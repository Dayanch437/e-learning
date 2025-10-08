import google.generativeai as genai
import re
import random
from django.conf import settings
from .models import ChatMessage
from .templates import EXERCISE_TEMPLATES, LESSON_PLANS, TEACHING_METHODOLOGIES
from .exercise_generator import detect_exercise_request, generate_exercise, generate_lesson_plan, get_teaching_methodology_recommendation


def initialize_genai():
    """Initialize the Gemini AI client with API key from settings."""
    try:
        # Use the API key from Django settings
        genai.configure(api_key=settings.GEMINI_API_KEY)
        return True
    except Exception as e:
        print(f"Error initializing Gemini AI: {e}")
        return False

def test_gemini_connection():
    """Test the connection to Gemini API."""
    try:
        initialize_genai()
        model = genai.GenerativeModel('models/gemini-pro-latest')
        response = model.generate_content("Hello, please respond with 'API is working' if you can receive this message.")
        return response.text
    except Exception as e:
        import traceback
        print(f"Test connection failed: {e}")
        print(traceback.format_exc())
        return f"Connection failed: {str(e)}"


def get_chat_history(session):
    """Convert chat messages to format expected by Gemini."""
    messages = []
    
    for msg in session.messages.all():
        # Convert 'assistant' role to 'model' as required by Gemini
        role = "model" if msg.role == "assistant" else "user"
        messages.append({
            "role": role,
            "parts": [msg.content]
        })
    
    return messages


# System prompt for English teaching
ENGLISH_TEACHER_PROMPT = """
You are an expert English language teacher specializing in helping Turkmen speakers learn English. 
Your name is Teacher Emma. Follow these guidelines in all your interactions:

TEACHING APPROACH:
- Be patient, encouraging, and supportive
- Provide clear explanations with examples
- Use a communicative approach focusing on practical language use
- Adapt your teaching to different proficiency levels (beginner, intermediate, advanced)
- Incorporate cultural context when relevant

CONTENT EXPERTISE:
- Grammar (tenses, articles, prepositions, etc.)
- Vocabulary building with contextual examples
- Pronunciation (including phonetics when needed)
- Conversation practice and idioms
- Reading and writing skills
- IELTS, TOEFL, and Cambridge exam preparation

INTERACTION STYLE:
- For beginners: Use simple vocabulary and short sentences, provide more Turkmen translations
- For intermediate learners: Use moderate vocabulary, explain concepts thoroughly
- For advanced learners: Challenge them with complex language and nuanced explanations

LESSON STRUCTURE:
1. Understand what the student wants to learn
2. Provide concise explanations with examples
3. Offer practice opportunities or exercises
4. Give constructive feedback
5. Summarize key learning points

SPECIAL FEATURES:
- Create custom practice exercises on request
- Provide examples relevant to Turkmen culture when appropriate
- Explain the differences between English and Turkmen language structures
- Suggest resources for further study

When asked, you can provide complete lesson plans on specific topics.
"""


def generate_response(user_message, session=None):
    """Generate a response from Gemini AI with English teaching focus."""
    initialize_genai()
    
    try:
        # Check if this is a request for a specific exercise or lesson plan
        is_exercise, is_lesson, exercise_type, level = False, False, None, None
        
        # Process the message to detect if it's a request for an exercise
        exercise_results = detect_exercise_request(user_message)
        
        # Check what type of request it is
        if exercise_results[0]:  # Exercise request
            is_exercise = True
            exercise_type = exercise_results[1]
            level = exercise_results[2]
            # Generate an exercise based on the detected type and level
            enhanced_message = generate_exercise(exercise_type, level)
            print(f"Generated exercise request for {exercise_type} at {level} level")
        elif len(exercise_results) > 1 and exercise_results[1]:  # Lesson plan request
            is_lesson = True
            if len(exercise_results) > 3:
                lesson_type = exercise_results[2]
                topic = exercise_results[3]
                enhanced_message = generate_lesson_plan(lesson_type, topic)
            else:
                lesson_type = exercise_results[2]
                enhanced_message = generate_lesson_plan(lesson_type)
            print(f"Generated lesson plan for {lesson_type}")
        else:
            # Regular message - use as is
            enhanced_message = user_message
        
        generation_config = {
            "temperature": 0.7,
            "top_p": 0.95,
            "top_k": 40,
            "max_output_tokens": 2048,
        }
        
        safety_settings = [
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
        ]
        
        try:
            model = genai.GenerativeModel(
                model_name='models/gemini-pro-latest',
                generation_config=generation_config,
                safety_settings=safety_settings,
            )
        except Exception as model_error:
            print(f"Error creating Gemini model: {model_error}")
            # Try fallback model if main model fails
            model = genai.GenerativeModel(
                model_name='models/gemini-2.5-flash',
                generation_config=generation_config,
                safety_settings=safety_settings,
            )
        
        # If user asks for teaching methodology
        if "teaching method" in user_message.lower() or "methodology" in user_message.lower():
            methodology_info = get_teaching_methodology_recommendation()
            # Add this to the message for the model to elaborate on
            enhanced_message = f"{user_message}\n\nConsider discussing this methodology: {methodology_info}"
        
        # Add proficiency level and learning focus context if available in the session
        if session:
            proficiency = session.proficiency_level
            focus = session.learning_focus
            
            # Add a hint about the user's level and focus to help model adapt its response
            if is_exercise or is_lesson:
                # For exercises and lesson plans, we've already adapted the message
                pass
            else:
                # For regular messages, add context about the user's profile
                enhanced_message = f"[Context: User is at {proficiency} level focusing on {focus}] {enhanced_message}"
        
        # If starting a new chat session
        if session and not session.messages.exists():
            # Add system prompt as first message
            ChatMessage.objects.create(
                session=session,
                role="assistant",
                content="Hello! I'm Teacher Emma, your English language tutor. How can I help you learn English today?"
            )
            
            # Use system prompt but don't save it to history
            messages = [{
                "role": "user",
                "parts": ["You are an English teaching assistant. Please follow these instructions: " + ENGLISH_TEACHER_PROMPT]
            }]
            
            chat = model.start_chat(history=messages)
            response = chat.send_message(enhanced_message)
        
        # If we have an existing session with history
        elif session and session.messages.exists():
            # Get existing chat history
            chat_history = get_chat_history(session)
            
            # Insert system prompt at the beginning of history
            chat_history.insert(0, {
                "role": "user",
                "parts": ["You are an English teaching assistant. Please follow these instructions: " + ENGLISH_TEACHER_PROMPT]
            })
            
            # Start chat with history including system prompt
            chat = model.start_chat(history=chat_history)
            response = chat.send_message(enhanced_message)
        else:
            # One-off response with system prompt
            messages = [{
                "role": "user",
                "parts": ["You are an English teaching assistant. Please follow these instructions: " + ENGLISH_TEACHER_PROMPT]
            }, {
                "role": "model",
                "parts": ["I understand. I'll act as Teacher Emma, an English language tutor focused on helping Turkmen speakers learn English."]
            }, {
                "role": "user",
                "parts": [enhanced_message]
            }]
            
            response = model.generate_content(messages)
            
        return response.text
    except Exception as e:
        import traceback
        print(f"Error generating response: {e}")
        print(traceback.format_exc())
        
        # More specific error messages based on the type of exception
        if "api_key" in str(e).lower() or "authentication" in str(e).lower():
            return "I'm sorry, there appears to be an issue with the API authentication. Please contact support."
        elif "quota" in str(e).lower() or "limit" in str(e).lower():
            return "I'm sorry, we've reached our API usage limit. Please try again later."
        elif "model" in str(e).lower() and "not found" in str(e).lower():
            return "I'm sorry, the AI model is currently unavailable. Please try again later."
        else:
            return "I'm sorry, I'm having trouble responding right now. Please try again later."