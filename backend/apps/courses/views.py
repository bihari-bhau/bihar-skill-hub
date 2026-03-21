from rest_framework import generics, permissions
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Course, Category
from .serializers import CourseListSerializer, CourseDetailSerializer, CategorySerializer


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_staff


# ─── Category Views ────────────────────────────────────────────────────────────
class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]


# ─── Course Views ──────────────────────────────────────────────────────────────
class CourseListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/courses/       - List published courses (students) or all (admin)
    POST /api/courses/       - Admin creates a course
    """
    filter_backends  = [SearchFilter, OrderingFilter]
    search_fields    = ['title', 'description', 'category__name']
    ordering_fields  = ['created_at', 'title', 'price']
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Course.objects.all()
        return Course.objects.filter(status=Course.PUBLISHED)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CourseDetailSerializer
        return CourseListSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/PATCH/DELETE /api/courses/<pk>/"""
    serializer_class   = CourseDetailSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Course.objects.all()
        return Course.objects.filter(status=Course.PUBLISHED)
