from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer, LoginSerializer, UserDetailSerializer, ChangePasswordSerializer
from .models import User

from django.http import HttpResponse
from django.core.mail import send_mail

def test_email(request):
    try:
        send_mail(
            subject='Test Email - Bihar Skill Hub',
            message='SMTP is working!',
            from_email='Bihar Skill Hub <a7d939001@smtp-brevo.com>',
            recipient_list=['your-personal-email@gmail.com'],  # ← your email
            fail_silently=False,
        )
        return HttpResponse('✅ Email sent successfully!')
    except Exception as e:
        return HttpResponse(f'❌ Error: {str(e)}')
class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/ — Student self-registration"""
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # ── Send welcome email ──────────────────────────────
        try:
            send_welcome_email(user.email, user.full_name or user.username)
        except Exception as e:
            print(f"[Email Error] Welcome email failed: {e}")
        # ───────────────────────────────────────────────────

        refresh = RefreshToken.for_user(user)
        return Response({
            'message': 'Registration successful.',
            'user': UserDetailSerializer(user).data,
            'access':  str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """POST /api/auth/login/ — Login for Admin and Students"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """POST /api/auth/logout/ — Blacklist refresh token"""

    def post(self, request):
        try:
            token = RefreshToken(request.data.get('refresh'))
            token.blacklist()
            return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'error': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/auth/profile/ — View or update own profile"""
    serializer_class = UserDetailSerializer

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    """POST /api/auth/change-password/"""

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'message': 'Password changed successfully.'})


class StudentListView(generics.ListAPIView):
    """GET /api/auth/students/ — Admin only: list all students"""
    serializer_class = UserDetailSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = User.objects.filter(role=User.STUDENT)
    """
OTP Views — Add these to backend/apps/users/views.py
"""

import os
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import OTPVerification, User


class SendOTPView(APIView):
    """
    POST /api/auth/send-otp/
    Sends a 6-digit OTP to the given email address.
    Called during Step 1 of registration.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()

        if not email:
            return Response(
                {'error': 'Email is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if email already registered
        if User.objects.filter(email=email).exists():
            return Response(
                {'error': 'This email is already registered. Please login.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generate OTP
        otp_obj = OTPVerification.generate_otp(email)

        # Send email
        try:
            send_mail(
                subject='Bihar Skill Hub — Your OTP for Registration',
                message=f"""
Dear Student,

Your OTP for Bihar Skill Hub registration is:

    ► {otp_obj.otp} ◄

This OTP is valid for 10 minutes.
Do not share this OTP with anyone.

If you did not request this, please ignore this email.

Best regards,
Bihar Skill Hub Team
admin@biharskillhub.co.in
biharskillhub.co.in
                """,
                from_email=os.environ.get('EMAIL_HOST_USER', 'admin@biharskillhub.co.in'),
                recipient_list=[email],
                fail_silently=False,
                html_message=f"""
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
      <h1>🎓 Bihar Skill Hub</h1>
      <p>Email Verification</p>
    </div>
    <div class="body">
      <p>You are registering on Bihar Skill Hub.<br>Use the OTP below to verify your email:</p>
      <div class="otp-box">
        <div class="otp">{otp_obj.otp}</div>
        <div class="note">Valid for 10 minutes only</div>
      </div>
      <p style="color:#dc2626;font-size:13px;">⚠️ Do not share this OTP with anyone.</p>
    </div>
    <div class="footer">
      Bihar Skill Hub &nbsp;|&nbsp; biharskillhub.co.in<br>
      admin@biharskillhub.co.in
    </div>
  </div>
</body>
</html>
                """,
            )
        except Exception as e:
            # If email fails, still return success in dev but log error
            if settings.DEBUG:
                print(f"[OTP Email Error] {e}")
                print(f"[DEV MODE] OTP for {email}: {otp_obj.otp}")
            else:
                return Response(
                    {'error': 'Failed to send OTP email. Please try again.'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        return Response({
            'message': f'OTP sent to {email}. Check your inbox.',
            'email': email,
        })


class VerifyOTPView(APIView):
    """
    POST /api/auth/verify-otp/
    Verifies OTP entered by user during registration.
    Returns a verified token to proceed with registration.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        otp   = request.data.get('otp', '').strip()

        if not email or not otp:
            return Response(
                {'error': 'Email and OTP are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            otp_obj = OTPVerification.objects.filter(
                email=email, is_used=False
            ).latest('created_at')
        except OTPVerification.DoesNotExist:
            return Response(
                {'error': 'No OTP found for this email. Please request a new OTP.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Increment attempts
        otp_obj.attempts += 1
        otp_obj.save(update_fields=['attempts'])

        if not otp_obj.is_valid():
            return Response(
                {'error': 'OTP has expired or too many attempts. Please request a new OTP.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if otp_obj.otp != otp:
            remaining = 3 - otp_obj.attempts
            return Response(
                {'error': f'Incorrect OTP. {remaining} attempt(s) remaining.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Mark OTP as used
        otp_obj.is_used = True
        otp_obj.save(update_fields=['is_used'])

        return Response({
            'message': 'OTP verified successfully!',
            'email': email,
            'verified': True,
        })


class ResendOTPView(APIView):
    """
    POST /api/auth/resend-otp/
    Resends a new OTP to the email.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # Reuse SendOTPView logic
        return SendOTPView().post(request)