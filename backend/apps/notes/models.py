"""
Notes App - Course notes/study materials (PDF, docs) uploaded by Admin.
Students can download notes for enrolled courses.
"""

from django.db import models
from apps.courses.models import Course
from apps.users.models import User


class Note(models.Model):
    PDF   = 'pdf'
    DOC   = 'doc'
    PPT   = 'ppt'
    OTHER = 'other'
    FILE_TYPE_CHOICES = [
        (PDF,   'PDF'),
        (DOC,   'Word Document'),
        (PPT,   'Presentation'),
        (OTHER, 'Other'),
    ]

    course      = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='notes')
    title       = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    file        = models.FileField(upload_to='notes/')
    file_type   = models.CharField(max_length=10, choices=FILE_TYPE_CHOICES, default=PDF)
    order       = models.PositiveIntegerField(default=0)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='notes_uploaded')
    is_free     = models.BooleanField(default=False, help_text='Accessible without enrollment')
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"[{self.course.title}] {self.title}"

    @property
    def file_size_kb(self):
        try:
            return round(self.file.size / 1024, 1)
        except Exception:
            return None
