from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "email", "is_staff", "date_joined"]
        read_only_fields = ["id", "username", "is_staff", "date_joined"]

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(max_length=256, trim_whitespace=False, write_only=True)

class PasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(trim_whitespace=False, write_only=True)
    new_password = serializers.CharField(trim_whitespace=False, write_only=True, max_length=256)
