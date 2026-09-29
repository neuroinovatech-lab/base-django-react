from rest_framework import serializers
from .models import Record

class RecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = Record
        fields = ["id", "title", "category", "status", "notes", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]
