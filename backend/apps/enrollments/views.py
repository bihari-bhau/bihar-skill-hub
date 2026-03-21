from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from .models import Enrollment
from .serializers import EnrollmentSerializer


class EnrollView(APIView):
    """POST /api/enrollments/enroll/  — Student enrolls in a course"""

    def post(self, request):
        course_id = request.data.get('course_id')
        if not course_id:
            return Response({'error': 'course_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        enrollment, created = Enrollment.objects.get_or_create(
            student=request.user,
            course_id=course_id,
            defaults={'status': Enrollment.ACTIVE}
        )
        if not created:
            if enrollment.status == Enrollment.CANCELLED:
                enrollment.status = Enrollment.ACTIVE
                enrollment.save()
                return Response({'message': 'Re-enrolled successfully.', 'enrollment_id': enrollment.id})
            return Response({'message': 'Already enrolled.', 'enrollment_id': enrollment.id})

        return Response({'message': 'Enrolled successfully.', 'enrollment_id': enrollment.id},
                        status=status.HTTP_201_CREATED)


class MyEnrollmentsView(generics.ListAPIView):
    """GET /api/enrollments/my/ — List all enrollments for the logged-in student"""
    serializer_class = EnrollmentSerializer

    def get_queryset(self):
        return Enrollment.objects.filter(
            student=self.request.user
        ).select_related('course', 'course__category')


class UnenrollView(APIView):
    """DELETE /api/enrollments/<enrollment_id>/unenroll/"""

    def delete(self, request, pk):
        try:
            enrollment = Enrollment.objects.get(pk=pk, student=request.user)
        except Enrollment.DoesNotExist:
            return Response({'error': 'Enrollment not found.'}, status=status.HTTP_404_NOT_FOUND)
        enrollment.status = Enrollment.CANCELLED
        enrollment.save()
        return Response({'message': 'Unenrolled successfully.'})


class AdminEnrollmentListView(generics.ListAPIView):
    """GET /api/enrollments/all/?course=<id>  — Admin: view all enrollments"""
    serializer_class   = EnrollmentSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        qs = Enrollment.objects.select_related('student', 'course')
        course_id = self.request.query_params.get('course')
        if course_id:
            qs = qs.filter(course_id=course_id)
        return qs


class MarkCourseCompleteView(APIView):
    """POST /api/enrollments/<enrollment_id>/complete/ — Admin marks a course as completed"""
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            enrollment = Enrollment.objects.get(pk=pk)
        except Enrollment.DoesNotExist:
            return Response({'error': 'Enrollment not found.'}, status=status.HTTP_404_NOT_FOUND)
        enrollment.status = Enrollment.COMPLETED
        enrollment.completed_at = timezone.now()
        enrollment.save()
        return Response({'message': 'Course marked as completed.'})
