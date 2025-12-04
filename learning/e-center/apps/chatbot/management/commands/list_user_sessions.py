"""
Django management command to list all chat sessions for authenticated users.
Usage: python manage.py list_user_sessions [--user-id USER_ID] [--recent DAYS] [--format FORMAT]
"""

from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model
from apps.chatbot.models import ChatSession, ChatMessage
from django.utils import timezone
from datetime import timedelta
import json

User = get_user_model()


class Command(BaseCommand):
    help = 'List all chat sessions for authenticated users with detailed information'

    def add_arguments(self, parser):
        parser.add_argument(
            '--user-id',
            type=int,
            help='Filter sessions by specific user ID',
        )
        parser.add_argument(
            '--username',
            type=str,
            help='Filter sessions by username',
        )
        parser.add_argument(
            '--recent',
            type=int,
            help='Show sessions from the last N days',
        )
        parser.add_argument(
            '--format',
            type=str,
            choices=['table', 'json', 'csv'],
            default='table',
            help='Output format (default: table)',
        )
        parser.add_argument(
            '--include-messages',
            action='store_true',
            help='Include message count and latest message preview',
        )
        parser.add_argument(
            '--active-only',
            action='store_true',
            help='Show only sessions with at least one message',
        )

    def handle(self, *args, **options):
        try:
            # Build queryset
            queryset = ChatSession.objects.select_related('user').prefetch_related('messages')
            
            # Apply filters
            if options['user_id']:
                queryset = queryset.filter(user_id=options['user_id'])
                
            if options['username']:
                queryset = queryset.filter(user__username=options['username'])
                
            if options['recent']:
                since_date = timezone.now() - timedelta(days=options['recent'])
                queryset = queryset.filter(updated_at__gte=since_date)
                
            if options['active_only']:
                queryset = queryset.filter(messages__isnull=False).distinct()
            
            # Order by most recent
            queryset = queryset.order_by('-updated_at')
            
            # Get the data
            sessions_data = []
            total_messages = 0
            
            for session in queryset:
                message_count = session.messages.count()
                total_messages += message_count
                
                session_data = {
                    'id': session.id,
                    'user_id': session.user.id,
                    'username': session.user.username,
                    'user_email': session.user.email,
                    'title': session.title,
                    'proficiency_level': session.proficiency_level,
                    'learning_focus': session.learning_focus,
                    'created_at': session.created_at,
                    'updated_at': session.updated_at,
                    'message_count': message_count,
                }
                
                if options['include_messages'] and message_count > 0:
                    latest_message = session.messages.order_by('-created_at').first()
                    session_data['latest_message'] = {
                        'role': latest_message.role,
                        'content': latest_message.content[:100] + ('...' if len(latest_message.content) > 100 else ''),
                        'created_at': latest_message.created_at,
                    }
                
                sessions_data.append(session_data)
            
            # Display results based on format
            if options['format'] == 'json':
                self.output_json(sessions_data, total_messages)
            elif options['format'] == 'csv':
                self.output_csv(sessions_data, total_messages)
            else:
                self.output_table(sessions_data, total_messages, options['include_messages'])
                
        except Exception as e:
            raise CommandError(f'Error listing sessions: {str(e)}')

    def output_table(self, sessions_data, total_messages, include_messages):
        """Output data in table format"""
        self.stdout.write(self.style.SUCCESS('\n=== CHAT SESSIONS SUMMARY ==='))
        self.stdout.write(f"Total Sessions: {len(sessions_data)}")
        self.stdout.write(f"Total Messages: {total_messages}")
        self.stdout.write(f"Average Messages per Session: {total_messages / len(sessions_data) if sessions_data else 0:.1f}\n")
        
        if not sessions_data:
            self.stdout.write(self.style.WARNING('No sessions found matching the criteria.'))
            return
            
        # Header
        header = f"{'ID':<5} {'User':<15} {'Title':<30} {'Level':<12} {'Focus':<15} {'Msgs':<5} {'Updated':<20}"
        self.stdout.write(self.style.SUCCESS(header))
        self.stdout.write('-' * len(header))
        
        # Data rows
        for session in sessions_data:
            row = (
                f"{session['id']:<5} "
                f"{session['username'][:14]:<15} "
                f"{session['title'][:29]:<30} "
                f"{session['proficiency_level']:<12} "
                f"{session['learning_focus']:<15} "
                f"{session['message_count']:<5} "
                f"{session['updated_at'].strftime('%Y-%m-%d %H:%M'):<20}"
            )
            self.stdout.write(row)
            
            if include_messages and 'latest_message' in session:
                latest = session['latest_message']
                self.stdout.write(f"      └─ Latest ({latest['role']}): {latest['content']}")
                self.stdout.write("")

    def output_json(self, sessions_data, total_messages):
        """Output data in JSON format"""
        output = {
            'summary': {
                'total_sessions': len(sessions_data),
                'total_messages': total_messages,
                'average_messages_per_session': total_messages / len(sessions_data) if sessions_data else 0
            },
            'sessions': []
        }
        
        for session in sessions_data:
            session_output = {
                'id': session['id'],
                'user': {
                    'id': session['user_id'],
                    'username': session['username'],
                    'email': session['user_email']
                },
                'title': session['title'],
                'proficiency_level': session['proficiency_level'],
                'learning_focus': session['learning_focus'],
                'message_count': session['message_count'],
                'created_at': session['created_at'].isoformat(),
                'updated_at': session['updated_at'].isoformat(),
            }
            
            if 'latest_message' in session:
                session_output['latest_message'] = {
                    'role': session['latest_message']['role'],
                    'content': session['latest_message']['content'],
                    'created_at': session['latest_message']['created_at'].isoformat()
                }
            
            output['sessions'].append(session_output)
        
        self.stdout.write(json.dumps(output, indent=2))

    def output_csv(self, sessions_data, total_messages):
        """Output data in CSV format"""
        import csv
        import sys
        
        writer = csv.writer(sys.stdout)
        
        # Header
        header = ['ID', 'User ID', 'Username', 'Email', 'Title', 'Proficiency Level', 
                 'Learning Focus', 'Message Count', 'Created At', 'Updated At']
        
        if any('latest_message' in session for session in sessions_data):
            header.extend(['Latest Message Role', 'Latest Message Content', 'Latest Message Time'])
            
        writer.writerow(header)
        
        # Data
        for session in sessions_data:
            row = [
                session['id'],
                session['user_id'],
                session['username'],
                session['user_email'],
                session['title'],
                session['proficiency_level'],
                session['learning_focus'],
                session['message_count'],
                session['created_at'].isoformat(),
                session['updated_at'].isoformat(),
            ]
            
            if 'latest_message' in session:
                latest = session['latest_message']
                row.extend([
                    latest['role'],
                    latest['content'],
                    latest['created_at'].isoformat()
                ])
            elif any('latest_message' in s for s in sessions_data):
                row.extend(['', '', ''])
                
            writer.writerow(row)