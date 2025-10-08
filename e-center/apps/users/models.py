from django.contrib.auth.models import AbstractUser
from django.db import models
from .enums import UserRole


class User(AbstractUser):
    """
    Custom User model that extends AbstractUser.
    Add additional fields as needed for your project.
    """
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    profile_picture = models.ImageField(
        upload_to='profile_pictures/', 
        null=True, 
        blank=True
    )
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.STUDENT
    )
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Use email as the unique identifier
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()
    
    @property
    def is_teacher(self):
        return self.role == UserRole.TEACHER
    
    @property
    def is_student(self):
        return self.role == UserRole.STUDENT
    
    @property
    def is_admin_user(self):
        return self.role == UserRole.ADMIN or self.is_superuser

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
