from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiExample
from .models import User
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserSerializer,
    CustomTokenObtainPairSerializer
)


@extend_schema_view(
    post=extend_schema(
        summary="Register a new user",
        description="Create a new user account with JWT tokens",
        tags=["Authentication"],
        examples=[
            OpenApiExample(
                "Register Example",
                value={
                    "email": "teacher@example.com",
                    "username": "teacher1",
                    "first_name": "John",
                    "last_name": "Doe",
                    "password": "securepassword123",
                    "password_confirm": "securepassword123",
                    "role": "teacher"
                }
            )
        ]
    )
)
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Create JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'message': 'User registered successfully'
        }, status=status.HTTP_201_CREATED)


@extend_schema_view(
    post=extend_schema(
        summary="Login user",
        description="Authenticate user and return JWT tokens",
        tags=["Authentication"],
        examples=[
            OpenApiExample(
                "Login Example",
                value={
                    "email": "teacher@example.com",
                    "password": "securepassword123"
                }
            )
        ]
    )
)
class LoginView(generics.GenericAPIView):
    serializer_class = UserLoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        # Create JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'message': 'Login successful'
        })


@extend_schema(
    summary="Obtain JWT token pair",
    description="Get access and refresh tokens using credentials",
    tags=["Authentication"]
)
class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom JWT token obtain view that includes user data in response
    """
    serializer_class = CustomTokenObtainPairSerializer


@extend_schema_view(
    get=extend_schema(
        summary="Get user profile",
        description="Retrieve the authenticated user's profile",
        tags=["Users"]
    ),
    put=extend_schema(
        summary="Update user profile",
        description="Update the authenticated user's profile",
        tags=["Users"]
    ),
    patch=extend_schema(
        summary="Partially update user profile",
        description="Partially update the authenticated user's profile",
        tags=["Users"]
    )
)
class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
