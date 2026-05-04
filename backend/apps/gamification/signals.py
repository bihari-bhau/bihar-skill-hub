from django.db.models.signals import post_save
from django.dispatch import receiver


def connect_gamification_signals():
    try:
        from apps.enrollments.models import Enrollment
        from apps.quizzes.models import QuizAttempt
        from .services import GamificationService

        @receiver(post_save, sender=Enrollment)
        def on_enrollment(sender, instance, created, **kwargs):
            if created:
                GamificationService.award_xp(instance.student, 'enrollment', 'Course enrolled')
                GamificationService._check_badges(instance.student)

        @receiver(post_save, sender=QuizAttempt)
        def on_quiz(sender, instance, **kwargs):
            if instance.status == 'submitted' and instance.score is not None:
                action = 'quiz_perfect' if instance.score == 100 else 'quiz_pass' if instance.passed else None
                if action:
                    GamificationService.award_xp(instance.student, action, f'Quiz score: {instance.score}%')
                    GamificationService._check_badges(instance.student)

    except ImportError:
        pass


connect_gamification_signals()
