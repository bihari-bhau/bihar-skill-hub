from django.urls import path
from .views import (
    MyCertificatesView,
    DownloadCertificateView,
    VerifyCertificateView,
    AdminCertificateListView,
    IssueOfferLetterView,
    AdminDownloadCertificateView,
    RegenerateCertificateView,
    ClaimCertificateView,
    IssueCertificateView,
)

urlpatterns = [
    # ── Student endpoints ─────────────────────────────────────────────────
    path('my/',                        MyCertificatesView.as_view(),          name='my-certificates'),
    path('<int:pk>/download/',         DownloadCertificateView.as_view(),      name='cert-download'),
    path('claim/<int:course_id>/',     ClaimCertificateView.as_view(),         name='claim-certificate'),

    # ── PUBLIC verification — no login required ───────────────────────────
    path('verify/<str:certificate_id>/', VerifyCertificateView.as_view(),     name='verify-certificate'),

    # ── Admin endpoints ───────────────────────────────────────────────────
    path('all/',                         AdminCertificateListView.as_view(),     name='admin-cert-list'),
    path('issue-offer-letter/',          IssueOfferLetterView.as_view(),         name='issue-offer-letter'),
    path('issue-certificate/',           IssueCertificateView.as_view(),         name='issue-certificate'),
    path('admin/<int:pk>/download/',     AdminDownloadCertificateView.as_view(), name='admin-cert-download'),
    path('admin/<int:pk>/regenerate/',   RegenerateCertificateView.as_view(),    name='cert-regenerate'),
]