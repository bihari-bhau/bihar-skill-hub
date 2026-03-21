from rest_framework import generics, permissions
from .models import Note
from .serializers import NoteSerializer
from apps.enrollments.models import Enrollment


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_staff


class NoteListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/notes/?course=<id>  — List notes the student can access
    POST /api/notes/              — Admin uploads a note
    """
    serializer_class   = NoteSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        qs = Note.objects.select_related('course')
        course_id = self.request.query_params.get('course')
        if course_id:
            qs = qs.filter(course_id=course_id)

        if not self.request.user.is_staff:
            enrolled_course_ids = Enrollment.objects.filter(
                student=self.request.user, status=Enrollment.ACTIVE
            ).values_list('course_id', flat=True)
            # Student sees notes for enrolled courses OR free notes
            qs = qs.filter(course_id__in=enrolled_course_ids) | qs.filter(is_free=True)
        return qs.distinct()

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)


class NoteDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/PATCH/DELETE /api/notes/<pk>/"""
    queryset           = Note.objects.all()
    serializer_class   = NoteSerializer
    permission_classes = [IsAdminOrReadOnly]
