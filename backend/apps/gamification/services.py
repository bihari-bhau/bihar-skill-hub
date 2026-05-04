"""
GamificationService — Awards XP and badges.
Call these from signals/views whenever an action happens.
"""
from .models import StudentPoints, Badge, StudentBadge


class GamificationService:

    XP_MAP = {
        'enrollment':   10,
        'completion':  100,
        'quiz_pass':    50,
        'quiz_perfect':100,
        'daily_login':   5,
        'first_course': 25,
        'review':       15,
    }

    @classmethod
    def award_xp(cls, user, action, reason=None):
        xp = cls.XP_MAP.get(action, 0)
        if xp == 0:
            return
        sp, _ = StudentPoints.objects.get_or_create(user=user)
        sp.add_xp(xp, reason or action)
        cls._check_badges(user)

    @classmethod
    def award_badge(cls, user, badge_name):
        meta = Badge.BADGE_META.get(badge_name)
        if not meta:
            return
        badge, _ = Badge.objects.get_or_create(
            name=badge_name,
            defaults={
                'description': meta['desc'],
                'icon':        meta['icon'],
                'color':       meta['color'],
                'points':      meta['points'],
            }
        )
        sb, created = StudentBadge.objects.get_or_create(user=user, badge=badge)
        if created:
            sp, _ = StudentPoints.objects.get_or_create(user=user)
            sp.add_xp(badge.points, f'Badge earned: {badge.name}')
        return created

    @classmethod
    def _check_badges(cls, user):
        from apps.enrollments.models import Enrollment
        from apps.quizzes.models import QuizAttempt

        enrolled_count = Enrollment.objects.filter(
            student=user, status='active'
        ).count()
        completed_count = Enrollment.objects.filter(
            student=user, status='completed'
        ).count()
        quiz_passes = QuizAttempt.objects.filter(
            student=user, passed=True
        ).count()

        if enrolled_count >= 1:
            cls.award_badge(user, 'first_enroll')
        if enrolled_count >= 5:
            cls.award_badge(user, 'five_courses')
        if completed_count >= 1:
            cls.award_badge(user, 'course_completer')
        if quiz_passes >= 5:
            cls.award_badge(user, 'quiz_master')

        perfect = QuizAttempt.objects.filter(
            student=user, score=100, passed=True
        ).exists()
        if perfect:
            cls.award_badge(user, 'perfect_score')

        top_score = QuizAttempt.objects.filter(
            student=user, score__gte=90, passed=True
        ).exists()
        if top_score:
            cls.award_badge(user, 'top_scorer')

        if user.id <= 100:
            cls.award_badge(user, 'early_bird')
