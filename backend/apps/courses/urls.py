from django.urls import path
from .views import CourseListCreateView, CourseDetailView, CategoryListCreateView, CategoryDetailView

urlpatterns = [
    path('',                   CourseListCreateView.as_view(), name='course-list'),
    path('<int:pk>/',          CourseDetailView.as_view(),     name='course-detail'),
    path('categories/',        CategoryListCreateView.as_view(), name='category-list'),
    path('categories/<int:pk>/', CategoryDetailView.as_view(), name='category-detail'),
]
