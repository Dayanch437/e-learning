"""
Management command to populate the database with fake data.
This command creates fake users, grammar lessons, video lessons, and vocabulary words.
"""

import random
import string
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.users.models import UserRole
from apps.center.models import Grammar, VideoLesson, TurkmenEnglishWord
from apps.center.enums import Level
from apps.users.enums import LessonStatus

User = get_user_model()


class FakeDataGenerator:
    """Helper class to generate fake data."""
    
    # Sample data for generating realistic content
    FIRST_NAMES = [
        'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa',
        'William', 'Mary', 'James', 'Jennifer', 'Richard', 'Linda', 'Charles',
        'Barbara', 'Joseph', 'Elizabeth', 'Thomas', 'Jessica', 'Christopher',
        'Susan', 'Daniel', 'Karen', 'Matthew', 'Nancy', 'Anthony', 'Betty',
        'Mark', 'Helen', 'Donald', 'Sandra', 'Steven', 'Donna', 'Paul', 'Carol'
    ]
    
    LAST_NAMES = [
        'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
        'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
        'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
        'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark',
        'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King'
    ]
    
    GRAMMAR_TOPICS = [
        'Present Simple Tense', 'Past Simple Tense', 'Future Simple Tense',
        'Present Continuous', 'Past Continuous', 'Present Perfect',
        'Past Perfect', 'Modal Verbs', 'Passive Voice', 'Conditionals',
        'Reported Speech', 'Articles (a, an, the)', 'Prepositions',
        'Adjectives and Adverbs', 'Comparative and Superlative',
        'Question Formation', 'Gerunds and Infinitives', 'Phrasal Verbs',
        'Relative Clauses', 'Subject-Verb Agreement'
    ]
    
    VIDEO_LESSON_TITLES = [
        'Introduction to English Grammar', 'Basic Conversation Skills',
        'English Pronunciation Guide', 'Everyday English Vocabulary',
        'Business English Essentials', 'Travel English Phrases',
        'Academic Writing Skills', 'English Listening Practice',
        'Common English Idioms', 'English Grammar Fundamentals',
        'Speaking Confidence Building', 'English Reading Comprehension',
        'Writing Effective Emails', 'English Interview Preparation',
        'Cultural Aspects of English', 'Advanced Grammar Concepts'
    ]
    
    TURKMEN_WORDS = [
        'salam', 'sagbol', 'eden', 'nahar', 'agşam', 'ertir', 'bugün',
        'öý', 'işgär', 'okuw', 'dynç', 'gowy', 'erbet', 'uly', 'kiçi',
        'täze', 'köne', 'owadan', 'açyk', 'ýapyk', 'yssy', 'sowuk',
        'ýaşyl', 'gyzyl', 'ak', 'gara', 'gök', 'sary', 'gyrmyzy',
        'maşyn', 'uçar', 'otly', 'duralgasy', 'ýol', 'köprü', 'şäher'
    ]
    
    ENGLISH_WORDS = [
        'hello', 'goodbye', 'good', 'food', 'evening', 'tomorrow', 'today',
        'house', 'worker', 'study', 'rest', 'good', 'bad', 'big', 'small',
        'new', 'old', 'beautiful', 'open', 'closed', 'hot', 'cold',
        'green', 'red', 'white', 'black', 'blue', 'yellow', 'pink',
        'car', 'airplane', 'train', 'station', 'road', 'bridge', 'city'
    ]
    
    GRAMMAR_CONTENT_TEMPLATES = [
        "Learn how to use {topic} in English. This lesson covers the basic structure and common usage patterns.",
        "Master {topic} with practical examples and exercises. Understand when and how to apply this grammar rule.",
        "Complete guide to {topic}. Includes explanation, examples, and practice exercises for better understanding.",
        "Essential {topic} lesson for English learners. Build your grammar foundation with clear explanations.",
        "Improve your English with this comprehensive {topic} tutorial. Perfect for intermediate students."
    ]
    
    @classmethod
    def random_string(cls, length=8):
        """Generate a random string of specified length."""
        return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))
    
    @classmethod
    def random_email(cls):
        """Generate a random email address."""
        username = cls.random_string(random.randint(5, 10))
        domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'example.com']
        return f"{username}@{random.choice(domains)}"
    
    @classmethod
    def random_name(cls):
        """Generate a random full name."""
        first = random.choice(cls.FIRST_NAMES)
        last = random.choice(cls.LAST_NAMES)
        return first, last
    
    @classmethod
    def random_date(cls, days_back=365):
        """Generate a random date within the last N days."""
        return datetime.now() - timedelta(days=random.randint(0, days_back))


class Command(BaseCommand):
    help = 'Populate the database with fake data for testing purposes'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--users',
            type=int,
            default=20,
            help='Number of users to create (default: 20)'
        )
        parser.add_argument(
            '--grammar',
            type=int,
            default=15,
            help='Number of grammar lessons to create (default: 15)'
        )
        parser.add_argument(
            '--videos',
            type=int,
            default=12,
            help='Number of video lessons to create (default: 12)'
        )
        parser.add_argument(
            '--vocabulary',
            type=int,
            default=30,
            help='Number of vocabulary words to create (default: 30)'
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before creating new fake data'
        )
    
    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing data...')
            self.clear_data()
        
        self.stdout.write('Creating fake users...')
        self.create_fake_users(options['users'])
        
        self.stdout.write('Creating fake grammar lessons...')
        self.create_fake_grammar(options['grammar'])
        
        self.stdout.write('Creating fake video lessons...')
        self.create_fake_videos(options['videos'])
        
        self.stdout.write('Creating fake vocabulary words...')
        self.create_fake_vocabulary(options['vocabulary'])
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created fake data:\n'
                f'- {options["users"]} users\n'
                f'- {options["grammar"]} grammar lessons\n'
                f'- {options["videos"]} video lessons\n'
                f'- {options["vocabulary"]} vocabulary words'
            )
        )
    
    def clear_data(self):
        """Clear existing data from all models."""
        TurkmenEnglishWord.objects.all().delete()
        VideoLesson.objects.all().delete()
        Grammar.objects.all().delete()
        # Keep superuser, delete only non-superuser accounts
        User.objects.filter(is_superuser=False).delete()
        self.stdout.write(self.style.WARNING('Existing data cleared.'))
    
    def create_fake_users(self, count):
        """Create fake users with different roles."""
        fake_gen = FakeDataGenerator()
        created_users = []
        
        for i in range(count):
            first_name, last_name = fake_gen.random_name()
            username = f"{first_name.lower()}{last_name.lower()}{random.randint(1, 999)}"
            email = fake_gen.random_email()
            
            # Ensure unique username and email
            while User.objects.filter(username=username).exists():
                username = f"{first_name.lower()}{last_name.lower()}{random.randint(1, 9999)}"
            
            while User.objects.filter(email=email).exists():
                email = fake_gen.random_email()
            
            # Assign roles: 60% students, 30% teachers, 10% admins
            role_choice = random.random()
            if role_choice < 0.6:
                role = UserRole.STUDENT
            elif role_choice < 0.9:
                role = UserRole.TEACHER
            else:
                role = UserRole.ADMIN
            
            user = User.objects.create_user(
                username=username,
                email=email,
                password='testpass123',  # Simple password for testing
                first_name=first_name,
                last_name=last_name,
                role=role,
                is_active=True
            )
            created_users.append(user)
        
        self.stdout.write(f'Created {len(created_users)} users.')
        return created_users
    
    def create_fake_grammar(self, count):
        """Create fake grammar lessons."""
        fake_gen = FakeDataGenerator()
        teachers = list(User.objects.filter(role=UserRole.TEACHER))
        
        if not teachers:
            self.stdout.write(self.style.WARNING('No teachers found. Creating grammar lessons without authors.'))
        
        created_lessons = []
        
        for i in range(count):
            topic = random.choice(fake_gen.GRAMMAR_TOPICS)
            content = random.choice(fake_gen.GRAMMAR_CONTENT_TEMPLATES).format(topic=topic)
            
            grammar = Grammar.objects.create(
                title=f"{topic} - Lesson {i+1}",
                content=content,
                level=random.choice(list(Level)),
                status=random.choice(list(LessonStatus)),
                created_by=random.choice(teachers) if teachers else None,
                examples=f"Example: {topic} is used in various contexts.",
                exercises=f"Exercise: Practice {topic} with the following sentences."
            )
            created_lessons.append(grammar)
        
        self.stdout.write(f'Created {len(created_lessons)} grammar lessons.')
        return created_lessons
    
    def create_fake_videos(self, count):
        """Create fake video lessons."""
        fake_gen = FakeDataGenerator()
        teachers = list(User.objects.filter(role=UserRole.TEACHER))
        
        if not teachers:
            self.stdout.write(self.style.WARNING('No teachers found. Creating video lessons without authors.'))
        
        created_videos = []
        
        for i in range(count):
            title = random.choice(fake_gen.VIDEO_LESSON_TITLES)
            
            # Generate a fake video filename
            video_filename = f"lesson_{fake_gen.random_string(8)}.mp4"
            
            description = f"Learn English with this comprehensive {title.lower()} video lesson. Perfect for improving your language skills."
            
            video = VideoLesson.objects.create(
                title=f"{title} - Part {i+1}",
                description=description,
                video_file=f"videos/lessons/{video_filename}",
                duration=random.randint(300, 3600),  # 5 minutes to 1 hour
                level=random.choice(list(Level)),
                status=random.choice(list(LessonStatus)),
                created_by=random.choice(teachers) if teachers else None
            )
            created_videos.append(video)
        
        self.stdout.write(f'Created {len(created_videos)} video lessons.')
        return created_videos
    
    def create_fake_vocabulary(self, count):
        """Create fake vocabulary words."""
        fake_gen = FakeDataGenerator()
        teachers = list(User.objects.filter(role=UserRole.TEACHER))
        
        if not teachers:
            self.stdout.write(self.style.WARNING('No teachers found. Creating vocabulary without authors.'))
        
        created_words = []
        
        # Ensure we don't exceed available word pairs
        max_words = min(count, len(fake_gen.TURKMEN_WORDS))
        
        for i in range(max_words):
            turkmen_word = fake_gen.TURKMEN_WORDS[i]
            english_word = fake_gen.ENGLISH_WORDS[i]
            
            # Generate example sentences and definition
            example_sentence = f"Men {turkmen_word} görýärin. - I see {english_word}."
            definition = f"The word '{english_word}' means '{turkmen_word}' in Turkmen."
            
            word = TurkmenEnglishWord.objects.create(
                turkmen_word=turkmen_word,
                english_word=english_word,
                definition=definition,
                example_sentence=example_sentence,
                level=random.choice(list(Level)),
                created_by=random.choice(teachers) if teachers else None,
                category=random.choice(['Common', 'Basic', 'Essential', 'Daily Use'])
            )
            created_words.append(word)
        
        self.stdout.write(f'Created {len(created_words)} vocabulary words.')
        return created_words