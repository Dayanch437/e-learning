from django.contrib import admin
from import_export import resources
from import_export.admin import ImportExportModelAdmin
from .models import Category, Grammar, VideoLesson, TurkmenEnglishWord


# Resource classes for import/export
class CategoryResource(resources.ModelResource):
    class Meta:
        model = Category
        fields = ('id', 'name', 'created_at', 'updated_at')
        export_order = fields


class GrammarResource(resources.ModelResource):
    class Meta:
        model = Grammar
        fields = (
            'id', 'title', 'content', 'examples', 'exercises', 
            'category__name', 'status', 'order', 'estimated_duration',
            'cover_image', 'created_by__username', 'created_at', 'updated_at'
        )
        export_order = fields


class VideoLessonResource(resources.ModelResource):
    class Meta:
        model = VideoLesson
        fields = (
            'id', 'title', 'description', 'video_url', 'thumbnail',
            'duration', 'level', 'status', 'order', 'views_count',
            'created_by__username', 'created_at', 'updated_at'
        )
        export_order = fields


class TurkmenEnglishWordResource(resources.ModelResource):
    class Meta:
        model = TurkmenEnglishWord
        fields = (
            'id', 'turkmen_word', 'english_word', 'definition',
            'example_sentence', 'pronunciation', 'level', 'category',
            'audio_file', 'status', 'created_by__username',
            'created_at', 'updated_at'
        )
        export_order = fields


# Admin classes with import/export
@admin.register(Category)
class CategoryAdmin(ImportExportModelAdmin):
    resource_class = CategoryResource
    list_display = ('id', 'name', 'created_at', 'updated_at')
    search_fields = ('name',)
    list_filter = ('created_at',)


@admin.register(Grammar)
class GrammarAdmin(ImportExportModelAdmin):
    resource_class = GrammarResource
    list_display = ('id', 'title', 'category', 'status', 'order', 'created_by', 'created_at')
    list_filter = ('status', 'category', 'created_at')
    search_fields = ('title', 'content')
    raw_id_fields = ('category', 'created_by')


@admin.register(VideoLesson)
class VideoLessonAdmin(ImportExportModelAdmin):
    resource_class = VideoLessonResource
    list_display = ('id', 'title', 'level', 'duration', 'views_count', 'status', 'order', 'created_by', 'created_at')
    list_filter = ('level', 'status', 'created_at')
    search_fields = ('title', 'description')
    raw_id_fields = ('created_by',)


@admin.register(TurkmenEnglishWord)
class TurkmenEnglishWordAdmin(ImportExportModelAdmin):
    resource_class = TurkmenEnglishWordResource
    list_display = ('id', 'turkmen_word', 'english_word', 'level', 'category', 'status', 'created_by')
    list_filter = ('level', 'status', 'category', 'created_at')
    search_fields = ('turkmen_word', 'english_word', 'definition')
    raw_id_fields = ('created_by',)
