"""
Certificate issuing service.

Centralises the logic for creating a course-completion Certificate and
generating its PDF, so both the student "claim" flow and the admin
"issue" flow share one implementation.
"""

from django.utils import timezone

from .models import Certificate
from .utils import generate_certificate_pdf


def course_completion(student, course):
    """Return (is_complete: bool, enrollment | None) for a student/course."""
    from apps.enrollments.models import Enrollment
    try:
        enr = Enrollment.objects.get(student=student, course=course)
    except Enrollment.DoesNotExist:
        return False, None
    return enr.completion_percentage >= 100, enr


def issue_course_certificate(student, course, force=False):
    """
    Issue a course-completion certificate.

    Returns a tuple: (cert | None, created: bool, error: str | None)

    - If `force` is False, the student must have completed 100% of the
      course (used for the self-service claim flow).
    - If `force` is True, the certificate is issued regardless
      (used by admins).
    """
    is_complete, enr = course_completion(student, course)

    if not force and not is_complete:
        return None, False, 'Course not completed yet.'

    cert, created = Certificate.objects.get_or_create(
        student=student,
        course=course,
        cert_type=Certificate.CERTIFICATE,
    )

    # Generate the PDF on first issue, or if the file is missing.
    if created or not cert.pdf_file:
        generate_certificate_pdf(cert)
        cert.refresh_from_db()

    # Mark the enrollment completed.
    if enr and enr.status != enr.COMPLETED:
        enr.status = enr.COMPLETED
        enr.completed_at = timezone.now()
        enr.save(update_fields=['status', 'completed_at'])

    return cert, created, None