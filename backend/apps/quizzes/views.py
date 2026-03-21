from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from .models import Quiz, Question, QuizAttempt, StudentAnswer
from .serializers import (QuizSerializer, QuizPublicSerializer, QuestionSerializer,
                           QuizAttemptSerializer, SubmitQuizSerializer)
from apps.enrollments.models import Enrollment


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_staff


# ─── Quiz CRUD (Admin) ─────────────────────────────────────────────────────────
class QuizListCreateView(generics.ListCreateAPIView):
    queryset           = Quiz.objects.all()
    permission_classes = [IsAdminOrReadOnly]

    def get_serializer_class(self):
        if self.request.user.is_staff:
            return QuizSerializer
        return QuizPublicSerializer


class QuizDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset           = Quiz.objects.all()
    permission_classes = [IsAdminOrReadOnly]

    def get_serializer_class(self):
        if self.request.user.is_staff:
            return QuizSerializer
        return QuizPublicSerializer


class QuestionCreateView(generics.CreateAPIView):
    """POST /api/quizzes/<quiz_id>/questions/ — Admin adds a question with options"""
    serializer_class   = QuestionSerializer
    permission_classes = [permissions.IsAdminUser]

    def perform_create(self, serializer):
        quiz = Quiz.objects.get(pk=self.kwargs['quiz_id'])
        serializer.save(quiz=quiz)


class QuestionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset           = Question.objects.all()
    serializer_class   = QuestionSerializer
    permission_classes = [permissions.IsAdminUser]


# ─── Student Quiz Flow ─────────────────────────────────────────────────────────
class StartQuizAttemptView(APIView):
    """POST /api/quizzes/<quiz_id>/start/ — Student starts an attempt"""

    def post(self, request, quiz_id):
        try:
            quiz = Quiz.objects.get(pk=quiz_id)
        except Quiz.DoesNotExist:
            return Response({'error': 'Quiz not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Check enrollment
        enrolled = Enrollment.objects.filter(
            student=request.user, course=quiz.course, status=Enrollment.ACTIVE
        ).exists()
        if not enrolled:
            return Response({'error': 'You must be enrolled to take this quiz.'},
                            status=status.HTTP_403_FORBIDDEN)

        # Check max attempts
        if quiz.max_attempts > 0:
            attempt_count = QuizAttempt.objects.filter(
                student=request.user, quiz=quiz, status=QuizAttempt.SUBMITTED
            ).count()
            if attempt_count >= quiz.max_attempts:
                return Response({'error': f'Maximum {quiz.max_attempts} attempts reached.'},
                                status=status.HTTP_403_FORBIDDEN)

        # Check for in-progress attempt
        existing = QuizAttempt.objects.filter(
            student=request.user, quiz=quiz, status=QuizAttempt.IN_PROGRESS
        ).first()
        if existing:
            return Response(QuizAttemptSerializer(existing).data)

        attempt = QuizAttempt.objects.create(student=request.user, quiz=quiz)
        return Response(QuizAttemptSerializer(attempt).data, status=status.HTTP_201_CREATED)


class SubmitQuizAttemptView(APIView):
    """POST /api/quizzes/attempts/<attempt_id>/submit/ — Student submits answers"""

    def post(self, request, attempt_id):
        try:
            attempt = QuizAttempt.objects.get(pk=attempt_id, student=request.user)
        except QuizAttempt.DoesNotExist:
            return Response({'error': 'Attempt not found.'}, status=status.HTTP_404_NOT_FOUND)

        if attempt.status == QuizAttempt.SUBMITTED:
            return Response({'error': 'Already submitted.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = SubmitQuizSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Save answers
        for ans_data in serializer.validated_data['answers']:
            StudentAnswer.objects.update_or_create(
                attempt=attempt,
                question=ans_data['question'],
                defaults={'selected_option': ans_data.get('selected_option')}
            )

        # Score and close attempt
        attempt.calculate_score()
        attempt.status = QuizAttempt.SUBMITTED
        attempt.submitted_at = timezone.now()
        attempt.save()

        # Auto-trigger certificate if passed
        if attempt.passed:
            _trigger_certificate(request.user, attempt.quiz.course)

        return Response({
            'score': attempt.score,
            'passed': attempt.passed,
            'passing_score': attempt.quiz.course.passing_score,
            'message': 'Congratulations! Certificate issued.' if attempt.passed else
                       f'You need {attempt.quiz.course.passing_score}% to pass. Please retry.',
        })


class MyAttemptsView(generics.ListAPIView):
    """GET /api/quizzes/my-attempts/?quiz=<id>"""
    serializer_class = QuizAttemptSerializer

    def get_queryset(self):
        qs = QuizAttempt.objects.filter(student=self.request.user)
        quiz_id = self.request.query_params.get('quiz')
        if quiz_id:
            qs = qs.filter(quiz_id=quiz_id)
        return qs


def _trigger_certificate(student, course):
    """Trigger certificate generation when student passes quiz."""
    from apps.certificates.models import Certificate
    from apps.certificates.utils import generate_certificate_pdf

    cert, created = Certificate.objects.get_or_create(
        student=student,
        course=course,
        cert_type=Certificate.COURSE,
        defaults={'issued': True}
    )
    if created:
        generate_certificate_pdf(cert)
