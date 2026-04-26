"""
Certificate & Offer Letter PDF Generator using ReportLab.
Produces styled, printable PDFs with:
  - Certificate of Completion (landscape, decorative border, QR code)
  - Offer Letter (portrait, professional letterhead, QR code)
"""

import os
import qrcode
from io import BytesIO
from datetime import date
from django.conf import settings
from django.core.files.base import ContentFile


def _generate_qr_bytes(url):
    """Generate QR code as PNG bytes for embedding in PDF."""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=4,
        border=2,
    )
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buf = BytesIO()
    img.save(buf, format='PNG')
    buf.seek(0)
    return buf


def generate_certificate_pdf(cert):
    """Generate a Course Completion Certificate PDF and save to cert.pdf_file."""
    try:
        from reportlab.lib.pagesizes import A4, landscape
        from reportlab.lib import colors
        from reportlab.lib.units import cm, mm
        from reportlab.pdfgen import canvas
        from reportlab.lib.utils import ImageReader
    except ImportError:
        return  # ReportLab not installed; skip silently

    buffer  = BytesIO()
    page_w, page_h = landscape(A4)
    c = canvas.Canvas(buffer, pagesize=landscape(A4))

    # ── Background ────────────────────────────────────────────────────────
    c.setFillColor(colors.HexColor('#FAFAF7'))
    c.rect(0, 0, page_w, page_h, fill=1, stroke=0)

    # ── Decorative outer border ───────────────────────────────────────────
    margin = 20
    c.setStrokeColor(colors.HexColor('#1A3C6E'))
    c.setLineWidth(4)
    c.rect(margin, margin, page_w - 2*margin, page_h - 2*margin, stroke=1, fill=0)
    c.setStrokeColor(colors.HexColor('#C9A84C'))
    c.setLineWidth(1.5)
    c.rect(margin + 8, margin + 8, page_w - 2*(margin+8), page_h - 2*(margin+8), stroke=1, fill=0)

    # ── Header ────────────────────────────────────────────────────────────
    c.setFillColor(colors.HexColor('#1A3C6E'))
    c.setFont('Helvetica-Bold', 36)
    c.drawCentredString(page_w / 2, page_h - 80, 'CERTIFICATE OF COMPLETION')

    c.setFont('Helvetica', 14)
    c.setFillColor(colors.HexColor('#555555'))
    c.drawCentredString(page_w / 2, page_h - 105, 'This is to proudly certify that')

    # ── Student Name ──────────────────────────────────────────────────────
    c.setFont('Helvetica-BoldOblique', 42)
    c.setFillColor(colors.HexColor('#C9A84C'))
    c.drawCentredString(page_w / 2, page_h - 165, cert.student.full_name)

    # Underline
    name_width = c.stringWidth(cert.student.full_name, 'Helvetica-BoldOblique', 42)
    line_x = (page_w - name_width) / 2
    c.setStrokeColor(colors.HexColor('#C9A84C'))
    c.setLineWidth(1)
    c.line(line_x, page_h - 170, line_x + name_width, page_h - 170)

    # ── Body text ─────────────────────────────────────────────────────────
    c.setFont('Helvetica', 14)
    c.setFillColor(colors.HexColor('#333333'))
    c.drawCentredString(page_w / 2, page_h - 205, 'has successfully completed the course')

    c.setFont('Helvetica-Bold', 20)
    c.setFillColor(colors.HexColor('#1A3C6E'))
    c.drawCentredString(page_w / 2, page_h - 240, cert.course.title)

    c.setFont('Helvetica', 13)
    c.setFillColor(colors.HexColor('#555555'))
    issued_date = cert.issued_at.strftime('%B %d, %Y') if cert.issued_at else date.today().strftime('%B %d, %Y')
    c.drawCentredString(page_w / 2, page_h - 270, f'with distinction on  {issued_date}')

    # ── Divider ───────────────────────────────────────────────────────────
    c.setStrokeColor(colors.HexColor('#CCCCCC'))
    c.setLineWidth(0.5)
    c.line(100, page_h - 295, page_w - 100, page_h - 295)

    # ── Signature block ───────────────────────────────────────────────────
    sig_y = page_h - 340
    c.setFont('Helvetica-Bold', 13)
    c.setFillColor(colors.HexColor('#1A3C6E'))
    c.drawCentredString(page_w / 4, sig_y, 'Bihar Skill Hub')
    c.setStrokeColor(colors.HexColor('#1A3C6E'))
    c.setLineWidth(1)
    c.line(page_w/4 - 80, sig_y + 20, page_w/4 + 80, sig_y + 20)
    c.setFont('Helvetica', 10)
    c.setFillColor(colors.HexColor('#777777'))
    c.drawCentredString(page_w / 4, sig_y - 12, 'Director of Education')

    c.setFont('Helvetica-Bold', 13)
    c.setFillColor(colors.HexColor('#1A3C6E'))
    c.drawCentredString(3 * page_w / 4, sig_y, issued_date)
    c.line(3*page_w/4 - 80, sig_y + 20, 3*page_w/4 + 80, sig_y + 20)
    c.setFont('Helvetica', 10)
    c.setFillColor(colors.HexColor('#777777'))
    c.drawCentredString(3 * page_w / 4, sig_y - 12, 'Date of Issue')

    # ── QR Code (bottom right) ────────────────────────────────────────────
    try:
        verify_url = cert.get_verify_url()
        qr_buf     = _generate_qr_bytes(verify_url)
        qr_img     = ImageReader(qr_buf)
        qr_size    = 60
        c.drawImage(qr_img, page_w - margin - qr_size - 10, margin + 10, qr_size, qr_size)
        c.setFont('Helvetica', 7)
        c.setFillColor(colors.HexColor('#999999'))
        c.drawCentredString(page_w - margin - (qr_size / 2) - 10, margin + 5, 'Scan to Verify')
    except Exception:
        pass  # Skip QR if qrcode not installed

    # ── Certificate ID & Platform ─────────────────────────────────────────
    c.setFont('Helvetica', 8)
    c.setFillColor(colors.HexColor('#AAAAAA'))
    c.drawCentredString(page_w / 2, 35, f'Certificate ID: {cert.certificate_id}  |  biharskillhub.co.in')

    c.save()
    buffer.seek(0)

    filename = f'certificate_{cert.student.id}_{cert.course.id}.pdf'
    cert.pdf_file.save(filename, ContentFile(buffer.read()), save=True)
    cert.issued = True
    cert.save(update_fields=['issued', 'pdf_file'])


def generate_offer_letter_pdf(cert):
    """Generate an Offer Letter PDF and save to cert.pdf_file."""
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib import colors
        from reportlab.lib.units import cm
        from reportlab.pdfgen import canvas
        from reportlab.lib.utils import ImageReader
    except ImportError:
        return

    buffer  = BytesIO()
    page_w, page_h = A4
    c = canvas.Canvas(buffer, pagesize=A4)

    # ── Header bar ────────────────────────────────────────────────────────
    c.setFillColor(colors.HexColor('#1A3C6E'))
    c.rect(0, page_h - 90, page_w, 90, fill=1, stroke=0)

    c.setFont('Helvetica-Bold', 28)
    c.setFillColor(colors.white)
    c.drawString(40, page_h - 48, 'Bihar Skill Hub')
    c.setFont('Helvetica', 11)
    c.drawString(40, page_h - 68, 'Excellence in Online Education')

    c.setFont('Helvetica', 10)
    c.drawRightString(page_w - 40, page_h - 48, 'admin@biharskillhub.co.in')
    c.drawRightString(page_w - 40, page_h - 63, 'biharskillhub.co.in')

    # ── Gold accent line ──────────────────────────────────────────────────
    c.setFillColor(colors.HexColor('#C9A84C'))
    c.rect(0, page_h - 95, page_w, 5, fill=1, stroke=0)

    # ── Date & Ref ────────────────────────────────────────────────────────
    issued_date = date.today().strftime('%B %d, %Y')
    c.setFont('Helvetica', 11)
    c.setFillColor(colors.HexColor('#333333'))
    c.drawRightString(page_w - 40, page_h - 130, f'Date: {issued_date}')
    c.drawRightString(page_w - 40, page_h - 148, f'Ref: OL-{cert.id:06d}')

    # ── Subject ───────────────────────────────────────────────────────────
    c.setFont('Helvetica-Bold', 14)
    c.setFillColor(colors.HexColor('#1A3C6E'))
    c.drawString(40, page_h - 185, 'OFFER LETTER')

    c.setStrokeColor(colors.HexColor('#C9A84C'))
    c.setLineWidth(2)
    c.line(40, page_h - 190, 160, page_h - 190)

    # ── Salutation ────────────────────────────────────────────────────────
    y = page_h - 225
    c.setFont('Helvetica', 12)
    c.setFillColor(colors.HexColor('#222222'))
    c.drawString(40, y, f'Dear {cert.student.full_name},')

    # ── Body ──────────────────────────────────────────────────────────────
    y -= 30
    role       = cert.role or 'Intern'
    start_date = cert.start_date.strftime('%B %d, %Y') if cert.start_date else '[ Start Date ]'
    stipend    = cert.stipend or '[ As discussed ]'

    body_lines = [
        f'We are pleased to offer you the position of  {role}  at Bihar Skill Hub,',
        f'in connection with the course  "{cert.course.title}".',
        '',
        f'Your engagement is scheduled to commence on  {start_date}.',
        f'Stipend / Compensation:  {stipend}',
        '',
        'This offer is extended in recognition of your outstanding performance and dedication',
        'demonstrated throughout the programme. We look forward to your valuable contribution.',
    ]

    if cert.custom_note:
        body_lines += ['', cert.custom_note]

    c.setFont('Helvetica', 11)
    c.setFillColor(colors.HexColor('#333333'))
    for line in body_lines:
        c.drawString(40, y, line)
        y -= 22

    # ── Terms ─────────────────────────────────────────────────────────────
    y -= 10
    c.setFont('Helvetica-Bold', 11)
    c.setFillColor(colors.HexColor('#1A3C6E'))
    c.drawString(40, y, 'Terms & Conditions:')
    y -= 20
    c.setFont('Helvetica', 10)
    c.setFillColor(colors.HexColor('#555555'))
    terms = [
        '1. This offer is valid for 7 days from the date of issue.',
        '2. The offer is subject to the successful completion of all required formalities.',
        '3. Bihar Skill Hub reserves the right to withdraw this offer if any information is found to be incorrect.',
    ]
    for term in terms:
        c.drawString(50, y, term)
        y -= 16

    # ── Signature ─────────────────────────────────────────────────────────
    y -= 30
    c.setStrokeColor(colors.HexColor('#CCCCCC'))
    c.setLineWidth(0.5)
    c.line(40, y, page_w - 40, y)
    y -= 25
    c.setFont('Helvetica-Bold', 12)
    c.setFillColor(colors.HexColor('#1A3C6E'))
    c.drawString(40, y, 'Authorised Signatory')
    c.drawRightString(page_w - 40, y, 'Bihar Skill Hub')
    c.setFont('Helvetica', 10)
    c.setFillColor(colors.HexColor('#777777'))
    c.drawString(40, y - 16, 'Director of Education')

    # ── QR Code (bottom right) ────────────────────────────────────────────
    try:
        verify_url = cert.get_verify_url()
        qr_buf     = _generate_qr_bytes(verify_url)
        qr_img     = ImageReader(qr_buf)
        qr_size    = 70
        c.drawImage(qr_img, page_w - 40 - qr_size, 40, qr_size, qr_size)
        c.setFont('Helvetica', 7)
        c.setFillColor(colors.HexColor('#999999'))
        c.drawCentredString(page_w - 40 - qr_size / 2, 32, 'Scan to Verify')
    except Exception:
        pass

    # ── Footer ────────────────────────────────────────────────────────────
    c.setFillColor(colors.HexColor('#1A3C6E'))
    c.rect(0, 0, page_w, 28, fill=1, stroke=0)
    c.setFont('Helvetica', 9)
    c.setFillColor(colors.white)
    c.drawCentredString(page_w / 2, 10, 'Bihar Skill Hub  |  admin@biharskillhub.co.in  |  biharskillhub.co.in')

    c.save()
    buffer.seek(0)

    filename = f'offer_letter_{cert.student.id}_{cert.course.id}.pdf'
    cert.pdf_file.save(filename, ContentFile(buffer.read()), save=True)
    cert.issued = True
    cert.save(update_fields=['issued', 'pdf_file'])
