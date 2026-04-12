from django.core.mail import EmailMessage
from django.conf import settings

def send_welcome_email(to_email, user_name):
    email = EmailMessage(
        subject='Welcome to Bihar Skill Hub!',
        body=f'Hello {user_name},\n\nWelcome! Your account has been created.',
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[to_email],
    )
    email.send()

def send_otp_email(to_email, otp):
    email = EmailMessage(
        subject='Your OTP - Bihar Skill Hub',
        body=f'Your OTP is: {otp}\n\nValid for 10 minutes. Do not share.',
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[to_email],
    )
    email.send()

def send_certificate_email(to_email, user_name, course_name, pdf_buffer, label='Certificate'):
    email = EmailMessage(
        subject=f'Your {label} - {course_name}',
        body=f'Hi {user_name},\n\nPlease find your {label} attached.\n\nBihar Skill Hub',
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[to_email],
    )
    email.attach(f'{label}_{course_name}.pdf', pdf_buffer, 'application/pdf')
    email.send()