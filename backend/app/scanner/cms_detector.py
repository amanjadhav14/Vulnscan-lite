import requests
from bs4 import BeautifulSoup

def detect_cms(url):

    result = {
        "cms": "Unknown",
        "version": None,
        "server": None,
        "powered_by": None,
        "score": 0
    }

    try:
        response = requests.get(url, timeout=10)

        headers = response.headers
        html = response.text

        soup = BeautifulSoup(html, "html.parser")

        # Detect server
        result["server"] = headers.get("Server")

        # Detect X-Powered-By
        result["powered_by"] = headers.get("X-Powered-By")

        # Meta generator detection
        generator = soup.find("meta", attrs={"name": "generator"})

        if generator:
            content = generator.get("content", "")

            result["cms"] = content

            if "WordPress" in content:
                result["score"] -= 10

            elif "Drupal" in content:
                result["score"] -= 5

        # Additional WordPress detection
        if "wp-content" in html:
            result["cms"] = "WordPress"

        return result

    except Exception as e:
        result["error"] = str(e)

    return result
