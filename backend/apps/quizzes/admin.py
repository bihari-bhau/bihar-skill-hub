from django.contrib import admin
from .models import Quiz, Question, Option, QuizAttempt, StudentAnswer


class OptionInline(admin.TabularInline):
    model = Option
    extra = 4


class QuestionInline(admin.StackedInline):
    model = Option
    extra = 0


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display  = ('course', 'title', 'time_limit_minutes', 'max_attempts')
    search_fields = ('title', 'course__title')


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display  = ('quiz', 'text', 'marks', 'order')
    list_filter   = ('quiz',)
    inlines       = [OptionInline]


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display  = ('student', 'quiz', 'score', 'status', 'submitted_at')
    list_filter   = ('status', 'quiz')
    search_fields = ('student__email',)
    readonly_fields = ('score', 'submitted_at')
