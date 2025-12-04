from django.db import models
from .enums import Level
from apps.core.models import BaseModel
from apps.users.enums import LessonStatus
from ..users.models import User


class Center(BaseModel):
    name = models.CharField(max_length=200)
    description = models.TextField()
    address = models.TextField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    logo = models.ImageField(upload_to='center/logos/', blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'center'
        verbose_name_plural = 'centers'
        app_label = 'center'
    
    def __str__(self):
        return self.name

class Category(BaseModel):
    name = models.CharField(max_length=100)

    class Meta:
        db_table = 'category'
        verbose_name_plural = 'categories'
        app_label = 'center'
    
    def __str__(self):
        return self.name

class Grammar(BaseModel):
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='grammar_lessons')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='grammar_lessons')
    title = models.CharField(max_length=200)
    content = models.TextField()
    examples = models.TextField(blank=True, null=True)
    exercises = models.TextField(blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=LessonStatus.choices,
        default=LessonStatus.DRAFT
    )
    cover_image = models.ImageField(upload_to='grammar/covers/', blank=True, null=True)
    order = models.PositiveIntegerField(default=0)
    estimated_duration = models.PositiveIntegerField(default=30, help_text="Duration in minutes")

    class Meta:
        db_table = 'grammar'
        verbose_name_plural = 'grammar_lessons'
        app_label = 'center'
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"{self.title} ({self.title})"


class VideoLesson(BaseModel):
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='video_lessons')
    title = models.CharField(max_length=200)
    description = models.TextField()
    video_url = models.FileField(upload_to='videos/lessons/')
    thumbnail = models.ImageField(upload_to='videos/thumbnails/', blank=True, null=True)
    level = models.CharField(max_length=20, choices=Level.choices)
    duration = models.PositiveIntegerField(help_text="Duration in seconds")
    status = models.CharField(
        max_length=20,
        choices=LessonStatus.choices,
        default=LessonStatus.DRAFT
    )
    order = models.PositiveIntegerField(default=0)
    views_count = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'video_lesson'
        verbose_name_plural = 'video_lessons'
        app_label = 'center'
        ordering = ['level', 'order', 'created_at']

    @property
    def duration_formatted(self):
        """Return duration formatted as MM:SS or HH:MM:SS"""
        hours = self.duration // 3600
        minutes = (self.duration % 3600) // 60
        seconds = self.duration % 60
        
        if hours > 0:
            return f"{hours:02d}:{minutes:02d}:{seconds:02d}"
        else:
            return f"{minutes:02d}:{seconds:02d}"

    def __str__(self):
        return f"{self.title} ({self.level})"


class TurkmenEnglishWord(BaseModel):
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='vocabulary', blank=True, null=True)
    turkmen_word = models.CharField(max_length=100)
    english_word = models.CharField(max_length=100)
    definition = models.TextField(blank=True, null=True)
    example_sentence = models.TextField(blank=True, null=True)
    pronunciation = models.CharField(max_length=200, blank=True, null=True)
    level = models.CharField(max_length=20, choices=Level.choices, default=Level.BEGINNER)
    category = models.CharField(max_length=100, blank=True, null=True)
    audio_file = models.FileField(upload_to='vocabulary/audio/', blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=LessonStatus.choices,
        default=LessonStatus.PUBLISHED
    )

    class Meta:
        db_table = 'vocabulary'
        verbose_name_plural = 'vocabulary'
        app_label = 'center'
        ordering = ['level', 'turkmen_word']
        unique_together = ['turkmen_word', 'english_word']

    def __str__(self):
        return f"{self.turkmen_word} - {self.english_word}"