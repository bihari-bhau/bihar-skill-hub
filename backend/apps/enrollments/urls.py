from django.urls import path
from .views import (EnrollView, MyEnrollmentsView, UnenrollView,
                    AdminEnrollmentListView, MarkCourseCompleteView)

urlpatterns = [
    path('enroll/',             EnrollView.as_view(),              name='enroll'),
    path('my/',                 MyEnrollmentsView.as_view(),        name='my-enrollments'),
    path('<int:pk>/unenroll/',  UnenrollView.as_view(),             name='unenroll'),
    path('all/',                AdminEnrollmentListView.as_view(),  name='admin-enrollments'),
    path('<int:pk>/complete/',  MarkCourseCompleteView.as_view(),   name='mark-complete'),
]
