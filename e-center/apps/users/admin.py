from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth import get_user_model

User = get_user_model()


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Custom User Admin
    """
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
