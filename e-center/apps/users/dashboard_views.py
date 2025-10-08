from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from drf_spectacular.utils import extend_schema, OpenApiParameter
from .models import User
from .dashboard_serializers import UserDashboardSerializer, SystemDashboardSerializer


class UserDashboardView(APIView):
    """
    API endpoint that provides dashboard data for users.
    """
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        summary="Get user dashboard data",
        description="Returns dashboard data specific to the authenticated user",
        responses={200: UserDashboardSerializer},
        tags=["Dashboard"]
    )
    def get(self, request):
        # Get the current user
        user = request.user
        
        # Serialize the data
        serializer = UserDashboardSerializer(user)
        
        return Response(serializer.data)


class SystemDashboardView(APIView):
    """
    API endpoint that provides system dashboard data for admins.
    """
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        summary="Get system dashboard data",
        description="Returns system-wide dashboard data for administrators",
        responses={200: SystemDashboardSerializer},
        tags=["Dashboard"]
    )
    def get(self, request):
        # This is a system-wide dashboard, so we don't need a specific object
        # Just pass the request user as context
        serializer = SystemDashboardSerializer(request.user)
        
        return Response(serializer.data)