import React, { useState, useEffect, useRef } from 'react';
import { Card, Input, Button, List, Avatar, Spin, Select, Tabs, Tooltip, message, Divider, Dropdown, Menu, Badge } from 'antd';
import { 
  SendOutlined, RobotOutlined, UserOutlined, PlusOutlined, 
  DeleteOutlined, EditOutlined, MenuOutlined, SettingOutlined,
  HistoryOutlined, CloseOutlined
} from '@ant-design/icons';
import chatAPI from '../../services/chatAPI';
import { useAuth } from '../../contexts/AuthContext';
import { useResponsive } from '../../components/Utils/ResponsiveProvider';
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

const { TabPane } = Tabs;
const { Option } = Select;

const Chat: React.FC = () => {
  const { user } = useAuth();
  const { isMobile } = useResponsive();
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
  const [chatLogVisible, setChatLogVisible] = useState(false);
  
  // Chat log visibility state
  
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
      // Handle both direct data and response.data format
      const sessionData = Array.isArray(response) ? response : 
                          (response.data && Array.isArray(response.data)) ? response.data : [];
      setSessions(sessionData);
      
      // Set first session as active if available
      if (sessionData.length > 0) {
        const firstSession = sessionData[0];
        setActiveSessionId(firstSession.id);
        setProficiencyLevel(firstSession.proficiency_level);
        setLearningFocus(firstSession.learning_focus);
      }
      setInitialLoading(false);
    } catch (error) {
      console.error('Failed to load chat sessions', error);
      message.error('Failed to load chat sessions');
      setInitialLoading(false);
    }
  };

  // Helper function to check if an error is related to API usage limits
  const isApiLimitError = (error: any): boolean => {
    const errorMessage = error?.response?.data?.detail || 
                        error?.response?.data?.message || 
                        (typeof error === 'string' ? error : 
                        error?.message || '');
                        
    return errorMessage.toLowerCase().includes('api usage limit') || 
           errorMessage.toLowerCase().includes('quota') || 
           errorMessage.toLowerCase().includes('limit');
  };
  
  // Helper function to display appropriate error message
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

  const loadMessages = async (sessionId: number) => {
    try {
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
        setProficiencyLevel(session.proficiency_level);
        setLearningFocus(session.learning_focus);
      }
      
      const response = await chatAPI.getMessages(sessionId);
      // Handle both direct data and response.data format
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
    try {
      // Create temporary message for UI
      const tempUserMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content: inputValue,
        created_at: new Date().toISOString(),
      };
      
      // Update UI immediately
      setMessages((prevMessages) => Array.isArray(prevMessages) ? [...prevMessages, tempUserMessage] : [tempUserMessage]);
      setInputValue('');
      
      // Send to API
      const response = await chatAPI.sendMessage(
        inputValue, 
        activeSessionId !== null ? activeSessionId : undefined,
        proficiencyLevel,
        learningFocus
      );
      
      // Handle both direct data and response.data format safely with type assertions
      const responseData = response.data ? response.data : response;
      
      // Extract session_id safely with type checking
      let sessionId = null;
      if ('session_id' in responseData) {
        sessionId = (responseData as any).session_id;
      } else if (responseData && 'data' in responseData && (responseData as any).data && 
                'session_id' in (responseData as any).data) {
        sessionId = (responseData as any).data.session_id;
      }
      
      if (!activeSessionId && sessionId) {
        // This was a new session
        setActiveSessionId(sessionId);
        
        // Refresh session list
        const sessionsResponse = await chatAPI.getSessions();
        const sessionData = Array.isArray(sessionsResponse) ? sessionsResponse : 
                           (sessionsResponse.data && Array.isArray(sessionsResponse.data)) ? 
                           sessionsResponse.data : [];
        setSessions(sessionData);
      }
      
      // Load the latest messages to get server-generated IDs
      if (sessionId) {
        loadMessages(sessionId);
      }
    } catch (error: any) {
      console.error('Failed to send message', error);
      
      if (isApiLimitError(error)) {
        message.error({
          content: 'We\'ve reached our API usage limit. Please try again later.',
          duration: 6,
          style: { marginTop: '20px' }
        });
        
        // Add a system message to inform the user in the chat
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
      
      // Handle both direct data and response.data format with type safety
      const sessionData = response.data ? response.data : response;
      
      // Type assertion to resolve the TypeScript error
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
      
      // Update session list
      setSessions(sessions.filter(s => s.id !== sessionId));
      
      // If the active session was deleted, set active to null or another session
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
    if (!editTitleValue.trim()) {
      setEditingSessionId(null);
      return;
    }
    
    try {
      if (editingSessionId !== null) {
        await chatAPI.updateSession(editingSessionId, { 
          title: editTitleValue 
        });
      }
      
      // Update local state
      setSessions(Array.isArray(sessions) ? sessions.map(s => 
        s.id === editingSessionId 
          ? { ...s, title: editTitleValue } 
          : s
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
      
      // Update local state
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

  // Quick prompt templates
  const quickPrompts = [
    { title: "Grammar Exercise", prompt: "Create a grammar exercise for my level" },
    { title: "Vocabulary Practice", prompt: "Give me a vocabulary exercise to practice" },
    { title: "Conversation", prompt: "Let's practice conversation in English" },
    { title: "Pronunciation", prompt: "Help me improve my pronunciation" },
    { title: "Writing Exercise", prompt: "Give me a writing exercise to practice" }
  ];

  const applyQuickPrompt = (prompt: string) => {
    setInputValue(prompt);
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
              onClick={() => setActiveSessionId(session.id)}
              actions={[
                <Tooltip title="Edit Title">
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
                <Tooltip title="Delete Session">
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
            {!isMobile && (
              <Card className="chat-settings">
                <div className="settings-row">
                  <div className="setting-item">
                    <label>Proficiency Level:</label>
                    <Select
                      value={proficiencyLevel}
                      onChange={(value) => setProficiencyLevel(value)}
                      style={{ width: 140 }}
                    >
                      <Option value="beginner">Beginner</Option>
                      <Option value="intermediate">Intermediate</Option>
                      <Option value="advanced">Advanced</Option>
                    </Select>
                  </div>
                  <div className="setting-item">
                    <label>Learning Focus:</label>
                    <Select
                      value={learningFocus}
                      onChange={(value) => setLearningFocus(value)}
                      style={{ width: 140 }}
                    >
                      <Option value="general">General English</Option>
                      <Option value="grammar">Grammar</Option>
                      <Option value="vocabulary">Vocabulary</Option>
                      <Option value="conversation">Conversation</Option>
                      <Option value="reading">Reading</Option>
                      <Option value="writing">Writing</Option>
                      <Option value="pronunciation">Pronunciation</Option>
                      <Option value="exam">Exam Prep</Option>
                    </Select>
                  </div>
                  <Button type="primary" onClick={updateSessionSettings}>
                    Apply Settings
                  </Button>
                </div>
                <Divider style={{ margin: '12px 0' }} />
                <div className="quick-prompts">
                  {quickPrompts.map((item, index) => (
                    <Button 
                      key={index} 
                      size="small"
                      onClick={() => applyQuickPrompt(item.prompt)}
                    >
                      {item.title}
                    </Button>
                  ))}
                </div>
              </Card>
            )}
            
            {isMobile && activeSessionId && (
              <div style={{ 
                padding: '8px 12px', 
                backgroundColor: '#f0f7ff', 
                borderBottom: '1px solid #d9e8f6',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <strong>
                    {sessions.find(s => s.id === activeSessionId)?.title || 'Chat'}
                  </strong>
                  <div style={{ fontSize: '11px', color: '#666' }}>
                    <span>{proficiencyLevel}</span> • <span>{learningFocus}</span>
                  </div>
                </div>
              </div>
            )}
          
            <div className="messages-container">
              {messages.length > 0 ? (
                <List
                  className="messages-list"
                  itemLayout="horizontal"
                  dataSource={Array.isArray(messages) ? messages : []}
                  renderItem={message => (
                    <List.Item className={`message ${message.role}`}>
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
                <Dropdown 
                  overlay={
                    <Menu className="chat-dropdown-menu">
                      <Menu.ItemGroup title="Settings">
                        <Menu.Item key="settings-proficiency">
                          <div className="setting-item">
                            <label>Proficiency:</label>
                            <Select
                              value={proficiencyLevel}
                              onChange={(value) => setProficiencyLevel(value)}
                              style={{ width: 120 }}
                              size="small"
                            >
                              <Option value="beginner">Beginner</Option>
                              <Option value="intermediate">Intermediate</Option>
                              <Option value="advanced">Advanced</Option>
                            </Select>
                          </div>
                        </Menu.Item>
                        <Menu.Item key="settings-focus">
                          <div className="setting-item">
                            <label>Focus:</label>
                            <Select
                              value={learningFocus}
                              onChange={(value) => setLearningFocus(value)}
                              style={{ width: 120 }}
                              size="small"
                            >
                              <Option value="general">General</Option>
                              <Option value="grammar">Grammar</Option>
                              <Option value="vocabulary">Vocabulary</Option>
                              <Option value="conversation">Conversation</Option>
                              <Option value="reading">Reading</Option>
                              <Option value="writing">Writing</Option>
                              <Option value="pronunciation">Pronunciation</Option>
                              <Option value="exam">Exam Prep</Option>
                            </Select>
                          </div>
                        </Menu.Item>
                        <Menu.Item key="apply-settings">
                          <Button type="primary" size="small" onClick={updateSessionSettings} block>
                            Apply Settings
                          </Button>
                        </Menu.Item>
                      </Menu.ItemGroup>
                      <Menu.Divider />
                      <Menu.ItemGroup title="Chat Log">
                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                          {messages.slice(-5).map((msg, index) => (
                            <Menu.Item key={`log-${index}`}>
                              <Badge 
                                color={msg.role === 'assistant' ? '#1890ff' : '#52c41a'} 
                                text={`${msg.role === 'assistant' ? 'Emma' : 'You'}: ${msg.content.substring(0, 30)}${msg.content.length > 30 ? '...' : ''}`} 
                              />
                            </Menu.Item>
                          ))}
                        </div>
                      </Menu.ItemGroup>
                      {isMobile && (
                        <>
                          <Menu.Divider />
                          <Menu.Item key="show-sessions" onClick={() => setMobileSidebarVisible(!mobileSidebarVisible)}>
                            <HistoryOutlined /> {mobileSidebarVisible ? 'Hide Chat Sessions' : 'Show Chat Sessions'}
                          </Menu.Item>
                        </>
                      )}
                    </Menu>
                  }
                  placement="topRight"
                  trigger={['click']}
                >
                  <Button 
                    type="text" 
                    icon={<SettingOutlined />} 
                    style={{ marginRight: 8 }}
                  />
                </Dropdown>
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