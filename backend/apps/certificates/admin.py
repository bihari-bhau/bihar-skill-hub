from django.contrib import admin
from django.utils.html import format_html
from .models import Certificate
from .utils import generate_certificate_pdf, generate_offer_letter_pdf


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display  = ('student', 'course', 'cert_type', 'issued', 'issued_at', 'pdf_link')
    list_filter   = ('cert_type', 'issued', 'course')
    search_fields = ('student__email', 'student__full_name', 'course__title')
    readonly_fields = ('issued_at', 'pdf_file')
    actions = ['regenerate_pdfs']

    def pdf_link(self, obj):
        if obj.pdf_file:
            return format_html('<a href="{}" target="_blank">Download PDF</a>', obj.pdf_file.url)
        return '—'
    pdf_link.short_description = 'PDF'

    def regenerate_pdfs(self, request, queryset):
        for cert in queryset:
            if cert.cert_type == Certificate.OFFER_LETTER:
                generate_offer_letter_pdf(cert)
            else:
                generate_certificate_pdf(cert)
        self.message_user(request, f'{queryset.count()} PDF(s) regenerated.')
    regenerate_pdfs.short_description = 'Regenerate selected PDFs'
