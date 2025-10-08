import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Card, Row, Col, Statistic, Input, Select, Tag, Button, Space, Slider } from 'antd';
import { BookOutlined, EyeOutlined, FilterOutlined, ClearOutlined, SearchOutlined } from '@ant-design/icons';
import { grammarAPI, categoryAPI } from '../../services/api';
import { GrammarLesson, Category } from '../../types';

const { Search } = Input;
const { Option } = Select;

const SimpleGrammarList: React.FC = () => {
  const navigate = useNavigate();
  const [grammar, setGrammar] = useState<GrammarLesson[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>({});
  const [total, setTotal] = useState(0);
  
  // Filter states
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [durationRange, setDurationRange] = useState<[number, number]>([0, 120]);
  const [sortOrder, setSortOrder] = useState('created_at');
  const [showFilters, setShowFilters] = useState(false);

  const fetchGrammar = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (searchText) params.search = searchText;
      if (categoryFilter) params.category__name__icontains = categoryFilter;
      if (statusFilter) params.status = statusFilter;
      if (durationRange[0] > 0) params.estimated_duration__gte = durationRange[0];
      if (durationRange[1] < 120) params.estimated_duration__lte = durationRange[1];
      if (sortOrder) params.ordering = sortOrder;

      const response = await grammarAPI.getAll(params);
      const data = response.data;
      
      if ('results' in data) {
        setGrammar(data.results);
        setTotal(data.count);
      } else {
        const lessons = Array.isArray(data) ? data : [];
        setGrammar(lessons);
        setTotal(lessons.length);
      }
    } catch (error) {
      console.error('Failed to fetch grammar:', error);
    } finally {
      setLoading(false);
    }
  }, [searchText, categoryFilter, statusFilter, durationRange, sortOrder]);

  useEffect(() => {
    fetchGrammar();
    fetchStats();
    fetchCategories();
  }, [fetchGrammar]);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      const data = response.data;
      if ('results' in data) {
        setCategories(data.results);
      } else {
        setCategories(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await grammarAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const clearFilters = () => {
    setSearchText('');
    setCategoryFilter('');
    setStatusFilter('');
    setDurationRange([0, 120]);
    setSortOrder('created_at');
    // Will trigger useEffect to refetch
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  // Remove unused function
  // const handleFilterChange = () => {
  //   fetchGrammar();
  // };

  const columns = [
    {
      title: 'Lesson',
      dataIndex: 'title',
      key: 'title',
      sorter: true,
      render: (text: string, record: GrammarLesson) => {
        const getCategoryColor = (categoryName: string) => {
          const name = categoryName?.toLowerCase();
          if (name?.includes('beginner')) return 'green';
          if (name?.includes('intermediate')) return 'orange';
          if (name?.includes('advanced')) return 'red';
          if (name?.includes('basic')) return 'blue';
          if (name?.includes('conversation')) return 'purple';
          if (name?.includes('business')) return 'gold';
          if (name?.includes('academic')) return 'magenta';
          return 'default';
        };
        
        return (
          <div>
            <div style={{ fontWeight: 500, marginBottom: 8, fontSize: '16px' }}>
              {text}
            </div>
            <Space>
              {record.category && (
                <Tag 
                  color={getCategoryColor(record.category.name)} 
                  style={{ 
                    fontSize: '11px',
                    fontWeight: '500',
                    borderRadius: '10px',
                    padding: '1px 6px'
                  }}
                >
                  📚 {record.category.name}
                </Tag>
              )}
              <Tag 
                color={record.status === 'published' ? 'green' : 'orange'}
                style={{ 
                  fontSize: '11px',
                  borderRadius: '10px',
                  padding: '1px 6px'
                }}
              >
                {record.status === 'published' ? '✅ Published' : '📝 Draft'}
              </Tag>
            </Space>
          </div>
        );
      },
    },
    {
      title: 'Duration',
      dataIndex: 'estimated_duration',
      key: 'duration',
      sorter: true,
      width: 100,
      render: (duration: number) => (
        <Tag color="purple" style={{ borderRadius: '8px' }}>
          ⏱️ {duration} min
        </Tag>
      ),
    },
    {
      title: 'Content Preview',
      dataIndex: 'content',
      key: 'content',
      width: 300,
      render: (content: string) => (
        <div style={{ 
          maxHeight: '60px', 
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          color: '#666',
          fontSize: '13px',
          lineHeight: '1.4'
        }}>
          {content?.substring(0, 120)}
          {content?.length > 120 && '...'}
        </div>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      sorter: true,
      width: 120,
      render: (date: string) => (
        <div style={{ fontSize: '12px', color: '#666' }}>
          {new Date(date).toLocaleDateString()}
        </div>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 150,
      render: (_: any, record: GrammarLesson) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/grammar/${record.id}`)}
          style={{ borderRadius: '6px' }}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h1>Grammar Lessons</h1>
      
      {/* Category Filter Section */}
      {categories.length > 0 && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 12 }}>
            <strong>📚 Browse by Category:</strong>
          </div>
          <Space wrap>
            <Tag 
              color={!categoryFilter ? 'blue' : 'default'}
              style={{ 
                cursor: 'pointer',
                fontSize: '12px',
                padding: '4px 8px',
                borderRadius: '12px'
              }}
              onClick={() => setCategoryFilter('')}
            >
              All Categories
            </Tag>
            {categories.map(category => {
              const getCategoryColor = (categoryName: string) => {
                const name = categoryName?.toLowerCase();
                if (name?.includes('beginner')) return 'green';
                if (name?.includes('intermediate')) return 'orange';
                if (name?.includes('advanced')) return 'red';
                if (name?.includes('basic')) return 'blue';
                if (name?.includes('conversation')) return 'purple';
                if (name?.includes('business')) return 'gold';
                if (name?.includes('academic')) return 'magenta';
                return 'default';
              };
              
              return (
                <Tag
                  key={category.id}
                  color={categoryFilter === category.name ? getCategoryColor(category.name) : 'default'}
                  style={{ 
                    cursor: 'pointer',
                    fontSize: '12px',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontWeight: categoryFilter === category.name ? '500' : 'normal'
                  }}
                  onClick={() => setCategoryFilter(category.name)}
                >
                  {category.name}
                </Tag>
              );
            })}
          </Space>
        </Card>
      )}

      {/* Advanced Filters */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>🔍 Search & Filters</h3>
          <Space>
            <Button 
              icon={<FilterOutlined />}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            <Button 
              icon={<ClearOutlined />}
              onClick={clearFilters}
            >
              Clear All
            </Button>
          </Space>
        </div>

        {/* Search Bar */}
        <Row gutter={16} style={{ marginBottom: showFilters ? 16 : 0 }}>
          <Col span={12}>
            <Search
              placeholder="Search lessons by title, content, or examples..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
              onChange={(e) => setSearchText(e.target.value)}
              value={searchText}
            />
          </Col>
          <Col span={6}>
            <Select
              placeholder="Sort by"
              style={{ width: '100%' }}
              size="large"
              value={sortOrder}
              onChange={setSortOrder}
            >
              <Option value="created_at">Newest First</Option>
              <Option value="-created_at">Oldest First</Option>
              <Option value="title">Title A-Z</Option>
              <Option value="-title">Title Z-A</Option>
              <Option value="estimated_duration">Duration (Short First)</Option>
              <Option value="-estimated_duration">Duration (Long First)</Option>
            </Select>
          </Col>
          <Col span={6}>
            <div style={{ textAlign: 'center', padding: '8px 0', background: '#f5f5f5', borderRadius: '6px' }}>
              <strong>Total: {total} lessons</strong>
            </div>
          </Col>
        </Row>

        {/* Advanced Filters (Collapsible) */}
        {showFilters && (
          <div style={{ 
            padding: '16px', 
            background: '#fafafa', 
            borderRadius: '8px',
            border: '1px solid #e8e8e8'
          }}>
            <Row gutter={16}>
              <Col span={6}>
                <div style={{ marginBottom: 8 }}>
                  <strong>Category:</strong>
                </div>
                <Select
                  placeholder="Select category"
                  allowClear
                  style={{ width: '100%' }}
                  value={categoryFilter || undefined}
                  onChange={setCategoryFilter}
                >
                  {categories.map(category => (
                    <Option key={category.id} value={category.name}>
                      {category.name}
                    </Option>
                  ))}
                </Select>
              </Col>
              
              <Col span={6}>
                <div style={{ marginBottom: 8 }}>
                  <strong>Status:</strong>
                </div>
                <Select
                  placeholder="Select status"
                  allowClear
                  style={{ width: '100%' }}
                  value={statusFilter || undefined}
                  onChange={setStatusFilter}
                >
                  <Option value="published">✅ Published</Option>
                  <Option value="draft">📝 Draft</Option>
                </Select>
              </Col>
              
              <Col span={12}>
                <div style={{ marginBottom: 8 }}>
                  <strong>Duration Range: {durationRange[0]} - {durationRange[1]} minutes</strong>
                </div>
                <Slider
                  range
                  min={0}
                  max={120}
                  value={durationRange}
                  onChange={(value) => setDurationRange(value as [number, number])}
                  marks={{
                    0: '0min',
                    30: '30min',
                    60: '1hr',
                    90: '1.5hr',
                    120: '2hr+'
                  }}
                />
              </Col>
            </Row>
          </div>
        )}
      </Card>
      
      {/* Stats Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Lessons"
              value={stats.total_lessons || 0}
              valueStyle={{ color: '#3f8600' }}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Beginner"
              value={stats.by_category?.beginner || stats.by_level?.beginner || 0}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Advanced"
              value={stats.by_category?.advanced || stats.by_level?.advanced || 0}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Card 
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>📖 Grammar Lessons</span>
            <Tag color="blue" style={{ fontSize: '12px' }}>
              {grammar.length} of {total} lessons
            </Tag>
          </div>
        }
        extra={
          <Button 
            type="primary" 
            style={{ borderRadius: '6px' }}
            onClick={() => window.location.reload()}
          >
            🔄 Refresh
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={grammar}
          loading={loading}
          rowKey="id"
          scroll={{ x: 'max-content' }}
          pagination={{
            current: 1,
            pageSize: 10,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `Showing ${range[0]}-${range[1]} of ${total} lessons`,
            pageSizeOptions: ['5', '10', '20', '50'],
            size: 'default',
          }}
        />
      </Card>
    </div>
  );
};

export default SimpleGrammarList;