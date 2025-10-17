import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Card, Row, Col, Statistic, Input, Select, Tag, Button, Space, Slider, Grid } from 'antd';
import { BookOutlined, EyeOutlined, FilterOutlined, ClearOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { grammarAPI, categoryAPI } from '../../services/api';
import { GrammarLesson, Category } from '../../types';

const { Search } = Input;
const { Option } = Select;
const { useBreakpoint } = Grid;

const SimpleGrammarList: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
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
      title: t('grammar.lesson'),
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
            <div style={{ fontWeight: 500, marginBottom: 8, fontSize: isMobile ? '14px' : '16px' }}>
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
                {record.status === 'published' ? `✅ ${t('dashboard.published')}` : `📝 ${t('dashboard.draft')}`}
              </Tag>
            </Space>
          </div>
        );
      },
    },
    {
      title: t('grammar.duration'),
      dataIndex: 'estimated_duration',
      key: 'duration',
      sorter: true,
      width: isMobile ? 80 : 100,
      render: (duration: number) => (
        <Tag color="purple" style={{ borderRadius: '8px' }}>
          ⏱️ {duration} {t('grammar.min')}
        </Tag>
      ),
    },
    {
      title: t('grammar.contentPreview'),
      dataIndex: 'content',
      key: 'content',
      width: isMobile ? 200 : 300,
      render: (content: string) => (
        <div style={{ 
          maxHeight: '60px', 
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          color: '#666',
          fontSize: isMobile ? '12px' : '13px',
          lineHeight: '1.4'
        }}>
          {content?.substring(0, 120)}
          {content?.length > 120 && '...'}
        </div>
      ),
    },
    {
      title: t('grammar.created'),
      dataIndex: 'created_at',
      key: 'created_at',
      sorter: true,
      width: isMobile ? 100 : 120,
      render: (date: string) => (
        <div style={{ fontSize: '12px', color: '#666' }}>
          {new Date(date).toLocaleDateString()}
        </div>
      ),
    },
    {
      title: t('grammar.action'),
      key: 'action',
      width: isMobile ? 100 : 150,
      render: (_: any, record: GrammarLesson) => (
        <Button
          type="primary"
          icon={!isMobile && <EyeOutlined />}
          onClick={() => navigate(`/grammar/${record.id}`)}
          style={{ borderRadius: '6px', fontSize: isMobile ? '12px' : '14px' }}
          size={isMobile ? 'small' : 'middle'}
        >
          {isMobile ? t('grammar.view') : t('grammar.viewDetails')}
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: isMobile ? '12px' : '24px' }}>
      <h1 style={{ fontSize: isMobile ? '20px' : '28px', marginBottom: '16px' }}>{t('grammar.title')}</h1>
      
      {/* Category Filter Section */}
      {categories.length > 0 && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 12, fontSize: isMobile ? '13px' : '14px' }}>
            <strong>📚 {t('grammar.browseByCategory')}:</strong>
          </div>
          <Space wrap>
            <Tag 
              color={!categoryFilter ? 'blue' : 'default'}
              style={{ 
                cursor: 'pointer',
                fontSize: isMobile ? '11px' : '12px',
                padding: '4px 8px',
                borderRadius: '12px'
              }}
              onClick={() => setCategoryFilter('')}
            >
              {t('grammar.allCategories')}
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
        <div style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between', 
          alignItems: isMobile ? 'flex-start' : 'center', 
          marginBottom: 16,
          gap: isMobile ? '12px' : '0'
        }}>
          <h3 style={{ margin: 0, fontSize: isMobile ? '16px' : '18px' }}>🔍 {t('grammar.searchAndFilters')}</h3>
          <Space>
            <Button 
              icon={<FilterOutlined />}
              onClick={() => setShowFilters(!showFilters)}
              size={isMobile ? 'small' : 'middle'}
            >
              {showFilters ? t('grammar.hideFilters') : t('grammar.showFilters')}
            </Button>
            <Button 
              icon={<ClearOutlined />}
              onClick={clearFilters}
              size={isMobile ? 'small' : 'middle'}
            >
              {t('grammar.clearAll')}
            </Button>
          </Space>
        </div>

        {/* Search Bar */}
        <Row gutter={[16, 16]} style={{ marginBottom: showFilters ? 16 : 0 }}>
          <Col xs={24} sm={24} md={12}>
            <Search
              placeholder={t('grammar.search')}
              allowClear
              enterButton={<SearchOutlined />}
              size={isMobile ? 'middle' : 'large'}
              onSearch={handleSearch}
              onChange={(e) => setSearchText(e.target.value)}
              value={searchText}
            />
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Select
              placeholder={t('grammar.sortBy')}
              style={{ width: '100%' }}
              size={isMobile ? 'middle' : 'large'}
              value={sortOrder}
              onChange={setSortOrder}
            >
              <Option value="created_at">{t('grammar.newestFirst')}</Option>
              <Option value="-created_at">{t('grammar.oldestFirst')}</Option>
              <Option value="title">{t('grammar.titleAZ')}</Option>
              <Option value="-title">{t('grammar.titleZA')}</Option>
              <Option value="estimated_duration">{t('grammar.durationShort')}</Option>
              <Option value="-estimated_duration">{t('grammar.durationLong')}</Option>
            </Select>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <div style={{ 
              textAlign: 'center', 
              padding: isMobile ? '6px 0' : '8px 0', 
              background: '#f5f5f5', 
              borderRadius: '6px',
              fontSize: isMobile ? '12px' : '14px'
            }}>
              <strong>{t('dashboard.total')}: {total} {t('grammar.lessons')}</strong>
            </div>
          </Col>
        </Row>

        {/* Advanced Filters (Collapsible) */}
        {showFilters && (
          <div style={{ 
            padding: isMobile ? '12px' : '16px', 
            background: '#fafafa', 
            borderRadius: '8px',
            border: '1px solid #e8e8e8'
          }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <div style={{ marginBottom: 8, fontSize: isMobile ? '13px' : '14px' }}>
                  <strong>{t('grammar.category')}:</strong>
                </div>
                <Select
                  placeholder={t('grammar.selectCategory')}
                  allowClear
                  style={{ width: '100%' }}
                  value={categoryFilter || undefined}
                  onChange={setCategoryFilter}
                  size={isMobile ? 'middle' : 'large'}
                >
                  {categories.map(category => (
                    <Option key={category.id} value={category.name}>
                      {category.name}
                    </Option>
                  ))}
                </Select>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <div style={{ marginBottom: 8, fontSize: isMobile ? '13px' : '14px' }}>
                  <strong>{t('grammar.status')}:</strong>
                </div>
                <Select
                  placeholder={t('grammar.selectStatus')}
                  allowClear
                  style={{ width: '100%' }}
                  value={statusFilter || undefined}
                  onChange={setStatusFilter}
                  size={isMobile ? 'middle' : 'large'}
                >
                  <Option value="published">✅ {t('dashboard.published')}</Option>
                  <Option value="draft">📝 {t('dashboard.draft')}</Option>
                </Select>
              </Col>
              
              <Col xs={24} sm={24} md={12}>
                <div style={{ marginBottom: 8, fontSize: isMobile ? '13px' : '14px' }}>
                  <strong>{t('grammar.durationRange')}: {durationRange[0]} - {durationRange[1]} {t('grammar.minutes')}</strong>
                </div>
                <Slider
                  range
                  min={0}
                  max={120}
                  value={durationRange}
                  onChange={(value) => setDurationRange(value as [number, number])}
                  marks={{
                    0: '0',
                    30: '30',
                    60: '60',
                    90: '90',
                    120: '120'
                  }}
                />
              </Col>
            </Row>
          </div>
        )}
      </Card>
      
      
      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title={t('grammar.totalLessons')}
              value={stats.total_lessons || 0}
              valueStyle={{ color: '#3f8600', fontSize: isMobile ? '20px' : '24px' }}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card>
            <Statistic
              title={t('grammar.beginner')}
              value={stats.by_category?.beginner || stats.by_level?.beginner || 0}
              valueStyle={{ color: '#52c41a', fontSize: isMobile ? '20px' : '24px' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card>
            <Statistic
              title={t('grammar.advanced')}
              value={stats.by_category?.advanced || stats.by_level?.advanced || 0}
              valueStyle={{ color: '#1890ff', fontSize: isMobile ? '20px' : '24px' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Card 
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: isMobile ? '14px' : '16px' }}>📖 {t('grammar.title')}</span>
            <Tag color="blue" style={{ fontSize: isMobile ? '11px' : '12px' }}>
              {grammar.length} {t('grammar.of')} {total} {t('grammar.lessons')}
            </Tag>
          </div>
        }
        extra={
          !isMobile && (
            <Button 
              type="primary" 
              style={{ borderRadius: '6px' }}
              onClick={() => window.location.reload()}
            >
              🔄 {t('grammar.refresh')}
            </Button>
          )
        }
      >
        <Table
          columns={columns}
          dataSource={grammar}
          loading={loading}
          rowKey="id"
          scroll={{ x: 'max-content' }}
          size={isMobile ? 'small' : 'middle'}
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