from django.contrib import admin
from import_export import resources
from import_export.admin import ImportExportModelAdmin
from .models import ChatSession, ChatMessage


class ChatMessageInline(admin.TabularInline):
    model = ChatMessage
    extra = 0


# Resource classes for import/export
class ChatSessionResource(resources.ModelResource):
    class Meta:
        model = ChatSession
        fields = ('id', 'title', 'user__username', 'user__email', 'created_at', 'updated_at')
        export_order = fields


class ChatMessageResource(resources.ModelResource):
    class Meta:
        model = ChatMessage
        fields = (
            'id', 'session__id', 'session__title', 'session__user__username',
            'role', 'content', 'created_at'
        )
        export_order = fields


@admin.register(ChatSession)
class ChatSessionAdmin(ImportExportModelAdmin):
    resource_class = ChatSessionResource
    list_display = ('title', 'user', 'created_at', 'updated_at')
    list_filter = ('user', 'created_at')
    search_fields = ('title', 'user__username', 'user__email')
    inlines = [ChatMessageInline]


@admin.register(ChatMessage)
class ChatMessageAdmin(ImportExportModelAdmin):
    resource_class = ChatMessageResource
    list_display = ('role', 'session', 'content_preview', 'created_at')
    list_filter = ('role', 'created_at', 'session__user')
    search_fields = ('content', 'session__title', 'session__user__username')
    
    def content_preview(self, obj):
        return obj.content[:50] + ('...' if len(obj.content) > 50 else '')
    content_preview.short_description = 'Content'
