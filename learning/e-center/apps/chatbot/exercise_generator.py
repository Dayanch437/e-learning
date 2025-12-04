import re
import random
from .templates import EXERCISE_TEMPLATES, LESSON_PLANS, TEACHING_METHODOLOGIES

def detect_exercise_request(message):
    """
    Detect if a user message is requesting an exercise or a lesson plan.
    
    Returns:
        tuple: (is_exercise_request, exercise_type, level)
        or (is_lesson_request, lesson_type, topic)
    """
    message = message.lower()
    
    # Check for exercise requests
    exercise_patterns = [
        r"(exercise|practice|quiz|task|drill|test|homework|assignment)(?:\s+for)?(?:\s+(\w+))?(?:\s+(beginner|intermediate|advanced))?",
        r"(beginner|intermediate|advanced)(?:\s+(\w+))?(?:\s+exercise|practice|quiz|task|drill|test)",
        r"give me (?:a|an|some)(?:\s+(\w+))?(?:\s+exercise|practice|quiz|task|drill|test)",
        r"create (?:a|an|some)(?:\s+(\w+))?(?:\s+exercise|practice|quiz|task|drill|test)"
    ]
    
    for pattern in exercise_patterns:
        match = re.search(pattern, message)
        if match:
            groups = match.groups()
            # Pattern dependent logic to extract exercise type and level
            if len(groups) >= 3 and groups[1] and groups[2]:
                return True, groups[1], groups[2]  # type and level
            elif len(groups) >= 2:
                if groups[0] in ['beginner', 'intermediate', 'advanced']:
                    return True, groups[1] if groups[1] else 'general', groups[0]  # type and level
                else:
                    return True, groups[1] if groups[1] else 'general', 'intermediate'  # default to intermediate
            else:
                return True, 'general', 'intermediate'  # default values
    
    # Check for lesson plan requests
    lesson_patterns = [
        r"lesson plan (?:on|for|about) (\w+)",
        r"plan (?:a|the) lesson (?:on|for|about) (\w+)",
        r"how to teach (\w+)",
        r"teaching (\w+)"
    ]
    
    for pattern in lesson_patterns:
        match = re.search(pattern, message)
        if match:
            topic = match.group(1)
            if topic in ['grammar', 'vocabulary', 'reading', 'writing', 'listening', 'speaking', 'pronunciation']:
                return False, True, topic
            else:
                # This is a specific topic within a skill area, need to determine which area
                if any(word in message for word in ['verb', 'tense', 'preposition', 'article', 'noun', 'adjective']):
                    return False, True, 'grammar', topic
                elif any(word in message for word in ['word', 'definition', 'meaning', 'synonym']):
                    return False, True, 'vocabulary', topic
                else:
                    return False, True, 'general', topic
    
    # No exercise or lesson plan request detected
    return False, False, None


def generate_exercise(exercise_type, level):
    """
    Generate an appropriate exercise based on the type and level.
    
    Args:
        exercise_type (str): Type of exercise (grammar, vocabulary, conversation, etc.)
        level (str): Proficiency level (beginner, intermediate, advanced)
        
    Returns:
        str: Generated exercise prompt
    """
    if exercise_type not in EXERCISE_TEMPLATES or level not in EXERCISE_TEMPLATES[exercise_type]:
        # Fallback to general exercises if specific type not found
        exercise_type = 'grammar' if exercise_type not in EXERCISE_TEMPLATES else exercise_type
        level = 'intermediate' if level not in EXERCISE_TEMPLATES[exercise_type] else level
    
    # Choose a random exercise template for the specified type and level
    templates = EXERCISE_TEMPLATES[exercise_type][level]
    template = random.choice(templates)
    
    # For now, we'll leave placeholders for the model to fill in
    # In a more advanced implementation, we could have a database of 
    # example sentences, words, etc. to fill in the templates
    
    exercise_prompt = f"""
    Please generate an English {level} level {exercise_type} exercise.
    Use this template as inspiration: "{template}"
    
    Fill in all the necessary details to make this a complete and useful exercise.
    Include:
    1. Clear instructions
    2. The exercise content
    3. Example answers or a solution key
    4. Learning tips related to this exercise
    
    Make sure the exercise is appropriate for {level} level English learners.
    """
    
    return exercise_prompt


def generate_lesson_plan(lesson_type, topic=None):
    """
    Generate a lesson plan based on the type and optional topic.
    
    Args:
        lesson_type (str): Type of lesson (grammar, vocabulary, etc.)
        topic (str, optional): Specific topic within the lesson type
        
    Returns:
        str: Generated lesson plan prompt
    """
    lesson_prompt = f"""
    Please generate a detailed English lesson plan on {topic or lesson_type}.
    
    The lesson plan should include:
    
    1. Lesson objectives
    2. Target language points
    3. Warm-up activity (5-10 minutes)
    4. Presentation of new language/concepts (10-15 minutes)
    5. Controlled practice activities (10-15 minutes)
    6. Free practice activities (10-15 minutes)
    7. Assessment or feedback activity
    8. Homework or extension activities
    9. Materials needed
    
    Please ensure the lesson plan is well-structured, engaging, and follows best practices for 
    language teaching. Include clear instructions for the teacher and estimated timing for each section.
    """
    
    # If we have a specific topic and it's in our predefined lesson plans, use that structure
    if topic and lesson_type in LESSON_PLANS and topic in LESSON_PLANS[lesson_type]:
        lesson_data = LESSON_PLANS[lesson_type][topic]
        
        lesson_prompt += f"""
        
        Use this structure for the {lesson_data['title']} lesson:
        
        {" ".join(lesson_data['structure'])}
        
        Expand on each section with detailed content and activities.
        """
    
    return lesson_prompt


def get_teaching_methodology_recommendation():
    """Returns a random teaching methodology recommendation with description."""
    methodology = random.choice(TEACHING_METHODOLOGIES)
    return f"{methodology['name']}: {methodology['description']} Best for: {methodology['best_for']}"