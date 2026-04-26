from rest_framework import serializers
from .models import Certificate


class CertificateSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    course_title = serializers.CharField(source='course.title',       read_only=True)
    verify_url   = serializers.SerializerMethodField()

    class Meta:
        model  = Certificate
        fields = [
            'id', 'certificate_id',
            'student', 'student_name',
            'course',  'course_title',
            'cert_type', 'issued', 'issued_at',
            'pdf_file',
            'role', 'start_date', 'stipend', 'custom_note',
            'verify_url',
        ]
        read_only_fields = ['certificate_id', 'issued', 'issued_at', 'pdf_file', 'verify_url']

    def get_verify_url(self, obj):
        return obj.get_verify_url()


class IssueOfferLetterSerializer(serializers.ModelSerializer):
    """Admin issues an offer letter to a student."""
    class Meta:
        model  = Certificate
        fields = ['student', 'course', 'role', 'start_date', 'stipend', 'custom_note']
