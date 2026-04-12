import requests
import os

BREVO_API_KEY = os.getenv('BREVO_API_KEY')
DEFAULT_FROM = {"name": "Bihar Skill Hub", "email": "admin@biharskillhub.co.in"}

def _send(to_email, to_name, subject, body):
    response = requests.post(
        "https://api.brevo.com/v3/smtp/email",
        headers={
            "api-key": BREVO_API_KEY,
            "Content-Type": "application/json"
        },
        json={
            "sender": DEFAULT_FROM,
            "to": [{"email": to_email, "name": to_name}],
            "subject": subject,
            "textContent": body
        }
    )
    if response.status_code not in (200, 201):
        raise Exception(f"Brevo API error: {response.text}")

def send_welcome_email(to_email, user_name):
    _send(
        to_email, user_name,
        "Welcome to Bihar Skill Hub!",
        f"Hello {user_name},\n\nWelcome! Your account has been created successfully.\n\nBihar Skill Hub"
    )

def send_otp_email(to_email, otp):
    _send(
        to_email, "User",
        "Your OTP - Bihar Skill Hub",
        f"Your OTP is: {otp}\n\nValid for 10 minutes. Do not share with anyone.\n\nBihar Skill Hub"
    )

def send_certificate_email(to_email, user_name, course_name, pdf_buffer, label='Certificate'):
    response = requests.post(
        "https://api.brevo.com/v3/smtp/email",
        headers={
            "api-key": BREVO_API_KEY,
            "Content-Type": "application/json"
        },
        json={
            "sender": DEFAULT_FROM,
            "to": [{"email": to_email, "name": user_name}],
            "subject": f"Your {label} - {course_name}",
            "textContent": f"Hi {user_name},\n\nPlease find your {label} attached.\n\nBihar Skill Hub",
            "attachment": [{
                "content": __import__('base64').b64encode(pdf_buffer).decode(),
                "name": f"{label}_{course_name}.pdf"
            }]
        }
    )
    if response.status_code not in (200, 201):
        raise Exception(f"Brevo API error: {response.text}")