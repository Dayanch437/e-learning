#!/bin/bash

# Quick setup script for new projects based on Django Starter
# This script helps you quickly set up a new project from this template

set -e

echo "Django Starter - Quick Project Setup"
echo "===================================="

# Get project name
read -p "Enter your new project name: " PROJECT_NAME

if [ -z "$PROJECT_NAME" ]; then
    echo "Project name cannot be empty!"
    exit 1
fi

echo "Setting up project: $PROJECT_NAME"

# Create project directory
mkdir -p "$PROJECT_NAME"
cd "$PROJECT_NAME"

# Copy all files except .git
rsync -av --exclude='.git' --exclude='.venv' --exclude='db.sqlite3' --exclude='__pycache__' --exclude='*.pyc' ../ ./

# Create new virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env from example
cp .env.example .env

# Generate new secret key
DJANGO_SECRET_KEY=$(python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')
sed -i "s/SECRET_KEY=.*/SECRET_KEY=$DJANGO_SECRET_KEY/" .env

# Set Django settings module for development
echo "DJANGO_SETTINGS_MODULE=config.settings.local" >> .env

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
echo "Creating superuser..."
python manage.py create_superuser

# Initialize git repository
git init
git add .
git commit -m "Initial commit - Django Starter Project: $PROJECT_NAME"

echo
echo "✅ Project setup completed successfully!"
echo
echo "Next steps:"
echo "1. cd $PROJECT_NAME"
echo "2. source .venv/bin/activate"
echo "3. python manage.py runserver"
echo
echo "Your project is ready at: $(pwd)"
echo "Admin: http://localhost:8000/admin"
echo "API: http://localhost:8000/api/v1/"