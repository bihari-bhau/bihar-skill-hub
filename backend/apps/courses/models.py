"""
Courses App - Core course catalog managed by Admin.
"""

from django.db import models
from apps.users.models import User


class Category(models.Model):
    name        = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name


class Course(models.Model):
    DRAFT     = 'draft'
    PUBLISHED = 'published'
    ARCHIVED  = 'archived'
    STATUS_CHOICES = [(DRAFT, 'Draft'), (PUBLISHED, 'Published'), (ARCHIVED, 'Archived')]

    BEGINNER     = 'beginner'
    INTERMEDIATE = 'intermediate'
    ADVANCED     = 'advanced'
    LEVEL_CHOICES = [
        (BEGINNER,     'Beginner'),
        (INTERMEDIATE, 'Intermediate'),
        (ADVANCED,     'Advanced'),
    ]

    title           = models.CharField(max_length=200)
    slug            = models.SlugField(unique=True)
    description     = models.TextField()
    category        = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='courses')
    thumbnail       = models.ImageField(upload_to='course_thumbnails/', blank=True, null=True)
    created_by      = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='courses_created')
    status          = models.CharField(max_length=10, choices=STATUS_CHOICES, default=DRAFT)
    price           = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    is_free         = models.BooleanField(default=True)
    duration_hours  = models.FloatField(default=0)
    level           = models.CharField(max_length=15, choices=LEVEL_CHOICES, default=BEGINNER)
    rating          = models.DecimalField(max_digits=3, decimal_places=1, default=4.5)
    students_count  = models.PositiveIntegerField(default=0)
    passing_score   = models.IntegerField(default=70, help_text='Minimum quiz score % to get certificate')
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title
