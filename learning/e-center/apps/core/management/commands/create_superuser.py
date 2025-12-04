"""
Custom Django management command to create a superuser with predefined credentials
Usage: python manage.py create_superuser
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Create a superuser with predefined credentials'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            default='admin@example.com',
            help='Email for the superuser (default: admin@example.com)'
        )
        parser.add_argument(
            '--password',
            type=str,
            default='admin123',
            help='Password for the superuser (default: admin123)'
        )
        parser.add_argument(
            '--username',
            type=str,
            default='admin',
            help='Username for the superuser (default: admin)'
        )
    
    def handle(self, *args, **options):
        email = options['email']
        password = options['password']
        username = options['username']
        
        if User.objects.filter(email=email).exists():
            self.stdout.write(
                self.style.WARNING(f'User with email {email} already exists')
            )
            return
        
        user = User.objects.create_superuser(
            email=email,
            username=username,
            password=password
        )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Superuser created successfully!\n'
                f'Email: {email}\n'
                f'Username: {username}\n'
                f'Password: {password}'
            )
        )