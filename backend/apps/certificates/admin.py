from django.contrib import admin
from .models import Certificate


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display   = ('student', 'course', 'cert_type', 'issued', 'certificate_id', 'issued_at')
    list_filter    = ('cert_type', 'issued')
    search_fields  = ('student__full_name', 'student__email', 'course__title', 'certificate_id')
    readonly_fields = ('certificate_id', 'issued_at', 'pdf_file')

    fieldsets = (
        ('Certificate Info', {
            'fields': ('student', 'course', 'cert_type', 'certificate_id', 'issued', 'issued_at', 'pdf_file')
        }),
        ('Offer Letter Fields', {
            'fields': ('role', 'start_date', 'stipend', 'custom_note'),
            'classes': ('collapse',),
        }),
    )
