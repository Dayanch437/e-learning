import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Space } from 'antd';
import { ArrowLeftOutlined, MessageOutlined } from '@ant-design/icons';
import SessionList from './SessionList';

const SessionListPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSessionSelect = (sessionId: number) => {
    // Navigate to chat with the selected session
    navigate(`/chat?session=${sessionId}`);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleNewChat = () => {
    navigate('/chat');
  };

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Card style={{ marginBottom: '16px', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />} 
              onClick={handleBackToDashboard}
              style={{ marginRight: '16px' }}
            >
              Back to Dashboard
            </Button>
            <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
              My Chat Sessions
            </span>
          </div>
          <Space>
            <Button 
              type="primary" 
              icon={<MessageOutlined />}
              onClick={handleNewChat}
            >
              Start New Chat
            </Button>
          </Space>
        </div>
      </Card>

      {/* Session List */}
      <SessionList 
        onSessionSelect={handleSessionSelect}
        showStats={true}
        compact={false}
      />
    </div>
  );
};

export default SessionListPage;