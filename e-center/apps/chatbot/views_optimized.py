from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from django.core.cache import cache
from django.db import transaction
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
import logging
import time

from .models import ChatSession, ChatMessage
from .serializers import (
    ChatSessionSerializer,
    ChatMessageSerializer,
    ChatRequestSerializer,
    ChatResponseSerializer
)
from .utils import generate_response, test_gemini_connection

logger = logging.getLogger('chatbot')


class ChatSessionViewSet(viewsets.ModelViewSet):
    """
    API endpoints for managing chat sessions with Gemini AI.
    Optimized with caching and performance improvements.
    """
    serializer_class = ChatSessionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return chat sessions for the authenticated user with optimized queries."""
        # Use select_related and prefetch_related to reduce database queries
        return ChatSession.objects.filter(user=self.request.user).select_related('user').prefetch_related('messages')
    
    def perform_create(self, serializer):
        """Save the user when creating a chat session."""
        serializer.save(user=self.request.user)
    
    @method_decorator(cache_page(60))  # Cache for 1 minute
    def list(self, request, *args, **kwargs):
        """List chat sessions with caching."""
        return super().list(request, *args, **kwargs)
    
    @extend_schema(
        request=ChatRequestSerializer,
        responses={200: ChatResponseSerializer},
        description="Send a message to Gemini AI and get a response.",
        methods=["POST"],
    )
    @action(detail=False, methods=['post'], permission_classes=[])
    def chat(self, request):
        """Send a message to Gemini AI and get a response with performance optimizations."""
        start_time = time.time()
        logger.info(f"Chat request started at {start_time}")
        
        serializer = ChatRequestSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        user_message = serializer.validated_data['message']
        session_id = serializer.validated_data.get('session_id')
        proficiency_level = serializer.validated_data.get('proficiency_level')
        learning_focus = serializer.validated_data.get('learning_focus')
        
        # Get a user - either the authenticated user or create a test user
        from apps.users.models import User
        if request.user.is_authenticated:
            user = request.user
        else:
            # Use cached test user to avoid repeated database queries
            cache_key = 'test_user_id'
            test_user_id = cache.get(cache_key)
            
            if test_user_id:
                try:
                    user = User.objects.get(id=test_user_id)
                except User.DoesNotExist:
                    test_user_id = None
            
            if not test_user_id:
                test_user, created = User.objects.get_or_create(
                    username='test_user',
                    defaults={
                        'email': 'test@example.com',
                        'first_name': 'Test',
                        'last_name': 'User'
                    }
                )
                if created:
                    test_user.set_password('testpassword123')
                    test_user.save()
                user = test_user
                cache.set(cache_key, user.id, 3600)  # Cache for 1 hour
        
        # Use transaction to optimize database operations
        with transaction.atomic():
            # Get or create a session
            if session_id:
                try:
                    # Use select_for_update to prevent race conditions
                    session = ChatSession.objects.select_for_update().select_related('user').get(
                        id=session_id, user=user
                    )
                    
                    # Update proficiency and focus if provided
                    if proficiency_level or learning_focus:
                        if proficiency_level:
                            session.proficiency_level = proficiency_level
                        if learning_focus:
                            session.learning_focus = learning_focus
                        session.save(update_fields=['proficiency_level', 'learning_focus'])
                    
                except ChatSession.DoesNotExist:
                    return Response(
                        {"error": "Chat session not found"}, 
                        status=status.HTTP_404_NOT_FOUND
                    )
            else:
                # Create new session with optional proficiency and focus
                session_data = {
                    'user': user,
                }
                if proficiency_level:
                    session_data['proficiency_level'] = proficiency_level
                if learning_focus:
                    session_data['learning_focus'] = learning_focus
                    
                session = ChatSession.objects.create(**session_data)
            
            # Check if this is the first message (optimized query)
            is_first_message = not session.messages.exists()
            
            # Customize user message with learning context if it's the first message
            if is_first_message:
                # Enhance the first message with learning context
                context_prefix = f"[English level: {session.proficiency_level}, Focus: {session.learning_focus}] "
                enhanced_message = context_prefix + user_message
                
                # Save original user message
                user_chat_message = ChatMessage.objects.create(
                    session=session,
                    role='user',
                    content=user_message
                )
                
                # Generate response with enhanced context
                ai_response = generate_response(enhanced_message, session)
            else:
                # For subsequent messages, use normal flow
                user_chat_message = ChatMessage.objects.create(
                    session=session,
                    role='user',
                    content=user_message
                )
                
                # Generate response from Gemini
                ai_response = generate_response(user_message, session)
            
            # Save the AI response
            assistant_message = ChatMessage.objects.create(
                session=session,
                role='assistant',
                content=ai_response
            )
            
            # Update the session title if it's a new session
            if session.title == "New Chat" and len(user_message) > 5:
                # Use the first few words of the user's message as the title
                title = user_message[:50] + ("..." if len(user_message) > 50 else "")
                session.title = title
                session.save(update_fields=['title'])
        
        # Log performance metrics
        end_time = time.time()
        response_time = end_time - start_time
        logger.info(f"Chat request completed in {response_time:.2f} seconds")
        
        # Return the response
        return Response({
            'response': ai_response,
            'session_id': session.id,
            'message_id': assistant_message.id,
            'proficiency_level': session.proficiency_level,
            'learning_focus': session.learning_focus,
            'response_time': round(response_time, 2)  # Include response time for debugging
        })
        
    @extend_schema(
        responses={200: {"type": "object", "properties": {"status": {"type": "string"}, "message": {"type": "string"}}}},
        description="Test the connection to Gemini AI.",
        methods=["GET"],
    )
    @action(detail=False, methods=['get'], permission_classes=[])
    def test_connection(self, request):
        """Test the connection to Gemini AI with caching."""
        # Cache the connection test result for 5 minutes
        cache_key = 'gemini_connection_test'
        cached_result = cache.get(cache_key)
        
        if cached_result:
            return Response({"status": "success", "message": cached_result, "cached": True})
        
        try:
            result = test_gemini_connection()
            cache.set(cache_key, result, 300)  # Cache for 5 minutes
            return Response({"status": "success", "message": result, "cached": False})
        except Exception as e:
            return Response(
                {"status": "error", "message": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ChatMessageViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoints for viewing chat messages.
    Optimized with select_related and prefetch_related.
    """
    serializer_class = ChatMessageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return messages for sessions owned by the authenticated user."""
        return ChatMessage.objects.filter(
            session__user=self.request.user
        ).select_related('session', 'session__user').order_by('-created_at')
    
    @method_decorator(cache_page(60))  # Cache for 1 minute
    def list(self, request, *args, **kwargs):
        """List messages with caching."""
        return super().list(request, *args, **kwargs)