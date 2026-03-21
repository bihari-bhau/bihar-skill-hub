from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Lecture, WatchProgress
from .serializers import LectureSerializer, WatchProgressSerializer
from apps.enrollments.models import Enrollment


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_staff


class LectureListCreateView(generics.ListCreateAPIView):
    """GET /api/lectures/?course=<id>  |  POST (admin only)"""
    serializer_class   = LectureSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        qs = Lecture.objects.select_related('course')
        course_id = self.request.query_params.get('course')
        if course_id:
            qs = qs.filter(course_id=course_id)
        # Non-admin can only see lectures of courses they're enrolled in, or preview lectures
        if not self.request.user.is_staff:
            enrolled_course_ids = Enrollment.objects.filter(
                student=self.request.user, status=Enrollment.ACTIVE
            ).values_list('course_id', flat=True)
            qs = qs.filter(course_id__in=enrolled_course_ids) | qs.filter(is_preview=True)
        return qs.distinct()


class LectureDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Lecture.objects.all()
    serializer_class   = LectureSerializer
    permission_classes = [IsAdminOrReadOnly]


class UpdateWatchProgressView(APIView):
    """POST /api/lectures/<lecture_id>/progress/ — student updates watch position"""

    def post(self, request, lecture_id):
        try:
            lecture = Lecture.objects.get(pk=lecture_id)
        except Lecture.DoesNotExist:
            return Response({'error': 'Lecture not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Ensure student is enrolled
        enrolled = Enrollment.objects.filter(
            student=request.user, course=lecture.course, status=Enrollment.ACTIVE
        ).exists()
        if not enrolled and not lecture.is_preview:
            return Response({'error': 'Not enrolled in this course.'}, status=status.HTTP_403_FORBIDDEN)

        progress, _ = WatchProgress.objects.get_or_create(student=request.user, lecture=lecture)
        serializer = WatchProgressSerializer(progress, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class MyWatchProgressView(generics.ListAPIView):
    """GET /api/lectures/my-progress/?course=<id>"""
    serializer_class = WatchProgressSerializer

    def get_queryset(self):
        qs = WatchProgress.objects.filter(student=self.request.user)
        course_id = self.request.query_params.get('course')
        if course_id:
            qs = qs.filter(lecture__course_id=course_id)
        return qs
