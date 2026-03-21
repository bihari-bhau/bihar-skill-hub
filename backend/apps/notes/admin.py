from django.contrib import admin
from .models import Note

@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display  = ('title', 'course', 'file_type', 'is_free', 'order', 'created_at')
    list_filter   = ('file_type', 'is_free', 'course')
    search_fields = ('title', 'course__title')
    ordering      = ('course', 'order')
