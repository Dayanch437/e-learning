# Database Configuration Guide

This guide explains how to configure databases for different environments in your Django starter project.

## 🏠 Local Development (SQLite)

### What is SQLite?
SQLite is a lightweight, file-based database that's perfect for development:
- **No server setup required** - database is just a file
- **Zero configuration** - works out of the box
- **Perfect for development** - fast and simple
- **Cross-platform** - works on any operating system

### How it works in this project:
- **Location**: Database file is stored at `db.sqlite3` in your project root
- **Automatic setup**: Created automatically when you run migrations
- **No installation needed**: Built into Python

### Commands for SQLite:
```bash
# Create/update database
python manage.py migrate

# View database (optional - install sqlite3 CLI)
sqlite3 db.sqlite3
.tables
.quit
```

## 🏭 Production (PostgreSQL)

### What is PostgreSQL?
PostgreSQL is a powerful, production-ready database:
- **Scalable** - handles large amounts of data
- **Reliable** - ACID compliant with data integrity
- **Feature-rich** - advanced querying and indexing
- **Industry standard** - used by major companies

### Setup for Production:

#### Option 1: Local PostgreSQL Installation
```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Install PostgreSQL (macOS with Homebrew)
brew install postgresql
brew services start postgresql

# Install PostgreSQL (Windows)
# Download from: https://www.postgresql.org/download/windows/
```

#### Option 2: Cloud PostgreSQL Services
- **Heroku Postgres**: Automatic with Heroku deployment
- **AWS RDS**: Managed PostgreSQL service
- **Railway**: Simple PostgreSQL hosting
- **DigitalOcean**: Managed databases
- **ElephantSQL**: PostgreSQL as a service

### Environment Variables for PostgreSQL:

#### Basic Format:
```bash
DATABASE_URL=postgres://username:password@host:port/database_name
```

#### Examples:

**Local PostgreSQL:**
```bash
DATABASE_URL=postgres://postgres:mypassword@localhost:5432/e-center
```

**Heroku (automatically provided):**
```bash
DATABASE_URL=postgres://user:pass@ec2-hostname.compute-1.amazonaws.com:5432/dbname
```

**Railway:**
```bash
DATABASE_URL=postgres://postgres:password@containers-us-west-1.railway.app:5432/railway
```

**AWS RDS:**
```bash
DATABASE_URL=postgres://myuser:mypass@mydb.cluster-xyz.us-east-1.rds.amazonaws.com:5432/mydb
```

## 🔧 Configuration Files Explained

### Local Settings (`config/settings/local.py`)
```python
# Uses SQLite - perfect for development
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

### Production Settings (`config/settings/production.py`)
```python
# Uses PostgreSQL from environment variable
DATABASES = {
    'default': dj_database_url.parse(
        config('DATABASE_URL'),  # Must be set in production
        conn_max_age=60,  # Connection pooling
    )
}
```

## 📋 Step-by-Step Setup

### For Local Development:
1. **No setup needed!** SQLite works automatically
2. Run migrations: `python manage.py migrate`
3. Start coding!

### For Production Deployment:

#### Step 1: Choose PostgreSQL Service
- Sign up for a service (Heroku, Railway, AWS, etc.)
- Create a PostgreSQL database
- Get the connection URL

#### Step 2: Set Environment Variable
```bash
# Add to your .env file or server environment
DATABASE_URL=postgres://your-connection-string-here
```

#### Step 3: Install PostgreSQL Driver
```bash
# Already included in requirements.txt
pip install psycopg2-binary
```

#### Step 4: Run Migrations in Production
```bash
# Set production environment
export DJANGO_SETTINGS_MODULE=config.settings.production

# Run migrations
python manage.py migrate
```

## 🚨 Common Issues & Solutions

### Issue: "No module named 'psycopg2'"
**Solution:** Install PostgreSQL driver
```bash
pip install psycopg2-binary
```

### Issue: "FATAL: database does not exist"
**Solution:** Create the database first
```bash
# Connect to PostgreSQL
psql -U postgres -h localhost

# Create database
CREATE DATABASE e-center;
\q
```

### Issue: "connection refused"
**Solution:** Check if PostgreSQL is running
```bash
# Check PostgreSQL status (Linux/macOS)
sudo service postgresql status

# Start PostgreSQL (Linux)
sudo service postgresql start

# Start PostgreSQL (macOS with Homebrew)
brew services start postgresql
```

## 📊 Database Comparison

| Feature | SQLite (Local) | PostgreSQL (Production) |
|---------|----------------|------------------------|
| Setup Complexity | ✅ None | ⚠️ Moderate |
| Performance | ✅ Fast for small data | ✅ Excellent for large data |
| Scalability | ❌ Limited | ✅ Highly scalable |
| Concurrent Users | ❌ Limited | ✅ Thousands |
| Data Integrity | ✅ Good | ✅ Excellent |
| Backup/Recovery | ✅ Simple file copy | ✅ Advanced tools |
| Cost | ✅ Free | ✅ Free (open source) |

## 🎯 Best Practices

1. **Always use SQLite for development** - it's simple and fast
2. **Always use PostgreSQL for production** - it's robust and scalable
3. **Keep database URLs in environment variables** - never hardcode credentials
4. **Use connection pooling in production** - improves performance
5. **Regular backups in production** - protect your data
6. **Monitor database performance** - optimize queries as needed

## 🔄 Migration Between Databases

If you need to move data from SQLite to PostgreSQL:

```bash
# Export data from SQLite
python manage.py dumpdata > data.json

# Switch to PostgreSQL settings
export DJANGO_SETTINGS_MODULE=config.settings.production

# Run migrations on PostgreSQL
python manage.py migrate

# Import data to PostgreSQL
python manage.py loaddata data.json
```

This setup gives you the best of both worlds: simple development with SQLite and robust production with PostgreSQL! 🚀