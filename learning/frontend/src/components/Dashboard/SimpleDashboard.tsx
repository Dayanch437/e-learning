import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Button } from 'antd';
import { BookOutlined, PlayCircleOutlined, TranslationOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { grammarAPI, videoAPI, vocabularyAPI } from '../../services/api';

const { Title, Paragraph } = Typography;

const SimpleDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>({
    grammar: {},
    videos: {},
    vocabulary: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllStats();
  }, []);

  const fetchAllStats = async () => {
    try {
      const [grammarStats, videoStats, vocabularyStats] = await Promise.all([
        grammarAPI.getStats(),
        videoAPI.getStats(),
        vocabularyAPI.getStats()
      ]);

      setStats({
        grammar: grammarStats.data,
        videos: videoStats.data,
        vocabulary: vocabularyStats.data
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <Title level={2}>Welcome to Turkmen-English Learning Platform</Title>
        <Paragraph style={{ fontSize: 16, color: '#666' }}>
          Learn Turkmen and English through our comprehensive lessons, videos, and vocabulary.
          All content is freely accessible - no registration required!
        </Paragraph>
      </div>

      {/* Main Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col span={8}>
          <Card
            hoverable
            onClick={() => navigate('/grammar')}
            style={{ cursor: 'pointer' }}
          >
            <Statistic
              title="Grammar Lessons"
              value={stats.grammar.total_lessons || 0}
              valueStyle={{ color: '#3f8600' }}
              prefix={<BookOutlined />}
            />
            <div style={{ marginTop: 16 }}>
              <Button type="primary" icon={<EyeOutlined />} block>
                View Grammar Lessons
              </Button>
            </div>
          </Card>
        </Col>
        
        <Col span={8}>
          <Card
            hoverable
            onClick={() => navigate('/videos')}
            style={{ cursor: 'pointer' }}
          >
            <Statistic
              title="Video Lessons"
              value={stats.videos.total_videos || 0}
              valueStyle={{ color: '#1890ff' }}
              prefix={<PlayCircleOutlined />}
            />
            <div style={{ marginTop: 16 }}>
              <Button type="primary" icon={<PlayCircleOutlined />} block>
                Watch Videos
              </Button>
            </div>
          </Card>
        </Col>
        
        <Col span={8}>
          <Card
            hoverable
            onClick={() => navigate('/vocabulary')}
            style={{ cursor: 'pointer' }}
          >
            <Statistic
              title="Vocabulary Words"
              value={stats.vocabulary.total_words || 0}
              valueStyle={{ color: '#722ed1' }}
              prefix={<TranslationOutlined />}
            />
            <div style={{ marginTop: 16 }}>
              <Button type="primary" icon={<TranslationOutlined />} block>
                Browse Vocabulary
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Level Distribution */}
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="Content by Level" loading={loading}>
            <Row gutter={[8, 8]}>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title="Beginner"
                    value={(
                      (stats.grammar.by_category?.beginner || stats.grammar.by_level?.beginner || 0) +
                      (stats.videos.by_level?.beginner || stats.videos.by_category?.beginner || 0) +
                      (stats.vocabulary.by_level?.beginner || stats.vocabulary.by_category?.beginner || 0)
                    )}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title="Intermediate"
                    value={(
                      (stats.grammar.by_category?.intermediate || stats.grammar.by_level?.intermediate || 0) +
                      (stats.videos.by_level?.intermediate || stats.videos.by_category?.intermediate || 0) +
                      (stats.vocabulary.by_level?.intermediate || stats.vocabulary.by_category?.intermediate || 0)
                    )}
                    valueStyle={{ color: '#fa8c16' }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title="Advanced"
                    value={(
                      (stats.grammar.by_category?.advanced || stats.grammar.by_level?.advanced || 0) +
                      (stats.videos.by_level?.advanced || stats.videos.by_category?.advanced || 0) +
                      (stats.vocabulary.by_level?.advanced || stats.vocabulary.by_category?.advanced || 0)
                    )}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title="Total Content"
                    value={(
                      (stats.grammar.total_lessons || 0) +
                      (stats.videos.total_videos || 0) +
                      (stats.vocabulary.total_words || 0)
                    )}
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="Quick Actions">
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Button size="large" block onClick={() => navigate('/grammar')}>
                Start with Grammar Basics
              </Button>
              <Button size="large" block onClick={() => navigate('/videos')}>
                Watch Learning Videos
              </Button>
              <Button size="large" block onClick={() => navigate('/vocabulary')}>
                Practice Vocabulary
              </Button>
              <Button size="large" block type="dashed" onClick={() => navigate('/api-test')}>
                Test API Connections
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SimpleDashboard;