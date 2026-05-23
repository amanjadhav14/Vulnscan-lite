import whois


def get_whois(domain):
    try:

        data = whois.whois(domain)

        creation_date = data.creation_date
        expiration_date = data.expiration_date

        # Handle list format
        if isinstance(creation_date, list):
            creation_date = creation_date[0]

        if isinstance(expiration_date, list):
            expiration_date = expiration_date[0]

        return {
            "registrar": str(data.registrar) if data.registrar else "Unknown",

            "organization": str(data.org) if data.org else "Unknown",

            "creation_date": str(creation_date.date()) if creation_date else "Unknown",

            "expiration_date": str(expiration_date.date()) if expiration_date else "Unknown"
        }

    except Exception:
        return {
            "registrar": "Unknown",
            "organization": "Unknown",
            "creation_date": "Unknown",
            "expiration_date": "Unknown"
        }
