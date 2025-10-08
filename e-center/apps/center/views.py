from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.db.models import Q
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from drf_spectacular.types import OpenApiTypes
from .serializers import (
    CenterSerializer,
    CategorySerializer,
    GrammarSerializer,
    VideoLessonSerializer,
    TurkmenEnglishWordSerializer
)
from .models import Center, Category, Grammar, VideoLesson, TurkmenEnglishWord

class CategoryViewSet(ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = []
    http_method_names = ['get', 'post', 'put', 'patch', 'delete']
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    filterset_fields = ['name']
    ordering_fields = ['name', 'created_at', 'updated_at']
    ordering = ['name']

class CenterViewSet(ModelViewSet):
    queryset = Center.objects.all()
    serializer_class = CenterSerializer
    permission_classes = []
    http_method_names = ['get']

class GrammarViewSet(ModelViewSet):
    queryset = Grammar.objects.select_related('category', 'created_by').all()
    serializer_class = GrammarSerializer
    permission_classes = []
    http_method_names = ['get']
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'content', 'examples', 'exercises']
    filterset_fields = {
        'category': ['exact'],
        'category__name': ['exact', 'icontains'],
        'status': ['exact'],
        'estimated_duration': ['exact', 'gte', 'lte', 'range'],
        'created_at': ['exact', 'gte', 'lte', 'date'],
        'updated_at': ['exact', 'gte', 'lte', 'date'],
    }
    ordering_fields = ['title', 'created_at', 'updated_at', 'estimated_duration', 'order']
    ordering = ['-created_at']

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get statistics about grammar lessons"""
        from django.db.models import Count
        
        total = self.get_queryset().count()
        by_category = self.get_queryset().values('category__name').annotate(
            count=Count('id')
        ).order_by('category__name')
        by_status = self.get_queryset().values('status').annotate(
            count=Count('id')
        ).order_by('status')
        
        # Convert to the format expected by frontend
        category_stats = {}
        for item in by_category:
            if item['category__name']:
                key = item['category__name'].lower()
                category_stats[key] = item['count']
        
        status_stats = {}
        for item in by_status:
            status_stats[item['status']] = item['count']
        
        return Response({
            'total': total,
            'by_category': category_stats,
            'by_status': status_stats,
            'total_lessons': total  # For backward compatibility
        })


class VideoLessonViewSet(ModelViewSet):
    queryset = VideoLesson.objects.select_related('created_by').all()
    serializer_class = VideoLessonSerializer
    permission_classes = []
    http_method_names = ['get']
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    filterset_fields = {
        'level': ['exact'],
        'status': ['exact'],
        'duration': ['exact', 'gte', 'lte', 'range'],
        'created_at': ['exact', 'gte', 'lte', 'date'],
    }
    ordering_fields = ['title', 'created_at', 'duration', 'level', 'order']
    ordering = ['-created_at']

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get statistics about video lessons"""
        from django.db.models import Count
        
        total = self.get_queryset().count()
        by_level = self.get_queryset().values('level').annotate(
            count=Count('id')
        ).order_by('level')
        by_status = self.get_queryset().values('status').annotate(
            count=Count('id')
        ).order_by('status')
        
        level_stats = {}
        for item in by_level:
            level_stats[item['level']] = item['count']
        
        status_stats = {}
        for item in by_status:
            status_stats[item['status']] = item['count']
        
        return Response({
            'total': total,
            'by_level': level_stats,
            'by_status': status_stats
        })

class TurkmenEnglishWordViewSet(ModelViewSet):
    queryset = TurkmenEnglishWord.objects.select_related('created_by').all()
    serializer_class = TurkmenEnglishWordSerializer
    permission_classes = []
    http_method_names = ['get']
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['turkmen_word', 'english_word', 'definition', 'example_sentence']
    filterset_fields = {
        'level': ['exact'],
        'category': ['exact', 'icontains'],
        'status': ['exact'],
        'created_at': ['exact', 'gte', 'lte', 'date'],
    }
    ordering_fields = ['turkmen_word', 'english_word', 'created_at', 'level']
    ordering = ['turkmen_word']
    
    def get_queryset(self):
        """
        Enhanced queryset with advanced search capabilities
        """
        queryset = super().get_queryset()
        query = self.request.query_params.get('q', '')
        
        if query:
            # Split search terms for more precise matching
            search_terms = query.split()
            
            # Start with an empty Q object
            q_objects = Q()
            
            # Build advanced search filter
            for term in search_terms:
                # Match against turkmen_word, english_word, definition, and example_sentence
                # With different weights/priority
                term_filter = (
                    Q(turkmen_word__icontains=term) | 
                    Q(english_word__icontains=term) | 
                    Q(definition__icontains=term) | 
                    Q(example_sentence__icontains=term)
                )
                q_objects |= term_filter
                
            # Apply filters to queryset
            queryset = queryset.filter(q_objects).distinct()
            
        # Additional search filters
        starts_with = self.request.query_params.get('starts_with', '')
        if starts_with:
            queryset = queryset.filter(
                Q(turkmen_word__istartswith=starts_with) | 
                Q(english_word__istartswith=starts_with)
            )
            
        # Filter by part of speech if provided
        part_of_speech = self.request.query_params.get('part_of_speech', '')
        if part_of_speech:
            queryset = queryset.filter(part_of_speech__icontains=part_of_speech)
            
        return queryset

    @action(detail=False, methods=['get'])
    @extend_schema(
        parameters=[
            OpenApiParameter(name="q", description="Search term for querying words", required=False, type=str),
            OpenApiParameter(name="starts_with", description="Filter words starting with this prefix", required=False, type=str),
            OpenApiParameter(name="part_of_speech", description="Filter by part of speech (noun, verb, etc.)", required=False, type=str),
        ],
        description="Advanced search with more options and better response format",
        responses={200: TurkmenEnglishWordSerializer(many=True)},
        examples=[
            OpenApiExample(
                "Basic Example",
                summary="Basic search example",
                value={"q": "hello"},
                request_only=True,
            ),
        ]
    )
    def search_advanced(self, request):
        """Advanced search with more options and better response format"""
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            response = self.get_paginated_response(serializer.data)
            response.data['query'] = request.query_params.get('q', '')
            return response
            
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'results': serializer.data,
            'count': len(serializer.data),
            'query': request.query_params.get('q', '')
        })
        
    @action(detail=False, methods=['get'])
    @extend_schema(
        description="Get statistics about vocabulary words",
        responses={
            200: OpenApiTypes.OBJECT
        }
    )
    def stats(self, request):
        """Get statistics about vocabulary words"""
        from django.db.models import Count
        
        total = self.get_queryset().count()
        by_level = self.get_queryset().values('level').annotate(
            count=Count('id')
        ).order_by('level')
        by_status = self.get_queryset().values('status').annotate(
            count=Count('id')
        ).order_by('status')
        
        level_stats = {}
        for item in by_level:
            level_stats[item['level']] = item['count']
        
        status_stats = {}
        for item in by_status:
            status_stats[item['status']] = item['count']
        
        return Response({
            'total': total,
            'by_level': level_stats,
            'by_status': status_stats
        })

    @action(detail=False, methods=['get'])
    @extend_schema(
        parameters=[
            OpenApiParameter(name="count", description="Number of random words to return", required=False, type=int, default=10),
            OpenApiParameter(name="level", description="Filter by vocabulary level", required=False, type=str),
        ],
        description="Get random vocabulary words for practice",
        responses={200: TurkmenEnglishWordSerializer(many=True)}
    )
    def random(self, request):
        """Get random vocabulary words for practice"""
        import random
        
        count = int(request.query_params.get('count', 10))
        level = request.query_params.get('level')
        
        queryset = self.get_queryset()
        if level:
            queryset = queryset.filter(level=level)
        
        # Get random words
        word_ids = list(queryset.values_list('id', flat=True))
        random_ids = random.sample(word_ids, min(count, len(word_ids)))
        random_words = queryset.filter(id__in=random_ids)
        
        serializer = self.get_serializer(random_words, many=True)
        return Response(serializer.data)