import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Tag, Button, Space, Divider, message, Spin, Alert } from 'antd';
import { ArrowLeftOutlined, BookOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { grammarAPI } from '../../services/api';
import { GrammarLesson } from '../../types';

const { Title } = Typography;

const SimpleGrammarDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<GrammarLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchLesson(parseInt(id));
    }
  }, [id]);

  const fetchLesson = async (lessonId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await grammarAPI.getById(lessonId);
      setLesson(response.data);
    } catch (error: any) {
      console.error('Error fetching lesson:', error);
      setError('Failed to load lesson. Please try again.');
      message.error('Failed to load lesson');
    } finally {
      setLoading(false);
    }
  };

    const getDifficultyColor = (categoryName?: string) => {
    if (!categoryName) return 'default';
    const name = categoryName.toLowerCase();
    if (name.includes('beginner')) return 'green';
    if (name.includes('intermediate')) return 'orange';
    if (name.includes('advanced')) return 'red';
    if (name.includes('basic')) return 'blue';
    if (name.includes('conversation')) return 'purple';
    if (name.includes('business')) return 'gold';
    if (name.includes('academic')) return 'magenta';
    return 'default';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Loading lesson...</div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Error"
          description={error || 'Lesson not found'}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={() => navigate('/grammar')}>
              Back to Grammar
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Button 
            type="link" 
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/grammar')}
            style={{ padding: 0 }}
          >
            Back to Grammar Lessons
          </Button>
          
          <div>
            <Space wrap style={{ marginBottom: 16 }}>
              {lesson.category && (
                <Tag 
                  color={getDifficultyColor(lesson.category.name)} 
                  icon={<BookOutlined />}
                  style={{ 
                    fontSize: '14px',
                    fontWeight: '500',
                    padding: '4px 12px',
                    borderRadius: '16px'
                  }}
                >
                  📚 {lesson.category.name}
                </Tag>
              )}
              <Tag color="blue" icon={<ClockCircleOutlined />}>
                {formatDate(lesson.created_at)}
              </Tag>
              <Tag color={lesson.status === 'published' ? 'green' : 'orange'}>
                {lesson.status.toUpperCase()}
              </Tag>
              {lesson.estimated_duration > 0 && (
                <Tag color="purple" icon={<ClockCircleOutlined />}>
                  {lesson.estimated_duration} min
                </Tag>
              )}
            </Space>
            
            <Title level={1} style={{ marginBottom: 16 }}>
              {lesson.title}
            </Title>
          </div>
        </Space>
      </Card>

      {/* Content */}
      <Card>
        <Title level={3} style={{ marginBottom: 24 }}>
          Lesson Content
        </Title>
        
        <div 
          style={{ 
            fontSize: '16px', 
            lineHeight: '1.8',
            color: '#333'
          }}
          dangerouslySetInnerHTML={{ 
            __html: lesson.content?.replace(/\n/g, '<br>') || 'No content available.' 
          }}
        />
        
        {lesson.examples && (
          <>
            <Divider />
            <Title level={4} style={{ marginTop: 24, marginBottom: 16 }}>
              Examples
            </Title>
            <div 
              style={{ 
                fontSize: '15px', 
                lineHeight: '1.6',
                color: '#333',
                backgroundColor: '#f9f9f9',
                padding: '16px',
                borderRadius: '6px'
              }}
              dangerouslySetInnerHTML={{ 
                __html: lesson.examples.replace(/\n/g, '<br>') 
              }}
            />
          </>
        )}
        
        {lesson.exercises && (
          <>
            <Divider />
            <Title level={4} style={{ marginTop: 24, marginBottom: 16 }}>
              Practice Exercises
            </Title>
            <div 
              style={{ 
                fontSize: '15px', 
                lineHeight: '1.6',
                color: '#333',
                backgroundColor: '#fff7e6',
                padding: '16px',
                borderRadius: '6px',
                border: '1px solid #ffd591'
              }}
              dangerouslySetInnerHTML={{ 
                __html: lesson.exercises.replace(/\n/g, '<br>') 
              }}
            />
          </>
        )}
        
        <Divider />
        
        <div style={{ textAlign: 'center' }}>
          <Button 
            type="primary" 
            size="large"
            onClick={() => navigate('/grammar')}
          >
            Back to All Lessons
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SimpleGrammarDetail;