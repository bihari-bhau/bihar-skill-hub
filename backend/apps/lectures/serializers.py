from rest_framework import serializers
from .models import Lecture, WatchProgress


class LectureSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Lecture
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

    def validate(self, attrs):
        if attrs.get('video_type') == Lecture.VIDEO_UPLOAD and not attrs.get('video_file'):
            raise serializers.ValidationError({'video_file': 'Required for uploaded videos.'})
        if attrs.get('video_type') == Lecture.VIDEO_EMBED and not attrs.get('video_url'):
            raise serializers.ValidationError({'video_url': 'Required for embed videos.'})
        return attrs


class WatchProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model  = WatchProgress
        fields = ['id', 'lecture', 'watched_seconds', 'is_completed', 'last_watched_at']
        read_only_fields = ['is_completed', 'last_watched_at']
