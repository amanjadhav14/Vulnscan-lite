from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer
)

from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import letter


def generate_pdf(data, filename):

    doc = SimpleDocTemplate(
        filename,
        pagesize=letter
    )

    styles = getSampleStyleSheet()

    elements = []

    # TITLE
    elements.append(
        Paragraph(
            "VulnScan Lite Security Report",
            styles['Title']
        )
    )

    elements.append(Spacer(1, 20))

    # BASIC INFO
    elements.append(
        Paragraph(
            f"Target URL: {data.get('url', 'N/A')}",
            styles['BodyText']
        )
    )

    elements.append(
        Paragraph(
            f"Security Grade: {data.get('grade', 'N/A')}",
            styles['BodyText']
        )
    )

    elements.append(
        Paragraph(
            f"Security Score: {data.get('total_score', 0)}",
            styles['BodyText']
        )
    )

    elements.append(Spacer(1, 20))

    # VULNERABILITIES
    elements.append(
        Paragraph(
            "Detected Vulnerabilities",
            styles['Heading2']
        )
    )

    vulnerabilities = data.get("vulnerabilities", [])

    if isinstance(vulnerabilities, list):

        for vuln in vulnerabilities:

            if isinstance(vuln, dict):

                title = vuln.get("title", "Unknown")
                severity = vuln.get("severity", "Low")
                description = vuln.get("description", "No description")

            else:

                title = str(vuln)
                severity = "Unknown"
                description = str(vuln)

            elements.append(
                Paragraph(
                    f"<b>{title}</b> ({severity})",
                    styles['BodyText']
                )
            )

            elements.append(
                Paragraph(
                    description,
                    styles['BodyText']
                )
            )

            elements.append(Spacer(1, 12))

    # REMEDIATION
    elements.append(
        Paragraph(
            "Remediation Recommendations",
            styles['Heading2']
        )
    )

    remediation = data.get("remediation", [])

    if isinstance(remediation, list):

        for item in remediation:

            if isinstance(item, dict):

                fix = (
                    item.get("fix")
                    or item.get("description")
                    or item.get("title")
                    or "No recommendation"
                )

            else:

                fix = str(item)

            elements.append(
                Paragraph(
                    f"• {fix}",
                    styles['BodyText']
                )
            )

    elements.append(Spacer(1, 20))

    # SUBDOMAINS
    elements.append(
        Paragraph(
            "Discovered Subdomains",
            styles['Heading2']
        )
    )

    subdomains = data.get("subdomains", [])

    if isinstance(subdomains, list):

        for sub in subdomains:

            if isinstance(sub, dict):

                value = (
                    sub.get("url")
                    or sub.get("domain")
                    or sub.get("name")
                    or "Unknown"
                )

            else:

                value = str(sub)

            elements.append(
                Paragraph(
                    f"• {value}",
                    styles['BodyText']
                )
            )

    doc.build(elements)
