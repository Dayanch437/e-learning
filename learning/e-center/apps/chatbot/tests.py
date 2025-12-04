from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.users.models import User
from apps.chatbot.models import ChatSession, ChatMessage
import json

class ChatbotAPITests(TestCase):
    """
    Test case for chatbot API endpoints.
    """
    def setUp(self):
        self.client = APIClient()
        self.sessions_url = '/api/v1/chat/sessions/'
        
        # Create a test user
        self.user = User.objects.create_user(
            email='testuser@example.com',
            password='testpassword123',
            first_name='Test',
            last_name='User'
        )
        
        # Authenticate the user
        self.client.force_authenticate(user=self.user)
        
        # Create a test chat session
        self.chat_session = ChatSession.objects.create(
            user=self.user,
            title="Test Chat",
            proficiency_level="intermediate",
            learning_focus="grammar"
        )

    def test_list_chat_sessions(self):
        """Test retrieving all chat sessions for the user"""
        response = self.client.get(self.sessions_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Test Chat')

    def test_create_chat_session(self):
        """Test creating a new chat session"""
        data = {
            'title': 'New Test Session',
            'proficiency_level': 'beginner',
            'learning_focus': 'vocabulary'
        }
        response = self.client.post(self.sessions_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'New Test Session')
        self.assertEqual(response.data['proficiency_level'], 'beginner')
        self.assertEqual(response.data['learning_focus'], 'vocabulary')
        
        # Verify in database
        session_exists = ChatSession.objects.filter(
            user=self.user,
            title='New Test Session',
            proficiency_level='beginner',
            learning_focus='vocabulary'
        ).exists()
        self.assertTrue(session_exists)

    def test_get_chat_session_detail(self):
        """Test retrieving a specific chat session"""
        detail_url = f'{self.sessions_url}{self.chat_session.id}/'
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.chat_session.id)
        self.assertEqual(response.data['title'], 'Test Chat')

    def test_update_chat_session(self):
        """Test updating a chat session"""
        detail_url = f'{self.sessions_url}{self.chat_session.id}/'
        data = {
            'title': 'Updated Chat Title',
            'proficiency_level': 'advanced'
        }
        response = self.client.patch(detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Updated Chat Title')
        self.assertEqual(response.data['proficiency_level'], 'advanced')
        
        # Verify in database
        self.chat_session.refresh_from_db()
        self.assertEqual(self.chat_session.title, 'Updated Chat Title')
        self.assertEqual(self.chat_session.proficiency_level, 'advanced')

    def test_delete_chat_session(self):
        """Test deleting a chat session"""
        detail_url = f'{self.sessions_url}{self.chat_session.id}/'
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Verify session is deleted
        session_exists = ChatSession.objects.filter(id=self.chat_session.id).exists()
        self.assertFalse(session_exists)

    def test_send_message(self):
        """Test sending a message in a chat session"""
        messages_url = f'{self.sessions_url}{self.chat_session.id}/messages/'
        data = {
            'content': 'Hello, this is a test message'
        }
        response = self.client.post(messages_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['content'], 'Hello, this is a test message')
        self.assertEqual(response.data['role'], 'user')  # Default role should be user
        
        # Check if AI responds
        ai_responded = False
        # Note: This may take some time as it depends on the Gemini API response
        # We may need to implement a timeout or check for the existence of an AI message
        # rather than waiting for the actual response
        messages_response = self.client.get(messages_url)
        self.assertEqual(messages_response.status_code, status.HTTP_200_OK)
        
        # There should be at least the user message
        self.assertGreaterEqual(len(messages_response.data), 1)

    def test_unauthenticated_access(self):
        """Test accessing chat sessions without authentication"""
        self.client.force_authenticate(user=None)
        response = self.client.get(self.sessions_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)