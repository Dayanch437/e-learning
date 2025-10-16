import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert, Divider, Checkbox } from 'antd';
import { LockOutlined, EyeInvisibleOutlined, EyeTwoTone, MailOutlined } from '@ant-design/icons';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const API_BASE_URL = 'http://192.168.1.110:8000/api/v1'; // change if needed
const { Title, Text } = Typography;

// Add unique console message to verify changes are loaded
console.log('🚀 LOGIN COMPONENT LOADED - Fixed API URL:', API_BASE_URL);
console.log('🔍 Current timestamp:', new Date().toISOString());

interface LoginForm {
  email: string;
  password: string;
  remember?: boolean;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const onFinish = async (values: LoginForm) => {
    setLoading(true);
    setError('');

    try {
      console.log('� Login Debug Info:');
      console.log('API_BASE_URL:', API_BASE_URL);
      console.log('�🔐 Logging in via:', `${API_BASE_URL}/auth/login/`);
      console.log('📧 Email:', values.email);
      
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      console.log('📡 Response status:', response.status);

      // Check if response is 200 OK
      if (response.status === 200 || response.ok) {
        const data = await response.json();
        console.log('✅ Login successful (200 OK):', data);

        // Save all authentication data to localStorage
        if (data?.access) {
          localStorage.setItem('access_token', data.access);
          localStorage.setItem('accessToken', data.access);
          console.log('💾 Access token saved');
        }
        
        if (data?.refresh) {
          localStorage.setItem('refresh_token', data.refresh);
          localStorage.setItem('refreshToken', data.refresh);
          console.log('💾 Refresh token saved');
        }
        
        if (data?.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          console.log('💾 User data saved:', data.user);
        }

        console.log('🎯 Navigating to dashboard...');
        // Navigate to dashboard on successful login (200 response)
        navigate('/dashboard', { replace: true });
      } else {
        // If response is not OK, throw error
        const errData = await response.json();
        throw new Error(errData?.detail || 'Invalid credentials');
      }
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
        padding: '20px',
      }}
    >
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '60px 40px',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <Title level={2} style={{ marginBottom: '8px' }}>
            Sign In
          </Title>
          <Text type="secondary">Welcome back! Please sign in to your account</Text>
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

        <Form name="login" onFinish={onFinish} layout="vertical" size="large">
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#8c8c8c' }} />}
              placeholder="Enter your email"
              style={{ borderRadius: '10px', padding: '12px 16px' }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#8c8c8c' }} />}
              placeholder="Enter your password"
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
              style={{ borderRadius: '10px', padding: '12px 16px' }}
            />
          </Form.Item>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Remember me</Checkbox>
            </Form.Item>
            <Link to="/forgot-password">Forgot password?</Link>
          </div>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                height: '50px',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '500',
                background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
                border: 'none',
              }}
            >
              Sign In
            </Button>
          </Form.Item>

          <Divider style={{ margin: '16px 0' }}>
            Don't have an account?
          </Divider>

          <Button
            block
            onClick={() => navigate('/register')}
            style={{
              height: '50px',
              borderRadius: '10px',
              border: '2px solid #1890ff',
              color: '#1890ff',
              background: 'transparent',
            }}
          >
            Create Account
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default Login;
