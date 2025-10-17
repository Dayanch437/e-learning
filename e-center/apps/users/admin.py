from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth import get_user_model
from import_export import resources
from import_export.admin import ImportExportModelAdmin

User = get_user_model()


class UserResource(resources.ModelResource):
    """
    Resource class for User import/export
    """
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name', 
            'role', 'phone_number', 'date_of_birth', 'is_verified', 
            'is_staff', 'is_active', 'created_at', 'updated_at'
        )
        export_order = fields


@admin.register(User)
class UserAdmin(ImportExportModelAdmin, BaseUserAdmin):
    """
    Custom User Admin with Import/Export functionality
    """
    resource_class = UserResource
    list_display = [
        'email', 'username', 'first_name', 'last_name', 'role',
        'is_verified', 'is_staff', 'is_active', 'created_at'
    ]
    list_filter = [
        'role', 'is_verified', 'is_staff', 'is_active', 'is_superuser', 'created_at'
    ]
    search_fields = ['email', 'username', 'first_name', 'last_name']
    ordering = ['-created_at']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': (
                'role', 'phone_number', 'date_of_birth', 'profile_picture', 
                'is_verified', 'created_at', 'updated_at'
            )
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'username', 'email', 'password1', 'password2',
                'first_name', 'last_name', 'role', 'phone_number'
            ),
        }),
    )
