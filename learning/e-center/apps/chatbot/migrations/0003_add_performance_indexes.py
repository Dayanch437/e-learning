"""
Database optimization migration for better performance.
This migration adds indexes to improve query performance.
"""

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('chatbot', '0002_chatsession_proficiency_level_learning_focus'),  # Updated to correct migration
    ]

    operations = [
        # Add database indexes for better query performance
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_chatsession_user_created ON chatbot_chatsession(user_id, created_at DESC);",
            reverse_sql="DROP INDEX IF EXISTS idx_chatsession_user_created;"
        ),
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_chatmessage_session_created ON chatbot_chatmessage(session_id, created_at DESC);",
            reverse_sql="DROP INDEX IF EXISTS idx_chatmessage_session_created;"
        ),
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_chatmessage_role ON chatbot_chatmessage(role);",
            reverse_sql="DROP INDEX IF EXISTS idx_chatmessage_role;"
        ),
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_chatsession_updated ON chatbot_chatsession(updated_at DESC);",
            reverse_sql="DROP INDEX IF EXISTS idx_chatsession_updated;"
        ),
    ]