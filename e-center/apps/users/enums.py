from django.db.models import TextChoices


class UserRole(TextChoices):
    STUDENT = 'student', 'Student'
    TEACHER = 'teacher', 'Teacher'
    ADMIN = 'admin', 'Admin'


class LessonStatus(TextChoices):
    DRAFT = 'draft', 'Draft'
    PUBLISHED = 'published', 'Published'
    ARCHIVED = 'archived', 'Archived'