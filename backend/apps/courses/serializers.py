from rest_framework import serializers
from .models import Course, Category


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = Category
        fields = '__all__'


class CourseListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model  = Course
        fields = ['id', 'title', 'slug', 'description', 'thumbnail', 'category_name',
                  'is_free', 'price', 'duration_hours', 'level', 'rating',
                  'students_count', 'status', 'created_at']


class CourseDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True, required=False
    )

    class Meta:
        model  = Course
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at', 'updated_at']
