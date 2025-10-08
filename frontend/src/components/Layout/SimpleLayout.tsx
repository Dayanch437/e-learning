import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Typography, Space, Button, Dropdown, Avatar, Tag, Drawer } from 'antd';
import {
  BookOutlined,
  PlayCircleOutlined,
  TranslationOutlined,
  DashboardOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  FolderOutlined,
  MenuOutlined,
  CloseOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useResponsive } from '../Utils/ResponsiveProvider';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageSelector from '../Utils/LanguageSelector';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const SimpleLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const { isMobile } = useResponsive();
  const { t } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);

  const handleMenuClick = (key: string) => {
    navigate(key);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: t('dashboard'),
    },
    {
      key: '/grammar',
      icon: <BookOutlined />,
      label: t('grammarLessons'),
    },
    {
      key: '/videos',
      icon: <PlayCircleOutlined />,
      label: t('videoLessons'),
    },
    {
      key: '/vocabulary',
      icon: <TranslationOutlined />,
      label: t('vocabulary'),
    },
    {
      key: '/chat',
      icon: <RobotOutlined />,
      label: t('englishTutor'),
    },
    ...(isAdmin ? [{
      key: '/categories',
      icon: <FolderOutlined />,
      label: t('categories'),
    }] : []),
    ...(isAdmin ? [{
      key: '/api-test',
      icon: <SettingOutlined />,
      label: t('apiTest'),
    }] : []),
  ];

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('logout'),
      onClick: handleLogout,
    },
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'red';
      case 'teacher': return 'blue';
      case 'student': return 'green';
      default: return 'default';
    }
  };

  // Menu component - reused in both desktop sider and mobile drawer
  const renderMenu = () => (
    <Menu
      mode="inline"
      selectedKeys={[location.pathname]}
      items={menuItems}
      onClick={({ key }) => {
        handleMenuClick(key);
        if (isMobile) {
          setMobileDrawerVisible(false);
        }
      }}
      style={{ borderRight: 0 }}
    />
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Desktop Sidebar - hidden on mobile */}
      {!isMobile && (
        <Sider
          theme="light"
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          style={{
            boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
            display: isMobile ? 'none' : 'block',
          }}
        >
          <div style={{ padding: '16px', textAlign: 'center' }}>
            <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
              {collapsed ? 'E-L' : t('eLearning')}
            </Title>
          </div>
          
          {renderMenu()}
        </Sider>
      )}
      
      {/* Mobile Drawer Menu */}
      {isMobile && (
        <Drawer
          placement="left"
          closable={true}
          onClose={() => setMobileDrawerVisible(false)}
          open={mobileDrawerVisible}
          closeIcon={<CloseOutlined />}
          title={
            <div style={{ color: '#1890ff', fontWeight: 'bold' }}>
              {t('eLearning')}
            </div>
          }
          styles={{
            body: { padding: 0 }
          }}
        >
          {renderMenu()}
        </Drawer>
      )}
      
      <Layout>
        <Header style={{ 
          background: '#fff', 
          padding: '0 16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* Mobile menu button */}
            {isMobile && (
              <Button 
                type="text" 
                icon={<MenuOutlined />} 
                onClick={() => setMobileDrawerVisible(true)} 
                style={{ marginRight: 16 }}
              />
            )}
            
            <Title level={isMobile ? 5 : 3} style={{ margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {isMobile ? t('learningPlatform') : t('turkmenEnglishLearningPlatform')}
            </Title>
          </div>
          
          <Space size="middle">
            <LanguageSelector mode="button" />
            {!isMobile && (
              <Tag color={getRoleColor(user?.role || '')}>
                {user?.role?.toUpperCase()}
              </Tag>
            )}
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
            >
              <Button type="text" style={{ display: 'flex', alignItems: 'center' }}>
                <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: isMobile ? 0 : 8 }} />
                {!isMobile && user?.username}
              </Button>
            </Dropdown>
          </Space>
        </Header>
        
        <Content style={{ 
          margin: isMobile ? '12px' : '24px',
          padding: isMobile ? '16px' : '24px',
          background: '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          overflowX: 'auto'
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default SimpleLayout;