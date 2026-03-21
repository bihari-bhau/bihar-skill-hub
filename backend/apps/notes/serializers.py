from rest_framework import serializers
from .models import Note


class NoteSerializer(serializers.ModelSerializer):
    file_size_kb = serializers.ReadOnlyField()

    class Meta:
        model  = Note
        fields = '__all__'
        read_only_fields = ['uploaded_by', 'created_at', 'updated_at', 'file_size_kb']
