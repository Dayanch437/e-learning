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





class IsTeacher(permissions.BasePermission):

    def has_permission(self, request, view):class IsOwnerOrReadOnly(permissions.BasePermission):

        return request.user.is_authenticated and request.user.role == UserRole.TEACHER

class IsTeacherOrReadOnly(permissions.BasePermission):    """



class IsOwnerOrTeacher(permissions.BasePermission):    """    Custom permission to only allow owners of an object to edit it.

    def has_object_permission(self, request, view, obj):

        if request.method in permissions.SAFE_METHODS:    Custom permission to only allow teachers to create/edit content.    """

            return request.user.is_authenticated

        return (obj.created_by == request.user or     Students can only read.    

                request.user.role == UserRole.TEACHER or 

                request.user.is_superuser)    """    def has_object_permission(self, request, view, obj):



        # Read permissions are allowed to any request,

class IsStudent(permissions.BasePermission):

    def has_permission(self, request, view):    def has_permission(self, request, view):        # so we'll always allow GET, HEAD or OPTIONS requests.

        return request.user.is_authenticated and request.user.role == UserRole.STUDENT

        # Read permissions for authenticated users        if request.method in permissions.SAFE_METHODS:



class IsOwnerOrReadOnly(permissions.BasePermission):        if request.method in permissions.SAFE_METHODS:            return True

    def has_object_permission(self, request, view, obj):

        if request.method in permissions.SAFE_METHODS:            return request.user.is_authenticated        

            return request.user.is_authenticated

        return obj.created_by == request.user or request.user.is_superuser                # Write permissions are only allowed to the owner of the object.

        # Write permissions only for teachers        return obj.owner == request.user

        return request.user.is_authenticated and request.user.role == UserRole.TEACHER



class IsOwner(permissions.BasePermission):

class IsTeacher(permissions.BasePermission):    """

    """    Custom permission to only allow owners of an object to access it.

    Custom permission to only allow teachers.    """

    """    

        def has_object_permission(self, request, view, obj):

    def has_permission(self, request, view):        return obj.owner == request.user

        return request.user.is_authenticated and request.user.role == UserRole.TEACHER



class IsVerified(permissions.BasePermission):

class IsOwnerOrTeacher(permissions.BasePermission):    """

    """    Custom permission to only allow verified users.

    Custom permission to only allow owners of an object or teachers to edit it.    """

    """    

    def has_permission(self, request, view):

    def has_object_permission(self, request, view, obj):        return bool(request.user and 

        # Read permissions for authenticated users                   request.user.is_authenticated and 

        if request.method in permissions.SAFE_METHODS:                   request.user.is_verified)

            return request.user.is_authenticated

        

        # Write permissions only for the owner or teachersclass IsAdminOrOwner(permissions.BasePermission):

        return (obj.created_by == request.user or     """

                request.user.role == UserRole.TEACHER or     Custom permission to only allow admin users or owners.

                request.user.is_superuser)    """

    

    def has_object_permission(self, request, view, obj):

class IsStudent(permissions.BasePermission):        return bool(request.user.is_staff or obj.owner == request.user)

    """

    Custom permission to only allow students.

    """class ReadOnlyPermission(permissions.BasePermission):

        """

    def has_permission(self, request, view):    Custom permission for read-only access.

        return request.user.is_authenticated and request.user.role == UserRole.STUDENT    """

    

    def has_permission(self, request, view):

class IsOwnerOrReadOnly(permissions.BasePermission):        return request.method in permissions.SAFE_METHODS
    """
    Custom permission to only allow owners of an object to edit it.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions for authenticated users
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        
        # Write permissions only for the owner
        return obj.created_by == request.user or request.user.is_superuser


class IsOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to access it.
    """
    
    def has_object_permission(self, request, view, obj):
        return obj.created_by == request.user