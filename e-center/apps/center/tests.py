from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.users.models import User
from apps.center.models import Grammar, VideoLesson, TurkmenEnglishWord
from apps.center.enums import Level
import json

class GrammarAPITests(TestCase):
    """
    Test case for grammar API endpoints.
    """
    def setUp(self):
        self.client = APIClient()
        self.grammar_url = '/api/v1/center/grammar/'
        
        # Create a test user
        self.user = User.objects.create_user(
            email='testuser@example.com',
            password='testpassword123',
            first_name='Test',
            last_name='User'
        )
        
        # Authenticate the user
        self.client.force_authenticate(user=self.user)
        
        # Create test grammar entries
        self.grammar1 = Grammar.objects.create(
            title='Past Simple',
            content='This is a lesson about Past Simple tense',
            level=Level.BEGINNER.value
        )
        
        self.grammar2 = Grammar.objects.create(
            title='Present Perfect',
            content='This is a lesson about Present Perfect tense',
            level=Level.INTERMEDIATE.value
        )

    def test_list_grammar_lessons(self):
        """Test retrieving all grammar lessons"""
        response = self.client.get(self.grammar_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)

    def test_filter_grammar_by_level(self):
        """Test filtering grammar lessons by level"""
        response = self.client.get(f"{self.grammar_url}?level={Level.BEGINNER.value}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['title'], 'Past Simple')

    def test_search_grammar_lessons(self):
        """Test searching for grammar lessons by title"""
        response = self.client.get(f"{self.grammar_url}?search=Perfect")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['title'], 'Present Perfect')

    def test_get_grammar_detail(self):
        """Test retrieving a specific grammar lesson"""
        detail_url = f'{self.grammar_url}{self.grammar1.id}/'
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Past Simple')
        self.assertEqual(response.data['content'], 'This is a lesson about Past Simple tense')

    def test_grammar_stats(self):
        """Test retrieving grammar statistics"""
        stats_url = f'{self.grammar_url}stats/'
        response = self.client.get(stats_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_count', response.data)
        self.assertEqual(response.data['total_count'], 2)
        self.assertIn('by_level', response.data)
        self.assertEqual(response.data['by_level'][Level.BEGINNER.value], 1)
        self.assertEqual(response.data['by_level'][Level.INTERMEDIATE.value], 1)

    def test_unauthenticated_access(self):
        """Test accessing grammar lessons without authentication"""
        # Public endpoints should be accessible without authentication
        self.client.force_authenticate(user=None)
        response = self.client.get(self.grammar_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class VocabularyAPITests(TestCase):
    """
    Test case for vocabulary API endpoints.
    """
    def setUp(self):
        self.client = APIClient()
        self.vocabulary_url = '/api/v1/center/vocabulary/'
        
        # Create a test user
        self.user = User.objects.create_user(
            email='testuser@example.com',
            password='testpassword123',
            first_name='Test',
            last_name='User'
        )
        
        # Authenticate the user
        self.client.force_authenticate(user=self.user)
        
        # Create test vocabulary entries
        self.word1 = TurkmenEnglishWord.objects.create(
            turkmen_word='Alma',
            english_word='Apple',
            definition='A round fruit with red or green skin and a white flesh',
            level=Level.BEGINNER.value
        )
        
        self.word2 = TurkmenEnglishWord.objects.create(
            turkmen_word='Kitap',
            english_word='Book',
            definition='A written or printed work consisting of pages',
            level=Level.INTERMEDIATE.value
        )

    def test_list_vocabulary_words(self):
        """Test retrieving all vocabulary words"""
        response = self.client.get(self.vocabulary_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)

    def test_filter_vocabulary_by_level(self):
        """Test filtering vocabulary by level"""
        response = self.client.get(f"{self.vocabulary_url}?level={Level.BEGINNER.value}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['turkmen_word'], 'Alma')

    def test_search_vocabulary(self):
        """Test searching for vocabulary words"""
        response = self.client.get(f"{self.vocabulary_url}?search=Book")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['english_word'], 'Book')

    def test_get_vocabulary_detail(self):
        """Test retrieving a specific vocabulary word"""
        detail_url = f'{self.vocabulary_url}{self.word1.id}/'
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['turkmen_word'], 'Alma')
        self.assertEqual(response.data['english_word'], 'Apple')

    def test_random_vocabulary(self):
        """Test retrieving random vocabulary words"""
        random_url = f'{self.vocabulary_url}random/?count=2'
        response = self.client.get(random_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_vocabulary_stats(self):
        """Test retrieving vocabulary statistics"""
        stats_url = f'{self.vocabulary_url}stats/'
        response = self.client.get(stats_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_count', response.data)
        self.assertEqual(response.data['total_count'], 2)
        self.assertIn('by_level', response.data)
        self.assertEqual(response.data['by_level'][Level.BEGINNER.value], 1)
        self.assertEqual(response.data['by_level'][Level.INTERMEDIATE.value], 1)


class VideoAPITests(TestCase):
    """
    Test case for video API endpoints.
    """
    def setUp(self):
        self.client = APIClient()
        self.video_url = '/api/v1/center/videos/'
        
        # Create a test user
        self.user = User.objects.create_user(
            email='testuser@example.com',
            password='testpassword123',
            first_name='Test',
            last_name='User'
        )
        
        # Authenticate the user
        self.client.force_authenticate(user=self.user)
        
        # Create test video entries
        self.video1 = VideoLesson.objects.create(
            created_by=self.user,
            title='English Pronunciation Basics',
            description='Learn the basics of English pronunciation',
            video_url='videos/lessons/test1.mp4',
            level=Level.BEGINNER.value,
            duration=300
        )
        
        self.video2 = VideoLesson.objects.create(
            created_by=self.user,
            title='Advanced Grammar Concepts',
            description='Explore advanced grammar concepts in English',
            video_url='videos/lessons/test2.mp4',
            level=Level.ADVANCED.value,
            duration=600
        )

    def test_list_videos(self):
        """Test retrieving all video lessons"""
        response = self.client.get(self.video_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)

    def test_filter_videos_by_level(self):
        """Test filtering videos by level"""
        response = self.client.get(f"{self.video_url}?level={Level.ADVANCED.value}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['title'], 'Advanced Grammar Concepts')

    def test_search_videos(self):
        """Test searching for videos"""
        response = self.client.get(f"{self.video_url}?search=Pronunciation")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['title'], 'English Pronunciation Basics')

    def test_get_video_detail(self):
        """Test retrieving a specific video"""
        detail_url = f'{self.video_url}{self.video1.id}/'
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'English Pronunciation Basics')
        self.assertEqual(response.data['level'], Level.BEGINNER.value)

    def test_video_stats(self):
        """Test retrieving video statistics"""
        stats_url = f'{self.video_url}stats/'
        response = self.client.get(stats_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_count', response.data)
        self.assertEqual(response.data['total_count'], 2)
        self.assertIn('by_level', response.data)
        self.assertEqual(response.data['by_level'][Level.BEGINNER.value], 1)
        self.assertEqual(response.data['by_level'][Level.ADVANCED.value], 1)
