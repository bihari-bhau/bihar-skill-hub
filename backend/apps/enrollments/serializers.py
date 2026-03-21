from rest_framework import serializers
from .models import Enrollment
from apps.courses.serializers import CourseListSerializer


class EnrollmentSerializer(serializers.ModelSerializer):
    course_detail       = CourseListSerializer(source='course', read_only=True)
    completion_percentage = serializers.ReadOnlyField()

    class Meta:
        model  = Enrollment
        fields = ['id', 'course', 'course_detail', 'status', 'enrolled_at',
                  'completed_at', 'completion_percentage']
        read_only_fields = ['status', 'enrolled_at', 'completed_at', 'completion_percentage']
