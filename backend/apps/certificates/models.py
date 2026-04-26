"""
Certificates App — Auto-generates PDF certificates on course completion
and offer letters issued by Admin. Both are downloadable and verifiable via QR.
"""

import uuid
from django.db import models
from apps.users.models import User
from apps.courses.models import Course


class Certificate(models.Model):
    CERTIFICATE  = 'certificate'
    OFFER_LETTER = 'offer_letter'
    TYPE_CHOICES = [
        (CERTIFICATE,  'Course Certificate'),
        (OFFER_LETTER, 'Offer Letter'),
    ]

    student     = models.ForeignKey(User,   on_delete=models.CASCADE, related_name='certificates')
    course      = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='certificates')

    # ── Certificate type ──────────────────────────────────────────────────
    cert_type   = models.CharField(max_length=20, choices=TYPE_CHOICES, default=CERTIFICATE)

    # ── NEW: Unique UUID for QR-based public verification ─────────────────
    certificate_id = models.UUIDField(
        default=uuid.uuid4, unique=True, editable=False,
        help_text='Unique ID embedded in QR code for public verification'
    )

    # ── Status ────────────────────────────────────────────────────────────
    issued      = models.BooleanField(default=False)
    issued_at   = models.DateTimeField(auto_now_add=True)

    # ── PDF storage ───────────────────────────────────────────────────────
    pdf_file    = models.FileField(upload_to='generated/certificates/', blank=True, null=True)

    # ── Offer letter specific fields ──────────────────────────────────────
    role        = models.CharField(max_length=200, blank=True, help_text='Role/position in offer letter')
    start_date  = models.DateField(null=True, blank=True)
    stipend     = models.CharField(max_length=100, blank=True)
    custom_note = models.TextField(blank=True)

    class Meta:
        unique_together = ['student', 'course', 'cert_type']
        ordering = ['-issued_at']

    def __str__(self):
        return f"{self.get_cert_type_display()} — {self.student.full_name} [{self.course.title}]"

    def get_verify_url(self):
        """Public URL for QR code verification"""
        return f"https://biharskillhub.co.in/verify/{self.certificate_id}"
