from django.db import models
from apps.users.models import User


class ChatSession(models.Model):
    """A session for chat conversations with Gemini AI."""
    PROFICIENCY_CHOICES = (
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    )
    
    FOCUS_CHOICES = (
        ('general', 'General English'),
        ('grammar', 'Grammar'),
        ('vocabulary', 'Vocabulary'),
        ('conversation', 'Conversation'),
        ('reading', 'Reading'),
        ('writing', 'Writing'),
        ('pronunciation', 'Pronunciation'),
        ('exam', 'Exam Preparation'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_sessions')
    title = models.CharField(max_length=255, default="New Chat")
    proficiency_level = models.CharField(max_length=20, choices=PROFICIENCY_CHOICES, default='intermediate')
    learning_focus = models.CharField(max_length=20, choices=FOCUS_CHOICES, default='general')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.user.username}"

    class Meta:
        ordering = ['-updated_at']


class ChatMessage(models.Model):
    """Individual messages within a chat session."""
    ROLE_CHOICES = (
        ('user', 'User'),
        ('assistant', 'Assistant'),
    )
    
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.role}: {self.content[:50]}..."
    
    class Meta:
        ordering = ['created_at']