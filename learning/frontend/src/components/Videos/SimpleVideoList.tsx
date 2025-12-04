import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Card, Row, Col, Statistic, Input, Select, Tag, Button } from 'antd';
import { PlayCircleOutlined, EyeOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { videoAPI } from '../../services/api';
import { VideoLesson } from '../../types';
import { useResponsive } from '../Utils/ResponsiveProvider';

const { Search } = Input;
const { Option } = Select;

const SimpleVideoList: React.FC = () => {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  const [videos, setVideos] = useState<VideoLesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>({});
  const [total, setTotal] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  
  // Debounce timer reference
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Debounce delay in milliseconds
  const DEBOUNCE_DELAY = 500;
  
  // Debounce function for search inputs
  const debounceSearch = useCallback((func: () => void) => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    searchTimerRef.current = setTimeout(() => {
      func();
    }, DEBOUNCE_DELAY);
  }, []);

  useEffect(() => {
    fetchVideos();
    fetchStats();
  }, []);
  
  // Effect for debouncing search
  useEffect(() => {
    if (searchText !== debouncedSearchText) {
      debounceSearch(() => {
        setDebouncedSearchText(searchText);
        fetchVideos();
      });
    }
  }, [searchText, debounceSearch]);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (debouncedSearchText) params.search = debouncedSearchText;
      if (levelFilter) params.level = levelFilter;

      const response = await videoAPI.getAll(params);
      const data = response.data;
      
      if ('results' in data) {
        setVideos(data.results);
        setTotal(data.count);
      } else {
        const videos = Array.isArray(data) ? data : [];
        setVideos(videos);
        setTotal(videos.length);
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await videoAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    // fetchVideos() will be called by the debounce effect
  };

  const handleFilterChange = () => {
    fetchVideos();
  };

  const columns = [
    {
      title: 'Video',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: VideoLesson) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {record.thumbnail ? (
            <img 
              src={record.thumbnail} 
              alt={title}
              style={{ 
                width: 80, 
                height: 45, 
                objectFit: 'cover', 
                borderRadius: 4,
                backgroundColor: '#f0f0f0'
              }}
            />
          ) : (
            <div style={{ 
              width: 80, 
              height: 45, 
              backgroundColor: '#f0f0f0', 
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <PlayCircleOutlined style={{ fontSize: 20, color: '#999' }} />
            </div>
          )}
          <div>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>{title}</div>
            {record.description && (
              <div style={{ 
                color: '#666', 
                fontSize: '12px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: 300
              }}>
                {record.description}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      render: (level: string) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <Tag color={
              level === 'beginner' ? 'green' : 
              level === 'intermediate' ? 'orange' : 
              level === 'advanced' ? 'red' : 'blue'
            }>
              {level?.toUpperCase()}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: number) => {
        const mins = Math.floor(duration / 60);
        const secs = duration % 60;
        const formatted = `${mins}:${secs.toString().padStart(2, '0')}`;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <ClockCircleOutlined />
            {formatted}
          </div>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'published' ? 'green' : 'orange'}>
          {status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Action',
      key: 'action',
      render: (text: any, record: VideoLesson) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/videos/${record.id}`)}
        >
          Watch Video
        </Button>
      ),
    },
  ];  return (
    <div>
      <h1>Video Lessons</h1>
      
      {/* Stats Cards */}
      <Row gutter={isMobile ? 8 : 16} style={{ marginBottom: isMobile ? 16 : 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Total Videos"
              value={stats.total_videos || 0}
              valueStyle={{ color: '#3f8600' }}
              prefix={<PlayCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Total Views"
              value={stats.total_views || 0}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Total Duration"
              value={stats.total_duration ? Math.floor(stats.total_duration / 60) + 'm' : '0m'}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Beginner"
              value={stats.by_level?.beginner || stats.by_category?.beginner || 0}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Search
              placeholder="Search videos..."
              allowClear
              onChange={(e) => handleSearch(e.target.value)}
              onSearch={handleSearch}
              style={{ width: 250, marginRight: 16 }}
            />
            <Select
              placeholder="Filter by level"
              allowClear
              style={{ width: 150 }}
              value={levelFilter}
              onChange={(value) => {
                setLevelFilter(value || '');
                handleFilterChange();
              }}
            >
              <Option value="beginner">Beginner</Option>
              <Option value="elementary">Elementary</Option>
              <Option value="pre_intermediate">Pre-Intermediate</Option>
              <Option value="intermediate">Intermediate</Option>
              <Option value="upper_intermediate">Upper-Intermediate</Option>
              <Option value="advanced">Advanced</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={isMobile ? 
            columns.filter(col => col.key !== 'status' && col.key !== 'created_at') : 
            columns}
          dataSource={videos}
          loading={loading}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            size: isMobile ? 'small' : 'default',
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
          }}
          scroll={isMobile ? { x: true } : undefined}
          size={isMobile ? 'small' : 'middle'}
        />
      </Card>
    </div>
  );
};

export default SimpleVideoList;