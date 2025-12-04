import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert, Select, DatePicker, Divider, Checkbox } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

interface RegisterForm {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  date_of_birth?: string;
  role: 'teacher' | 'student';
  password: string;
  password_confirm: string;
  agree_terms: boolean;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form] = Form.useForm();

  const onFinish = async (values: RegisterForm) => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await authAPI.register(values);
      setSuccess('Account created successfully! You can now sign in.');
      form.resetFields();
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
        maxWidth: '900px',
        width: '100%',
        display: 'flex',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(10px)',
        overflow: 'hidden'
      }}>
        {/* Left Side - Registration Form */}
        <div style={{
          padding: '40px',
          flex: 2,
          maxHeight: '90vh',
          overflowY: 'auto'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>🎓</div>
            <Title level={2} style={{ margin: 0, color: '#262626', marginBottom: '8px' }}>
              Create Account
            </Title>
            <Text style={{ color: '#8c8c8c', fontSize: '16px' }}>
              Join E-Center and start your learning journey
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

          {success && (
            <Alert
              message={success}
              type="success"
              showIcon
              style={{ 
                marginBottom: '24px',
                borderRadius: '8px'
              }}
            />
          )}
          
          <Form
            form={form}
            name="register"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
            requiredMark={false}
            size="large"
          >
            <div style={{ display: 'flex', gap: '16px' }}>
              <Form.Item
                name="first_name"
                label="First Name"
                style={{ flex: 1 }}
                rules={[
                  { required: true, message: 'Please input your first name!' },
                  { min: 2, message: 'First name must be at least 2 characters!' }
                ]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: '#8c8c8c' }} />}
                  placeholder="First Name"
                  style={{
                    borderRadius: '8px',
                    border: '2px solid #f0f0f0'
                  }}
                />
              </Form.Item>

              <Form.Item
                name="last_name"
                label="Last Name"
                style={{ flex: 1 }}
                rules={[
                  { required: true, message: 'Please input your last name!' },
                  { min: 2, message: 'Last name must be at least 2 characters!' }
                ]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: '#8c8c8c' }} />}
                  placeholder="Last Name"
                  style={{
                    borderRadius: '8px',
                    border: '2px solid #f0f0f0'
                  }}
                />
              </Form.Item>
            </div>

            <Form.Item
              name="username"
              label="Username"
              rules={[
                { required: true, message: 'Please input your username!' },
                { min: 3, message: 'Username must be at least 3 characters!' },
                { pattern: /^[a-zA-Z0-9_]+$/, message: 'Username can only contain letters, numbers, and underscores!' }
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#8c8c8c' }} />}
                placeholder="Choose a username"
                style={{
                  borderRadius: '8px',
                  border: '2px solid #f0f0f0'
                }}
              />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: '#8c8c8c' }} />}
                placeholder="Enter your email"
                style={{
                  borderRadius: '8px',
                  border: '2px solid #f0f0f0'
                }}
              />
            </Form.Item>

            <div style={{ display: 'flex', gap: '16px' }}>
              <Form.Item
                name="phone_number"
                label="Phone Number"
                style={{ flex: 1 }}
              >
                <Input
                  prefix={<PhoneOutlined style={{ color: '#8c8c8c' }} />}
                  placeholder="+993 XX XXX XXX"
                  style={{
                    borderRadius: '8px',
                    border: '2px solid #f0f0f0'
                  }}
                />
              </Form.Item>

              <Form.Item
                name="role"
                label="I am a"
                style={{ flex: 1 }}
                rules={[
                  { required: true, message: 'Please select your role!' }
                ]}
              >
                <Select
                  placeholder="Select your role"
                  style={{
                    borderRadius: '8px'
                  }}
                >
                  <Option value="student">🎓 Student</Option>
                  <Option value="teacher">👨‍🏫 Teacher</Option>
                </Select>
              </Form.Item>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <Form.Item
                name="password"
                label="Password"
                style={{ flex: 1 }}
                rules={[
                  { required: true, message: 'Please input your password!' },
                  { min: 8, message: 'Password must be at least 8 characters!' },
                  { 
                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: 'Password must contain uppercase, lowercase, and number!'
                  }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#8c8c8c' }} />}
                  placeholder="Create password"
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  style={{
                    borderRadius: '8px',
                    border: '2px solid #f0f0f0'
                  }}
                />
              </Form.Item>

              <Form.Item
                name="password_confirm"
                label="Confirm Password"
                style={{ flex: 1 }}
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Please confirm your password!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Passwords do not match!'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#8c8c8c' }} />}
                  placeholder="Confirm password"
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  style={{
                    borderRadius: '8px',
                    border: '2px solid #f0f0f0'
                  }}
                />
              </Form.Item>
            </div>

            <Form.Item
              name="agree_terms"
              valuePropName="checked"
              rules={[
                { 
                  validator: (_, value) =>
                    value ? Promise.resolve() : Promise.reject(new Error('Please agree to the terms and conditions!')),
                },
              ]}
            >
              <Checkbox style={{ color: '#8c8c8c' }}>
                I agree to the{' '}
                <Link to="/terms" style={{ color: '#1890ff' }}>Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" style={{ color: '#1890ff' }}>Privacy Policy</Link>
              </Checkbox>
            </Form.Item>

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
                Create Account
              </Button>
            </Form.Item>

            <Divider style={{ margin: '24px 0', color: '#8c8c8c' }}>
              <Text style={{ color: '#8c8c8c', fontSize: '14px' }}>
                Already have an account?
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
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          </Form>
        </div>

        {/* Right Side - Branding */}
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
            Join E-Center
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', lineHeight: '1.6' }}>
            Join thousands of learners improving their Turkmen-English skills 
            with our comprehensive learning platform.
          </Text>
          
          <div style={{ marginTop: '40px' }}>
            <div style={{ 
              background: 'rgba(255,255,255,0.1)', 
              borderRadius: '10px', 
              padding: '20px',
              backdropFilter: 'blur(5px)'
            }}>
              <Text style={{ color: 'white', fontSize: '14px' }}>
                🎯 Personalized Learning Path<br/>
                👥 Expert Teacher Support<br/>
                📊 Progress Tracking<br/>
                🏆 Achievement System
              </Text>
            </div>
          </div>

          <div style={{ marginTop: '40px' }}>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
              Trusted by 10,000+ learners worldwide
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;