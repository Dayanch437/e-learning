"""
Custom Django management command to check database configuration and status
Usage: python manage.py check_database
"""
from django.core.management.base import BaseCommand
from django.db import connection
from django.conf import settings


class Command(BaseCommand):
    help = 'Check database configuration and connection status'
    
    def handle(self, *args, **options):
        self.stdout.write("\n" + "="*50)
        self.stdout.write("DATABASE CONFIGURATION CHECK")
        self.stdout.write("="*50)
        
        # Get database configuration
        db_config = settings.DATABASES['default']
        
        self.stdout.write(f"\n📋 Configuration Details:")
        self.stdout.write(f"   Engine: {db_config['ENGINE']}")
        
        if 'sqlite' in db_config['ENGINE'].lower():
            self.stdout.write(f"   Database Type: SQLite (Development)")
            self.stdout.write(f"   Database File: {db_config['NAME']}")
            
            # Check if file exists
            import os
            if os.path.exists(db_config['NAME']):
                file_size = os.path.getsize(db_config['NAME'])
                self.stdout.write(f"   File Size: {file_size:,} bytes")
                self.stdout.write(self.style.SUCCESS("   ✅ Database file exists"))
            else:
                self.stdout.write(self.style.WARNING("   ⚠️  Database file not found - run 'python manage.py migrate'"))
        
        elif 'postgres' in db_config['ENGINE'].lower():
            self.stdout.write(f"   Database Type: PostgreSQL (Production)")
            self.stdout.write(f"   Host: {db_config.get('HOST', 'Not specified')}")
            self.stdout.write(f"   Port: {db_config.get('PORT', 'Default')}")
            self.stdout.write(f"   Database: {db_config.get('NAME', 'Not specified')}")
            self.stdout.write(f"   User: {db_config.get('USER', 'Not specified')}")
        
        # Test connection
        self.stdout.write(f"\n🔌 Connection Test:")
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                result = cursor.fetchone()
                if result[0] == 1:
                    self.stdout.write(self.style.SUCCESS("   ✅ Database connection successful"))
                    
                    # Get database info
                    if 'sqlite' in db_config['ENGINE'].lower():
                        cursor.execute("SELECT sqlite_version()")
                        version = cursor.fetchone()[0]
                        self.stdout.write(f"   SQLite Version: {version}")
                    elif 'postgres' in db_config['ENGINE'].lower():
                        cursor.execute("SELECT version()")
                        version = cursor.fetchone()[0]
                        # Extract just the PostgreSQL version number
                        pg_version = version.split()[1]
                        self.stdout.write(f"   PostgreSQL Version: {pg_version}")
        
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"   ❌ Database connection failed: {e}"))
            
            if 'sqlite' in db_config['ENGINE'].lower():
                self.stdout.write("\n💡 Solution for SQLite:")
                self.stdout.write("   Run: python manage.py migrate")
            elif 'postgres' in db_config['ENGINE'].lower():
                self.stdout.write("\n💡 Solution for PostgreSQL:")
                self.stdout.write("   1. Make sure PostgreSQL server is running")
                self.stdout.write("   2. Check DATABASE_URL environment variable")
                self.stdout.write("   3. Verify database exists and user has permissions")
                self.stdout.write("   4. Install: pip install psycopg2-binary")
        
        # Check for migrations
        self.stdout.write(f"\n📊 Migration Status:")
        try:
            from django.db.migrations.executor import MigrationExecutor
            executor = MigrationExecutor(connection)
            plan = executor.migration_plan(executor.loader.graph.leaf_nodes())
            
            if plan:
                self.stdout.write(self.style.WARNING(f"   ⚠️  {len(plan)} unapplied migrations found"))
                self.stdout.write("   Run: python manage.py migrate")
            else:
                self.stdout.write(self.style.SUCCESS("   ✅ All migrations applied"))
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"   ❌ Could not check migrations: {e}"))
        
        # Environment info
        self.stdout.write(f"\n⚙️  Environment:")
        self.stdout.write(f"   Settings Module: {settings.SETTINGS_MODULE}")
        self.stdout.write(f"   Debug Mode: {settings.DEBUG}")
        
        self.stdout.write("\n" + "="*50)
        
        if 'sqlite' in db_config['ENGINE'].lower() and not settings.DEBUG:
            self.stdout.write(self.style.WARNING(
                "\n⚠️  WARNING: Using SQLite in production mode!\n"
                "   Consider switching to PostgreSQL for production.\n"
                "   See DATABASE_GUIDE.md for instructions."
            ))
        
        self.stdout.write("")  # Empty line for clean output