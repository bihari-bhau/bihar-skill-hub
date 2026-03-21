"""
Lectures App - Video lectures with upload support, embed links, and watch progress tracking.
"""

from django.db import models
from apps.courses.models import Course
from apps.users.models import User


class Lecture(models.Model):
    VIDEO_UPLOAD = 'upload'
    VIDEO_EMBED  = 'embed'
    VIDEO_TYPES  = [(VIDEO_UPLOAD, 'Uploaded Video'), (VIDEO_EMBED, 'Embed Link (YouTube/Vimeo)')]

    course       = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lectures')
    title        = models.CharField(max_length=200)
    description  = models.TextField(blank=True)
    order        = models.PositiveIntegerField(default=0)
    video_type   = models.CharField(max_length=10, choices=VIDEO_TYPES, default=VIDEO_UPLOAD)
    # For uploaded videos
    video_file   = models.FileField(upload_to='lectures/videos/', blank=True, null=True)
    # For YouTube/Vimeo embed
    video_url    = models.URLField(blank=True, help_text='YouTube or Vimeo URL')
    embed_code   = models.TextField(blank=True, help_text='Optional custom embed HTML')
    duration_seconds = models.PositiveIntegerField(default=0)
    is_preview   = models.BooleanField(default=False, help_text='Free preview without enrollment')
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"[{self.course.title}] {self.title}"

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.video_type == self.VIDEO_UPLOAD and not self.video_file:
            raise ValidationError('Uploaded video requires a video file.')
        if self.video_type == self.VIDEO_EMBED and not self.video_url:
            raise ValidationError('Embed video requires a URL.')


class WatchProgress(models.Model):
    """Tracks how far a student has watched each lecture."""
    student          = models.ForeignKey(User, on_delete=models.CASCADE, related_name='watch_progress')
    lecture          = models.ForeignKey(Lecture, on_delete=models.CASCADE, related_name='watch_progress')
    watched_seconds  = models.PositiveIntegerField(default=0)
    is_completed     = models.BooleanField(default=False)
    last_watched_at  = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['student', 'lecture']

    def __str__(self):
        return f"{self.student.full_name} → {self.lecture.title} ({self.watched_seconds}s)"

    def save(self, *args, **kwargs):
        # Auto-mark completed if ≥90% watched
        if self.lecture.duration_seconds > 0:
            pct = self.watched_seconds / self.lecture.duration_seconds
            self.is_completed = pct >= 0.9
        super().save(*args, **kwargs)
