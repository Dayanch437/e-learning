import React, { useState, useRef } from 'react';
import { Input, Button, List, Avatar, message, Spin } from 'antd';
import { 
  SendOutlined, RobotOutlined, UserOutlined
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

const Chat: React.FC = () => {
  const { user } = useAuth();
  const { isMobile } = useResponsive();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      
      setMessages((prevMessages) => [...prevMessages, tempUserMessage]);
      
      // Send message to API (without session management)
      const response = await chatAPI.sendMessage(
        currentInput, 
        undefined, // no session ID
        'intermediate', // default proficiency
        'general' // default focus
      );
      
      const responseData = response.data ? response.data : response;
      
      // Extract AI response
      let aiResponse = '';
      if ('response' in responseData) {
        aiResponse = (responseData as any).response;
      }
      
      // Add AI response immediately to UI
      if (aiResponse) {
        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: aiResponse,
          created_at: new Date().toISOString(),
        };
        
        setMessages((prevMessages) => [...prevMessages, aiMessage]);
      }
      
      // Scroll to bottom
      setTimeout(scrollToBottom, 100);
      
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
        
        setMessages((prevMessages) => [...prevMessages, systemMessage]);
      } else {
        handleApiError(error, 'Failed to send message');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container-simple">
      <div className="chat-header">
        <div className="header-content">
          <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#1890ff', marginRight: '12px' }} />
          <div>
            <h3 style={{ margin: 0, color: '#1890ff' }}>Teacher Emma</h3>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Your English Learning Assistant</p>
          </div>
        </div>
      </div>
      
      <div className="chat-main-simple">
        <div className="messages-container">
          {messages.length > 0 ? (
            <List
              className="messages-list"
              itemLayout="horizontal"
              dataSource={messages}
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
              <div className="welcome-message">
                <RobotOutlined style={{ fontSize: '48px', marginBottom: '20px', color: '#1890ff' }} />
                <h2>Welcome to English Learning!</h2>
                <p>I'm Teacher Emma, your AI English tutor. I'm here to help you improve your English skills.</p>
                <p>Start by asking me anything about English - grammar, vocabulary, conversation practice, or just say hello!</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="input-container">
          <div className="input-wrapper">
            <Input.TextArea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message to Teacher Emma..."
              autoSize={{ 
                minRows: 1, 
                maxRows: isMobile ? 4 : 6 
              }}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="chat-input"
              disabled={loading}
            />
            <Button 
              type="primary" 
              icon={<SendOutlined />} 
              onClick={handleSendMessage}
              loading={loading}
              className="send-button"
              size={isMobile ? "small" : "middle"}
            >
              {!isMobile && "Send"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
