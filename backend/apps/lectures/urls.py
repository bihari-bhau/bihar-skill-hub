from django.urls import path
from .views import LectureListCreateView, LectureDetailView, UpdateWatchProgressView, MyWatchProgressView

urlpatterns = [
    path('',                            LectureListCreateView.as_view(),  name='lecture-list'),
    path('<int:pk>/',                   LectureDetailView.as_view(),      name='lecture-detail'),
    path('<int:lecture_id>/progress/',  UpdateWatchProgressView.as_view(), name='watch-progress'),
    path('my-progress/',               MyWatchProgressView.as_view(),    name='my-progress'),
]
