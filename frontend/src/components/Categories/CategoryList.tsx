import React, { useState, useEffect } from 'react';
import { Card, List, Typography, Tag, Space, Spin, Alert, Grid } from 'antd';
import { FolderOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { categoryAPI } from '../../services/api';
import { Category } from '../../types';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

interface CategoryListProps {
  onCategorySelect?: (category: Category) => void;
  selectedCategoryId?: number;
}

const CategoryList: React.FC<CategoryListProps> = ({ 
  onCategorySelect, 
  selectedCategoryId 
}) => {
  const { t } = useTranslation();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await categoryAPI.getAll();
      setCategories(response.data.results || response.data);
    } catch (error: any) {
      setError(t('categories.failedToLoad'));
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: isMobile ? '16px' : '20px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px', fontSize: isMobile ? '13px' : '14px' }}>
            {t('categories.loading')}
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Alert
          message={t('common.error')}
          description={error}
          type="error"
          showIcon
          action={
            <button 
              onClick={fetchCategories} 
              style={{ 
                border: 'none', 
                background: 'none', 
                color: '#1890ff', 
                cursor: 'pointer',
                fontSize: isMobile ? '12px' : '14px'
              }}
            >
              {t('categories.retry')}
            </button>
          }
        />
      </Card>
    );
  }

  return (
    <Card>
      <Title level={isMobile ? 5 : 4} style={{ marginBottom: '16px' }}>
        <FolderOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
        {t('categories.title')}
      </Title>

      <List
        dataSource={categories}
        size={isMobile ? 'small' : 'default'}
        renderItem={(category) => (
          <List.Item
            onClick={() => onCategorySelect?.(category)}
            style={{
              cursor: onCategorySelect ? 'pointer' : 'default',
              backgroundColor: selectedCategoryId === category.id ? '#f0f7ff' : 'transparent',
              borderRadius: '6px',
              padding: isMobile ? '8px' : '12px',
              marginBottom: '8px',
              border: selectedCategoryId === category.id ? '1px solid #1890ff' : '1px solid transparent'
            }}
          >
            <List.Item.Meta
              avatar={<FolderOutlined style={{ fontSize: isMobile ? '16px' : '18px', color: '#1890ff' }} />}
              title={
                <Space>
                  <Text strong style={{ fontSize: isMobile ? '13px' : '14px' }}>{category.name}</Text>
                  {selectedCategoryId === category.id && (
                    <Tag color="blue" style={{ fontSize: isMobile ? '11px' : '12px' }}>
                      {t('categories.selected')}
                    </Tag>
                  )}
                </Space>
              }
              description={
                <Text type="secondary" style={{ fontSize: isMobile ? '11px' : '12px' }}>
                  {t('categories.created')}: {new Date(category.created_at).toLocaleDateString()}
                </Text>
              }
            />
          </List.Item>
        )}
        locale={{
          emptyText: (
            <div style={{ textAlign: 'center', padding: isMobile ? '16px' : '20px' }}>
              <FolderOutlined style={{ fontSize: isMobile ? '36px' : '48px', color: '#d9d9d9' }} />
              <div style={{ marginTop: '16px', color: '#999', fontSize: isMobile ? '12px' : '14px' }}>
                {t('categories.noCategories')}
              </div>
            </div>
          )
        }}
      />

      {categories.length > 0 && (
        <div style={{ 
          marginTop: '16px', 
          textAlign: 'center', 
          color: '#999', 
          fontSize: isMobile ? '11px' : '12px' 
        }}>
          {t('dashboard.total')}: {categories.length} {t('categories.categories')}
        </div>
      )}
    </Card>
  );
};;

export default CategoryList;