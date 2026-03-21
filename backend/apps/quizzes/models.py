"""
Quizzes App - MCQ quizzes per course with auto-scoring.
A passing score (defined on Course) triggers certificate generation.
"""

from django.db import models
from apps.courses.models import Course
from apps.users.models import User


class Quiz(models.Model):
    course      = models.OneToOneField(Course, on_delete=models.CASCADE, related_name='quiz')
    title       = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    time_limit_minutes = models.PositiveIntegerField(default=30, help_text='0 = no limit')
    max_attempts = models.PositiveIntegerField(default=3, help_text='0 = unlimited')
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Quizzes'

    def __str__(self):
        return f"Quiz: {self.course.title}"

    @property
    def total_marks(self):
        return self.questions.aggregate(
            total=models.Sum('marks')
        )['total'] or 0


class Question(models.Model):
    quiz    = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    text    = models.TextField()
    marks   = models.PositiveIntegerField(default=1)
    order   = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Q{self.order}: {self.text[:60]}"


class Option(models.Model):
    question   = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
    text       = models.CharField(max_length=500)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return f"{'✓' if self.is_correct else '✗'} {self.text[:60]}"


class QuizAttempt(models.Model):
    IN_PROGRESS = 'in_progress'
    SUBMITTED   = 'submitted'
    STATUS_CHOICES = [(IN_PROGRESS, 'In Progress'), (SUBMITTED, 'Submitted')]

    student    = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quiz_attempts')
    quiz       = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    status     = models.CharField(max_length=15, choices=STATUS_CHOICES, default=IN_PROGRESS)
    score      = models.FloatField(null=True, blank=True, help_text='Percentage score 0–100')
    started_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.student.full_name} — {self.quiz} [{self.score}%]"

    @property
    def passed(self):
        if self.score is None:
            return False
        return self.score >= self.quiz.course.passing_score

    def calculate_score(self):
        """Calculate and store the percentage score from submitted answers."""
        total_marks = self.quiz.total_marks
        if total_marks == 0:
            self.score = 0
            return
        earned = 0
        for answer in self.answers.all():
            if answer.selected_option and answer.selected_option.is_correct:
                earned += answer.question.marks
        self.score = round((earned / total_marks) * 100, 2)


class StudentAnswer(models.Model):
    attempt         = models.ForeignKey(QuizAttempt, on_delete=models.CASCADE, related_name='answers')
    question        = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_option = models.ForeignKey(Option, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        unique_together = ['attempt', 'question']
