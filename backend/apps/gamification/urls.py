from django.urls import path
from .views import LeaderboardView, MyStatsView, AllBadgesView, DailyLoginView

urlpatterns = [
    path('leaderboard/',  LeaderboardView.as_view(), name='leaderboard'),
    path('my-stats/',     MyStatsView.as_view(),     name='my-stats'),
    path('badges/',       AllBadgesView.as_view(),   name='all-badges'),
    path('daily-login/',  DailyLoginView.as_view(),  name='daily-login'),
]
