from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.middleware.csrf import get_token
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView
from .models import User
from .serializers import LoginSerializer, PasswordSerializer, UserSerializer

@ensure_csrf_cookie
@api_view(["GET"])
@permission_classes([AllowAny])
def csrf(request):
    return Response({"csrfToken": get_token(request)})

class LoginThrottle(AnonRateThrottle):
    scope = "login"

@method_decorator(csrf_protect, name="dispatch")
class LoginView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [LoginThrottle]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(request, **serializer.validated_data)
        if user is None:
            return Response({"detail": "Usuário ou senha inválidos."}, status=status.HTTP_400_BAD_REQUEST)
        login(request, user)
        return Response(UserSerializer(user).data)

@api_view(["POST"])
def logout_view(request):
    logout(request)
    return Response(status=status.HTTP_204_NO_CONTENT)

class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    http_method_names = ["get", "patch", "head", "options"]
    def get_object(self):
        return self.request.user

class UserList(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = UserSerializer
    queryset = User.objects.filter(is_active=True).order_by("first_name", "username")

@api_view(["POST"])
def change_password(request):
    serializer = PasswordSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data
    if not request.user.check_password(data["current_password"]):
        return Response({"current_password": ["Senha atual incorreta."]}, status=400)
    try:
        validate_password(data["new_password"], request.user)
    except ValidationError as exc:
        return Response({"new_password": exc.messages}, status=400)
    request.user.set_password(data["new_password"])
    request.user.save(update_fields=["password"])
    update_session_auth_hash(request, request.user)
    return Response({"detail": "Senha atualizada."})
