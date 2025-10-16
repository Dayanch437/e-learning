import google.generativeai as genai
import re
import random
import time
import logging
from django.conf import settings
from django.core.cache import cache
from .models import ChatMessage
from .templates import EXERCISE_TEMPLATES, LESSON_PLANS, TEACHING_METHODOLOGIES
from .exercise_generator import detect_exercise_request, generate_exercise, generate_lesson_plan, get_teaching_methodology_recommendation

logger = logging.getLogger('chatbot')

# Cache the Gemini client initialization
_genai_initialized = False

def initialize_genai():
    """Initialize the Gemini AI client with API key from settings."""
    global _genai_initialized
    
    if _genai_initialized:
        return True
        
    try:
        # Use the API key from Django settings
        genai.configure(api_key=settings.GEMINI_API_KEY)
        _genai_initialized = True
        logger.info("Gemini AI client initialized successfully")
        return True
    except Exception as e:
        logger.error(f"Error initializing Gemini AI: {e}")
        return False

def test_gemini_connection():
    """Test the connection to Gemini API with caching."""
    cache_key = 'gemini_connection_status'
    cached_result = cache.get(cache_key)
    
    if cached_result:
        return cached_result
    
    try:
        initialize_genai()
        model = genai.GenerativeModel('models/gemini-pro-latest')
        response = model.generate_content("Hello, please respond with 'API is working' if you can receive this message.")
        result = response.text
        
        # Cache successful connection for 5 minutes
        cache.set(cache_key, result, 300)
        return result
    except Exception as e:
        import traceback
        error_msg = f"Connection failed: {str(e)}"
        logger.error(f"Test connection failed: {e}")
        logger.error(traceback.format_exc())
        
        # Cache error for 1 minute to prevent spam
        cache.set(cache_key, error_msg, 60)
        return error_msg


def get_chat_history(session):
    """Convert chat messages to format expected by Gemini with caching."""
    cache_key = f'chat_history_{session.id}_{session.updated_at.timestamp()}'
    cached_history = cache.get(cache_key)
    
    if cached_history:
        return cached_history
    
    messages = []
    
    # Use select_related to avoid N+1 queries
    for msg in session.messages.all():
        # Convert 'assistant' role to 'model' as required by Gemini
        role = "model" if msg.role == "assistant" else "user"
        messages.append({
            "role": role,
            "parts": [msg.content]
        })
    
    # Cache history for 5 minutes
    cache.set(cache_key, messages, 300)
    return messages


# System prompt for English teaching (cached)
def get_english_teacher_prompt():
    """Get the English teacher prompt with caching."""
    cache_key = 'english_teacher_prompt'
    cached_prompt = cache.get(cache_key)
    
    if cached_prompt:
        return cached_prompt
    
    prompt = """
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
    
    # Cache prompt for 1 hour
    cache.set(cache_key, prompt, 3600)
    return prompt


def get_cached_model():
    """Get or create a cached Gemini model instance."""
    cache_key = 'gemini_model_instance'
    
    # Don't cache the actual model object as it's not serializable
    # Instead, create it fresh each time but with optimized settings
    
    generation_config = {
        "temperature": 0.7,
        "top_p": 0.95,
        "top_k": 40,
        "max_output_tokens": 1024,  # Reduced for faster responses
    }
    
    safety_settings = [
        {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
        {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
        {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
        {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    ]
    
    try:
        model = genai.GenerativeModel(
            model_name='models/gemini-2.5-flash',  # Use faster flash model
            generation_config=generation_config,
            safety_settings=safety_settings,
        )
        return model
    except Exception as model_error:
        logger.error(f"Error creating Gemini model: {model_error}")
        # Try fallback model if main model fails
        try:
            model = genai.GenerativeModel(
                model_name='models/gemini-pro',
                generation_config=generation_config,
                safety_settings=safety_settings,
            )
            return model
        except Exception as fallback_error:
            logger.error(f"Fallback model also failed: {fallback_error}")
            raise Exception("Unable to initialize any Gemini model")


def generate_response(user_message, session=None):
    """Generate a response from Gemini AI with English teaching focus and performance optimizations."""
    start_time = time.time()
    logger.info(f"Starting response generation for message: {user_message[:50]}...")
    
    # Check for cached response (for identical messages in the same session)
    if session:
        cache_key = f'response_{session.id}_{hash(user_message)}'
        cached_response = cache.get(cache_key)
        if cached_response:
            logger.info("Returning cached response")
            return cached_response
    
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
            logger.info(f"Generated exercise request for {exercise_type} at {level} level")
        elif len(exercise_results) > 1 and exercise_results[1]:  # Lesson plan request
            is_lesson = True
            if len(exercise_results) > 3:
                lesson_type = exercise_results[2]
                topic = exercise_results[3]
                enhanced_message = generate_lesson_plan(lesson_type, topic)
            else:
                lesson_type = exercise_results[2]
                enhanced_message = generate_lesson_plan(lesson_type)
            logger.info(f"Generated lesson plan for {lesson_type}")
        else:
            # Regular message - use as is
            enhanced_message = user_message
        
        # Get optimized model instance
        model = get_cached_model()
        
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
            if not (is_exercise or is_lesson):
                # For regular messages, add context about the user's profile
                enhanced_message = f"[Context: User is at {proficiency} level focusing on {focus}] {enhanced_message}"
        
        # Get the system prompt
        system_prompt = get_english_teacher_prompt()
        
        # If starting a new chat session
        if session and not session.messages.exists():
            # Use system prompt but don't save it to history
            messages = [{
                "role": "user",
                "parts": [f"You are an English teaching assistant. Please follow these instructions: {system_prompt}"]
            }]
            
            chat = model.start_chat(history=messages)
            response = chat.send_message(enhanced_message)
        
        # If we have an existing session with history
        elif session and session.messages.exists():
            # Get existing chat history (cached)
            chat_history = get_chat_history(session)
            
            # Limit history to last 10 messages for performance
            if len(chat_history) > 10:
                chat_history = chat_history[-10:]
            
            # Insert system prompt at the beginning of history
            chat_history.insert(0, {
                "role": "user",
                "parts": [f"You are an English teaching assistant. Please follow these instructions: {system_prompt}"]
            })
            
            # Start chat with history including system prompt
            chat = model.start_chat(history=chat_history)
            response = chat.send_message(enhanced_message)
        else:
            # One-off response with system prompt
            messages = [{
                "role": "user",
                "parts": [f"You are an English teaching assistant. Please follow these instructions: {system_prompt}"]
            }, {
                "role": "model",
                "parts": ["I understand. I'll act as Teacher Emma, an English language tutor focused on helping Turkmen speakers learn English."]
            }, {
                "role": "user",
                "parts": [enhanced_message]
            }]
            
            response = model.generate_content(messages)
        
        response_text = response.text
        
        # Cache the response for 10 minutes if it's from a session
        if session:
            cache.set(cache_key, response_text, 600)
        
        # Log performance metrics
        end_time = time.time()
        response_time = end_time - start_time
        logger.info(f"Response generated in {response_time:.2f} seconds")
        
        return response_text
        
    except Exception as e:
        import traceback
        logger.error(f"Error generating response: {e}")
        logger.error(traceback.format_exc())
        
        # More specific error messages based on the type of exception
        if "api_key" in str(e).lower() or "authentication" in str(e).lower():
            return "I'm sorry, there appears to be an issue with the API authentication. Please contact support."
        elif "quota" in str(e).lower() or "limit" in str(e).lower():
            return "I'm sorry, we've reached our API usage limit. Please try again later."
        elif "model" in str(e).lower() and "not found" in str(e).lower():
            return "I'm sorry, the AI model is currently unavailable. Please try again later."
        elif "timeout" in str(e).lower():
            return "I'm sorry, the request timed out. Please try again with a shorter message."
        else:
            return "I'm sorry, I'm having trouble responding right now. Please try again later."