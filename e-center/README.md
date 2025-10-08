# Django REST Framewor#### �️ **Database Configuration:**
- **Local Development**: SQLite (file-based, zero setup)
- **Production**: PostgreSQL (scalable, robust)
- **Environment-based**: Automatic switching based on settings
- **Connection Pooling**: Optimized for production performance

### 🏗️ **Project Organization:**
- **Apps Structure**: All Django apps organized in `/apps` directory
- **Settings Split**: Environment-specific settings (base, local, production)
- **Environment Configuration**: Easy switching between development/production
- **Logging**: Structured logging configuration for different environments
- **Security**: Production-ready security settings and CORS configurationter Project

A comprehensive Django starter project with Django REST Framework, pre-configured with essential features for rapid development.

## Features

### 🚀 Core Features
- **Django 5.2.6** with **Django REST Framework 3.15.2**
- Custom User model with extended fields
- JWT/Token Authentication ready
- CORS configuration for frontend integration
- PostgreSQL and SQLite support
- Static and Media files configuration
- Comprehensive admin interface

### 🔐 Authentication System
- Custom User model with email as username
- User registration and login endpoints
- Password change functionality
- Profile management
- Token-based authentication

### 🛠️ Development Tools
- Environment-based configuration with python-decouple
- Custom management commands
- Base models with timestamps and soft delete
- Custom permissions and pagination classes
- Whitenoise for static file serving

### 📦 Included Packages
- `Django` - Web framework
- `djangorestframework` - API framework
- `django-cors-headers` - CORS handling
- `python-decouple` - Environment configuration
- `Pillow` - Image processing
- `django-filter` - API filtering
- `dj-database-url` - Database URL parsing
- `psycopg2-binary` - PostgreSQL adapter
- `gunicorn` - WSGI server
- `whitenoise` - Static file serving

## Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd e-center
```

### 2. Create Virtual Environment
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Environment Configuration
```bash
cp .env.example .env
```
Edit `.env` file with your configurations:
```env
DEBUG=True
SECRET_KEY=your-secret-key-here-change-in-production
ALLOWED_HOSTS=localhost,127.0.0.1
DJANGO_SETTINGS_MODULE=config.settings.local
DATABASE_URL=sqlite:///db.sqlite3
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### 5. Settings Environment
Choose your environment configuration:
```bash
# For local development (default)
export DJANGO_SETTINGS_MODULE=config.settings.local

# For production
export DJANGO_SETTINGS_MODULE=config.settings.production

# Or use the helper script
./set_environment.sh
```

### 6. Database Setup

#### 🏠 **Local Development (SQLite - Default)**
SQLite is used automatically for local development - no setup required!
```bash
python manage.py makemigrations
python manage.py migrate
```

#### 🏭 **Production (PostgreSQL)**
For production, configure PostgreSQL in your environment:
```bash
# Set PostgreSQL connection in .env or environment
DATABASE_URL=postgres://username:password@host:port/database_name

# Example for local PostgreSQL
DATABASE_URL=postgres://postgres:mypassword@localhost:5432/e-center

# Run with production settings
export DJANGO_SETTINGS_MODULE=config.settings.production
python manage.py migrate
```

📚 **See [DATABASE_GUIDE.md](DATABASE_GUIDE.md) for detailed database configuration instructions.**

### 7. Create Superuser
```bash
python manage.py create_superuser
# Or with custom credentials:
python manage.py create_superuser --email admin@yoursite.com --password yourpassword
```

### 8. Run Development Server
```bash
python manage.py runserver
```

## API Endpoints

### Authentication Endpoints
- `POST /api/v1/auth/register/` - User registration
- `POST /api/v1/auth/login/` - User login
- `POST /api/v1/auth/logout/` - User logout
- `GET /api/v1/auth/profile/` - Get user profile
- `PUT /api/v1/auth/profile/update/` - Update user profile
- `POST /api/v1/auth/change-password/` - Change password
- `GET /api/v1/auth/list/` - List users (admin only)

### API Documentation
- Visit `/api/docs/` for interactive API documentation

## Project Structure

```
django_starter/
├── config/                 # Django project configuration
│   ├── settings/          # Split settings configuration
│   │   ├── __init__.py   # Settings package
│   │   ├── base.py       # Base settings (common)
│   │   ├── local.py      # Local development settings
│   │   └── production.py # Production settings
│   ├── urls.py           # Main URL configuration
│   ├── wsgi.py          # WSGI configuration
│   └── asgi.py          # ASGI configuration
├── apps/                  # All Django apps
│   ├── core/             # Core app with utilities
│   │   ├── management/   # Custom management commands
│   │   ├── models.py     # Base models
│   │   ├── permissions.py # Custom permissions
│   │   ├── pagination.py # Pagination classes
│   │   └── utils.py      # Utility functions
│   └── users/            # User management app
│       ├── models.py     # Custom User model
│       ├── serializers.py # User serializers
│       ├── views.py      # User API views
│       ├── urls.py       # User URL patterns
│       └── admin.py      # User admin configuration
├── static/               # Static files
├── media/                # Media files
├── templates/            # HTML templates
├── logs/                 # Log files directory
├── requirements.txt      # Python dependencies
├── .env.example         # Environment variables example
├── .gitignore           # Git ignore file
├── set_environment.sh   # Environment switching script
├── deploy.sh            # Deployment script
├── test_api.py          # API testing script
├── quick_setup.sh       # New project setup
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Docker Compose
└── manage.py            # Django management script
```

## Usage Examples

### User Registration
```python
import requests

response = requests.post('http://localhost:8000/api/v1/auth/register/', {
    'username': 'testuser',
    'email': 'test@example.com',
    'password': 'testpass123',
    'password_confirm': 'testpass123',
    'first_name': 'Test',
    'last_name': 'User'
})
```

### User Login
```python
response = requests.post('http://localhost:8000/api/v1/auth/login/', {
    'email': 'test@example.com',
    'password': 'testpass123'
})
token = response.json()['token']
```

### Authenticated Requests
```python
headers = {'Authorization': f'Token {token}'}
response = requests.get('http://localhost:8000/api/v1/auth/profile/', headers=headers)
```

## Settings Configuration

### Environment-Specific Settings

#### Base Settings (`config.settings.base`)
Contains common settings shared across all environments:
- Installed apps configuration
- Middleware setup
- Templates configuration
- REST Framework settings
- DRF Spectacular configuration

#### Local Development (`config.settings.local`)
Inherits from base and adds:
- Debug mode enabled
- SQLite database (default)
- Console email backend
- Development logging
- CORS allow all origins

#### Production (`config.settings.production`)
Inherits from base and adds:
- Debug mode disabled
- Security headers and SSL settings
- PostgreSQL database support
- Email configuration (SMTP)
- Redis caching
- Structured logging
- Sentry integration (optional)

### Switching Environments
```bash
# Set environment variable
export DJANGO_SETTINGS_MODULE=config.settings.local

# Or use the helper script
./set_environment.sh

# Or set in .env file
DJANGO_SETTINGS_MODULE=config.settings.local
```

## Customization
### Adding New Apps
1. Create a new app in apps directory: `python manage.py startapp myapp apps/myapp`
2. Add to `LOCAL_APPS` in `config/settings/base.py`
3. Create URL patterns and include in main `urls.py`

### Custom Models
Extend the base models for automatic timestamps and soft delete:
```python
from apps.core.models import BaseModel

class MyModel(BaseModel):
    title = models.CharField(max_length=200)
    # Automatically includes created_at, updated_at, is_deleted, deleted_at
```

### Environment Variables
Add new environment variables in `.env` and access them in settings:
```python
from decouple import config

MY_SETTING = config('MY_SETTING', default='default_value')
```

## Deployment

### Production Settings
1. Set `DEBUG=False` in `.env`
2. Configure proper `SECRET_KEY`
3. Set up PostgreSQL database
4. Configure `ALLOWED_HOSTS`
5. Use environment variables for sensitive data

### Static Files
Static files are handled by WhiteNoise. Run:
```bash
python manage.py collectstatic
```

## Development Guidelines

### Code Style
- Follow PEP 8
- Use meaningful variable names
- Add docstrings to functions and classes
- Write tests for new functionality

### Git Workflow
1. Create feature branches from `main`
2. Make descriptive commits
3. Test before pushing
4. Create pull requests for review

## Common Issues

### Migration Issues
```bash
# Reset migrations
python manage.py migrate --fake-initial
python manage.py migrate
```

### Permission Denied
```bash
# Make sure virtual environment is activated
source .venv/bin/activate
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For questions or issues, please create an issue in the repository or contact the maintainers.

---

**Happy Coding! 🚀**
# diplom_is
