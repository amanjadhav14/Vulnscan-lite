import ssl
import socket
from datetime import datetime

def check_ssl(domain):
    result = {
        "ssl_valid": False,
        "expiry_date": None,
        "days_left": None,
        "issuer": None,
        "score": 0
    }

    try:
        context = ssl.create_default_context()

        with socket.create_connection((domain, 443)) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as ssock:

                cert = ssock.getpeercert()

                expiry_date = cert['notAfter']
                expiry_datetime = datetime.strptime(
                    expiry_date,
                    "%b %d %H:%M:%S %Y %Z"
                )

                days_left = (expiry_datetime - datetime.utcnow()).days

                result["ssl_valid"] = True
                result["expiry_date"] = expiry_date
                result["days_left"] = days_left
                result["issuer"] = cert.get('issuer')

                if days_left > 30:
                    result["score"] += 30
                else:
                    result["score"] -= 20

    except Exception as e:
        result["error"] = str(e)

    return result
