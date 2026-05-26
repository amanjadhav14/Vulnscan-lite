# VulnScan Lite - README.txt

========================================
PROJECT NAME
============

VulnScan Lite
AI-Powered Website Security Monitoring & Vulnerability Assessment Platform

========================================
DEFAULT ADMIN LOGIN
===================

Username: admin
Password: admin

========================================
PROJECT OVERVIEW
================

VulnScan Lite is a modern full-stack cybersecurity web application designed to perform automated website security analysis, infrastructure reconnaissance, and vulnerability assessment.

The platform allows users to scan target websites and receive:

* Security Grade
* Threat Score
* Vulnerability Analysis
* SSL/TLS Information
* DNS Intelligence
* WHOIS Data
* Technology Fingerprinting
* Open Port Detection
* Subdomain Discovery
* Remediation Suggestions
* Downloadable PDF Reports

The project demonstrates modern cybersecurity dashboard development using React, FastAPI, SQLite, and ReportLab.

========================================
FEATURES
========

1. Website Vulnerability Scanning
2. Security Header Analysis
3. SSL Certificate Validation
4. DNS Record Analysis
5. WHOIS Lookup
6. Technology Detection
7. Open Port Enumeration
8. Subdomain Discovery
9. Threat Score Calculation
10. PDF Report Generation
11. Scan History Logging
12. Interactive Dashboard UI

========================================
TECHNOLOGIES USED
=================

FRONTEND:

* React.js
* Vite
* Tailwind CSS
* Axios
* Recharts
* React Icons

BACKEND:

* FastAPI
* Python

DATABASE:

* SQLite

PDF ENGINE:

* ReportLab

DEPLOYMENT:

* Render (Backend)
* Vercel (Frontend)  https://vulnscan-lite-jcgw1eopo-amanjadhav14s-projects.vercel.app/

========================================
PROJECT STRUCTURE
=================

vulnscan-lite/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── pdf_generator.py
│   │   ├── scanner.py
│   │   └── database.py
│   │
│   ├── requirements.txt
│   └── scan_history.db
│
└── README.txt

========================================
INSTALLATION GUIDE
==================

1. Clone Repository

git clone https://github.com/amanjadhav14/Vulnscan-lite.git

========================================

2. FRONTEND SETUP

cd frontend

npm install

npm run dev

========================================

3. BACKEND SETUP

cd backend

python -m venv venv

source venv/bin/activate

pip install -r requirements.txt

python -m uvicorn app.main:app --reload

========================================
API ENDPOINTS
=============

1. Start Scan

POST /scan

========================================

2. Get Scan Result

GET /scan/{task_id}

========================================

3. Download PDF Report

POST /download-report

========================================
DATABASE
========

Table Name:
scan_history

Columns:

* id
* url
* grade
* total_score
* timestamp

========================================
SECURITY FEATURES
=================

* CORS Protection
* Input Validation
* Error Handling
* SSL Validation
* Rate Limiting
* Secure PDF Generation

========================================
DEPLOYMENT
==========

Frontend:

* Deploy using Vercel

Backend:

* Deploy using Render

========================================
FUTURE ENHANCEMENTS
===================

* AI Threat Intelligence
* CVE Integration
* Multi-user Dashboard
* Real-time Monitoring
* SIEM Integration
* Scheduled Scans
* Advanced Port Scanning


========================================
LICENSE
=======

This project is created for educational and cybersecurity learning purposes.

========================================
END OF README
=============
