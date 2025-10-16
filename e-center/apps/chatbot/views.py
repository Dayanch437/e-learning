from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample

from .models import ChatSession, ChatMessage
from .serializers import (
    ChatSessionSerializer,
    ChatMessageSerializer,
    ChatRequestSerializer,
    ChatResponseSerializer
)
from .utils import generate_response, test_gemini_connection


class ChatSessionViewSet(viewsets.ModelViewSet):
    """
    API endpoints for managing chat sessions with Gemini AI.
    """
    serializer_class = ChatSessionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return chat sessions for the authenticated user."""
        return ChatSession.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        """Save the user when creating a chat session."""
        serializer.save(user=self.request.user)
    
    @extend_schema(
        request=ChatRequestSerializer,
        responses={200: ChatResponseSerializer},
        description="Send a message to Gemini AI and get a response.",
        methods=["POST"],
    )
    @action(detail=False, methods=['post'], permission_classes=[])
    def chat(self, request):
        """Send a message to Gemini AI and get a response."""
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
            # Use a test user or create one if needed
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
        
        # Get or create a session
        if session_id:
            try:
                session = ChatSession.objects.get(id=session_id, user=user)
                
                # Update proficiency and focus if provided
                if proficiency_level:
                    session.proficiency_level = proficiency_level
                if learning_focus:
                    session.learning_focus = learning_focus
                if proficiency_level or learning_focus:
                    session.save()
                
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
        
        # Customize user message with learning context if it's the first message
        if not session.messages.exists():
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
            session.save()
        
        # Return the response
        return Response({
            'response': ai_response,
            'session_id': session.id,
            'message_id': assistant_message.id,
            'proficiency_level': session.proficiency_level,
            'learning_focus': session.learning_focus
        })
        
    @extend_schema(
        responses={200: {"type": "object", "properties": {"status": {"type": "string"}, "message": {"type": "string"}}}},
        description="Test the Gemini API connection.",
        methods=["GET"],
    )
    @action(detail=False, methods=['get'], permission_classes=[])
    def test(self, request):
        """Test the Gemini AI connection."""
        result = test_gemini_connection()
        return Response({
            'status': 'success' if 'API is working' in result else 'error',
            'message': result
        })
    
    @extend_schema(
        responses={200: ChatMessageSerializer(many=True)},
        description="Get messages for a specific chat session.",
        methods=["GET"],
    )
    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        """Get all messages for a specific chat session."""
        try:
            session = self.get_queryset().get(pk=pk)
            messages = session.messages.all()
            serializer = ChatMessageSerializer(messages, many=True)
            return Response(serializer.data)
        except ChatSession.DoesNotExist:
            return Response(
                {"error": "Chat session not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @extend_schema(
        request={"type": "object", "properties": {"message": {"type": "string"}}},
        responses={200: {"type": "object", "properties": {"response": {"type": "string"}}}},
        description="Simple chat without sessions - just send a message and get a response.",
        methods=["POST"],
    )
    @action(detail=False, methods=['post'], url_path='simple-chat', permission_classes=[])
    def simple_chat(self, request):
        """Simple chat without sessions - fast and stateless."""
        user_message = request.data.get('message', '').strip()
        
        if not user_message:
            return Response(
                {"error": "Message is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Generate response directly without session
            ai_response = generate_response(user_message, session=None)
            
            return Response({
                'response': ai_response,
                'message': user_message,
                'timestamp': __import__('datetime').datetime.now().isoformat()
            })
        except Exception as e:
            return Response(
                {"error": f"Failed to generate response: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )