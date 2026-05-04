"""
Gamification Models — Points, Badges, Streaks, Leaderboard
backend/apps/gamification/models.py
"""
from django.db import models
from django.utils import timezone
from apps.users.models import User


class Badge(models.Model):
    BADGE_META = {
        'course_completer': {'icon': '🎓', 'color': '#1d4ed8', 'desc': 'Completed your first course',   'points': 100},
        'quiz_master':      {'icon': '🧠', 'color': '#7c3aed', 'desc': 'Passed 5 quizzes',              'points': 150},
        'fast_learner':     {'icon': '⚡', 'color': '#f59e0b', 'desc': 'Completed a course in 7 days',  'points': 75},
        'streak_warrior':   {'icon': '🔥', 'color': '#dc2626', 'desc': 'Logged in 7 days in a row',     'points': 50},
        'top_scorer':       {'icon': '🏆', 'color': '#d97706', 'desc': 'Scored 90%+ in a quiz',         'points': 100},
        'first_enroll':     {'icon': '🌟', 'color': '#059669', 'desc': 'Enrolled in first course',      'points': 25},
        'five_courses':     {'icon': '📚', 'color': '#0891b2', 'desc': 'Enrolled in 5+ courses',        'points': 200},
        'perfect_score':    {'icon': '💯', 'color': '#6366f1', 'desc': 'Got 100% in a quiz',            'points': 200},
        'early_bird':       {'icon': '🐦', 'color': '#10b981', 'desc': 'One of the first 100 students', 'points': 100},
        'knowledge_hunter': {'icon': '🔍', 'color': '#ec4899', 'desc': 'Completed 10 courses',          'points': 300},
    }

    BADGE_CHOICES = [(k, v['desc']) for k, v in BADGE_META.items()]

    name        = models.CharField(max_length=50, choices=BADGE_CHOICES, unique=True)
    description = models.TextField()
    icon        = models.CharField(max_length=10, default='🏅')
    color       = models.CharField(max_length=20, default='#1d4ed8')
    points      = models.IntegerField(default=50)
    created_at  = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class StudentPoints(models.Model):
    LEVEL_THRESHOLDS = [
        (0,    'Beginner',  '🌱', 1),
        (100,  'Explorer',  '🔍', 2),
        (300,  'Learner',   '📖', 3),
        (600,  'Achiever',  '⭐', 4),
        (1000, 'Expert',    '🚀', 5),
        (1500, 'Master',    '👑', 6),
        (2500, 'Legend',    '🏆', 7),
    ]

    student     = models.OneToOneField(User, on_delete=models.CASCADE, related_name='points')
    total_xp    = models.IntegerField(default=0)
    level       = models.IntegerField(default=1)
    level_name  = models.CharField(max_length=50, default='Beginner')
    level_icon  = models.CharField(max_length=10, default='🌱')
    streak_days = models.IntegerField(default=0)
    last_login  = models.DateField(null=True, blank=True)
    updated_at  = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.student.full_name} — {self.total_xp} XP"

    def add_xp(self, amount, reason=''):
        self.total_xp += amount
        self._update_level()
        self.save()
        PointHistory.objects.create(student=self.student, points=amount, reason=reason)

    def _update_level(self):
        for xp, name, icon, lvl in reversed(self.LEVEL_THRESHOLDS):
            if self.total_xp >= xp:
                self.level = lvl; self.level_name = name; self.level_icon = icon
                break

    @property
    def next_level_xp(self):
        for xp, name, icon, lvl in self.LEVEL_THRESHOLDS:
            if self.total_xp < xp:
                return xp
        return self.total_xp + 1

    @property
    def progress_percent(self):
        thresholds = [t[0] for t in self.LEVEL_THRESHOLDS]
        for i, t in enumerate(thresholds):
            if self.total_xp < t:
                prev = thresholds[i-1] if i > 0 else 0
                span = t - prev
                return int((self.total_xp - prev) / span * 100) if span else 100
        return 100


class PointHistory(models.Model):
    student    = models.ForeignKey(User, on_delete=models.CASCADE, related_name='point_history')
    points     = models.IntegerField()
    reason     = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']


class StudentBadge(models.Model):
    student   = models.ForeignKey(User, on_delete=models.CASCADE, related_name='badges')
    badge     = models.ForeignKey(Badge, on_delete=models.CASCADE)
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['student', 'badge']
        ordering = ['-earned_at']
