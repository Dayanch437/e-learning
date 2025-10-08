# Gemini AI English Teaching Chatbot

This module provides an English language teaching assistant powered by Google's Gemini AI, specifically designed for Turkmen speakers learning English.

## Features

- Chat with "Teacher Emma," an expert English language tutor
- Get personalized English lessons based on your proficiency level
- Generate custom exercises for grammar, vocabulary, pronunciation, and more
- Access complete lesson plans for English teaching
- Learn with a communicative approach focusing on practical language use
- Maintain conversation history with persistent sessions
- Track your progress across different English skills

## API Endpoints

### Chat Sessions

- `GET /api/v1/chat/sessions/` - List all chat sessions for the current user
- `POST /api/v1/chat/sessions/` - Create a new chat session
- `GET /api/v1/chat/sessions/{id}/` - Retrieve details of a specific chat session
- `PATCH /api/v1/chat/sessions/{id}/` - Update a chat session (e.g., rename)
- `DELETE /api/v1/chat/sessions/{id}/` - Delete a chat session

### Chat Messages

- `GET /api/v1/chat/sessions/{id}/messages/` - Get all messages for a specific chat session
- `POST /api/v1/chat/sessions/chat/` - Send a message to Gemini AI and get a response

## Setup

1. Obtain a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add the API key to your environment:
   ```
   export GEMINI_API_KEY=your_api_key_here
   ```
   Or add it to your `.env` file:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
3. Install the required dependency:
   ```
   pip install google-generativeai
   ```

## English Teaching Features

### Proficiency Levels
The chatbot adapts its teaching style and content based on the user's proficiency level:

- **Beginner**: Simple vocabulary, short sentences, more translations
- **Intermediate**: Moderate complexity, thorough explanations
- **Advanced**: Advanced vocabulary, complex language, nuanced explanations

### Learning Focus Areas
Users can specify their learning focus to get specialized help:

- **General English**: Overall language improvement
- **Grammar**: Rules, structures, and patterns
- **Vocabulary**: Word meaning, usage, and collocations
- **Conversation**: Speaking practice and dialogues
- **Reading**: Comprehension and analysis
- **Writing**: Composition and style
- **Pronunciation**: Sound production and intonation
- **Exam Preparation**: IELTS, TOEFL, Cambridge exam strategies

### Special Commands

The chatbot responds to special requests:

- **Exercise Generation**: "Give me a beginner grammar exercise"
- **Lesson Plans**: "Create a lesson plan for teaching past tense"
- **Teaching Methodology**: "Suggest a teaching method for conversation practice"

## Usage Examples

### Frontend React Example with English Teaching Features

```tsx
import React, { useState, useEffect } from 'react';
import chatAPI from '../services/chatAPI';
import { Select, Radio } from 'antd';

const ChatInterface = () => {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [proficiency, setProficiency] = useState('intermediate');
  const [focus, setFocus] = useState('general');

  // Load sessions
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const response = await chatAPI.getSessions();
        setSessions(response.data);
        
        // Set first session as active if available
        if (response.data.length > 0) {
          setActiveSession(response.data[0]);
          setProficiency(response.data[0].proficiency_level);
          setFocus(response.data[0].learning_focus);
          loadMessages(response.data[0].id);
        }
      } catch (error) {
        console.error('Failed to load chat sessions', error);
      }
    };
    
    loadSessions();
  }, []);

  // Load messages for a session
  const loadMessages = async (sessionId) => {
    try {
      const response = await chatAPI.getMessages(sessionId);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to load messages', error);
    }
  };

  // Send a message
  const sendMessage = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    try {
      const sessionId = activeSession?.id || null;
      const userMessage = { role: 'user', content: input, created_at: new Date().toISOString() };
      
      // Optimistically update UI
      setMessages([...messages, userMessage]);
      setInput('');
      
      // Send to API with proficiency and focus
      const response = await chatAPI.sendMessage(input, sessionId, proficiency, focus);
      
      // Get the updated session if this was a new one
      if (!sessionId) {
        const newSessionResponse = await chatAPI.getSession(response.data.session_id);
        setActiveSession(newSessionResponse.data);
        setSessions([...sessions, newSessionResponse.data]);
      }
      
      // Add AI response to messages
      const aiMessage = {
        role: 'assistant',
        content: response.data.response,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to send message', error);
    } finally {
      setLoading(false);
    }
  };

  // Update session settings
  const updateSessionSettings = async () => {
    if (activeSession) {
      try {
        await chatAPI.updateSession(activeSession.id, {
          proficiency_level: proficiency,
          learning_focus: focus
        });
      } catch (error) {
        console.error('Failed to update session settings', error);
      }
    }
  };

  return (
    <div className="chat-interface">
      <div className="settings-panel">
        <h3>English Learning Settings</h3>
        <div className="setting-item">
          <label>Proficiency Level:</label>
          <Select 
            value={proficiency} 
            onChange={(value) => {
              setProficiency(value);
              updateSessionSettings();
            }}
            options={[
              { value: 'beginner', label: 'Beginner' },
              { value: 'intermediate', label: 'Intermediate' },
              { value: 'advanced', label: 'Advanced' }
            ]}
          />
        </div>
        
        <div className="setting-item">
          <label>Learning Focus:</label>
          <Select 
            value={focus} 
            onChange={(value) => {
              setFocus(value);
              updateSessionSettings();
            }}
            options={[
              { value: 'general', label: 'General English' },
              { value: 'grammar', label: 'Grammar' },
              { value: 'vocabulary', label: 'Vocabulary' },
              { value: 'conversation', label: 'Conversation' },
              { value: 'reading', label: 'Reading' },
              { value: 'writing', label: 'Writing' },
              { value: 'pronunciation', label: 'Pronunciation' },
              { value: 'exam', label: 'Exam Preparation' }
            ]}
          />
        </div>
        
        <div className="suggestion-buttons">
          <button onClick={() => setInput("Give me a grammar exercise")}>
            Grammar Exercise
          </button>
          <button onClick={() => setInput("Help me practice conversation")}>
            Conversation Practice
          </button>
          <button onClick={() => setInput("Create a lesson plan for teaching vocabulary")}>
            Lesson Plan
          </button>
        </div>
      </div>
      
      {/* Rest of the chat interface */}
    </div>
  };
};
```

## API Usage

```typescript
// Get all user's chat sessions
const sessions = await chatAPI.getSessions();

// Start a new beginner English grammar chat
const newChat = await chatAPI.sendMessage(
  "Hello, I need help with English articles.", 
  null, // No existing session
  "beginner", // Proficiency level
  "grammar" // Learning focus
);

// Send a message in existing chat session
const response = await chatAPI.sendMessage(
  "Can you give me a practice exercise?", 
  existingSessionId
);

// Request a specific exercise type
const grammarExercise = await chatAPI.sendMessage(
  "Give me an intermediate level exercise for practicing past tense",
  existingSessionId
);

// Get a lesson plan
const lessonPlan = await chatAPI.sendMessage(
  "Create a lesson plan for teaching conversation skills",
  existingSessionId
);

// Update session settings
await chatAPI.updateSession(sessionId, { 
  title: "English Grammar Learning",
  proficiency_level: "intermediate",
  learning_focus: "grammar"
});

// Delete a chat session
await chatAPI.deleteSession(sessionId);
```

## Quick Teaching Commands

These commands can be sent directly to the chatbot:

- `"Give me a beginner grammar exercise"`
- `"Create an advanced vocabulary exercise"`
- `"Help me practice English pronunciation"`
- `"Create a lesson plan for teaching past tense"`
- `"What teaching methodology works best for vocabulary?"`
- `"How do I teach English articles to beginners?"`
- `"Create a reading comprehension exercise"`
- `"Help me prepare for IELTS speaking test"`