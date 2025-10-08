from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.users.models import User
import json

class AuthenticationTests(TestCase):
    """
    Test case for user authentication API endpoints.
    """
    def setUp(self):
        self.client = APIClient()
        self.login_url = '/api/v1/auth/login/'  # Using string path as reverse might not work with API URLs
        self.register_url = '/api/v1/auth/register/'
        self.refresh_url = '/api/v1/auth/token/refresh/'
        
        # Create a test user
        self.user = User.objects.create_user(
            email='testuser@example.com',
            password='testpassword123',
            first_name='Test',
            last_name='User'
        )

    def test_user_login(self):
        """Test user can login and get JWT token"""
        data = {
            'email': 'testuser@example.com',
            'password': 'testpassword123'
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_user_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        data = {
            'email': 'testuser@example.com',
            'password': 'wrongpassword'
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_registration(self):
        """Test new user registration"""
        data = {
            'email': 'newuser@example.com',
            'password': 'newpassword123',
            'first_name': 'New',
            'last_name': 'User'
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email='newuser@example.com').exists())

    def test_token_refresh(self):
        """Test JWT token refresh"""
        # First login to get refresh token
        login_data = {
            'email': 'testuser@example.com',
            'password': 'testpassword123'
        }
        login_response = self.client.post(self.login_url, login_data, format='json')
        refresh_token = login_response.data['refresh']
        
        # Then try to refresh the token
        refresh_data = {'refresh': refresh_token}
        response = self.client.post(self.refresh_url, refresh_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_token_refresh_invalid(self):
        """Test JWT token refresh with invalid token"""
        refresh_data = {'refresh': 'invalid_token'}
        response = self.client.post(self.refresh_url, refresh_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class UserProfileTests(TestCase):
    """
    Test case for user profile API endpoints.
    """
    def setUp(self):
        self.client = APIClient()
        self.profile_url = '/api/v1/users/profile/'
        
        # Create a test user
        self.user = User.objects.create_user(
            email='testuser@example.com',
            password='testpassword123',
            first_name='Test',
            last_name='User'
        )
        
        # Authenticate the user
        self.client.force_authenticate(user=self.user)

    def test_get_profile(self):
        """Test retrieving user profile"""
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'testuser@example.com')
        self.assertEqual(response.data['first_name'], 'Test')
        self.assertEqual(response.data['last_name'], 'User')

    def test_update_profile(self):
        """Test updating user profile"""
        update_data = {
            'first_name': 'Updated',
            'last_name': 'Name'
        }
        response = self.client.patch(self.profile_url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Refresh user from database
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, 'Updated')
        self.assertEqual(self.user.last_name, 'Name')

    def test_profile_unauthenticated(self):
        """Test accessing profile without authentication"""
        self.client.force_authenticate(user=None)
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
