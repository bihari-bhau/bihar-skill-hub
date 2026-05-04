from django.db.models import Sum, Count
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from apps.users.models import User
from .models import StudentPoints, StudentBadge, PointHistory, Badge
from .services import GamificationService


class LeaderboardView(APIView):
    """GET /api/gamification/leaderboard/ — Top 50 students by XP"""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        top = StudentPoints.objects.select_related('student').order_by('-total_xp')[:50]
        current_user_rank = None

        if request.user.is_authenticated:
            try:
                sp = StudentPoints.objects.get(student=request.user)
                current_user_rank = StudentPoints.objects.filter(total_xp__gt=sp.total_xp).count() + 1
            except StudentPoints.DoesNotExist:
                pass

        data = []
        for rank, sp in enumerate(top, 1):
            badge_count = StudentBadge.objects.filter(student=sp.student).count()
            data.append({
                'rank':        rank,
                'student_id':  sp.student.id,
                'name':        sp.student.full_name,
                'avatar':      sp.student.full_name[0].upper(),
                'total_xp':    sp.total_xp,
                'level':       sp.level,
                'level_name':  sp.level_name,
                'level_icon':  sp.level_icon,
                'streak_days': sp.streak_days,
                'badge_count': badge_count,
                'is_current':  request.user.is_authenticated and sp.student.id == request.user.id,
            })

        return Response({'leaderboard': data, 'my_rank': current_user_rank})


class MyStatsView(APIView):
    """GET /api/gamification/my-stats/ — Current student's gamification stats"""

    def get(self, request):
        sp, _ = StudentPoints.objects.get_or_create(student=request.user, defaults={'total_xp': 0})
        badges = StudentBadge.objects.filter(student=request.user).select_related('badge')

        history = PointHistory.objects.filter(student=request.user)[:10]

        rank = StudentPoints.objects.filter(total_xp__gt=sp.total_xp).count() + 1

        return Response({
            'total_xp':       sp.total_xp,
            'level':          sp.level,
            'level_name':     sp.level_name,
            'level_icon':     sp.level_icon,
            'next_level_xp':  sp.next_level_xp,
            'progress':       sp.progress_percent,
            'streak_days':    sp.streak_days,
            'rank':           rank,
            'badges': [{
                'name':      b.badge.name,
                'icon':      b.badge.icon,
                'color':     b.badge.color,
                'desc':      b.badge.description,
                'earned_at': b.earned_at,
            } for b in badges],
            'recent_xp': [{
                'points':     h.points,
                'reason':     h.reason,
                'created_at': h.created_at,
            } for h in history],
        })


class AllBadgesView(APIView):
    """GET /api/gamification/badges/ — All available badges"""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        all_badges = Badge.objects.all()
        earned_ids = []
        if request.user.is_authenticated:
            earned_ids = StudentBadge.objects.filter(
                student=request.user
            ).values_list('badge__name', flat=True)

        data = [{
            'name':    b.name,
            'icon':    b.icon,
            'color':   b.color,
            'desc':    b.description,
            'points':  b.points,
            'earned':  b.name in earned_ids,
        } for b in all_badges]

        return Response(data)


class DailyLoginView(APIView):
    """POST /api/gamification/daily-login/ — Award XP for daily login"""

    def post(self, request):
        from datetime import date
        today = date.today()
        sp, _ = StudentPoints.objects.get_or_create(student=request.user)

        if sp.last_login == today:
            return Response({'message': 'Already logged in today', 'xp_earned': 0})

        # Streak logic
        from datetime import timedelta
        if sp.last_login and (today - sp.last_login).days == 1:
            sp.streak_days += 1
        elif sp.last_login and (today - sp.last_login).days > 1:
            sp.streak_days = 1
        else:
            sp.streak_days = 1

        sp.last_login = today
        xp = 5

        # Streak bonus
        if sp.streak_days == 7:
            xp += 50
            GamificationService.award_badge(request.user, 'streak_warrior')
        elif sp.streak_days == 30:
            xp += 200

        sp.add_xp(xp, f'Daily login (streak: {sp.streak_days} days)')

        return Response({
            'xp_earned':   xp,
            'streak_days': sp.streak_days,
            'total_xp':    sp.total_xp,
            'level':       sp.level_name,
        })
