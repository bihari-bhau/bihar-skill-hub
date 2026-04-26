"""
Users App - Custom User model supporting Admin and Student roles.
"""

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', User.ADMIN)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    STUDENT = 'student'
    ADMIN   = 'admin'
    ROLE_CHOICES = [(STUDENT, 'Student'), (ADMIN, 'Admin')]

    email        = models.EmailField(unique=True)
    full_name    = models.CharField(max_length=150)
    role         = models.CharField(max_length=10, choices=ROLE_CHOICES, default=STUDENT)
    phone        = models.CharField(max_length=20, blank=True)
    profile_pic  = models.ImageField(upload_to='profiles/', blank=True, null=True)
    bio          = models.TextField(blank=True)
    is_active    = models.BooleanField(default=True)
    is_staff     = models.BooleanField(default=False)
    date_joined  = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = ['full_name']
    objects = UserManager()

    class Meta:
        verbose_name = 'User'
        ordering = ['-date_joined']

    def __str__(self):
        return f"{self.full_name} ({self.role})"

    @property
    def is_admin(self):
        return self.role == self.ADMIN

    @property
    def is_student(self):
        return self.role == self.STUDENT
"""
OTP Model — Email verification for registration
Add this to backend/apps/users/models.py (append below existing User model)
"""

import random
import string
from django.db import models
from django.utils import timezone
from datetime import timedelta


class OTPVerification(models.Model):
    """Stores OTP for email verification during registration."""
    email      = models.EmailField()
    otp        = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used    = models.BooleanField(default=False)
    attempts   = models.IntegerField(default=0)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"OTP for {self.email}"

    def is_valid(self):
        """OTP valid for 10 minutes, max 3 attempts."""
        expiry = self.created_at + timedelta(minutes=10)
        return (
            not self.is_used and
            timezone.now() < expiry and
            self.attempts < 3
        )

    @classmethod
    def generate_otp(cls, email):
        """Delete old OTPs for email and create a new one."""
        cls.objects.filter(email=email, is_used=False).delete()
        otp = ''.join(random.choices(string.digits, k=6))
        return cls.objects.create(email=email, otp=otp)