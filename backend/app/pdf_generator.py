from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import letter

def generate_pdf(data, filename):

    doc = SimpleDocTemplate(
        filename,
        pagesize=letter
    )

    styles = getSampleStyleSheet()

    content = []

    title = Paragraph(
        "VulnScan Lite Security Report",
        styles["Title"]
    )

    content.append(title)
    content.append(Spacer(1, 20))

    fields = [
        f"Target URL: {data['url']}",
        f"Security Grade: {data['grade']}",
        f"Security Score: {data['total_score']}",
        f"CMS: {data['cms']['cms']}",
        f"Server: {data['cms']['server']}",
        f"SSL Valid: {data['ssl']['ssl_valid']}",
        f"SSL Days Left: {data['ssl']['days_left']}",
    ]

    for item in fields:

        p = Paragraph(item, styles["BodyText"])
        content.append(p)
        content.append(Spacer(1, 10))

    remediation_title = Paragraph(
        "Security Recommendations",
        styles["Heading2"]
    )

    content.append(remediation_title)

    for fix in data["remediation"]:

        text = f"""
        <b>{fix['header']}</b><br/>
        Risk: {fix['risk']}<br/>
        Fix: {fix['fix']}
        """

        p = Paragraph(text, styles["BodyText"])

        content.append(p)
        content.append(Spacer(1, 15))

    doc.build(content)
