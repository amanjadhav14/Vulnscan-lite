import requests


def detect_technologies(url):

    technologies = []

    try:

        response = requests.get(url, timeout=10)

        headers = response.headers
        html = response.text.lower()

        server = headers.get("Server", "")
        powered = headers.get("X-Powered-By", "")

        if server:
            technologies.append(server)

        if powered:
            technologies.append(powered)

        if "cloudflare" in server.lower():
            technologies.append("Cloudflare")

        if "wordpress" in html:
            technologies.append("WordPress")

        if "react" in html:
            technologies.append("React")

        if "bootstrap" in html:
            technologies.append("Bootstrap")

        if "jquery" in html:
            technologies.append("jQuery")

        if "nginx" in server.lower():
            technologies.append("Nginx")

        if "php" in powered.lower():
            technologies.append("PHP")

        return list(set(technologies))

    except Exception as e:

        print(e)

        return ["Unknown"]
