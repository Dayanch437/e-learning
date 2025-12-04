from rest_framework import permissions
from apps.users.enums import UserRole


class IsTeacherOrReadOnly(permissions.BasePermission):
    """
    Custom permission to allow teachers to create/edit content,
    but allow read-only access to others.
    """
    
    def has_permission(self, request, view):
        # Read permissions for all authenticated users
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only for teachers and admins
        return (
            request.user.is_authenticated and 
            request.user.role in [UserRole.TEACHER, UserRole.ADMIN]
        )


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    Admins can edit any object.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions for all
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only to the owner or admin
        return (
            obj.created_by == request.user or 
            request.user.role == UserRole.ADMIN
        )


class IsStudentOnly(permissions.BasePermission):
    """
    Custom permission to allow only students.
    """
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.role == UserRole.STUDENT
        )


class IsTeacherOnly(permissions.BasePermission):
    """
    Custom permission to allow only teachers.
    """
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.role == UserRole.TEACHER
        )


class IsAdminOnly(permissions.BasePermission):
    """
    Custom permission to allow only admins.
    """
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.role == UserRole.ADMIN
        )


class IsTeacherOrAdmin(permissions.BasePermission):
    """
    Custom permission to allow only teachers and admins.
    """
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.role in [UserRole.TEACHER, UserRole.ADMIN]
        )
