import random
from datetime import datetime, timedelta
from django.core.files import File
from django.core.management.base import BaseCommand
from django.db import transaction
from faker import Faker
from django.utils import timezone
import os
import shutil
from pathlib import Path
from django.conf import settings

from apps.users.models import User
from apps.users.enums import UserRole, LessonStatus
from apps.center.models import (
    Center, Category, Grammar, VideoLesson, TurkmenEnglishWord
)
from apps.center.enums import Level

# Initialize faker - using only English locale
fake = Faker('en_US')


class Command(BaseCommand):
    help = 'Generate fake data for the application'

    def add_arguments(self, parser):
        parser.add_argument(
            '--users',
            type=int,
            default=10,
            help='Number of users to create'
        )
        parser.add_argument(
            '--centers',
            type=int,
            default=3,
            help='Number of centers to create'
        )
        parser.add_argument(
            '--categories',
            type=int,
            default=8,
            help='Number of categories to create'
        )
        parser.add_argument(
            '--grammar',
            type=int,
            default=15,
            help='Number of grammar lessons to create'
        )
        parser.add_argument(
            '--videos',
            type=int,
            default=20,
            help='Number of video lessons to create'
        )
        parser.add_argument(
            '--vocabulary',
            type=int,
            default=100,
            help='Number of vocabulary words to create'
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before creating new data'
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.clear_data()
            self.stdout.write(self.style.SUCCESS('Data cleared successfully'))

        # Create data in correct order to maintain relationships
        self.create_users(options['users'])
        self.create_centers(options['centers'])
        self.create_categories(options['categories'])
        self.create_grammar_lessons(options['grammar'])
        self.create_video_lessons(options['videos'])
        self.create_vocabulary_words(options['vocabulary'])

        self.stdout.write(self.style.SUCCESS('Fake data created successfully'))

    @transaction.atomic
    def clear_data(self):
        """Delete all existing data"""
        TurkmenEnglishWord.objects.all().delete()
        VideoLesson.objects.all().delete()
        Grammar.objects.all().delete()
        Category.objects.all().delete()
        Center.objects.all().delete()
        # Keep superuser but delete other users
        User.objects.exclude(is_superuser=True).delete()

    def create_users(self, count):
        """Create fake users"""
        self.stdout.write(f'Creating {count} users...')
        
        # Create one user of each role
        roles = [UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN]
        
        for role in roles:
            email = f"{role.lower()}@example.com"
            if not User.objects.filter(email=email).exists():
                User.objects.create(
                    username=f"{role.lower()}_user",
                    email=email,
                    first_name=fake.first_name(),
                    last_name=fake.last_name(),
                    phone_number=fake.phone_number(),
                    date_of_birth=fake.date_of_birth(minimum_age=18, maximum_age=70),
                    role=role,
                    is_verified=True,
                    is_active=True
                )
        
        # Create additional random users
        for i in range(count - len(roles)):
            role = random.choice([UserRole.STUDENT, UserRole.TEACHER])
            username = f"{fake.user_name()}_{i}"
            email = f"{username}@example.com"
            
            if not User.objects.filter(email=email).exists():
                User.objects.create(
                    username=username,
                    email=email,
                    first_name=fake.first_name(),
                    last_name=fake.last_name(),
                    phone_number=fake.phone_number(),
                    date_of_birth=fake.date_of_birth(minimum_age=16, maximum_age=70),
                    role=role,
                    is_verified=random.choice([True, False]),
                    is_active=True
                )

        self.stdout.write(f'Created {User.objects.count()} users')

    def create_centers(self, count):
        """Create fake centers"""
        self.stdout.write(f'Creating {count} centers...')
        
        for i in range(count):
            name = f"{fake.company()} Learning Center"
            
            Center.objects.create(
                name=name,
                description=fake.paragraph(nb_sentences=5),
                address=fake.address(),
                phone=fake.phone_number(),
                email=fake.company_email(),
                is_active=True
            )
        
        self.stdout.write(f'Created {Center.objects.count()} centers')

    def create_categories(self, count):
        """Create fake categories"""
        self.stdout.write(f'Creating {count} categories...')
        
        # Create some fixed categories for grammar and vocabulary
        categories = [
            "Grammar Basics", "Verbs", "Nouns", "Adjectives", 
            "Prepositions", "Adverbs", "Phrases", "Idioms",
            "Slang", "Formal Language", "Business English", "Academic Writing"
        ]
        
        # Create fixed categories first
        for category_name in categories[:count]:
            Category.objects.get_or_create(name=category_name)
        
        # Create additional random categories if needed
        for i in range(max(0, count - len(categories))):
            name = f"{fake.word().capitalize()} {fake.word().capitalize()}"
            Category.objects.create(name=name)
        
        self.stdout.write(f'Created {Category.objects.count()} categories')

    def create_grammar_lessons(self, count):
        """Create fake grammar lessons"""
        self.stdout.write(f'Creating {count} grammar lessons...')
        
        # Get existing users with teacher role
        teachers = list(User.objects.filter(role=UserRole.TEACHER))
        if not teachers:
            self.stdout.write("No teachers found. Creating a teacher user...")
            teacher = User.objects.create(
                username="teacher1",
                email="teacher1@example.com",
                first_name="Teacher",
                last_name="One",
                role=UserRole.TEACHER,
                is_verified=True
            )
            teachers = [teacher]
        
        # Get existing categories
        categories = list(Category.objects.all())
        if not categories:
            self.stdout.write("No categories found. Creating a default category...")
            category = Category.objects.create(name="Grammar")
            categories = [category]
        
        # Sample grammar lesson titles
        grammar_titles = [
            "Present Simple Tense", "Past Simple Tense", "Future Simple Tense",
            "Present Continuous Tense", "Past Continuous Tense", "Future Continuous Tense",
            "Present Perfect Tense", "Past Perfect Tense", "Present Perfect Continuous",
            "Modal Verbs", "Conditionals", "Passive Voice",
            "Reported Speech", "Relative Clauses", "Articles",
            "Gerunds and Infinitives", "Phrasal Verbs", "Conjunctions",
            "Question Forms", "Comparatives and Superlatives"
        ]
        
        # Generate random grammar lessons
        for i in range(count):
            title = grammar_titles[i % len(grammar_titles)]
            if i >= len(grammar_titles):
                title += f" (Advanced {i})"
                
            Grammar.objects.create(
                created_by=random.choice(teachers),
                category=random.choice(categories),
                title=title,
                content="\n\n".join([fake.paragraph(nb_sentences=6) for _ in range(4)]),
                examples="\n\n".join([f"Example {j+1}: {fake.sentence()}" for j in range(5)]),
                exercises="\n\n".join([f"Exercise {j+1}: {fake.sentence()}" for j in range(3)]),
                status=random.choice([
                    LessonStatus.DRAFT,
                    LessonStatus.PUBLISHED,
                    LessonStatus.PUBLISHED,  # Higher chance for published
                    LessonStatus.PUBLISHED,
                ]),
                order=i,
                estimated_duration=random.randint(10, 60)
            )
        
        self.stdout.write(f'Created {Grammar.objects.count()} grammar lessons')

    def create_video_lessons(self, count):
        """Create fake video lessons"""
        self.stdout.write(f'Creating {count} video lessons...')
        
        # Get existing users with teacher role
        teachers = list(User.objects.filter(role=UserRole.TEACHER))
        if not teachers:
            self.stdout.write("No teachers found. Using admin user...")
            teachers = list(User.objects.filter(is_staff=True))[:1]
        
        levels = list(Level)
        
        # Sample video lesson titles
        video_titles = [
            "Introduction to English", "Basic Conversation Skills", 
            "Intermediate Grammar Rules", "Advanced Vocabulary",
            "English for Business", "Academic English", 
            "Everyday Expressions", "Pronunciation Guide",
            "Speaking Fluently", "Writing Essays", 
            "Reading Comprehension", "Listening Skills",
            "Job Interview English", "Travel English", 
            "Medical English", "Legal English"
        ]
        
        # Generate random video lessons
        for i in range(count):
            title = video_titles[i % len(video_titles)]
            if i >= len(video_titles):
                title += f" Part {i - len(video_titles) + 2}"
                
            # Create a placeholder for video URL and thumbnail
            level_choice = random.choice(levels)
            
            VideoLesson.objects.create(
                created_by=random.choice(teachers),
                title=title,
                description=fake.paragraph(nb_sentences=3),
                video_url="videos/lessons/placeholder.mp4",  # This would be a real file in production
                level=level_choice,
                duration=random.randint(300, 3600),  # 5 min to 1 hour
                status=random.choice([
                    LessonStatus.DRAFT,
                    LessonStatus.PUBLISHED,
                    LessonStatus.PUBLISHED,  # Higher chance for published
                ]),
                order=i,
                views_count=random.randint(0, 1000)
            )
        
        self.stdout.write(f'Created {VideoLesson.objects.count()} video lessons')

    def create_vocabulary_words(self, count):
        """Create fake vocabulary words"""
        self.stdout.write(f'Creating {count} vocabulary words...')
        
        # Get existing users
        users = list(User.objects.all())
        
        # Predefined categories for vocabulary
        vocab_categories = ["Nouns", "Verbs", "Adjectives", "Adverbs", "Phrases", "Idioms"]
        
        # Sample Turkmen-English word pairs (to make the data more realistic)
        word_pairs = [
            ("salam", "hello"),
            ("sagbol", "goodbye"),
            ("hawa", "yes"),
            ("ýok", "no"),
            ("suw", "water"),
            ("çörek", "bread"),
            ("kitap", "book"),
            ("okamak", "to read"),
            ("ýazmak", "to write"),
            ("öwrenmek", "to learn"),
            ("jaý", "house"),
            ("maşyn", "car"),
            ("gözel", "beautiful"),
            ("uly", "big"),
            ("kiçi", "small"),
        ]
        
        # Generate remaining random word pairs to meet count
        additional_needed = max(0, count - len(word_pairs))
        
        for _ in range(additional_needed):
            turkmen_word = fake.word()
            english_word = fake.word()
            word_pairs.append((turkmen_word, english_word))
        
        levels = list(Level)
        
        # Create vocabulary words
        for i, (turkmen, english) in enumerate(word_pairs[:count]):
            example = fake.sentence()
            if "{{turkmen}}" in example:
                example = example.replace("{{turkmen}}", turkmen)
            if "{{english}}" in example:
                example = example.replace("{{english}}", english)
                
            TurkmenEnglishWord.objects.create(
                created_by=random.choice(users) if users else None,
                turkmen_word=turkmen,
                english_word=english,
                definition=fake.sentence(),
                example_sentence=example,
                pronunciation=f"/{english.lower()}/",  # Simplified pronunciation
                level=random.choice(levels),
                category=random.choice(vocab_categories),
                status=LessonStatus.PUBLISHED,
            )
        
        self.stdout.write(f'Created {TurkmenEnglishWord.objects.count()} vocabulary words')