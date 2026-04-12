from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer, LoginSerializer, UserDetailSerializer, ChangePasswordSerializer
from .models import User
from utils.mailer import send_welcome_email  # ← ADD THIS


class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/ — Student self-registration"""
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # ── Send welcome email ──────────────────────────────
        try:
            send_welcome_email(user.email, user.full_name or user.username)
        except Exception as e:
            print(f"[Email Error] Welcome email failed: {e}")
        # ───────────────────────────────────────────────────

        refresh = RefreshToken.for_user(user)
        return Response({
            'message': 'Registration successful.',
            'user': UserDetailSerializer(user).data,
            'access':  str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """POST /api/auth/login/ — Login for Admin and Students"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """POST /api/auth/logout/ — Blacklist refresh token"""

    def post(self, request):
        try:
            token = RefreshToken(request.data.get('refresh'))
            token.blacklist()
            return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'error': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/auth/profile/ — View or update own profile"""
    serializer_class = UserDetailSerializer

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    """POST /api/auth/change-password/"""

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'message': 'Password changed successfully.'})


class StudentListView(generics.ListAPIView):
    """GET /api/auth/students/ — Admin only: list all students"""
    serializer_class = UserDetailSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = User.objects.filter(role=User.STUDENT)