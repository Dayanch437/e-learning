import React, { useState, useEffect, useRef } from 'react';
import { Card, Input, Button, List, Avatar, Spin, Select, Tooltip, message, Divider, Dropdown, Menu, Badge } from 'antd';
import { 
  SendOutlined, RobotOutlined, UserOutlined, PlusOutlined, 
  DeleteOutlined, EditOutlined, MenuOutlined, SettingOutlined,
  HistoryOutlined, CloseOutlined
} from '@ant-design/icons';
import chatAPI from '../../services/chatAPI';
import { useAuth } from '../../contexts/AuthContext';
import { useResponsive } from '../../components/Utils/ResponsiveProvider';
import { useLanguage } from '../../contexts/LanguageContext';
import './Chat.css';

// Type definitions
interface ChatMessage {
  id: number | string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface ChatSession {
  id: number;
  title: string;
  proficiency_level: 'beginner' | 'intermediate' | 'advanced';
  learning_focus: 'general' | 'grammar' | 'vocabulary' | 'conversation' | 'reading' | 'writing' | 'pronunciation' | 'exam';
  created_at: string;
  updated_at: string;
  messages?: ChatMessage[];
}

const { Option } = Select;

const Chat = (): React.ReactElement => {
  const { user } = useAuth();
  const { isMobile } = useResponsive();
  const { t } = useLanguage();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [proficiencyLevel, setProficiencyLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [learningFocus, setLearningFocus] = useState<'general' | 'grammar' | 'vocabulary' | 'conversation' | 'reading' | 'writing' | 'pronunciation' | 'exam'>('general');
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
  const [editTitleValue, setEditTitleValue] = useState('');
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat sessions
  useEffect(() => {
    loadSessions();
  }, []);

  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Watch for active session changes and load messages
  useEffect(() => {
    if (activeSessionId !== null) {
      loadMessages(activeSessionId);
    } else {
      setMessages([]);
    }
  }, [activeSessionId]);

  const loadSessions = async () => {
    try {
      setInitialLoading(true);
      const response = await chatAPI.getSessions();
      const sessionData = Array.isArray(response) ? response : 
                          (response.data && Array.isArray(response.data)) ? response.data : [];
      setSessions(sessionData);
      
      // Only set first session as active if no session is currently active
      if (sessionData.length > 0 && !activeSessionId) {
        const firstSession = sessionData[0];
        setActiveSessionId(firstSession.id);
        setProficiencyLevel(firstSession.proficiency_level);
        setLearningFocus(firstSession.learning_focus);
      } else if (sessionData.length === 0) {
        setActiveSessionId(null);
        setMessages([]);
      }
      setInitialLoading(false);
    } catch (error) {
      console.error('Failed to load chat sessions', error);
      message.error('Failed to load chat sessions');
      setInitialLoading(false);
    }
  };

  const isApiLimitError = (error: any): boolean => {
    const errorMessage = error?.response?.data?.detail || 
                        error?.response?.data?.message || 
                        (typeof error === 'string' ? error : 
                        error?.message || '');
                        
    return errorMessage.toLowerCase().includes('api usage limit') || 
           errorMessage.toLowerCase().includes('quota') || 
           errorMessage.toLowerCase().includes('limit');
  };

  const handleApiError = (error: any, defaultMessage: string) => {
    console.error(defaultMessage, error);
    
    if (isApiLimitError(error)) {
      message.error({
        content: 'We\'ve reached our API usage limit. Please try again later.',
        duration: 6,
        style: { marginTop: '20px' }
      });
    } else {
      message.error(defaultMessage);
    }
  };

  const handleSessionClick = (sessionId: number) => {
    setActiveSessionId(sessionId);
    
    const selectedSession = sessions.find(s => s.id === sessionId);
    if (selectedSession) {
      setProficiencyLevel(selectedSession.proficiency_level);
      setLearningFocus(selectedSession.learning_focus);
    }
    
    if (isMobile) {
      setMobileSidebarVisible(false);
    }
  };

  const loadMessages = async (sessionId: number) => {
    try {
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
        setProficiencyLevel(session.proficiency_level);
        setLearningFocus(session.learning_focus);
      }
      
      const response = await chatAPI.getMessages(sessionId);
      const messageData = Array.isArray(response) ? response :
                         (response.data && Array.isArray(response.data)) ? response.data : [];
      setMessages(messageData);
    } catch (error) {
      handleApiError(error, 'Failed to load messages');
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    setLoading(true);
    const currentInput = inputValue;
    setInputValue('');
    
    try {
      // Add user message immediately to UI
      const tempUserMessage: ChatMessage = {
        id: `temp-user-${Date.now()}`,
        role: 'user',
        content: currentInput,
        created_at: new Date().toISOString(),
      };
      
      setMessages((prevMessages) => Array.isArray(prevMessages) ? [...prevMessages, tempUserMessage] : [tempUserMessage]);
      
      // Send message to API
      const response = await chatAPI.sendMessage(
        currentInput, 
        activeSessionId !== null ? activeSessionId : undefined,
        proficiencyLevel,
        learningFocus
      );
      
      const responseData = response.data ? response.data : response;
      
      // Extract session ID and AI response
      let sessionId = null;
      let aiResponse = '';
      let messageId = null;
      
      if ('session_id' in responseData) {
        sessionId = (responseData as any).session_id;
      }
      if ('response' in responseData) {
        aiResponse = (responseData as any).response;
      }
      if ('message_id' in responseData) {
        messageId = (responseData as any).message_id;
      }
      
      // If this is a new session, update the session list and set active session
      if (!activeSessionId && sessionId) {
        setActiveSessionId(sessionId);
        const sessionsResponse = await chatAPI.getSessions();
        const sessionData = Array.isArray(sessionsResponse) ? sessionsResponse : 
                           (sessionsResponse.data && Array.isArray(sessionsResponse.data)) ? 
                           sessionsResponse.data : [];
        setSessions(sessionData);
      }
      
      // Add AI response immediately to UI
      if (aiResponse) {
        const aiMessage: ChatMessage = {
          id: messageId || `temp-ai-${Date.now()}`,
          role: 'assistant',
          content: aiResponse,
          created_at: new Date().toISOString(),
        };
        
        setMessages((prevMessages) => Array.isArray(prevMessages) ? [...prevMessages, aiMessage] : [aiMessage]);
      }
      
    } catch (error: any) {
      console.error('Failed to send message', error);
      
      // Restore input value on error
      setInputValue(currentInput);
      
      if (isApiLimitError(error)) {
        message.error({
          content: 'We\'ve reached our API usage limit. Please try again later.',
          duration: 6,
          style: { marginTop: '20px' }
        });
        
        const systemMessage: ChatMessage = {
          id: `system-${Date.now()}`,
          role: 'assistant',
          content: "I'm sorry, we've reached our API usage limit. Please try again later or contact support if this persists.",
          created_at: new Date().toISOString(),
        };
        setMessages((prevMessages) => Array.isArray(prevMessages) ? [...prevMessages, systemMessage] : [systemMessage]);
      } else {
        message.error('Failed to send message. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const createNewSession = async () => {
    try {
      const response = await chatAPI.createSession({
        title: "New Chat",
        proficiency_level: proficiencyLevel,
        learning_focus: learningFocus
      });
      
      const sessionData = response.data ? response.data : response;
      const safeSessionData = sessionData as ChatSession;
      
      setSessions(Array.isArray(sessions) ? [...sessions, safeSessionData] : [safeSessionData]);
      setActiveSessionId(safeSessionData.id);
    } catch (error: any) {
      handleApiError(error, 'Failed to create new session');
    }
  };

  const deleteSession = async (sessionId: number) => {
    try {
      await chatAPI.deleteSession(sessionId);
      setSessions(sessions.filter(s => s.id !== sessionId));
      
      if (activeSessionId === sessionId) {
        const remainingSessions = sessions.filter(s => s.id !== sessionId);
        setActiveSessionId(remainingSessions.length > 0 ? remainingSessions[0].id : null);
      }
      
      message.success('Chat session deleted');
    } catch (error) {
      handleApiError(error, 'Failed to delete session');
    }
  };

  const startEditingTitle = (session: ChatSession) => {
    setEditingSessionId(session.id);
    setEditTitleValue(session.title);
  };

  const updateSessionTitle = async () => {
    if (!editingSessionId || !editTitleValue.trim()) {
      setEditingSessionId(null);
      return;
    }

    try {
      await chatAPI.updateSession(editingSessionId, { title: editTitleValue.trim() });
      
      setSessions(Array.isArray(sessions) ? sessions.map(s => 
        s.id === editingSessionId ? { ...s, title: editTitleValue.trim() } : s
      ) : []);
      
      setEditingSessionId(null);
    } catch (error) {
      console.error('Failed to update session title', error);
      message.error('Failed to update session title');
      setEditingSessionId(null);
    }
  };

  const updateSessionSettings = async () => {
    if (!activeSessionId) return;
    
    try {
      await chatAPI.updateSession(activeSessionId, {
        proficiency_level: proficiencyLevel,
        learning_focus: learningFocus
      });
      
      setSessions(Array.isArray(sessions) ? sessions.map(s => 
        s.id === activeSessionId 
          ? { ...s, proficiency_level: proficiencyLevel, learning_focus: learningFocus } 
          : s
      ) : []);
      
      message.success('Learning settings updated');
    } catch (error) {
      console.error('Failed to update session settings', error);
      message.error('Failed to update settings');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (initialLoading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <p>Loading chat sessions...</p>
      </div>
    );
  }

  return (
    <div className="chat-container">
      {isMobile && (
        <Button
          className="mobile-sidebar-toggle"
          type="text"
          icon={mobileSidebarVisible ? <CloseOutlined /> : <MenuOutlined />}
          onClick={() => setMobileSidebarVisible(!mobileSidebarVisible)}
        />
      )}
      
      <div className={`chat-sidebar ${isMobile && mobileSidebarVisible ? 'visible' : ''}`}
           style={{ display: isMobile ? (mobileSidebarVisible ? 'flex' : 'none') : 'flex' }}>
        <div className="sessions-header">
          <h3>Your Chat Sessions</h3>
          <Button 
            type="primary" 
            size={isMobile ? "small" : "middle"}
            icon={<PlusOutlined />} 
            onClick={createNewSession}
          >
            New Chat
          </Button>
        </div>
        
        <List
          className="sessions-list"
          itemLayout="horizontal"
          dataSource={Array.isArray(sessions) ? sessions : []}
          renderItem={session => (
            <List.Item
              className={`session-item ${activeSessionId === session.id ? 'active' : ''}`}
              onClick={() => handleSessionClick(session.id)}
              actions={[
                <Tooltip title="Edit Title" key="edit">
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<EditOutlined />} 
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditingTitle(session);
                    }}
                  />
                </Tooltip>,
                <Tooltip title="Delete Session" key="delete">
                  <Button 
                    type="text" 
                    danger
                    size="small" 
                    icon={<DeleteOutlined />} 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.id);
                    }}
                  />
                </Tooltip>
              ]}
            >
              {editingSessionId === session.id ? (
                <Input
                  value={editTitleValue}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => setEditTitleValue(e.target.value)}
                  onPressEnter={updateSessionTitle}
                  onBlur={updateSessionTitle}
                  autoFocus
                />
              ) : (
                <div className="session-title">
                  {session.title}
                  <div className="session-meta">
                    <span className="proficiency-badge">{session.proficiency_level}</span>
                    <span className="focus-badge">{session.learning_focus}</span>
                  </div>
                </div>
              )}
            </List.Item>
          )}
        />
      </div>
      
      <div className="chat-main">
        {!activeSessionId && sessions.length === 0 ? (
          <div className="empty-state">
            <RobotOutlined style={{ fontSize: '48px', marginBottom: '20px' }} />
            <h2>Welcome to English Learning Assistant!</h2>
            <p>Start a new conversation with Teacher Emma to improve your English skills.</p>
            <Button type="primary" onClick={createNewSession}>Start Learning</Button>
          </div>
        ) : (
          <>
            <div className="messages-container">
              {messages.length > 0 ? (
                <List
                  className="messages-list"
                  itemLayout="horizontal"
                  dataSource={Array.isArray(messages) ? messages : []}
                  renderItem={message => (
                    <List.Item className={`message ${message.role}`} key={message.id}>
                      <List.Item.Meta
                        avatar={
                          message.role === 'assistant' ? 
                            <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#1890ff' }} size={isMobile ? 'small' : 'default'} /> : 
                            <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#52c41a' }} size={isMobile ? 'small' : 'default'} />
                        }
                        title={
                          <span style={{ fontSize: isMobile ? '12px' : '14px' }}>
                            {message.role === 'assistant' ? 'Teacher Emma' : user?.username || 'You'}
                          </span>
                        }
                        description={
                          <div className="message-content" style={{ fontSize: isMobile ? '13px' : '14px' }}>
                            {message.content.split('\n').map((line, i) => (
                              <React.Fragment key={i}>
                                {line}
                                <br />
                              </React.Fragment>
                            ))}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <div className="empty-messages">
                  <p>No messages yet. Start by sending a message to Teacher Emma!</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="input-container">
              <Input.TextArea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                autoSize={{ minRows: 1, maxRows: isMobile ? 3 : 4 }}
                onPressEnter={(e) => {
                  if (!e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                style={{ flex: 1 }}
              />
              <div className="chat-controls">
                <Button 
                  type="primary" 
                  icon={<SendOutlined />} 
                  onClick={handleSendMessage}
                  loading={loading}
                >
                  {!isMobile && "Send"}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;