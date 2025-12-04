from django.db.models import TextChoices


class Level(TextChoices):
    BEGINNER = 'beginner', 'Beginner'
    ELEMENTARY = 'elementary', 'Elementary'
    PRE_INTERMEDIATE = 'pre_intermediate', 'Pre-Intermediate'
    INTERMEDIATE = 'intermediate', 'Intermediate'
    UPPER_INTERMEDIATE = 'upper_intermediate', 'Upper-Intermediate'
    ADVANCED = 'advanced', 'Advanced'


