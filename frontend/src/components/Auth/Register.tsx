import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert, Select, Divider, Checkbox, Grid } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher';

const { Title, Text } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;

interface RegisterForm {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  role: 'teacher' | 'student';
  password: string;
  password_confirm: string;
  agree_terms: boolean;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const screens = useBreakpoint();
  const isMobile = !screens.sm;
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
      setSuccess(t('auth.registerSuccess') || 'Account created successfully! You can now sign in.');
      form.resetFields();
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || t('auth.registerFailed') || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      position: 'relative', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#ffffff',
      padding: '20px'
    }}>
      {/* Language Switcher - Top Right */}
      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10 }}>
        <LanguageSwitcher />
      </div>

      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: isMobile ? '12px' : '20px',
        padding: '0',
        maxWidth: '900px',
        width: '100%',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(10px)',
        overflow: 'hidden'
      }}>
        {/* Left Side - Registration Form */}
        <div style={{
          padding: isMobile ? '20px' : '40px',
          flex: screens.md ? 2 : 1,
          maxHeight: isMobile ? 'auto' : '90vh',
          overflowY: 'auto'
        }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? '20px' : '32px' }}>
            <div style={{ fontSize: isMobile ? '24px' : '32px', marginBottom: isMobile ? '8px' : '16px' }}>🎓</div>
            <Title level={isMobile ? 3 : 2} style={{ margin: 0, color: '#262626', marginBottom: '8px' }}>
              {t('auth.register')}
            </Title>
            <Text style={{ color: '#8c8c8c', fontSize: isMobile ? '13px' : '16px' }}>
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
            size={isMobile ? 'middle' : 'large'}
          >
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '0' : '16px' }}>
              <Form.Item
                name="first_name"
                label={t('auth.firstName')}
                style={{ flex: 1 }}
                rules={[
                  { required: true, message: t('auth.firstName') + ' is required!' },
                  { min: 2, message: t('auth.firstName') + ' must be at least 2 characters!' }
                ]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: '#8c8c8c' }} />}
                  placeholder={t('auth.firstName')}
                  style={{
                    borderRadius: '8px',
                    border: '2px solid #f0f0f0'
                  }}
                />
              </Form.Item>

              <Form.Item
                name="last_name"
                label={t('auth.lastName')}
                style={{ flex: 1 }}
                rules={[
                  { required: true, message: t('auth.lastName') + ' is required!' },
                  { min: 2, message: t('auth.lastName') + ' must be at least 2 characters!' }
                ]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: '#8c8c8c' }} />}
                  placeholder={t('auth.lastName')}
                  style={{
                    borderRadius: '8px',
                    border: '2px solid #f0f0f0'
                  }}
                />
              </Form.Item>
            </div>

            <Form.Item
              name="username"
              label={t('auth.username')}
              rules={[
                { required: true, message: t('auth.username') + ' is required!' },
                { min: 3, message: t('auth.username') + ' must be at least 3 characters!' },
                { pattern: /^[a-zA-Z0-9_]+$/, message: 'Username can only contain letters, numbers, and underscores!' }
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#8c8c8c' }} />}
                placeholder={t('auth.username')}
                style={{
                  borderRadius: '8px',
                  border: '2px solid #f0f0f0'
                }}
              />
            </Form.Item>

            <Form.Item
              name="email"
              label={t('auth.email')}
              rules={[
                { required: true, message: t('auth.email') + ' is required!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: '#8c8c8c' }} />}
                placeholder={t('auth.email')}
                style={{
                  borderRadius: '8px',
                  border: '2px solid #f0f0f0'
                }}
              />
            </Form.Item>

            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '0' : '16px' }}>
              <Form.Item
                name="phone_number"
                label={t('auth.phoneNumber')}
                style={{ flex: 1 }}
              >
                <Input
                  prefix={<PhoneOutlined style={{ color: '#8c8c8c' }} />}
                  placeholder={t('auth.phoneNumber')}
                  style={{
                    borderRadius: '8px',
                    border: '2px solid #f0f0f0'
                  }}
                />
              </Form.Item>

              <Form.Item
                name="role"
                label={t('auth.role')}
                style={{ flex: 1 }}
                rules={[
                  { required: true, message: 'Please select your role!' }
                ]}
              >
                <Select
                  placeholder={t('auth.role')}
                  style={{
                    borderRadius: '8px'
                  }}
                >
                  <Option value="student">🎓 {t('auth.student')}</Option>
                  <Option value="teacher">👨‍🏫 {t('auth.teacher')}</Option>
                </Select>
              </Form.Item>
            </div>

            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '0' : '16px' }}>
              <Form.Item
                name="password"
                label={t('auth.password')}
                style={{ flex: 1 }}
                rules={[
                  { required: true, message: t('auth.password') + ' is required!' },
                  { min: 8, message: 'Password must be at least 8 characters!' },
                  { 
                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: 'Password must contain uppercase, lowercase, and number!'
                  }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#8c8c8c' }} />}
                  placeholder={t('auth.password')}
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  style={{
                    borderRadius: '8px',
                    border: '2px solid #f0f0f0'
                  }}
                />
              </Form.Item>

              <Form.Item
                name="password_confirm"
                label={t('auth.confirmPassword')}
                style={{ flex: 1 }}
                dependencies={['password']}
                rules={[
                  { required: true, message: t('auth.confirmPassword') + ' is required!' },
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
                  placeholder={t('auth.confirmPassword')}
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
              <Checkbox style={{ color: '#8c8c8c', fontSize: isMobile ? '12px' : '14px' }}>
                {t('auth.agreeTerms')}
              </Checkbox>
            </Form.Item>

            <Form.Item style={{ marginBottom: '16px' }}>
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
                  boxShadow: '0 4px 15px rgba(24, 144, 255, 0.2)'
                }}
              >
                {t('auth.register')}
              </Button>
            </Form.Item>

            <Divider style={{ margin: isMobile ? '16px 0' : '24px 0', color: '#8c8c8c' }}>
              <Text style={{ color: '#8c8c8c', fontSize: isMobile ? '12px' : '14px' }}>
                {t('auth.alreadyHaveAccount')}
              </Text>
            </Divider>

            <Button 
              block
              style={{
                height: isMobile ? '44px' : '50px',
                borderRadius: '10px',
                fontSize: isMobile ? '14px' : '16px',
                fontWeight: '500',
                border: '2px solid #1890ff',
                color: '#1890ff',
                background: 'transparent'
              }}
              onClick={() => navigate('/login')}
            >
              {t('auth.login')}
            </Button>
          </Form>
        </div>

        {/* Right Side - Branding (Hidden on mobile) */}
        {screens.md && (
          <div style={{
            background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
            padding: screens.lg ? '60px 40px' : '40px 30px',
            color: 'white',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: screens.lg ? '48px' : '36px', marginBottom: '20px' }}>🎓</div>
            <Title level={screens.lg ? 2 : 3} style={{ color: 'white', margin: 0, marginBottom: '16px' }}>
              Join E-Center
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: screens.lg ? '16px' : '14px', lineHeight: '1.6' }}>
              Join thousands of learners improving their Turkmen-English skills 
              with our comprehensive learning platform.
            </Text>
            
            <div style={{ marginTop: screens.lg ? '40px' : '30px' }}>
              <div style={{ 
                background: 'rgba(255,255,255,0.1)', 
                borderRadius: '10px', 
                padding: screens.lg ? '20px' : '16px',
                backdropFilter: 'blur(5px)'
              }}>
                <Text style={{ color: 'white', fontSize: screens.lg ? '14px' : '13px' }}>
                  🎯 Personalized Learning Path<br/>
                  👥 Expert Teacher Support<br/>
                  📊 Progress Tracking<br/>
                  🏆 Achievement System
                </Text>
              </div>
            </div>

            <div style={{ marginTop: screens.lg ? '40px' : '30px' }}>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
                Trusted by 10,000+ learners worldwide
              </Text>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;