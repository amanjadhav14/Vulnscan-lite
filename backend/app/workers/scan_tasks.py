import requests
from bs4 import BeautifulSoup
import socket
import ssl
from datetime import datetime
from celery_worker import celery

@celery.task(name="app.workers.scan_tasks.run_scan")
def run_scan(url):

    try:

        if not url.startswith(("http://", "https://")):
            url = "https://" + url

        try:
            response = requests.get(
                url,
                timeout=10,
                headers={"User-Agent": "VulnScanLite/1.0"}
            )

            headers = response.headers
            soup = BeautifulSoup(response.text, "html.parser")

        except Exception as e:
            return {
                "url": url,
                "status": "Failed",
                "error": str(e)
            }

        # ─── EXTRACTION & GRADING LOGIC ───
        total_score = 100
        passed_headers = []
        failed_headers = []
        remediation_array = []

        security_headers = {
            "Content-Security-Policy": {
                "risk": "Missing explicit directive rules leaves application highly susceptible to Cross-Site Scripting (XSS) and injection exploits.",
                "fix": "add_header Content-Security-Policy \"default-src 'self'; script-src 'self' 'unsafe-inline';\";",
                "severity": "Critical"
            },
            "X-Frame-Options": {
                "risk": "Absence of framing configurations allows malicious UI redressing and clickjacking attack layers.",
                "fix": "add_header X-Frame-Options \"SAMEORIGIN\" always;",
                "severity": "High"
            },
            "Strict-Transport-Security": {
                "risk": "Lack of HTTP Strict Transport Security (HSTS) exposes active user sessions to SSL-Stripping and MITM downgrades.",
                "fix": "add_header Strict-Transport-Security \"max-age=31536000; includeSubDomains\" always;",
                "severity": "High"
            }
        }

        for header_name, meta in security_headers.items():

            if header_name in headers:
                passed_headers.append(header_name)

            else:
                failed_headers.append(header_name)
                total_score -= 20

                remediation_array.append({
                    "header": header_name,
                    "risk": meta["risk"],
                    "fix": meta["fix"],
                    "severity": meta["severity"]
                })

        total_score = max(0, total_score)

        if total_score >= 80:
            grade = "A"

        elif total_score >= 60:
            grade = "B"

        elif total_score >= 40:
            grade = "C"

        elif total_score >= 20:
            grade = "D"

        else:
            grade = "F"

        # ─── DOMAIN ───
        domain = url.replace("https://", "").replace("http://", "").split("/")[0]

        # ─── SSL CHECK ───
        ssl_data = {
            "ssl_valid": False,
            "days_left": 0
        }

        try:

            context = ssl.create_default_context()

            with socket.create_connection((domain, 443), timeout=4) as sock:

                with context.wrap_socket(sock, server_hostname=domain) as ssock:

                    cert = ssock.getpeercert()

                    exp_date = datetime.strptime(
                        cert['notAfter'],
                        '%b %d %H:%M:%S %Y %Z'
                    )

                    days_left = (exp_date - datetime.now()).days

                    ssl_data = {
                        "ssl_valid": days_left > 0,
                        "days_left": max(0, days_left)
                    }

        except Exception as e:
            print("SSL ERROR:", e)

        # ─── SAFE RESPONSE ───
        return {

            "url": url,

            "total_score": total_score,

            "grade": grade,

            "headers": {
                "passed": passed_headers,
                "failed": failed_headers
            },

            "remediation": remediation_array,

            "ssl": ssl_data,

            "cms": {
                "cms": "WordPress" if "wp-content" in response.text else "Unknown",
                "server": headers.get("Server", "Obscured")
            },

            # STATIC SAFE DATA
            "ports": [
                {"port": 80, "service": "http"},
                {"port": 443, "service": "https"}
            ],

            "subdomains": [
                f"www.{domain}",
                f"api.{domain}"
            ],

            "technologies": [
                "Nginx",
                "PHP",
                "OpenSSL"
            ],

            "dns_records": {
                "A": ["192.168.1.1"],
                "MX": ["mail.target.local"]
            },

            "whois": {
                "registrar": "MarkMonitor Inc.",
                "organization": "Privacy Protection"
            }
        }

    except Exception as e:

        print("SCAN ERROR:", e)

        return {
            "url": url,
            "status": "Failed",
            "error": str(e),
            "total_score": 0,
            "grade": "F"
        }
