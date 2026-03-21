"""
Enrollments App - Manages student course enrollments and completion tracking.
"""

from django.db import models
from apps.users.models import User
from apps.courses.models import Course


class Enrollment(models.Model):
    ACTIVE    = 'active'
    COMPLETED = 'completed'
    CANCELLED = 'cancelled'
    STATUS_CHOICES = [
        (ACTIVE,    'Active'),
        (COMPLETED, 'Completed'),
        (CANCELLED, 'Cancelled'),
    ]

    student     = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments')
    course      = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    status      = models.CharField(max_length=10, choices=STATUS_CHOICES, default=ACTIVE)
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ['student', 'course']
        ordering = ['-enrolled_at']

    def __str__(self):
        return f"{self.student.full_name} → {self.course.title} [{self.status}]"

    @property
    def completion_percentage(self):
        """Percentage of lectures completed by the student."""
        from apps.lectures.models import WatchProgress
        total = self.course.lectures.count()
        if total == 0:
            return 0
        completed = WatchProgress.objects.filter(
            student=self.student,
            lecture__course=self.course,
            is_completed=True
        ).count()
        return round((completed / total) * 100, 1)
