import React, { useState, useRef, useEffect } from 'react';
import { Card, Input, Button, List, Spin, message, Grid } from 'antd';
import { SendOutlined, RobotOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../../host';

const { useBreakpoint } = Grid;

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const SimpleChat: React.FC = () => {
  const { user, accessToken } = useAuth();
  const { t } = useTranslation();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString(),
    };

    // Add user message to UI
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setLoading(true);

    try {
      console.log('🤖 Sending message to:', `${API_BASE_URL}/chat/sessions/simple-chat/`);
      console.log('🔑 Using token:', accessToken ? 'Token present' : 'No token!');
      
      const response = await fetch(`${API_BASE_URL}/chat/sessions/simple-chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          message: currentInput,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || errorData.message || `Error: ${response.status} ${response.statusText}`;
        
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ AI Response:', data);

      // Add AI response to UI
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.response || data.message || 'No response',
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('❌ Chat error:', error);
      message.error(error.message || t('chat.error'));
      
      // Add error message to UI
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Error: ${error.message || t('chat.error')}`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    message.success(t('chat.clearChat'));
  };

  return (
    <div style={{ padding: isMobile ? '12px' : '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Card
        title={
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            fontSize: isMobile ? '14px' : '16px'
          }}>
            <span>🤖 {t('chat.title')}</span>
            <Button onClick={clearChat} size={isMobile ? 'small' : 'middle'}>
              {t('chat.clearChat')}
            </Button>
          </div>
        }
        style={{ 
          height: isMobile ? 'calc(100vh - 100px)' : 'calc(100vh - 150px)', 
          display: 'flex', 
          flexDirection: 'column' 
        }}
        bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0 }}
      >
        {/* Messages Area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: isMobile ? '12px' : '20px',
            backgroundColor: '#f5f5f5',
          }}
        >
          {messages.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              padding: isMobile ? '20px' : '40px', 
              color: '#999',
              fontSize: isMobile ? '12px' : '14px'
            }}>
              <RobotOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
              <p>{t('chat.startConversation')}</p>
              <p style={{ fontSize: '12px' }}>{t('chat.helpText')}</p>
            </div>
          )}

          <List
            dataSource={messages}
            renderItem={(msg) => (
              <div
                key={msg.id}
                style={{
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: isMobile ? '85%' : '70%',
                  }}
                >
                  <div
                    style={{
                      padding: isMobile ? '10px 14px' : '12px 16px',
                      borderRadius: '12px',
                      backgroundColor: msg.role === 'user' ? '#1890ff' : '#fff',
                      color: msg.role === 'user' ? '#fff' : '#000',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      wordBreak: 'break-word',
                    }}
                  >
                    <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                    <div
                      style={{
                        fontSize: '11px',
                        marginTop: '4px',
                        opacity: 0.7,
                      }}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          />
          
          {loading && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Spin tip={t('chat.thinking')} />
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div
          style={{
            padding: isMobile ? '12px' : '16px',
            borderTop: '1px solid #f0f0f0',
            backgroundColor: '#fff',
          }}
        >
          <div style={{ display: 'flex', gap: isMobile ? '4px' : '8px' }}>
            <Input.TextArea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('chat.placeholder')}
              autoSize={{ minRows: 1, maxRows: 4 }}
              disabled={loading}
              style={{ flex: 1, fontSize: isMobile ? '14px' : '16px' }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSendMessage}
              loading={loading}
              disabled={!inputValue.trim()}
              style={{ height: 'auto' }}
            >
              {!isMobile && t('chat.send')}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SimpleChat;
