from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
import io

def generate_certificate(user_name, course_name):
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    # Border
    c.setStrokeColorRGB(0.8, 0.6, 0)
    c.setLineWidth(10)
    c.rect(30, 30, width - 60, height - 60)

    # Content
    c.setFont("Helvetica-Bold", 28)
    c.drawCentredString(width/2, height - 200, "Certificate of Completion")

    c.setFont("Helvetica", 20)
    c.drawCentredString(width/2, height - 280, f"This certifies that")

    c.setFont("Helvetica-Bold", 24)
    c.drawCentredString(width/2, height - 330, user_name)

    c.setFont("Helvetica", 18)
    c.drawCentredString(width/2, height - 390, f"has completed: {course_name}")

    c.setFont("Helvetica", 14)
    c.drawCentredString(width/2, height - 450, "Bihar Skill Hub")

    c.save()
    buffer.seek(0)
    return buffer.read()