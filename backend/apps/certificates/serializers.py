from rest_framework import serializers
from .models import Certificate


class CertificateSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model  = Certificate
        fields = ['id', 'student', 'student_name', 'course', 'course_title',
                  'cert_type', 'issued', 'issued_at', 'pdf_file',
                  'role', 'start_date', 'stipend', 'custom_note']
        read_only_fields = ['issued', 'issued_at', 'pdf_file']


class IssueOfferLetterSerializer(serializers.ModelSerializer):
    """Admin issues an offer letter to a student."""
    class Meta:
        model  = Certificate
        fields = ['student', 'course', 'role', 'start_date', 'stipend', 'custom_note']
