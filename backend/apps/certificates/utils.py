"""
Certificate & Offer Letter PDF Generator using ReportLab.
Produces styled, printable PDFs with:
  - Certificate of Completion (landscape, classic navy/gold border, seal, QR code)
  - Offer Letter (portrait, professional letterhead, QR code)
"""

import os
import qrcode
from io import BytesIO
from datetime import date
from django.conf import settings
from django.core.files.base import ContentFile

# ── Brand palette ────────────────────────────────────────────────────────────
NAVY      = '#1A3C6E'
GOLD      = '#C9A84C'
GOLD_DARK = '#8A7530'
CREAM     = '#FAF6EC'
GRAY      = '#6B6B6B'
BODY      = '#444444'
FOOT      = '#A89B78'


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


def _draw_tracked(c, cx, y, text, font, size, color, tracking=0):
    """Draw letter-spaced text centred on cx."""
    c.setFont(font, size)
    c.setFillColor(color)
    widths = [c.stringWidth(ch, font, size) for ch in text]
    total  = sum(widths) + tracking * (len(text) - 1)
    cursor = cx - total / 2
    for ch, w in zip(text, widths):
        c.drawString(cursor, y, ch)
        cursor += w + tracking


def generate_certificate_pdf(cert):
    """Generate a Course Completion Certificate PDF (Classic style)."""
    try:
        from reportlab.lib.pagesizes import A4, landscape
        from reportlab.lib import colors
        from reportlab.pdfgen import canvas
        from reportlab.lib.utils import ImageReader
    except ImportError:
        return  # ReportLab not installed; skip silently

    buffer = BytesIO()
    page_w, page_h = landscape(A4)
    c = canvas.Canvas(buffer, pagesize=landscape(A4))

    navy = colors.HexColor(NAVY)
    gold = colors.HexColor(GOLD)

    # ── Background ────────────────────────────────────────────────────────
    c.setFillColor(colors.HexColor(CREAM))
    c.rect(0, 0, page_w, page_h, fill=1, stroke=0)

    # ── Double border ─────────────────────────────────────────────────────
    m = 24
    c.setStrokeColor(navy)
    c.setLineWidth(4)
    c.rect(m, m, page_w - 2 * m, page_h - 2 * m, stroke=1, fill=0)
    c.setStrokeColor(gold)
    c.setLineWidth(1.5)
    c.rect(m + 10, m + 10, page_w - 2 * (m + 10), page_h - 2 * (m + 10), stroke=1, fill=0)

    # ── Gold corner brackets ──────────────────────────────────────────────
    ix0, iy0 = m + 10, m + 10
    ix1, iy1 = page_w - (m + 10), page_h - (m + 10)
    L = 18
    c.setStrokeColor(gold)
    c.setLineWidth(2)
    for (x, y, dx, dy) in [
        (ix0, iy0, 1, 1), (ix1, iy0, -1, 1),
        (ix0, iy1, 1, -1), (ix1, iy1, -1, -1),
    ]:
        c.line(x, y, x + dx * L, y)
        c.line(x, y, x, y + dy * L)

    cx = page_w / 2

    # ── Header ────────────────────────────────────────────────────────────
    _draw_tracked(c, cx, page_h - 95, 'CERTIFICATE', 'Helvetica-Bold', 38, navy, tracking=4)
    _draw_tracked(c, cx, page_h - 122, 'OF COMPLETION', 'Helvetica', 15, colors.HexColor(GOLD_DARK), tracking=8)
    c.setStrokeColor(gold)
    c.setLineWidth(1.5)
    c.line(cx - 60, page_h - 138, cx + 60, page_h - 138)

    # ── Intro ─────────────────────────────────────────────────────────────
    c.setFont('Helvetica-Oblique', 14)
    c.setFillColor(colors.HexColor(GRAY))
    c.drawCentredString(cx, page_h - 178, 'This is to proudly certify that')

    # ── Student name ──────────────────────────────────────────────────────
    name = cert.student.full_name or 'Student'
    c.setFont('Helvetica-BoldOblique', 44)
    c.setFillColor(gold)
    c.drawCentredString(cx, page_h - 235, name)
    name_w = c.stringWidth(name, 'Helvetica-BoldOblique', 44)
    c.setStrokeColor(gold)
    c.setLineWidth(1)
    c.line(cx - name_w / 2 - 10, page_h - 245, cx + name_w / 2 + 10, page_h - 245)

    # ── Course ────────────────────────────────────────────────────────────
    c.setFont('Helvetica', 15)
    c.setFillColor(colors.HexColor(BODY))
    c.drawCentredString(cx, page_h - 278, 'has successfully completed the course')

    c.setFont('Helvetica-Bold', 22)
    c.setFillColor(navy)
    c.drawCentredString(cx, page_h - 312, cert.course.title)

    issued_date = (cert.issued_at or date.today())
    issued_str = issued_date.strftime('%B %d, %Y')
    c.setFont('Helvetica', 13)
    c.setFillColor(colors.HexColor(GRAY))
    c.drawCentredString(cx, page_h - 340, f'with distinction on {issued_str}')

    # ── Seal ──────────────────────────────────────────────────────────────
    seal_cy = 190
    c.setStrokeColor(gold)
    c.setLineWidth(2)
    c.circle(cx, seal_cy, 30, stroke=1, fill=0)
    c.setLineWidth(0.75)
    c.circle(cx, seal_cy, 23, stroke=1, fill=0)
    c.setFont('Helvetica-Bold', 14)
    c.setFillColor(navy)
    c.drawCentredString(cx, seal_cy - 5, 'BSH')

    # ── Signature lines ───────────────────────────────────────────────────
    sig_y = 130
    lx, rx = 250, page_w - 250
    c.setStrokeColor(navy)
    c.setLineWidth(1)
    c.line(lx - 80, sig_y, lx + 80, sig_y)
    c.line(rx - 80, sig_y, rx + 80, sig_y)
    c.setFont('Helvetica-Bold', 12)
    c.setFillColor(navy)
    c.drawCentredString(lx, sig_y - 16, 'Bihar Skill Hub')
    c.drawCentredString(rx, sig_y - 16, issued_str)
    c.setFont('Helvetica', 10)
    c.setFillColor(colors.HexColor('#777777'))
    c.drawCentredString(lx, sig_y - 30, 'Director of Education')
    c.drawCentredString(rx, sig_y - 30, 'Date of Issue')

    # ── QR code ───────────────────────────────────────────────────────────
    try:
        qr_buf  = _generate_qr_bytes(cert.get_verify_url())
        qr_img  = ImageReader(qr_buf)
        qr_size = 58
        qx = page_w - (m + 10) - qr_size - 12
        qy = m + 24
        c.drawImage(qr_img, qx, qy, qr_size, qr_size)
        c.setFont('Helvetica', 7)
        c.setFillColor(colors.HexColor('#999999'))
        c.drawCentredString(qx + qr_size / 2, qy - 9, 'Scan to verify')
    except Exception:
        pass

    # ── Footer ────────────────────────────────────────────────────────────
    c.setFont('Helvetica', 8.5)
    c.setFillColor(colors.HexColor(FOOT))
    c.drawCentredString(cx, m + 18, f'Certificate ID: {cert.certificate_id}  ·  biharskillhub.co.in')

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