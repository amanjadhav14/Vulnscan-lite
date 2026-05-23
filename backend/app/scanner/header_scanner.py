import requests

SECURITY_HEADERS = [
    "Content-Security-Policy",
    "X-Frame-Options",
    "Strict-Transport-Security"
]

def scan_headers(url):
    result = {
        "passed": [],
        "failed": [],
        "score": 0
    }

    try:
        response = requests.get(url, timeout=10)

        headers = response.headers

        for header in SECURITY_HEADERS:
            if header in headers:
                result["passed"].append(header)
                result["score"] += 10
            else:
                result["failed"].append(header)
                result["score"] -= 10

    except Exception as e:
        result["error"] = str(e)

    return result
