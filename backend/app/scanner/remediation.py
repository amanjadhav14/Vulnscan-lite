REMEDIATION_TIPS = {

    "Content-Security-Policy": {
        "risk": "Can allow XSS attacks.",
        "fix": "add_header Content-Security-Policy \"default-src 'self'\";",
        "severity": "High"
    },

    "X-Frame-Options": {
        "risk": "Website vulnerable to clickjacking.",
        "fix": "add_header X-Frame-Options \"DENY\";",
        "severity": "Medium"
    },

    "Strict-Transport-Security": {
        "risk": "HTTPS downgrade attacks possible.",
        "fix": "add_header Strict-Transport-Security \"max-age=31536000\";",
        "severity": "High"
    }

}
