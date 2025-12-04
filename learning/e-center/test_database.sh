#!/bin/bash

# Database Testing Script
# This script demonstrates how to test different database configurations

echo "🗄️  Database Configuration Testing"
echo "=================================="

echo ""
echo "1️⃣  Testing SQLite (Local Development)"
echo "-------------------------------------------"
DJANGO_SETTINGS_MODULE=config.settings.local python manage.py check_database

echo ""
echo "2️⃣  Testing PostgreSQL Configuration Check"
echo "------------------------------------------------"
echo "This would require PostgreSQL to be installed and running."
echo "Example PostgreSQL setup commands:"
echo ""
echo "   # Install PostgreSQL (Ubuntu/Debian)"
echo "   sudo apt update && sudo apt install postgresql postgresql-contrib"
echo ""
echo "   # Create database and user"
echo "   sudo -u postgres psql -c \"CREATE DATABASE django_starter;\""
echo "   sudo -u postgres psql -c \"CREATE USER django_user WITH PASSWORD 'django_pass';\""
echo "   sudo -u postgres psql -c \"GRANT ALL PRIVILEGES ON DATABASE django_starter TO django_user;\""
echo ""
echo "   # Test with PostgreSQL"
echo "   DATABASE_URL=postgres://django_user:django_pass@localhost:5432/django_starter \\"
echo "   DJANGO_SETTINGS_MODULE=config.settings.production python manage.py check_database"

echo ""
echo "3️⃣  Current Environment Status"
echo "--------------------------------"
echo "Current Django Settings: ${DJANGO_SETTINGS_MODULE:-config.settings.local}"
echo "Database file exists: $([ -f db.sqlite3 ] && echo "✅ Yes" || echo "❌ No")"
echo "Database file size: $([ -f db.sqlite3 ] && stat -f%z db.sqlite3 2>/dev/null || stat -c%s db.sqlite3 2>/dev/null || echo "0") bytes"

echo ""
echo "📚 For detailed database setup instructions, see:"
echo "   - DATABASE_GUIDE.md"
echo "   - .env.example (database configuration examples)"