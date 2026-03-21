from django.contrib import admin
from .models import Lecture, WatchProgress

@admin.register(Lecture)
class LectureAdmin(admin.ModelAdmin):
    list_display  = ('title', 'course', 'video_type', 'order', 'is_preview', 'duration_seconds')
    list_filter   = ('video_type', 'is_preview', 'course')
    search_fields = ('title', 'course__title')
    ordering      = ('course', 'order')

@admin.register(WatchProgress)
class WatchProgressAdmin(admin.ModelAdmin):
    list_display  = ('student', 'lecture', 'watched_seconds', 'is_completed', 'last_watched_at')
    list_filter   = ('is_completed',)
    search_fields = ('student__email', 'lecture__title')
