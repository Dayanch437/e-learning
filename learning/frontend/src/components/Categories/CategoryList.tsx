import React, { useState, useEffect } from 'react';
import { Card, List, Typography, Tag, Space, Spin, Alert } from 'antd';
import { FolderOutlined } from '@ant-design/icons';
import { categoryAPI } from '../../services/api';
import { Category } from '../../types';

const { Title, Text } = Typography;

interface CategoryListProps {
  onCategorySelect?: (category: Category) => void;
  selectedCategoryId?: number;
}

const CategoryList: React.FC<CategoryListProps> = ({ 
  onCategorySelect, 
  selectedCategoryId 
}) => {
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
      setError('Failed to load categories');
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
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>Loading categories...</div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <button onClick={fetchCategories} style={{ border: 'none', background: 'none', color: '#1890ff', cursor: 'pointer' }}>
              Retry
            </button>
          }
        />
      </Card>
    );
  }

  return (
    <Card>
      <Title level={4} style={{ marginBottom: '16px' }}>
        <FolderOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
        Categories
      </Title>

      <List
        dataSource={categories}
        renderItem={(category) => (
          <List.Item
            onClick={() => onCategorySelect?.(category)}
            style={{
              cursor: onCategorySelect ? 'pointer' : 'default',
              backgroundColor: selectedCategoryId === category.id ? '#f0f7ff' : 'transparent',
              borderRadius: '6px',
              padding: '12px',
              marginBottom: '8px',
              border: selectedCategoryId === category.id ? '1px solid #1890ff' : '1px solid transparent'
            }}
          >
            <List.Item.Meta
              avatar={<FolderOutlined style={{ fontSize: '18px', color: '#1890ff' }} />}
              title={
                <Space>
                  <Text strong>{category.name}</Text>
                  {selectedCategoryId === category.id && (
                    <Tag color="blue">Selected</Tag>
                  )}
                </Space>
              }
              description={
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Created: {new Date(category.created_at).toLocaleDateString()}
                </Text>
              }
            />
          </List.Item>
        )}
        locale={{
          emptyText: (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <FolderOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
              <div style={{ marginTop: '16px', color: '#999' }}>No categories found</div>
            </div>
          )
        }}
      />

      {categories.length > 0 && (
        <div style={{ marginTop: '16px', textAlign: 'center', color: '#999', fontSize: '12px' }}>
          Total: {categories.length} categories
        </div>
      )}
    </Card>
  );
};

export default CategoryList;