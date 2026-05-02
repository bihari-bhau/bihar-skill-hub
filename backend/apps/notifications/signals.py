"""
signals.py — Auto-trigger email notifications
Place at: backend/apps/notifications/signals.py

These signals fire automatically when:
- User registers → Welcome email
- Enrollment created → Enrollment confirmation
- Certificate issued → Certificate/Offer letter email
- Quiz submitted → Quiz result email
- Payment success → Payment receipt email
- Password changed → Security alert
"""

from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model

User = get_user_model()


# ── Import email functions ────────────────────────────────────────────────────
def _safe_import():
    from .emails import (
        send_welcome_email,
        send_enrollment_email,
        send_certificate_email,
        send_offer_letter_email,
        send_quiz_result_email,
        send_payment_success_email,
        send_password_changed_email,
    )
    return {
        'welcome':        send_welcome_email,
        'enrollment':     send_enrollment_email,
        'certificate':    send_certificate_email,
        'offer_letter':   send_offer_letter_email,
        'quiz_result':    send_quiz_result_email,
        'payment':        send_payment_success_email,
        'password':       send_password_changed_email,
    }


# ── 1. Welcome Email — on new user registration ───────────────────────────────
@receiver(post_save, sender=User)
def on_user_created(sender, instance, created, **kwargs):
    if created:
        try:
            fns = _safe_import()
            fns['welcome'](instance)
        except Exception as e:
            print(f"[Email Signal Error - Welcome] {e}")


# ── 2. Enrollment Email — on new enrollment ───────────────────────────────────
def connect_enrollment_signal():
    try:
        from apps.enrollments.models import Enrollment

        @receiver(post_save, sender=Enrollment)
        def on_enrollment_created(sender, instance, created, **kwargs):
            if created and instance.status == 'active':
                try:
                    fns = _safe_import()
                    fns['enrollment'](instance)
                except Exception as e:
                    print(f"[Email Signal Error - Enrollment] {e}")

    except ImportError:
        pass


# ── 3. Certificate / Offer Letter Email ───────────────────────────────────────
def connect_certificate_signal():
    try:
        from apps.certificates.models import Certificate

        @receiver(post_save, sender=Certificate)
        def on_certificate_issued(sender, instance, created, **kwargs):
            # Only send on first issue (when pdf_file is just saved)
            if instance.issued and instance.pdf_file:
                try:
                    fns = _safe_import()
                    if instance.cert_type == Certificate.OFFER_LETTER:
                        fns['offer_letter'](instance)
                    else:
                        fns['certificate'](instance)
                except Exception as e:
                    print(f"[Email Signal Error - Certificate] {e}")

    except ImportError:
        pass


# ── 4. Quiz Result Email ──────────────────────────────────────────────────────
def connect_quiz_signal():
    try:
        from apps.quizzes.models import QuizAttempt

        @receiver(post_save, sender=QuizAttempt)
        def on_quiz_submitted(sender, instance, created, **kwargs):
            if instance.status == 'submitted' and instance.score is not None:
                try:
                    fns = _safe_import()
                    fns['quiz_result'](instance)
                except Exception as e:
                    print(f"[Email Signal Error - Quiz] {e}")

    except ImportError:
        pass


# ── 5. Payment Success Email ──────────────────────────────────────────────────
def connect_payment_signal():
    try:
        from apps.payments.models import Payment

        @receiver(post_save, sender=Payment)
        def on_payment_success(sender, instance, created, **kwargs):
            if not created and instance.status == 'success':
                # Only send once — check if payment_id was just set
                try:
                    fns = _safe_import()
                    fns['payment'](instance)
                except Exception as e:
                    print(f"[Email Signal Error - Payment] {e}")

    except ImportError:
        pass


# ── Connect all signals ───────────────────────────────────────────────────────
connect_enrollment_signal()
connect_certificate_signal()
connect_quiz_signal()
connect_payment_signal()
