import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Space, 
  Popconfirm, 
  message, 
  Card, 
  Typography,
  Grid
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FolderOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { categoryAPI } from '../../services/api';
import { Category } from '../../types';

const { Title } = Typography;
const { useBreakpoint } = Grid;

const CategoryManagement: React.FC = () => {
  const { t } = useTranslation();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await categoryAPI.getAll();
      setCategories(response.data.results || response.data);
    } catch (error: any) {
      message.error(t('categories.failedToFetch'));
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = () => {
    setEditingCategory(null);
    setModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setModalVisible(true);
    form.setFieldsValue(category);
  };

  const handleDelete = async (id: number) => {
    try {
      await categoryAPI.delete(id);
      message.success(t('categories.deleteSuccess'));
      fetchCategories();
    } catch (error: any) {
      message.error(t('categories.deleteFailed'));
      console.error('Error deleting category:', error);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingCategory) {
        await categoryAPI.update(editingCategory.id, values);
        message.success(t('categories.updateSuccess'));
      } else {
        await categoryAPI.create(values);
        message.success(t('categories.createSuccess'));
      }
      setModalVisible(false);
      form.resetFields();
      fetchCategories();
    } catch (error: any) {
      message.error(t(editingCategory ? 'categories.updateFailed' : 'categories.createFailed'));
      console.error('Error saving category:', error);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: isMobile ? 50 : 80,
    },
    {
      title: t('categories.name'),
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <FolderOutlined style={{ color: '#1890ff' }} />
          <strong style={{ fontSize: isMobile ? '13px' : '14px' }}>{text}</strong>
        </Space>
      ),
    },
    {
      title: t('categories.createdDate'),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => <span style={{ fontSize: isMobile ? '12px' : '14px' }}>{new Date(date).toLocaleDateString()}</span>,
    },
    {
      title: t('categories.updatedDate'),
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (date: string) => <span style={{ fontSize: isMobile ? '12px' : '14px' }}>{new Date(date).toLocaleDateString()}</span>,
    },
    {
      title: t('categories.actions'),
      key: 'actions',
      render: (_: any, record: Category) => (
        <Space>
          <Button
            type="primary"
            size={isMobile ? 'small' : 'middle'}
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            {!isMobile && t('common.edit')}
          </Button>
          <Popconfirm
            title={t('categories.deleteConfirm')}
            onConfirm={() => handleDelete(record.id)}
            okText={t('common.yes')}
            cancelText={t('common.no')}
          >
            <Button
              type="primary"
              danger
              size={isMobile ? 'small' : 'middle'}
              icon={<DeleteOutlined />}
            >
              {!isMobile && t('common.delete')}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: isMobile ? '12px' : '24px' }}>
      <Card>
        <div style={{ 
          marginBottom: '16px', 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between', 
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: isMobile ? '12px' : '0'
        }}>
          <Title level={isMobile ? 3 : 2} style={{ margin: 0 }}>
            <FolderOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
            {t('categories.management')}
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            size={isMobile ? 'middle' : 'large'}
          >
            {t('categories.addNew')}
          </Button>
        </div>

        <Table
          columns={isMobile ? columns.filter(col => col.key !== 'updated_at') : columns}
          dataSource={categories}
          rowKey="id"
          loading={loading}
          size={isMobile ? 'small' : 'middle'}
          scroll={isMobile ? { x: true } : undefined}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: !isMobile,
            size: isMobile ? 'small' : 'default',
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} ${t('video.of')} ${total} ${t('categories.categories')}`,
          }}
        />

        <Modal
          title={editingCategory ? t('categories.editCategory') : t('categories.createNew')}
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
          }}
          footer={null}
          destroyOnClose
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
          >
            <Form.Item
              name="name"
              label={t('categories.categoryName')}
              rules={[
                { required: true, message: t('categories.enterName') },
                { min: 2, message: t('categories.nameMinLength') },
                { max: 100, message: t('categories.nameMaxLength') }
              ]}
            >
              <Input
                placeholder={t('categories.enterNamePlaceholder')}
                prefix={<FolderOutlined />}
                size={isMobile ? 'middle' : 'large'}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setModalVisible(false)} size={isMobile ? 'middle' : 'large'}>
                  {t('common.cancel')}
                </Button>
                <Button type="primary" htmlType="submit" size={isMobile ? 'middle' : 'large'}>
                  {editingCategory ? t('common.edit') : t('common.add')}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default CategoryManagement;