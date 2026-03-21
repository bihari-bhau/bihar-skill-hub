from django.urls import path
from .views import RegisterView, LoginView, LogoutView, ProfileView, ChangePasswordView, StudentListView

urlpatterns = [
    path('register/',        RegisterView.as_view(),       name='register'),
    path('login/',           LoginView.as_view(),           name='login'),
    path('logout/',          LogoutView.as_view(),          name='logout'),
    path('profile/',         ProfileView.as_view(),         name='profile'),
    path('change-password/', ChangePasswordView.as_view(),  name='change-password'),
    path('students/',        StudentListView.as_view(),     name='student-list'),
]
