#!/bin/bash

# Django Starter Project Deployment Script
# This script helps deploy your Django project to various environments

set -e  # Exit on any error

echo "Django Starter Project Deployment Script"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    print_status "Creating virtual environment..."
    python3 -m venv .venv
fi

print_status "Activating virtual environment..."
source .venv/bin/activate

print_status "Installing/Updating dependencies..."
pip install -r requirements.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Copying from .env.example..."
    cp .env.example .env
    print_warning "Please edit .env file with your configuration before continuing."
fi

print_status "Running database migrations..."
python manage.py makemigrations
python manage.py migrate

print_status "Collecting static files..."
python manage.py collectstatic --noinput

# Create superuser if requested
read -p "Create superuser? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    print_status "Creating superuser..."
    python manage.py create_superuser
fi

print_status "Running system checks..."
python manage.py check

echo
print_status "Deployment completed successfully!"
echo
echo "Next steps:"
echo "1. Review your .env configuration"
echo "2. Start the server: python manage.py runserver"
echo "3. Visit http://localhost:8000/admin for admin interface"
echo "4. API endpoints are available at http://localhost:8000/api/v1/"
echo
print_warning "For production deployment:"
echo "- Set DEBUG=False in .env"
echo "- Configure proper SECRET_KEY"
echo "- Set up PostgreSQL database"
echo "- Configure ALLOWED_HOSTS"
echo "- Use gunicorn or similar WSGI server"