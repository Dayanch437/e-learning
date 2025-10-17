import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert, Divider, Checkbox, Grid } from 'antd';
import { LockOutlined, EyeInvisibleOutlined, EyeTwoTone, MailOutlined } from '@ant-design/icons';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

interface LoginForm {
  email: string;
  password: string;
  remember?: boolean;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { t } = useTranslation();
  const screens = useBreakpoint();
  const isMobile = !screens.sm;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const onFinish = async (values: LoginForm) => {
    setLoading(true);
    setError('');

    try {
      console.log('🔐 Logging in with email:', values.email);
      
      // Use AuthContext's login method which updates the state properly
      await login(values.email, values.password);
      
      console.log('✅ Login successful, navigating to:', from);
      // Navigate to dashboard on successful login
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      setError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        padding: isMobile ? '10px' : '20px',
        position: 'relative',
      }}
    >
      {/* Language Switcher - Top Right */}
      <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
        <LanguageSwitcher />
      </div>

      <div
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: isMobile ? '12px' : '20px',
          padding: isMobile ? '30px 20px' : '60px 40px',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: isMobile ? '20px' : '30px' }}>
          <Title level={isMobile ? 3 : 2} style={{ marginBottom: '8px' }}>
            {t('auth.login')}
          </Title>
          <Text type="secondary" style={{ fontSize: isMobile ? '13px' : '14px' }}>
            {t('dashboard.welcome')}! {t('auth.login').toLowerCase()}
          </Text>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            closable
            onClose={() => setError('')}
            style={{ marginBottom: '24px', borderRadius: '8px' }}
          />
        )}

        <Form name="login" onFinish={onFinish} layout="vertical" size={isMobile ? 'middle' : 'large'}>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: t('auth.email') + ' is required!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#8c8c8c' }} />}
              placeholder={t('auth.email')}
              style={{ borderRadius: '10px', padding: isMobile ? '10px 14px' : '12px 16px' }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: t('auth.password') + ' is required!' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#8c8c8c' }} />}
              placeholder={t('auth.password')}
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
              style={{ borderRadius: '10px', padding: isMobile ? '10px 14px' : '12px 16px' }}
            />
          </Form.Item>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '16px',
              fontSize: isMobile ? '13px' : '14px',
            }}
          >
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>{t('auth.rememberMe')}</Checkbox>
            </Form.Item>
            <Link to="/forgot-password">{t('auth.forgotPassword')}</Link>
          </div>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                height: isMobile ? '44px' : '50px',
                borderRadius: '10px',
                fontSize: isMobile ? '14px' : '16px',
                fontWeight: '500',
                background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
                border: 'none',
              }}
            >
              {t('auth.login')}
            </Button>
          </Form.Item>

          <Divider style={{ margin: '16px 0', fontSize: isMobile ? '12px' : '14px' }}>
            {t('auth.dontHaveAccount')}
          </Divider>

          <Button
            block
            onClick={() => navigate('/register')}
            style={{
              height: isMobile ? '44px' : '50px',
              borderRadius: '10px',
              border: '2px solid #1890ff',
              color: '#1890ff',
              background: 'transparent',
              fontSize: isMobile ? '14px' : '16px',
            }}
          >
            {t('auth.register')}
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default Login;
