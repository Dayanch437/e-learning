"""
Core utilities and helper functions
"""
import os
import uuid
from django.utils.text import slugify


def generate_unique_filename(instance, filename):
    """
    Generate a unique filename using UUID
    """
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return filename


def upload_to_directory(directory):
    """
    Generate upload path for file fields
    Usage: upload_to=upload_to_directory('profile_pictures')
    """
    def upload_path(instance, filename):
        filename = generate_unique_filename(instance, filename)
        return os.path.join(directory, filename)
    return upload_path


def create_slug(text, max_length=50):
    """
    Create a slug from text with optional max length
    """
    slug = slugify(text)
    if len(slug) > max_length:
        slug = slug[:max_length].rsplit('-', 1)[0]
    return slug


def get_client_ip(request):
    """
    Get client IP address from request
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def format_file_size(size_in_bytes):
    """
    Format file size in human readable format
    """
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if size_in_bytes < 1024.0:
            return f"{size_in_bytes:.1f} {unit}"
        size_in_bytes /= 1024.0
    return f"{size_in_bytes:.1f} PB"