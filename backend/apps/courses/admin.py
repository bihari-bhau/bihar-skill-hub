from django.contrib import admin
from .models import Course, Category

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display  = ('title', 'category', 'status', 'is_free', 'created_at')
    list_filter   = ('status', 'category', 'is_free')
    search_fields = ('title', 'description')
    prepopulated_fields = {'slug': ('title',)}
