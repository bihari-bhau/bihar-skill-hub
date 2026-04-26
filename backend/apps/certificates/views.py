from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import FileResponse
from .models import Certificate
from .serializers import CertificateSerializer, IssueOfferLetterSerializer
from .utils import generate_certificate_pdf, generate_offer_letter_pdf


# ─── Student Views ────────────────────────────────────────────────────────────

class MyCertificatesView(generics.ListAPIView):
    """GET /api/certificates/my/ — Student views their certificates & offer letters"""
    serializer_class = CertificateSerializer

    def get_queryset(self):
        qs = Certificate.objects.filter(student=self.request.user, issued=True)
        cert_type = self.request.query_params.get('type')
        if cert_type:
            qs = qs.filter(cert_type=cert_type)
        return qs


class DownloadCertificateView(APIView):
    """GET /api/certificates/<pk>/download/ — Student downloads their certificate PDF"""

    def get(self, request, pk):
        try:
            cert = Certificate.objects.get(pk=pk, student=request.user, issued=True)
        except Certificate.DoesNotExist:
            return Response({'error': 'Certificate not found.'}, status=status.HTTP_404_NOT_FOUND)

        if not cert.pdf_file:
            # Regenerate if missing
            if cert.cert_type == Certificate.OFFER_LETTER:
                generate_offer_letter_pdf(cert)
            else:
                generate_certificate_pdf(cert)
            cert.refresh_from_db()

        if not cert.pdf_file:
            return Response({'error': 'PDF could not be generated.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        response = FileResponse(cert.pdf_file.open('rb'), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{cert.pdf_file.name.split("/")[-1]}"'
        return response


# ─── Public Verification View (No Auth Required) ──────────────────────────────

class VerifyCertificateView(APIView):
    """
    PUBLIC — GET /api/certificates/verify/<certificate_id>/
    Used by the /verify/<id> frontend page and QR code scans.
    No login required.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, certificate_id):
        try:
            cert = Certificate.objects.select_related(
                'student', 'course'
            ).get(certificate_id=certificate_id, issued=True)
        except Certificate.DoesNotExist:
            return Response(
                {'error': 'Certificate not found or not yet issued.', 'is_valid': False},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response({
            'is_valid':       True,
            'certificate_id': str(cert.certificate_id),
            'cert_type':      cert.cert_type,
            'student_name':   cert.student.full_name,
            'course_title':   cert.course.title,
            'issued_at':      cert.issued_at,
            'role':           cert.role   or None,
            'stipend':        cert.stipend or None,
            'pdf_file':       cert.pdf_file.url if cert.pdf_file else None,
        })


# ─── Admin Views ──────────────────────────────────────────────────────────────

class AdminCertificateListView(generics.ListAPIView):
    """GET /api/certificates/all/ — Admin lists all certificates"""
    serializer_class   = CertificateSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        qs = Certificate.objects.select_related('student', 'course').all()
        cert_type  = self.request.query_params.get('type')
        student_id = self.request.query_params.get('student')
        course_id  = self.request.query_params.get('course')
        if cert_type:
            qs = qs.filter(cert_type=cert_type)
        if student_id:
            qs = qs.filter(student_id=student_id)
        if course_id:
            qs = qs.filter(course_id=course_id)
        return qs


class IssueOfferLetterView(APIView):
    """POST /api/certificates/issue-offer-letter/ — Admin issues offer letter to a student"""
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        serializer = IssueOfferLetterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        cert, created = Certificate.objects.get_or_create(
            student=serializer.validated_data['student'],
            course=serializer.validated_data['course'],
            cert_type=Certificate.OFFER_LETTER,
            defaults={**serializer.validated_data, 'issued': False}
        )
        if not created:
            # Update fields on existing offer letter
            for field, value in serializer.validated_data.items():
                setattr(cert, field, value)
            cert.save()

        generate_offer_letter_pdf(cert)
        cert.refresh_from_db()
        return Response(CertificateSerializer(cert).data, status=status.HTTP_201_CREATED)


class AdminDownloadCertificateView(APIView):
    """GET /api/certificates/admin/<pk>/download/ — Admin downloads any certificate"""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, pk):
        try:
            cert = Certificate.objects.get(pk=pk)
        except Certificate.DoesNotExist:
            return Response({'error': 'Certificate not found.'}, status=status.HTTP_404_NOT_FOUND)

        if not cert.pdf_file:
            if cert.cert_type == Certificate.OFFER_LETTER:
                generate_offer_letter_pdf(cert)
            else:
                generate_certificate_pdf(cert)
            cert.refresh_from_db()

        response = FileResponse(cert.pdf_file.open('rb'), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{cert.pdf_file.name.split("/")[-1]}"'
        return response


class RegenerateCertificateView(APIView):
    """POST /api/certificates/admin/<pk>/regenerate/ — Admin regenerates a PDF"""
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            cert = Certificate.objects.get(pk=pk)
        except Certificate.DoesNotExist:
            return Response({'error': 'Certificate not found.'}, status=status.HTTP_404_NOT_FOUND)

        if cert.cert_type == Certificate.OFFER_LETTER:
            generate_offer_letter_pdf(cert)
        else:
            generate_certificate_pdf(cert)

        cert.refresh_from_db()
        return Response({
            'message':    'PDF regenerated successfully.',
            'pdf_url':    cert.pdf_file.url if cert.pdf_file else None,
            'verify_url': cert.get_verify_url(),
        })
