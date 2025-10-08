from rest_framework import serializers
from .models import ChatSession, ChatMessage


class ChatMessageSerializer(serializers.ModelSerializer):
    """Serializer for chat messages."""
    
    class Meta:
        model = ChatMessage
        fields = ['id', 'role', 'content', 'created_at']
        read_only_fields = ['id', 'created_at']


class ChatSessionSerializer(serializers.ModelSerializer):
    """Serializer for chat sessions."""
    messages = ChatMessageSerializer(many=True, read_only=True)
    
    class Meta:
        model = ChatSession
        fields = ['id', 'title', 'proficiency_level', 'learning_focus', 
                 'created_at', 'updated_at', 'messages']
        read_only_fields = ['id', 'created_at', 'updated_at']
        

class ChatRequestSerializer(serializers.Serializer):
    """Serializer for chat requests to the AI model."""
    message = serializers.CharField(required=True)
    session_id = serializers.IntegerField(required=False, allow_null=True)
    proficiency_level = serializers.ChoiceField(
        choices=ChatSession.PROFICIENCY_CHOICES, 
        required=False
    )
    learning_focus = serializers.ChoiceField(
        choices=ChatSession.FOCUS_CHOICES,
        required=False
    )
    

class ChatResponseSerializer(serializers.Serializer):
    """Serializer for responses from the AI model."""
    response = serializers.CharField()
    session_id = serializers.IntegerField()
    message_id = serializers.IntegerField()