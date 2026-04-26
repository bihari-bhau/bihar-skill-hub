# backend/apps/users/urls.py
# Add these 3 new OTP URLs to your existing urlpatterns

from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# Import existing views (keep all your existing imports)
from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    ProfileView,
    ChangePasswordView,
    StudentListView,
)

# Import new OTP views
from .otp_views import SendOTPView, VerifyOTPView, ResendOTPView

urlpatterns = [
    # ── Existing endpoints (keep as is) ──────────────────────────────────
    path('register/',         RegisterView.as_view(),       name='register'),
    path('login/',            LoginView.as_view(),           name='login'),
    path('logout/',           LogoutView.as_view(),          name='logout'),
    path('profile/',          ProfileView.as_view(),         name='profile'),
    path('change-password/',  ChangePasswordView.as_view(),  name='change-password'),
    path('students/',         StudentListView.as_view(),     name='students'),

    # ── NEW: OTP endpoints ────────────────────────────────────────────────
    path('send-otp/',         SendOTPView.as_view(),         name='send-otp'),
    path('verify-otp/',       VerifyOTPView.as_view(),       name='verify-otp'),
    path('resend-otp/',       ResendOTPView.as_view(),       name='resend-otp'),
]