"""
Management command to create a superuser with predefined credentials.
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.users.models import UserRole

User = get_user_model()


class Command(BaseCommand):
    help = 'Create a superuser with predefined credentials'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--username',
            type=str,
            default='superadmin',
            help='Username for the superuser (default: superadmin)'
        )
        parser.add_argument(
            '--email',
            type=str,
            default='admin@example.com',
            help='Email for the superuser (default: admin@example.com)'
        )
        parser.add_argument(
            '--password',
            type=str,
            default='admin123456',
            help='Password for the superuser (default: admin123456)'
        )
    
    def handle(self, *args, **options):
        username = options['username']
        email = options['email']
        password = options['password']
        
        # Check if user already exists
        if User.objects.filter(username=username).exists():
            self.stdout.write(
                self.style.WARNING(f'User with username "{username}" already exists.')
            )
            return
        
        if User.objects.filter(email=email).exists():
            self.stdout.write(
                self.style.WARNING(f'User with email "{email}" already exists.')
            )
            return
        
        # Create superuser
        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
            role=UserRole.ADMIN,
            first_name='Super',
            last_name='Admin'
        )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created superuser:\n'
                f'Username: {username}\n'
                f'Email: {email}\n'
                f'Password: {password}\n'
                f'Role: {user.role}'
            )
        )