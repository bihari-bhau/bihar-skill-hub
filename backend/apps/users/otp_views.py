"""
OTP Views — Email verification for registration.

Endpoints:
    POST /api/auth/send-otp/    Send a 6-digit OTP to an email.
    POST /api/auth/verify-otp/  Verify an OTP entered by the user.
    POST /api/auth/resend-otp/  Resend a fresh OTP.
"""

import os
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

from .models import OTPVerification, User


class SendOTPView(APIView):
    """POST /api/auth/send-otp/ — Sends a 6-digit OTP to the given email."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()

        if not email:
            return Response(
                {'error': 'Email is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {'error': 'This email is already registered. Please login.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        otp_obj = OTPVerification.generate_otp(email)

        text_body = (
            "Dear Student,\n\n"
            "Your OTP for Bihar Skill Hub registration is:\n\n"
            f"    {otp_obj.otp}\n\n"
            "This OTP is valid for 10 minutes.\n"
            "Do not share this OTP with anyone.\n\n"
            "If you did not request this, please ignore this email.\n\n"
            "Best regards,\n"
            "Bihar Skill Hub Team\n"
            "admin@biharskillhub.co.in"
        )

        html_body = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: Arial, sans-serif; background: #f4f8ff; margin: 0; padding: 20px; }}
    .container {{ max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }}
    .header {{ background: linear-gradient(135deg, #1e3a8a, #1d4ed8); padding: 32px 24px; text-align: center; }}
    .header h1 {{ color: white; margin: 0; font-size: 22px; }}
    .header p  {{ color: #bfdbfe; margin: 8px 0 0; font-size: 14px; }}
    .body {{ padding: 32px 24px; text-align: center; }}
    .body p  {{ color: #475569; font-size: 15px; line-height: 1.6; }}
    .otp-box {{ background: #eff6ff; border: 2px dashed #1d4ed8; border-radius: 12px; padding: 20px; margin: 24px 0; }}
    .otp {{ font-size: 36px; font-weight: 800; color: #1d4ed8; letter-spacing: 12px; }}
    .note {{ color: #94a3b8; font-size: 13px; margin-top: 8px; }}
    .footer {{ background: #f8fafc; padding: 20px 24px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Bihar Skill Hub</h1>
      <p>Email Verification</p>
    </div>
    <div class="body">
      <p>You are registering on Bihar Skill Hub.<br>Use the OTP below to verify your email:</p>
      <div class="otp-box">
        <div class="otp">{otp_obj.otp}</div>
        <div class="note">Valid for 10 minutes only</div>
      </div>
      <p style="color:#dc2626;font-size:13px;">Do not share this OTP with anyone.</p>
    </div>
    <div class="footer">
      Bihar Skill Hub &nbsp;|&nbsp; biharskillhub.co.in<br>
      admin@biharskillhub.co.in
    </div>
  </div>
</body>
</html>
        """

        from_email = (
            os.environ.get('EMAIL_HOST_USER')
            or getattr(settings, 'DEFAULT_FROM_EMAIL', 'admin@biharskillhub.co.in')
        )

        try:
            send_mail(
                subject='Bihar Skill Hub — Your OTP for Registration',
                message=text_body,
                from_email=from_email,
                recipient_list=[email],
                fail_silently=False,
                html_message=html_body,
            )
        except Exception as e:
            if settings.DEBUG:
                print(f"[OTP Email Error] {e}")
                print(f"[DEV MODE] OTP for {email}: {otp_obj.otp}")
            else:
                return Response(
                    {'error': 'Failed to send OTP email. Please try again.'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        return Response({
            'message': f'OTP sent to {email}. Check your inbox.',
            'email': email,
        })


class VerifyOTPView(APIView):
    """POST /api/auth/verify-otp/ — Verifies the OTP entered by the user."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        otp   = request.data.get('otp', '').strip()

        if not email or not otp:
            return Response(
                {'error': 'Email and OTP are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            otp_obj = OTPVerification.objects.filter(
                email=email, is_used=False
            ).latest('created_at')
        except OTPVerification.DoesNotExist:
            return Response(
                {'error': 'No OTP found for this email. Please request a new OTP.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        otp_obj.attempts += 1
        otp_obj.save(update_fields=['attempts'])

        if not otp_obj.is_valid():
            return Response(
                {'error': 'OTP has expired or too many attempts. Please request a new OTP.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if otp_obj.otp != otp:
            remaining = max(0, 3 - otp_obj.attempts)
            return Response(
                {'error': f'Incorrect OTP. {remaining} attempt(s) remaining.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        otp_obj.is_used = True
        otp_obj.save(update_fields=['is_used'])

        return Response({
            'message': 'OTP verified successfully!',
            'email': email,
            'verified': True,
        })


class ResendOTPView(SendOTPView):
    """POST /api/auth/resend-otp/ — Resends a fresh OTP (same logic as send)."""
    pass