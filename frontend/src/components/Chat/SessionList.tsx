import React, { useState, useEffect } from 'react';
import { 
  Card, 
  List, 
  Avatar, 
  Button, 
  Tooltip, 
  message, 
  Typography, 
  Row, 
  Col, 
  Statistic, 
  Badge, 
  Space, 
  Tag, 
  Input,
  Select,
  Dropdown,
  Menu,
  Divider,
  Empty,
  Spin
} from 'antd';
import {
  MessageOutlined,
  ClockCircleOutlined,
  UserOutlined,
  BarChartOutlined,
  FilterOutlined,
  SearchOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  MoreOutlined,
  TrophyOutlined,
  BookOutlined
} from '@ant-design/icons';
import chatAPI from '../../services/chatAPI';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import './SessionList.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Search } = Input;

// Types
interface ChatSession {
  id: number;
  title: string;
  proficiency_level: 'beginner' | 'intermediate' | 'advanced';
  learning_focus: 'general' | 'grammar' | 'vocabulary' | 'conversation' | 'reading' | 'writing' | 'pronunciation' | 'exam';
  created_at: string;
  updated_at: string;
  message_count?: number;
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

interface SessionListProps {
  onSessionSelect?: (sessionId: number) => void;
  selectedSessionId?: number | null;
  showStats?: boolean;
  compact?: boolean;
}

const SessionList: React.FC<SessionListProps> = ({
  onSessionSelect,
  selectedSessionId,
  showStats = true,
  compact = false
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  // State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterFocus, setFilterFocus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'messages'>('updated');

  // Load data on component mount
  useEffect(() => {
    loadSessions();
    if (showStats) {
      loadStats();
    }
  }, [showStats]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await chatAPI.getSessions();
      const sessionData = Array.isArray(response.data) ? response.data : [];
      
      // Add message count to each session
      const sessionsWithCounts = await Promise.all(
        sessionData.map(async (session) => {
          try {
            const messages = await chatAPI.getMessages(session.id);
            const messageData = Array.isArray(messages.data) ? messages.data : [];
            return { ...session, message_count: messageData.length };
          } catch (error) {
            return { ...session, message_count: 0 };
          }
        })
      );
      
      setSessions(sessionsWithCounts);
    } catch (error) {
      console.error('Failed to load sessions:', error);
      message.error('Failed to load chat sessions');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const response = await chatAPI.getSessionStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
      message.error('Failed to load session statistics');
    } finally {
      setStatsLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: number) => {
    try {
      await chatAPI.deleteSession(sessionId);
      setSessions(sessions.filter(s => s.id !== sessionId));
      message.success('Session deleted successfully');
    } catch (error) {
      console.error('Failed to delete session:', error);
      message.error('Failed to delete session');
    }
  };

  const handleSessionRename = async (sessionId: number, newTitle: string) => {
    try {
      await chatAPI.updateSession(sessionId, { title: newTitle });
      setSessions(sessions.map(s => 
        s.id === sessionId ? { ...s, title: newTitle } : s
      ));
      message.success('Session renamed successfully');
    } catch (error) {
      console.error('Failed to rename session:', error);
      message.error('Failed to rename session');
    }
  };

  // Filter and sort sessions
  const getFilteredSessions = () => {
    let filtered = sessions.filter(session => {
      const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel = filterLevel === 'all' || session.proficiency_level === filterLevel;
      const matchesFocus = filterFocus === 'all' || session.learning_focus === filterFocus;
      return matchesSearch && matchesLevel && matchesFocus;
    });

    // Sort sessions
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'messages':
          return (b.message_count || 0) - (a.message_count || 0);
        case 'updated':
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });

    return filtered;
  };

  const getProficiencyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'green';
      case 'intermediate': return 'blue';
      case 'advanced': return 'purple';
      default: return 'default';
    }
  };

  const getFocusIcon = (focus: string) => {
    switch (focus) {
      case 'grammar': return <BookOutlined />;
      case 'vocabulary': return <BookOutlined />;
      case 'conversation': return <MessageOutlined />;
      case 'exam': return <TrophyOutlined />;
      default: return <MessageOutlined />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const filteredSessions = getFilteredSessions();

  const sessionMenu = (session: ChatSession) => (
    <Menu>
      <Menu.Item 
        key="edit" 
        icon={<EditOutlined />}
        onClick={() => {
          const newTitle = prompt('Enter new title:', session.title);
          if (newTitle && newTitle.trim()) {
            handleSessionRename(session.id, newTitle.trim());
          }
        }}
      >
        Rename
      </Menu.Item>
      <Menu.Item 
        key="delete" 
        icon={<DeleteOutlined />}
        danger
        onClick={() => {
          if (window.confirm(`Delete session "${session.title}"?`)) {
            handleDeleteSession(session.id);
          }
        }}
      >
        Delete
      </Menu.Item>
    </Menu>
  );

  if (loading) {
    return (
      <Card className="session-list-card">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>Loading chat sessions...</div>
        </div>
      </Card>
    );
  }

  return (
    <div className="session-list-container">
      {/* Statistics Section */}
      {showStats && !compact && stats && (
        <Card className="stats-card" style={{ marginBottom: '16px' }}>
          <Title level={4}>
            <BarChartOutlined /> Chat Statistics
          </Title>
          <Row gutter={16}>
            <Col span={8}>
              <Statistic 
                title="Total Sessions" 
                value={stats.total_sessions}
                prefix={<MessageOutlined />}
              />
            </Col>
            <Col span={8}>
              <Statistic 
                title="Total Messages" 
                value={stats.total_messages}
                prefix={<UserOutlined />}
              />
            </Col>
            <Col span={8}>
              <Statistic 
                title="Avg Messages/Session" 
                value={stats.average_messages_per_session}
                precision={1}
                prefix={<BarChartOutlined />}
              />
            </Col>
          </Row>
          
          <Divider />
          
          <Row gutter={16}>
            <Col span={12}>
              <Text strong>Proficiency Levels:</Text>
              <div style={{ marginTop: '8px' }}>
                {Object.entries(stats.sessions_by_level).map(([level, count]) => (
                  <Tag key={level} color={getProficiencyColor(level)} style={{ marginBottom: '4px' }}>
                    {level}: {count}
                  </Tag>
                ))}
              </div>
            </Col>
            <Col span={12}>
              <Text strong>Learning Focus:</Text>
              <div style={{ marginTop: '8px' }}>
                {Object.entries(stats.sessions_by_focus).map(([focus, count]) => (
                  <Tag key={focus} style={{ marginBottom: '4px' }}>
                    {focus}: {count}
                  </Tag>
                ))}
              </div>
            </Col>
          </Row>
        </Card>
      )}

      {/* Filters and Search */}
      {!compact && (
        <Card className="filters-card" style={{ marginBottom: '16px' }}>
          <Row gutter={16} align="middle">
            <Col span={8}>
              <Search
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col span={5}>
              <Select
                placeholder="Level"
                value={filterLevel}
                onChange={setFilterLevel}
                style={{ width: '100%' }}
              >
                <Option value="all">All Levels</Option>
                <Option value="beginner">Beginner</Option>
                <Option value="intermediate">Intermediate</Option>
                <Option value="advanced">Advanced</Option>
              </Select>
            </Col>
            <Col span={5}>
              <Select
                placeholder="Focus"
                value={filterFocus}
                onChange={setFilterFocus}
                style={{ width: '100%' }}
              >
                <Option value="all">All Focus</Option>
                <Option value="general">General</Option>
                <Option value="grammar">Grammar</Option>
                <Option value="vocabulary">Vocabulary</Option>
                <Option value="conversation">Conversation</Option>
                <Option value="reading">Reading</Option>
                <Option value="writing">Writing</Option>
                <Option value="pronunciation">Pronunciation</Option>
                <Option value="exam">Exam Prep</Option>
              </Select>
            </Col>
            <Col span={6}>
              <Select
                placeholder="Sort by"
                value={sortBy}
                onChange={setSortBy}
                style={{ width: '100%' }}
              >
                <Option value="updated">Last Updated</Option>
                <Option value="created">Date Created</Option>
                <Option value="messages">Message Count</Option>
              </Select>
            </Col>
          </Row>
        </Card>
      )}

      {/* Sessions List */}
      <Card className="sessions-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Title level={4} style={{ margin: 0 }}>
            <MessageOutlined /> Chat Sessions ({filteredSessions.length})
          </Title>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => window.location.href = '/chat'}
          >
            New Chat
          </Button>
        </div>

        {filteredSessions.length === 0 ? (
          <Empty 
            description="No chat sessions found"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={filteredSessions}
            renderItem={(session) => (
              <List.Item
                className={`session-item ${selectedSessionId === session.id ? 'selected' : ''}`}
                onClick={() => onSessionSelect?.(session.id)}
                actions={[
                  <Badge count={session.message_count || 0} showZero>
                    <MessageOutlined />
                  </Badge>,
                  <Tooltip title={`Updated: ${new Date(session.updated_at).toLocaleString()}`}>
                    <Text type="secondary">
                      <ClockCircleOutlined /> {formatDate(session.updated_at)}
                    </Text>
                  </Tooltip>,
                  <Dropdown overlay={sessionMenu(session)} trigger={['click']}>
                    <Button type="text" icon={<MoreOutlined />} />
                  </Dropdown>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      icon={getFocusIcon(session.learning_focus)} 
                      style={{ backgroundColor: getProficiencyColor(session.proficiency_level) }}
                    />
                  }
                  title={
                    <div>
                      <Text strong style={{ fontSize: '16px' }}>
                        {session.title}
                      </Text>
                      <div style={{ marginTop: '4px' }}>
                        <Tag color={getProficiencyColor(session.proficiency_level)}>
                          {session.proficiency_level}
                        </Tag>
                        <Tag>
                          {session.learning_focus}
                        </Tag>
                      </div>
                    </div>
                  }
                  description={
                    <Text type="secondary">
                      Created: {new Date(session.created_at).toLocaleDateString()} • 
                      {session.message_count || 0} messages
                    </Text>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default SessionList;