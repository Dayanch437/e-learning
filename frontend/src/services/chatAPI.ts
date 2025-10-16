import api from './api';

// Define types for chat API
interface ChatSession {
  id: number;
  title: string;
  proficiency_level: 'beginner' | 'intermediate' | 'advanced';
  learning_focus: 'general' | 'grammar' | 'vocabulary' | 'conversation' | 'reading' | 'writing' | 'pronunciation' | 'exam';
  created_at: string;
  updated_at: string;
  messages: ChatMessage[];
}

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface ChatSessionCreateData {
  title?: string;
  proficiency_level?: 'beginner' | 'intermediate' | 'advanced';
  learning_focus?: 'general' | 'grammar' | 'vocabulary' | 'conversation' | 'reading' | 'writing' | 'pronunciation' | 'exam';
}

interface ChatSessionUpdateData {
  title?: string;
  proficiency_level?: 'beginner' | 'intermediate' | 'advanced';
  learning_focus?: 'general' | 'grammar' | 'vocabulary' | 'conversation' | 'reading' | 'writing' | 'pronunciation' | 'exam';
}

interface ChatResponse {
  response: string;
  session_id: number;
  message_id: number;
  proficiency_level: 'beginner' | 'intermediate' | 'advanced';
  learning_focus: 'general' | 'grammar' | 'vocabulary' | 'conversation' | 'reading' | 'writing' | 'pronunciation' | 'exam';
}

interface SessionStats {
  total_sessions: number;
  total_messages: number;
  average_messages_per_session: number;
  sessions_by_level: { [key: string]: number };
  sessions_by_focus: { [key: string]: number };
  recent_sessions: Array<{
    id: number;
    title: string;
    proficiency_level: string;
    learning_focus: string;
    message_count: number;
    updated_at: string;
    created_at: string;
  }>;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

// Chat API Service
const chatAPI = {
  // Get all chat sessions for current user
  getSessions: () => {
    return api.get<ChatSession[]>('/chat/sessions/');
  },
  
  // Get a specific chat session
  getSession: (id: number) => {
    return api.get<ChatSession>(`/chat/sessions/${id}/`);
  },
  
  // Get messages for a specific chat session
  getMessages: (sessionId: number) => {
    return api.get<ChatMessage[]>(`/chat/sessions/${sessionId}/messages/`);
  },
  
  // Create a new chat session
  createSession: (data: ChatSessionCreateData) => {
    return api.post<ChatSession>('/chat/sessions/', data);
  },
  
  // Update a chat session (e.g., rename)
  updateSession: (id: number, data: ChatSessionUpdateData) => {
    return api.patch<ChatSession>(`/chat/sessions/${id}/`, data);
  },
  
  // Delete a chat session
  deleteSession: (id: number) => {
    return api.delete(`/chat/sessions/${id}/`);
  },
  
  // Send a message and get AI response
  sendMessage: (
    message: string, 
    sessionId?: number,
    proficiency_level?: 'beginner' | 'intermediate' | 'advanced',
    learning_focus?: 'general' | 'grammar' | 'vocabulary' | 'conversation' | 'reading' | 'writing' | 'pronunciation' | 'exam'
  ) => {
    return api.post<ChatResponse>('/chat/sessions/chat/', {
      message,
      session_id: sessionId,
      proficiency_level,
      learning_focus
    });
  },

  // Get session statistics for the current user
  getSessionStats: () => {
    return api.get<SessionStats>('/chat/sessions/stats/');
  }
};

export default chatAPI;