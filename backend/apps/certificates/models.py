"""
Certificates App - Auto-generates PDF certificates on course completion
and offer letters issued by Admin. Both are downloadable.
"""

from django.db import models
from apps.users.models import User
from apps.courses.models import Course


class Certificate(models.Model):
    COURSE      = 'certificate'
    OFFER_LETTER = 'offer_letter'
    TYPE_CHOICES = [(COURSE, 'Course Certificate'), (OFFER_LETTER, 'Offer Letter')]

    student     = models.ForeignKey(User, on_delete=models.CASCADE, related_name='certificates')
    course      = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='certificates')
    cert_type   = models.CharField(max_length=20, choices=TYPE_CHOICES, default=COURSE)
    issued      = models.BooleanField(default=False)
    issued_at   = models.DateTimeField(auto_now_add=True)
    pdf_file    = models.FileField(upload_to='generated/certificates/', blank=True, null=True)
    # Extra fields used for offer letters
    role        = models.CharField(max_length=200, blank=True, help_text='Role/position in offer letter')
    start_date  = models.DateField(null=True, blank=True)
    stipend     = models.CharField(max_length=100, blank=True)
    custom_note = models.TextField(blank=True)

    class Meta:
        unique_together = ['student', 'course', 'cert_type']
        ordering = ['-issued_at']

    def __str__(self):
        return f"{self.get_cert_type_display()} — {self.student.full_name} [{self.course.title}]"
