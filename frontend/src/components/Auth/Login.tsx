import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Space, Divider, Checkbox } from 'antd';
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone, MailOutlined } from '@ant-design/icons';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useResponsive } from '../../components/Utils/ResponsiveProvider';

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
  const { isMobile, isTablet } = useResponsive();
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
      padding: isMobile ? '10px' : '20px'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: isMobile ? '12px' : '20px',
        padding: '0',
        maxWidth: '800px',
        width: '100%',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(10px)',
        overflow: 'hidden'
      }}>
        {/* Left Side - Branding */}
        <div style={{
          background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
          padding: isMobile ? '30px 20px' : isTablet ? '40px 30px' : '60px 40px',
          color: 'white',
          flex: isMobile ? 'unset' : 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          textAlign: 'center',
          minHeight: isMobile ? 'unset' : '400px'
        }}>
          <div style={{ 
            fontSize: isMobile ? '36px' : '48px', 
            marginBottom: isMobile ? '12px' : '20px' 
          }}>🎓</div>
          <Title level={isMobile ? 3 : 2} style={{ 
            color: 'white', 
            margin: 0, 
            marginBottom: isMobile ? '10px' : '16px' 
          }}>
            Welcome to E-Center
          </Title>
          {!isMobile && (
            <Text style={{ 
              color: 'rgba(255,255,255,0.9)', 
              fontSize: isTablet ? '14px' : '16px', 
              lineHeight: '1.6' 
            }}>
              Your comprehensive platform for Turkmen-English language learning. 
              Access grammar lessons, video tutorials, and vocabulary exercises.
            </Text>
          )}
          {!isMobile && (
            <div style={{ marginTop: isMobile ? '20px' : '40px' }}>
              <div style={{ 
                background: 'rgba(255,255,255,0.1)', 
                borderRadius: '10px', 
                padding: isMobile ? '12px' : '20px',
                backdropFilter: 'blur(5px)'
              }}>
                <Text style={{ color: 'white', fontSize: isMobile ? '12px' : '14px' }}>
                  ✨ Interactive Learning Experience<br/>
                  📚 Comprehensive Grammar Lessons<br/>
                  🎥 Video Tutorials<br/>
                  📝 Practice Exercises
                </Text>
              </div>
            </div>
          )}
        </div>

        {/* Right Side - Login Form */}
        <div style={{
          padding: isMobile ? '30px 20px' : isTablet ? '40px 30px' : '60px 40px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? '24px' : '40px' }}>
            <Title level={isMobile ? 3 : 2} style={{ margin: 0, color: '#262626', marginBottom: '8px' }}>
              Sign In
            </Title>
            <Text style={{ color: '#8c8c8c', fontSize: isMobile ? '14px' : '16px' }}>
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
            size={isMobile ? "middle" : "large"}
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
                  borderRadius: isMobile ? '8px' : '10px',
                  border: '2px solid #f0f0f0',
                  padding: isMobile ? '8px 12px' : '12px 16px',
                  height: isMobile ? '40px' : 'auto'
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
                  borderRadius: isMobile ? '8px' : '10px',
                  border: '2px solid #f0f0f0',
                  padding: isMobile ? '8px 12px' : '12px 16px',
                  height: isMobile ? '40px' : 'auto'
                }}
              />
            </Form.Item>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: isMobile ? '16px' : '24px',
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? '10px' : '0'
            }}>
              <Form.Item name="remember" valuePropName="checked" noStyle style={{ alignSelf: isMobile ? 'flex-start' : 'center' }}>
                <Checkbox style={{ color: '#8c8c8c', fontSize: isMobile ? '13px' : '14px' }}>Remember me</Checkbox>
              </Form.Item>
              <Link 
                to="/forgot-password" 
                style={{ 
                  color: '#1890ff', 
                  textDecoration: 'none', 
                  fontSize: isMobile ? '13px' : '14px',
                  alignSelf: isMobile ? 'flex-end' : 'center'
                }}
              >
                Forgot password?
              </Link>
            </div>

            <Form.Item style={{ marginBottom: isMobile ? '12px' : '16px' }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                block
                style={{
                  height: isMobile ? '40px' : '50px',
                  borderRadius: isMobile ? '8px' : '10px',
                  fontSize: isMobile ? '14px' : '16px',
                  fontWeight: '500',
                  background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
                  border: 'none',
                  boxShadow: '0 4px 15px rgba(24, 144, 255, 0.2)'
                }}
              >
                Sign In
              </Button>
            </Form.Item>

            <Divider style={{ margin: isMobile ? '16px 0' : '24px 0', color: '#8c8c8c' }}>
              <Text style={{ color: '#8c8c8c', fontSize: isMobile ? '12px' : '14px' }}>
                Don't have an account?
              </Text>
            </Divider>

            <Button 
              block
              style={{
                height: isMobile ? '40px' : '50px',
                borderRadius: isMobile ? '8px' : '10px',
                fontSize: isMobile ? '14px' : '16px',
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
          
          <div style={{ textAlign: 'center', marginTop: isMobile ? '20px' : '32px' }}>
            <Text style={{ color: '#8c8c8c', fontSize: isMobile ? '12px' : '14px' }}>
              Demo: teacher@example.com / securepassword123
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;