from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views
from .dashboard_views import UserDashboardView, SystemDashboardView

app_name = 'users'

urlpatterns = [
    # Authentication endpoints
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    
    # JWT token endpoints
    path('token/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User profile
    path('profile/', views.ProfileView.as_view(), name='profile'),
    
    # Dashboard endpoints
    path('dashboard/', UserDashboardView.as_view(), name='user_dashboard'),
    path('dashboard/system/', SystemDashboardView.as_view(), name='system_dashboard'),
]