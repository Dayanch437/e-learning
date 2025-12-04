from rest_framework import serializers
from django.db.models import Count, Sum, Q
from apps.center.models import Grammar, VideoLesson, TurkmenEnglishWord, Category
from .models import User


class UserDashboardSerializer(serializers.Serializer):
    """
    Serializer for user dashboard data.
    """
    # User info summary
    user_id = serializers.IntegerField(source='id')
    username = serializers.CharField()
    email = serializers.EmailField()
    role = serializers.CharField()
    
    # Content statistics
    total_grammar_lessons = serializers.SerializerMethodField()
    total_video_lessons = serializers.SerializerMethodField()
    total_vocabulary_words = serializers.SerializerMethodField()
    
    # Category statistics
    categories = serializers.SerializerMethodField()
    
    # User progress (for students)
    completed_grammar = serializers.SerializerMethodField()
    completed_videos = serializers.SerializerMethodField()
    vocabulary_mastered = serializers.SerializerMethodField()
    
    # Teacher statistics (for teachers)
    created_content = serializers.SerializerMethodField()
    
    def get_total_grammar_lessons(self, obj):
        return Grammar.objects.count()
    
    def get_total_video_lessons(self, obj):
        return VideoLesson.objects.count()
    
    def get_total_vocabulary_words(self, obj):
        return TurkmenEnglishWord.objects.count()
    
    def get_categories(self, obj):
        categories = Category.objects.annotate(
            grammar_count=Count('grammar_lessons'),
        ).values('id', 'name', 'grammar_count')
        
        return categories
    
    def get_completed_grammar(self, obj):
        # Placeholder for student progress - would be linked to a Progress model
        if obj.role != 'student':
            return None
        
        # This would typically link to a Progress or Completion model
        # For now, return placeholder data
        return {
            'completed': 0,
            'total': Grammar.objects.count(),
            'percentage': 0
        }
    
    def get_completed_videos(self, obj):
        # Placeholder for student progress - would be linked to a Progress model
        if obj.role != 'student':
            return None
        
        # This would typically link to a Progress or Completion model
        return {
            'completed': 0,
            'total': VideoLesson.objects.count(),
            'percentage': 0
        }
    
    def get_vocabulary_mastered(self, obj):
        # Placeholder for student progress - would be linked to a Progress model
        if obj.role != 'student':
            return None
        
        total = TurkmenEnglishWord.objects.count()
        return {
            'completed': 0,
            'mastered': 0,  # Keep for backward compatibility
            'total': total,
            'percentage': 0
        }
    
    def get_created_content(self, obj):
        # Only relevant for teachers
        if obj.role != 'teacher':
            return None
        
        grammar_count = Grammar.objects.filter(created_by=obj).count()
        video_count = VideoLesson.objects.filter(created_by=obj).count()
        vocabulary_count = TurkmenEnglishWord.objects.filter(created_by=obj).count()
        
        total_content = grammar_count + video_count + vocabulary_count
        
        # Get content by status
        published_grammar = Grammar.objects.filter(created_by=obj, status='published').count()
        published_videos = VideoLesson.objects.filter(created_by=obj, status='published').count()
        published_vocabulary = TurkmenEnglishWord.objects.filter(created_by=obj, status='published').count()
        
        draft_grammar = Grammar.objects.filter(created_by=obj, status='draft').count()
        draft_videos = VideoLesson.objects.filter(created_by=obj, status='draft').count()
        draft_vocabulary = TurkmenEnglishWord.objects.filter(created_by=obj, status='draft').count()
        
        return {
            'total': total_content,
            'grammar': {
                'total': grammar_count,
                'published': published_grammar,
                'draft': draft_grammar
            },
            'videos': {
                'total': video_count,
                'published': published_videos,
                'draft': draft_videos
            },
            'vocabulary': {
                'total': vocabulary_count,
                'published': published_vocabulary,
                'draft': draft_vocabulary
            }
        }


class SystemDashboardSerializer(serializers.Serializer):
    """
    Serializer for system-wide dashboard data (for admins).
    """
    # System totals
    total_users = serializers.SerializerMethodField()
    total_content = serializers.SerializerMethodField()
    
    # User statistics
    user_stats = serializers.SerializerMethodField()
    
    # Content statistics
    content_stats = serializers.SerializerMethodField()
    
    def get_total_users(self, obj):
        return User.objects.count()
    
    def get_total_content(self, obj):
        grammar_count = Grammar.objects.count()
        video_count = VideoLesson.objects.count()
        vocabulary_count = TurkmenEnglishWord.objects.count()
        return grammar_count + video_count + vocabulary_count
    
    def get_user_stats(self, obj):
        # User counts by role
        students_count = User.objects.filter(role='student').count()
        teachers_count = User.objects.filter(role='teacher').count()
        admins_count = User.objects.filter(role='admin').count()
        
        # Active users
        active_users = User.objects.filter(is_active=True).count()
        
        # Verified users
        verified_users = User.objects.filter(is_verified=True).count()
        
        return {
            'by_role': {
                'students': students_count,
                'teachers': teachers_count,
                'admins': admins_count
            },
            'active_users': active_users,
            'verified_users': verified_users
        }
    
    def get_content_stats(self, obj):
        # Grammar stats
        grammar_count = Grammar.objects.count()
        published_grammar = Grammar.objects.filter(status='published').count()
        draft_grammar = Grammar.objects.filter(status='draft').count()
        
        # Video stats
        video_count = VideoLesson.objects.count()
        published_videos = VideoLesson.objects.filter(status='published').count()
        draft_videos = VideoLesson.objects.filter(status='draft').count()
        
        # Vocabulary stats
        vocabulary_count = TurkmenEnglishWord.objects.count()
        published_vocabulary = TurkmenEnglishWord.objects.filter(status='published').count()
        draft_vocabulary = TurkmenEnglishWord.objects.filter(status='draft').count()
        
        # Count by level
        beginner_count = (
            VideoLesson.objects.filter(level='beginner').count() +
            TurkmenEnglishWord.objects.filter(level='beginner').count()
        )
        
        intermediate_count = (
            VideoLesson.objects.filter(level='intermediate').count() +
            TurkmenEnglishWord.objects.filter(level='intermediate').count()
        )
        
        advanced_count = (
            VideoLesson.objects.filter(level='advanced').count() +
            TurkmenEnglishWord.objects.filter(level='advanced').count()
        )
        
        return {
            'grammar': {
                'total': grammar_count,
                'published': published_grammar,
                'draft': draft_grammar
            },
            'videos': {
                'total': video_count,
                'published': published_videos,
                'draft': draft_videos
            },
            'vocabulary': {
                'total': vocabulary_count,
                'published': published_vocabulary,
                'draft': draft_vocabulary
            },
            'by_level': {
                'beginner': beginner_count,
                'intermediate': intermediate_count,
                'advanced': advanced_count
            }
        }