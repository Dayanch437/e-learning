"""
Local development settings for Django project.
This file contains settings specific to local development environment.
"""

import dj_database_url
from .base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config('DEBUG', default=True, cast=bool)

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=lambda v: [s.strip() for s in v.split(',')])

# Database Configuration for Local Development
# Uses SQLite - a lightweight, file-based database perfect for development
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

# SQLite Configuration (Default for Development)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',  # Database file location
        'OPTIONS': {
            'timeout': 20,  # Timeout for database operations
        }
    }
}

# Alternative: Use environment variable for database URL
# Uncomment the lines below if you want to use DATABASE_URL from .env
# DATABASES = {
#     'default': dj_database_url.parse(
#         config('DATABASE_URL', default='sqlite:///' + str(BASE_DIR / 'db.sqlite3'))
#     )
# }

# SQLite-specific optimizations for development
if DATABASES['default']['ENGINE'] == 'django.db.backends.sqlite3':
    DATABASES['default']['OPTIONS'] = {
        'timeout': 20,
        # Enable foreign key constraints
        'init_command': "PRAGMA foreign_keys=ON;",
    }

# Development specific apps
INSTALLED_APPS += [
    # Add development-specific apps here
    # 'debug_toolbar',
    # 'django_extensions',
]

# Development specific middleware
MIDDLEWARE += [
    # Add development-specific middleware here
    # 'debug_toolbar.middleware.DebugToolbarMiddleware',
]

# Logging configuration for development
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'simple'
        },
        'file': {
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'django.log',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.request': {
            'handlers': ['console', 'file'],
            'level': 'ERROR',
            'propagate': False,
        },
    },
}

# Email backend for development
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Cache configuration for development
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    }
}

# Development specific settings
INTERNAL_IPS = [
    '127.0.0.1',
    'localhost',
]

# Allow all origins for CORS in development
CORS_ALLOW_ALL_ORIGINS = True

# Disable CSRF for development API testing
# CSRF_TRUSTED_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000']