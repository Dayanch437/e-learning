import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Space, Divider, Checkbox } from 'antd';
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone, MailOutlined } from '@ant-design/icons';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text } = Typography;

interface LoginForm {
  email: string;
  password: string;
  remember?: boolean;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const onFinish = async (values: LoginForm) => {
    setLoading(true);
    setError('');
    
    try {
      await login(values.email, values.password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
        <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#ffffff',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: '0',
        maxWidth: '800px',
        width: '100%',
        display: 'flex',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(10px)',
        overflow: 'hidden'
      }}>
        {/* Left Side - Branding */}
        <div style={{
          background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
          padding: '60px 40px',
          color: 'white',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎓</div>
          <Title level={2} style={{ color: 'white', margin: 0, marginBottom: '16px' }}>
            Welcome to E-Center
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', lineHeight: '1.6' }}>
            Your comprehensive platform for Turkmen-English language learning. 
            Access grammar lessons, video tutorials, and vocabulary exercises.
          </Text>
          <div style={{ marginTop: '40px' }}>
            <div style={{ 
              background: 'rgba(255,255,255,0.1)', 
              borderRadius: '10px', 
              padding: '20px',
              backdropFilter: 'blur(5px)'
            }}>
              <Text style={{ color: 'white', fontSize: '14px' }}>
                ✨ Interactive Learning Experience<br/>
                📚 Comprehensive Grammar Lessons<br/>
                🎥 Video Tutorials<br/>
                📝 Practice Exercises
              </Text>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div style={{
          padding: '60px 40px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <Title level={2} style={{ margin: 0, color: '#262626', marginBottom: '8px' }}>
              Sign In
            </Title>
            <Text style={{ color: '#8c8c8c', fontSize: '16px' }}>
              Welcome back! Please sign in to your account
            </Text>
          </div>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              onClose={() => setError('')}
              style={{ 
                marginBottom: '24px',
                borderRadius: '8px'
              }}
            />
          )}
          
          <Form
            name="login"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
            requiredMark={false}
            size="large"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: '#8c8c8c' }} />}
                placeholder="Enter your email"
                style={{
                  borderRadius: '10px',
                  border: '2px solid #f0f0f0',
                  padding: '12px 16px'
                }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Please input your password!' },
                { min: 4, message: 'Password must be at least 6 characters!' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#8c8c8c' }} />}
                placeholder="Enter your password"
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                style={{
                  borderRadius: '10px',
                  border: '2px solid #f0f0f0',
                  padding: '12px 16px'
                }}
              />
            </Form.Item>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox style={{ color: '#8c8c8c' }}>Remember me</Checkbox>
              </Form.Item>
              <Link to="/forgot-password" style={{ color: '#1890ff', textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </div>

            <Form.Item style={{ marginBottom: '16px' }}>
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
                  boxShadow: '0 4px 15px rgba(24, 144, 255, 0.2)'
                }}
              >
                Sign In
              </Button>
            </Form.Item>

            <Divider style={{ margin: '24px 0', color: '#8c8c8c' }}>
              <Text style={{ color: '#8c8c8c', fontSize: '14px' }}>
                Don't have an account?
              </Text>
            </Divider>

            <Button 
              block
              style={{
                height: '50px',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '500',
                border: '2px solid #1890ff',
                color: '#1890ff',
                background: 'transparent'
              }}
              onClick={() => navigate('/register')}
            >
              Create Account
            </Button>
          </Form>
          
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <Text style={{ color: '#8c8c8c', fontSize: '14px' }}>
              Demo: teacher@example.com / securepassword123
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;