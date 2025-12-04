import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Typography, Statistic, Spin, Alert, Progress, Tabs, List, Tag } from 'antd';
import { BookOutlined, VideoCameraOutlined, ReadOutlined, UserOutlined } from '@ant-design/icons';
import dashboardAPI from '../../services/dashboardAPI';
import { useAuth } from '../../contexts/AuthContext';
import { UserDashboard, SystemDashboard } from '../../types';
import { useResponsive } from '../Utils/ResponsiveProvider';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isMobile } = useResponsive();
  const [userDashboard, setUserDashboard] = useState<UserDashboard | null>(null);
  const [systemDashboard, setSystemDashboard] = useState<SystemDashboard | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Get user dashboard data
        const userResponse = await dashboardAPI.getUserDashboard();
        setUserDashboard(userResponse.data);

        // Get system dashboard data if user is admin
        if (user?.role === 'admin') {
          const systemResponse = await dashboardAPI.getSystemDashboard();
          setSystemDashboard(systemResponse.data);
        }
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
      />
    );
  }

  return (
    <div className="dashboard-container">
      <Title level={2} style={{ fontSize: isMobile ? '1.5em' : '2em' }}>Dashboard</Title>
      <Text type="secondary">Welcome back, {user?.full_name || user?.username}</Text>

      {userDashboard && (
        <Tabs 
          defaultActiveKey="overview"
          size="middle"
        >
          <TabPane tab="Overview" key="overview">
            <Row gutter={isMobile ? [8, 8] : [16, 16]} className="stats-row">
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Grammar Lessons"
                    value={userDashboard.total_grammar_lessons}
                    prefix={<BookOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Video Lessons"
                    value={userDashboard.total_video_lessons}
                    prefix={<VideoCameraOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Vocabulary Words"
                    value={userDashboard.total_vocabulary_words}
                    prefix={<ReadOutlined />}
                  />
                </Card>
              </Col>
            </Row>

            {/* Progress section - for students */}
            {user?.role === 'student' && userDashboard.completed_grammar && (
              <Card title="Your Progress" className="progress-card">
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Text>Grammar Lessons</Text>
                    <Progress 
                      percent={userDashboard.completed_grammar.percentage} 
                      format={() => `${userDashboard.completed_grammar?.completed}/${userDashboard.completed_grammar?.total}`} 
                    />
                  </Col>
                  <Col span={24}>
                    <Text>Video Lessons</Text>
                    <Progress 
                      percent={userDashboard.completed_videos?.percentage} 
                      format={() => `${userDashboard.completed_videos?.completed}/${userDashboard.completed_videos?.total}`} 
                    />
                  </Col>
                  <Col span={24}>
                    <Text>Vocabulary Mastered</Text>
                    <Progress 
                      percent={userDashboard.vocabulary_mastered?.percentage} 
                      format={() => `${userDashboard.vocabulary_mastered?.completed}/${userDashboard.vocabulary_mastered?.total}`} 
                    />
                  </Col>
                </Row>
              </Card>
            )}

            {/* Created Content section - for teachers */}
            {user?.role === 'teacher' && userDashboard.created_content && (
              <Card title="Your Created Content" className="content-card">
                <Row gutter={isMobile ? [8, 8] : [16, 16]}>
                  <Col xs={24} sm={8}>
                    <Card size="small" title="Grammar">
                      <Statistic title="Total" value={userDashboard.created_content.grammar.total} />
                      <Statistic title="Published" value={userDashboard.created_content.grammar.published} />
                      <Statistic title="Draft" value={userDashboard.created_content.grammar.draft} />
                    </Card>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Card size="small" title="Videos">
                      <Statistic title="Total" value={userDashboard.created_content.videos.total} />
                      <Statistic title="Published" value={userDashboard.created_content.videos.published} />
                      <Statistic title="Draft" value={userDashboard.created_content.videos.draft} />
                    </Card>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Card size="small" title="Vocabulary">
                      <Statistic title="Total" value={userDashboard.created_content.vocabulary.total} />
                      <Statistic title="Published" value={userDashboard.created_content.vocabulary.published} />
                      <Statistic title="Draft" value={userDashboard.created_content.vocabulary.draft} />
                    </Card>
                  </Col>
                </Row>
              </Card>
            )}

            {/* Categories */}
            <Card title="Categories" className="categories-card">
              <List
                dataSource={userDashboard.categories}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.name}
                      description={`Grammar Lessons: ${item.grammar_count}`}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </TabPane>

          {user?.role === 'admin' && systemDashboard && (
            <TabPane tab="System Overview" key="system">
              <Row gutter={isMobile ? [8, 8] : [16, 16]} className="stats-row">
                <Col xs={24} sm={12}>
                  <Card>
                    <Statistic
                      title="Total Users"
                      value={systemDashboard.total_users}
                      prefix={<UserOutlined />}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12}>
                  <Card>
                    <Statistic
                      title="Total Content Items"
                      value={systemDashboard.total_content}
                    />
                  </Card>
                </Col>
              </Row>
              
              {/* User Stats */}
              <Card title="User Statistics" className="user-stats-card">
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={8}>
                    <Statistic title="Students" value={systemDashboard.user_stats.by_role.students} />
                  </Col>
                  <Col xs={24} sm={8}>
                    <Statistic title="Teachers" value={systemDashboard.user_stats.by_role.teachers} />
                  </Col>
                  <Col xs={24} sm={8}>
                    <Statistic title="Admins" value={systemDashboard.user_stats.by_role.admins} />
                  </Col>
                  <Col xs={24} sm={12}>
                    <Statistic title="Active Users" value={systemDashboard.user_stats.active_users} />
                  </Col>
                  <Col xs={24} sm={12}>
                    <Statistic title="Verified Users" value={systemDashboard.user_stats.verified_users} />
                  </Col>
                </Row>
              </Card>
              
              {/* Content Stats */}
              <Card title="Content Statistics" className="content-stats-card">
                <Tabs defaultActiveKey="byType">
                  <TabPane tab="By Type" key="byType">
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={8}>
                        <Card size="small" title="Grammar">
                          <Statistic title="Total" value={systemDashboard.content_stats.grammar.total} />
                          <Statistic title="Published" value={systemDashboard.content_stats.grammar.published} />
                          <Statistic title="Draft" value={systemDashboard.content_stats.grammar.draft} />
                        </Card>
                      </Col>
                      <Col xs={24} sm={8}>
                        <Card size="small" title="Videos">
                          <Statistic title="Total" value={systemDashboard.content_stats.videos.total} />
                          <Statistic title="Published" value={systemDashboard.content_stats.videos.published} />
                          <Statistic title="Draft" value={systemDashboard.content_stats.videos.draft} />
                        </Card>
                      </Col>
                      <Col xs={24} sm={8}>
                        <Card size="small" title="Vocabulary">
                          <Statistic title="Total" value={systemDashboard.content_stats.vocabulary.total} />
                          <Statistic title="Published" value={systemDashboard.content_stats.vocabulary.published} />
                          <Statistic title="Draft" value={systemDashboard.content_stats.vocabulary.draft} />
                        </Card>
                      </Col>
                    </Row>
                  </TabPane>
                  <TabPane tab="By Level" key="byLevel">
                    <Row gutter={[16, 16]}>
                      <Col span={8}>
                        <Card>
                          <Statistic 
                            title="Beginner" 
                            value={systemDashboard.content_stats.by_level.beginner} 
                          />
                        </Card>
                      </Col>
                      <Col span={8}>
                        <Card>
                          <Statistic 
                            title="Intermediate" 
                            value={systemDashboard.content_stats.by_level.intermediate} 
                          />
                        </Card>
                      </Col>
                      <Col span={8}>
                        <Card>
                          <Statistic 
                            title="Advanced" 
                            value={systemDashboard.content_stats.by_level.advanced} 
                          />
                        </Card>
                      </Col>
                    </Row>
                  </TabPane>
                </Tabs>
              </Card>
            </TabPane>
          )}
        </Tabs>
      )}
    </div>
  );
};

export default Dashboard;