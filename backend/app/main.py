from fastapi import FastAPI, Body, BackgroundTasks, HTTPException, status, Request
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from celery.result import AsyncResult
from celery_worker import celery
from app.workers.scan_tasks import run_scan
from app.pdf_generator import generate_pdf
import os
import logging
import sqlite3
from datetime import datetime

# ─── RATE LIMITING IMPORTS ───
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Limiter using remote client address tracking
limiter = Limiter(key_func=get_remote_address)
app = FastAPI()

# Setup rate-limit state and exception handling
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"]
)

# ─── DATABASE CONFIGURATION ───
DB_PATH = "vulnscan_history.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS scan_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT NOT NULL,
            grade TEXT NOT NULL,
            total_score INTEGER NOT NULL,
            timestamp TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

init_db()

# ─── AUTHENTICATION SCHEMAS & CONFIG ───
ADMIN_USERNAME = os.getenv("VULNSCAN_USER", "admin")
ADMIN_PASSWORD = os.getenv("VULNSCAN_PASSWORD", "admin")

class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/login")
def login(request: Request, credentials: LoginRequest):  # Fixed: Request parameter injected
    if credentials.username == ADMIN_USERNAME and credentials.password == ADMIN_PASSWORD:
        return {
            "status": "authenticated",
            "token": "session_active_token_vulnscan_secret"
        }
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid terminal credentials provided."
    )

@app.get("/")
def home():
    return {"message": "VulnScan Lite Backend Running with Persistence Engine"}

# ─── START SCAN (RATE LIMITED: 5 per minute) ───
@app.post("/scan")
@limiter.limit("5/minute")
def start_scan(request: Request, url: str):
    task = run_scan.delay(url)
    return {
        "task_id": task.id,
        "status": "Processing"
    }

# CHECK SCAN STATUS & PERSIST DATA
@app.get("/scan/{task_id}")
def get_scan(task_id: str):
    task = AsyncResult(task_id, app=celery)
    
    if task.state == "PENDING":
        return {"status": "Pending"}
    elif task.state == "STARTED":
        return {"status": "Scanning"}
    elif task.state == "SUCCESS":
        result_data = task.result
        
        try:
            target_url = result_data.get("url", "unknown_vector")
            calculated_grade = result_data.get("grade", "F")
            final_score = result_data.get("total_score", 0)
            current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            
            cursor.execute(
                "SELECT id FROM scan_history WHERE url=? AND timestamp > datetime('now', '-5 second')", 
                (target_url,)
            )
            already_logged = cursor.fetchone()
            
            if not already_logged:
                cursor.execute(
                    "INSERT INTO scan_history (url, grade, total_score, timestamp) VALUES (?, ?, ?, ?)",
                    (target_url, calculated_grade, final_score, current_time)
                )
                conn.commit()
                logger.info(f"Persistent metrics recorded cleanly for target vector: {target_url}")
                
            conn.close()
        except Exception as db_err:
            logger.error(f"Failed to record persistent timeline logs: {str(db_err)}")

        return {"status": "Completed", "result": result_data}
    else:
        return {"status": task.state}

# HISTORICAL TIMELINE STREAMING ENDPOINT
@app.get("/history")
def get_history():
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT id, url, grade, total_score, timestamp FROM scan_history ORDER BY id DESC")
        rows = cursor.fetchall()
        conn.close()
        
        history_list = []
        for row in rows:
            history_list.append({
                "id": row[0],
                "url": row[1],
                "grade": row[2],
                "total_score": row[3],
                "timestamp": row[4]
            })
        return {"history": history_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database retrieval failure: {str(e)}")

def remove_file(path: str):
    try:
        if os.path.exists(path):
            os.remove(path)
    except Exception as e:
        logger.error(f"Error cleaning up temporary file {path}: {str(e)}")


# ─── DOWNLOAD REPORT (STABILIZED ROUTE) ───
@app.post("/download-report")
@limiter.limit("10/minute")
async def download_report(request: Request, background_tasks: BackgroundTasks, data: dict = Body(...)):
    filename = "security_report.pdf"
    try:
        # Prevent errors if remediation blocks are empty or null
        if "remediation" not in data:
            data["remediation"] = data.get("reremediation", [])
        if data["remediation"] is None:
            data["remediation"] = []
            
        logger.info(f"Compiling PDF Report payload data for target vector.")
        generate_pdf(data, filename)
        
    except Exception as pdf_error:
        logger.error(f"Error inside pdf_generator backend: {str(pdf_error)}")
        raise HTTPException(status_code=500, detail=f"PDF Generator Error: {str(pdf_error)}")
    
    if not os.path.exists(filename):
        raise HTTPException(status_code=500, detail="Generated report file missing from transient storage.")
        
    background_tasks.add_task(remove_file, filename)
    
    headers = {
        "Content-Disposition": f"attachment; filename={filename}",
        "Access-Control-Expose-Headers": "Content-Disposition"
    }
    return FileResponse(path=filename, filename=filename, media_type='application/pdf', headers=headers)
