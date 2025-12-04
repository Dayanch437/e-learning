"""
Production settings for Django project.
This file contains settings specific to production environment.
"""

import dj_database_url
from .base import *

try:
    import sentry_sdk
    from sentry_sdk.integrations.django import DjangoIntegration
    from sentry_sdk.integrations.logging import LoggingIntegration
    SENTRY_AVAILABLE = True
except ImportError:
    SENTRY_AVAILABLE = False

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config('DEBUG', default=False, cast=bool)

ALLOWED_HOSTS = config(
    'ALLOWED_HOSTS', 
    default='', 
    cast=lambda v: [s.strip() for s in v.split(',') if s.strip()]
)

# Database Configuration for Production
# Uses PostgreSQL - a robust, scalable database for production environments
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

# PostgreSQL Configuration (Required for Production)
# DATABASE_URL format: postgres://username:password@host:port/database_name
# Example: postgres://myuser:mypass@localhost:5432/mydatabase
DATABASES = {
    'default': dj_database_url.parse(
        config('DATABASE_URL'),  # This MUST be set in production environment
        conn_max_age=60,  # Connection pooling - keeps connections alive for 60 seconds
    )
}

# Ensure PostgreSQL is being used in production
if 'postgresql' not in DATABASES['default']['ENGINE'] and 'postgres' not in DATABASES['default']['ENGINE']:
    raise Exception(
        "Production environment must use PostgreSQL database. "
        "Please set DATABASE_URL environment variable with PostgreSQL connection string."
    )

# PostgreSQL-specific optimizations
DATABASES['default']['OPTIONS'] = {
    # Connection pool settings
    'MAX_CONNS': 20,
    'MIN_CONNS': 5,
    # Enable SSL in production (recommended)
    # 'sslmode': 'require',
}

# Security settings for production
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_SECONDS = 31536000
SECURE_REDIRECT_EXEMPT = []
SECURE_SSL_REDIRECT = config('SECURE_SSL_REDIRECT', default=True, cast=bool)
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# Additional security headers
SECURE_HSTS_PRELOAD = True
SECURE_FRAME_DENY = True
SECURE_REFERRER_POLICY = 'same-origin'

# CORS settings for production
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS', 
    default='',
    cast=lambda v: [s.strip() for s in v.split(',') if s.strip()]
)

# CSRF settings
CSRF_TRUSTED_ORIGINS = config(
    'CSRF_TRUSTED_ORIGINS', 
    default='',
    cast=lambda v: [s.strip() for s in v.split(',') if s.strip()]
)

# Email configuration
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = config('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=True, cast=bool)
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='noreply@yourdomain.com')

# Cache configuration
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': config('REDIS_URL', default='redis://127.0.0.1:6379/1'),
    }
}

# Session configuration
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'

# Logging configuration for production
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': BASE_DIR / 'logs' / 'django.log',
            'maxBytes': 1024*1024*15,  # 15MB
            'backupCount': 10,
            'formatter': 'verbose',
        },
        'error_file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': BASE_DIR / 'logs' / 'django_error.log',
            'maxBytes': 1024*1024*15,  # 15MB
            'backupCount': 10,
            'formatter': 'verbose',
        },
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'WARNING',
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.request': {
            'handlers': ['console', 'error_file'],
            'level': 'ERROR',
            'propagate': False,
        },
    },
}

# Sentry configuration (optional)
SENTRY_DSN = config('SENTRY_DSN', default='')
if SENTRY_DSN and SENTRY_AVAILABLE:
    import logging
    sentry_logging = LoggingIntegration(
        level=logging.INFO,
        event_level=logging.ERROR
    )
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[DjangoIntegration(), sentry_logging],
        traces_sample_rate=0.1,
        send_default_pii=True,
        environment=config('ENVIRONMENT', default='production')
    )

# Static files storage for production
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media files configuration for production
# Consider using AWS S3 or similar cloud storage
DEFAULT_FILE_STORAGE = 'django.core.files.storage.FileSystemStorage'

# Performance optimizations
CONN_MAX_AGE = 60

# Admin URL (change this in production)
ADMIN_URL = config('ADMIN_URL', default='admin/')

# Production-specific apps
INSTALLED_APPS += [
    # Add production-specific apps here
]

# Rate limiting (if using django-ratelimit)
# RATELIMIT_ENABLE = True