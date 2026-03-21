from django.urls import path
from .views import (QuizListCreateView, QuizDetailView, QuestionCreateView,
                    QuestionDetailView, StartQuizAttemptView,
                    SubmitQuizAttemptView, MyAttemptsView)

urlpatterns = [
    path('',                                    QuizListCreateView.as_view(),    name='quiz-list'),
    path('<int:pk>/',                           QuizDetailView.as_view(),        name='quiz-detail'),
    path('<int:quiz_id>/questions/',            QuestionCreateView.as_view(),    name='question-create'),
    path('questions/<int:pk>/',                 QuestionDetailView.as_view(),    name='question-detail'),
    path('<int:quiz_id>/start/',                StartQuizAttemptView.as_view(),  name='quiz-start'),
    path('attempts/<int:attempt_id>/submit/',   SubmitQuizAttemptView.as_view(), name='quiz-submit'),
    path('my-attempts/',                        MyAttemptsView.as_view(),        name='my-attempts'),
]
