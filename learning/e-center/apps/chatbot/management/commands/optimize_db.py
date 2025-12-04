"""
Management command to optimize database performance.
Usage: python manage.py optimize_db
"""

from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = 'Optimize database performance for SQLite'

    def handle(self, *args, **options):
        self.stdout.write('Starting database optimization...')
        
        with connection.cursor() as cursor:
            # SQLite specific optimizations
            optimizations = [
                "PRAGMA journal_mode=WAL;",  # Write-Ahead Logging for better concurrency
                "PRAGMA synchronous=NORMAL;",  # Faster writes
                "PRAGMA cache_size=10000;",  # Increase cache size
                "PRAGMA temp_store=MEMORY;",  # Store temporary tables in memory
                "PRAGMA mmap_size=268435456;",  # Use memory-mapped I/O (256MB)
                "VACUUM;",  # Rebuild database for optimal storage
                "ANALYZE;",  # Update statistics for query optimizer
            ]
            
            for sql in optimizations:
                try:
                    cursor.execute(sql)
                    self.stdout.write(
                        self.style.SUCCESS(f'✓ Executed: {sql}')
                    )
                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(f'✗ Failed: {sql} - {e}')
                    )
        
        self.stdout.write(
            self.style.SUCCESS('Database optimization completed!')
        )