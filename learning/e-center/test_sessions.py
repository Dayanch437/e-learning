#!/usr/bin/env python3
"""
Simple script to test the chat session listing functionality directly with Django ORM.
Run this from the e-center directory.
"""

import os
import sys
import django

# Setup Django
sys.path.append('/home/hack-me-if-you-can/project_DIPLOM/e-center')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.local')

django.setup()

# Now we can import Django models
from apps.chatbot.models import ChatSession, ChatMessage
from apps.users.models import User
from django.db.models import Count, Avg
from django.utils import timezone
from datetime import timedelta


def list_all_user_sessions():
    """List all chat sessions for authenticated users with statistics."""
    
    print("🔍 CHAT SESSIONS FOR AUTHENTICATED USERS")
    print("=" * 60)
    
    # Get all users with chat sessions
    users_with_sessions = User.objects.filter(chat_sessions__isnull=False).distinct()
    
    print(f"👥 Users with chat sessions: {users_with_sessions.count()}")
    print()
    
    total_sessions = 0
    total_messages = 0
    
    for user in users_with_sessions:
        # Get user's sessions with message counts
        user_sessions = ChatSession.objects.filter(user=user).prefetch_related('messages')
        session_count = user_sessions.count()
        user_message_count = sum(session.messages.count() for session in user_sessions)
        
        total_sessions += session_count
        total_messages += user_message_count
        
        print(f"👤 User: {user.username} (ID: {user.id})")
        print(f"   📧 Email: {user.email}")
        print(f"   💬 Sessions: {session_count}")
        print(f"   📝 Total Messages: {user_message_count}")
        print(f"   📊 Avg Messages/Session: {user_message_count / session_count if session_count > 0 else 0:.1f}")
        
        # Show recent sessions
        recent_sessions = user_sessions.order_by('-updated_at')[:5]
        print(f"   🕒 Recent Sessions:")
        
        for session in recent_sessions:
            message_count = session.messages.count()
            latest_activity = session.updated_at.strftime('%Y-%m-%d %H:%M:%S')
            
            # Get latest message preview
            latest_message = session.messages.order_by('-created_at').first()
            message_preview = ""
            if latest_message:
                preview_content = latest_message.content[:50] + ("..." if len(latest_message.content) > 50 else "")
                message_preview = f" | Last: [{latest_message.role}] {preview_content}"
            
            print(f"      • ID {session.id}: '{session.title}' ({message_count} msgs) - {latest_activity}{message_preview}")
        
        print("-" * 60)
    
    # Overall statistics
    print("\n📈 OVERALL STATISTICS")
    print("=" * 60)
    print(f"👥 Total Users with Sessions: {users_with_sessions.count()}")
    print(f"💬 Total Chat Sessions: {total_sessions}")
    print(f"📝 Total Messages: {total_messages}")
    print(f"📊 Average Sessions per User: {total_sessions / users_with_sessions.count() if users_with_sessions.count() > 0 else 0:.1f}")
    print(f"📊 Average Messages per Session: {total_messages / total_sessions if total_sessions > 0 else 0:.1f}")
    
    # Sessions by proficiency level
    print("\n🎓 SESSIONS BY PROFICIENCY LEVEL")
    proficiency_stats = {}
    for level, label in ChatSession.PROFICIENCY_CHOICES:
        count = ChatSession.objects.filter(proficiency_level=level).count()
        proficiency_stats[label] = count
        print(f"   {label}: {count} sessions")
    
    # Sessions by learning focus
    print("\n🎯 SESSIONS BY LEARNING FOCUS")
    focus_stats = {}
    for focus, label in ChatSession.FOCUS_CHOICES:
        count = ChatSession.objects.filter(learning_focus=focus).count()
        focus_stats[label] = count
        print(f"   {label}: {count} sessions")
    
    # Recent activity (last 7 days)
    recent_date = timezone.now() - timedelta(days=7)
    recent_sessions = ChatSession.objects.filter(updated_at__gte=recent_date).count()
    recent_messages = ChatMessage.objects.filter(created_at__gte=recent_date).count()
    
    print("\n📅 RECENT ACTIVITY (Last 7 days)")
    print(f"   New Sessions: {recent_sessions}")
    print(f"   New Messages: {recent_messages}")
    
    return {
        'total_users': users_with_sessions.count(),
        'total_sessions': total_sessions,
        'total_messages': total_messages,
        'proficiency_stats': proficiency_stats,
        'focus_stats': focus_stats,
        'recent_activity': {
            'sessions': recent_sessions,
            'messages': recent_messages
        }
    }


if __name__ == "__main__":
    try:
        stats = list_all_user_sessions()
        print(f"\n✅ Session listing completed successfully!")
        print(f"📊 Found {stats['total_sessions']} sessions across {stats['total_users']} users")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()