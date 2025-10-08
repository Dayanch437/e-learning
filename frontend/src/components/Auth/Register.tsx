import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert, Select, DatePicker, Divider, Checkbox } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useResponsive } from '../../components/Utils/ResponsiveProvider';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageSelector from '../../components/Utils/LanguageSelector';

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
  const { isMobile, isTablet } = useResponsive();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form] = Form.useForm();

  const onFinish = async (values: RegisterForm) => {
    if (values.password !== values.password_confirm) {
      setError('Passwords do not match');
      return;
    }

    if (!values.agree_terms) {
      setError('You must agree to the terms of service');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await authAPI.register(values);
      setSuccess('Registration successful! Please check your email to activate your account.');
      form.resetFields();
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
      flexDirection: 'column',
      position: 'relative',
      backgroundColor: '#ffffff',
      padding: isMobile ? '10px' : '20px'
    }}>
      {/* Language Selector in the top-right corner */}
      <div style={{ 
        position: 'absolute', 
        top: '20px', 
        right: '20px',
        zIndex: 10
      }}>
        <LanguageSelector mode="button" />
      </div>
      
      <div style={{ 
        display: 'flex',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: isMobile ? '12px' : '20px',
          padding: '0',
          maxWidth: '900px',
          width: '100%',
          display: 'flex',
          flexDirection: isMobile ? 'column-reverse' : 'row',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)',
          overflow: 'hidden'
        }}>
          {/* Left Side - Registration Form */}
          <div style={{
            padding: isMobile ? '30px 20px' : isTablet ? '40px 30px' : '40px 40px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div style={{ textAlign: 'center', marginBottom: isMobile ? '24px' : '32px' }}>
              <Title level={isMobile ? 3 : 2} style={{ margin: 0, color: '#262626', marginBottom: '8px' }}>
                {t('register')}
              </Title>
              <Text style={{ color: '#8c8c8c', fontSize: isMobile ? '14px' : '16px' }}>
                {t('register_welcome')}
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

            {success && (
              <Alert
                message={success}
                type="success"
                showIcon
                closable
                onClose={() => setSuccess('')}
                style={{ marginBottom: '24px', borderRadius: '8px' }}
              />
            )}

            <Form
              form={form}
              name="register"
              onFinish={onFinish}
              layout="vertical"
              requiredMark={false}
              size={isMobile ? "middle" : "large"}
              style={{ width: '100%' }}
            >
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
                gap: '16px'
              }}>
                <Form.Item
                  name="first_name"
                  rules={[{ required: true, message: 'Please enter your first name' }]}
                >
                  <Input 
                    placeholder="First Name"
                    prefix={<UserOutlined style={{ color: '#8c8c8c' }} />}
                    style={{
                      borderRadius: '8px',
                      border: '2px solid #f0f0f0',
                      height: isMobile ? '40px' : '45px'
                    }}
                  />
                </Form.Item>
                
                <Form.Item
                  name="last_name"
                  rules={[{ required: true, message: 'Please enter your last name' }]}
                >
                  <Input 
                    placeholder="Last Name"
                    prefix={<UserOutlined style={{ color: '#8c8c8c' }} />}
                    style={{
                      borderRadius: '8px',
                      border: '2px solid #f0f0f0',
                      height: isMobile ? '40px' : '45px'
                    }}
                  />
                </Form.Item>
              </div>
              
              <Form.Item
                name="username"
                rules={[{ required: true, message: 'Please enter a username' }]}
              >
                <Input 
                  placeholder="Username"
                  prefix={<UserOutlined style={{ color: '#8c8c8c' }} />}
                  style={{
                    borderRadius: '8px',
                    border: '2px solid #f0f0f0',
                    height: isMobile ? '40px' : '45px'
                  }}
                />
              </Form.Item>

              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Please enter a valid email address' }
                ]}
              >
                <Input 
                  placeholder="Email Address"
                  prefix={<MailOutlined style={{ color: '#8c8c8c' }} />}
                  style={{
                    borderRadius: '8px',
                    border: '2px solid #f0f0f0',
                    height: isMobile ? '40px' : '45px'
                  }}
                />
              </Form.Item>

              <Form.Item
                name="phone_number"
                rules={[{ pattern: /^[0-9+\-\s]+$/, message: 'Please enter a valid phone number' }]}
              >
                <Input 
                  placeholder="Phone Number (Optional)"
                  prefix={<PhoneOutlined style={{ color: '#8c8c8c' }} />}
                  style={{
                    borderRadius: '8px',
                    border: '2px solid #f0f0f0',
                    height: isMobile ? '40px' : '45px'
                  }}
                />
              </Form.Item>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
                gap: '16px'
              }}>
                <Form.Item
                  name="role"
                  rules={[{ required: true, message: 'Please select your role' }]}
                >
                  <Select 
                    placeholder="Select Role"
                    style={{ 
                      width: '100%',
                      borderRadius: '8px',
                      height: isMobile ? '40px' : '45px'
                    }}
                  >
                    <Option value="student">Student</Option>
                    <Option value="teacher">Teacher</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="date_of_birth"
                >
                  <DatePicker 
                    placeholder="Date of Birth (Optional)"
                    style={{ 
                      width: '100%',
                      borderRadius: '8px',
                      border: '2px solid #f0f0f0',
                      height: isMobile ? '40px' : '45px'
                    }}
                  />
                </Form.Item>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
                gap: '16px'
              }}>
                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: 'Please enter your password' },
                    { min: 8, message: 'Password must be at least 8 characters' }
                  ]}
                >
                  <Input.Password
                    placeholder="Password"
                    prefix={<LockOutlined style={{ color: '#8c8c8c' }} />}
                    iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                    style={{
                      borderRadius: '8px',
                      border: '2px solid #f0f0f0',
                      height: isMobile ? '40px' : '45px'
                    }}
                  />
                </Form.Item>
                
                <Form.Item
                  name="password_confirm"
                  rules={[
                    { required: true, message: 'Please confirm your password' },
                    { min: 8, message: 'Password must be at least 8 characters' }
                  ]}
                >
                  <Input.Password
                    placeholder="Confirm Password"
                    prefix={<LockOutlined style={{ color: '#8c8c8c' }} />}
                    iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                    style={{
                      borderRadius: '8px',
                      border: '2px solid #f0f0f0',
                      height: isMobile ? '40px' : '45px'
                    }}
                  />
                </Form.Item>
              </div>

              <Form.Item
                name="agree_terms"
                valuePropName="checked"
                style={{ marginBottom: '24px' }}
              >
                <Checkbox>
                  I agree to the <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>
                </Checkbox>
              </Form.Item>

              <Form.Item style={{ marginBottom: '16px' }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  style={{
                    height: isMobile ? '40px' : '45px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '500',
                    background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
                    border: 'none',
                    boxShadow: '0 4px 15px rgba(24, 144, 255, 0.2)'
                  }}
                >
                  {t('register')}
                </Button>
              </Form.Item>
            </Form>

            <Divider plain style={{ margin: '16px 0' }}>
              <Text style={{ color: '#8c8c8c', fontSize: '14px' }}>
                {t('already_have_account')}
              </Text>
            </Divider>

            <Button
              block
              onClick={() => navigate('/login')}
              style={{
                height: isMobile ? '40px' : '45px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                border: '2px solid #1890ff',
                color: '#1890ff',
                background: 'transparent'
              }}
            >
              {t('login')}
            </Button>
          </div>

          {/* Right Side - Branding */}
          <div style={{
            background: 'linear-gradient(135deg, #722ed1 0%, #1890ff 100%)',
            padding: isMobile ? '30px 20px' : isTablet ? '40px 30px' : '40px',
            color: 'white',
            flex: isMobile ? 'unset' : 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            textAlign: 'center',
            minHeight: isMobile ? '250px' : 'auto'
          }}>
            <div style={{ 
              fontSize: isMobile ? '36px' : '48px', 
              marginBottom: isMobile ? '10px' : '16px' 
            }}>🚀</div>
            <Title level={isMobile ? 3 : 2} style={{ 
              color: 'white', 
              margin: 0, 
              marginBottom: isMobile ? '8px' : '16px'
            }}>
              {t('app_name')}
            </Title>
            
            <Text style={{ 
              color: 'rgba(255,255,255,0.9)', 
              fontSize: isMobile ? '14px' : '16px', 
              marginBottom: isMobile ? '16px' : '30px'
            }}>
              {t('register_welcome')}
            </Text>

            {!isMobile && (
              <div style={{ marginTop: '24px' }}>
                <div style={{ 
                  background: 'rgba(255,255,255,0.1)', 
                  borderRadius: '10px', 
                  padding: isMobile ? '15px' : '20px',
                  backdropFilter: 'blur(5px)'
                }}>
                  <Text style={{ color: 'white', fontSize: isMobile ? '12px' : '14px' }}>
                    🎯 Personalized Learning Path<br/>
                    👥 Expert Teacher Support<br/>
                    📊 Progress Tracking<br/>
                    🏆 Achievement System
                  </Text>
                </div>
              </div>
            )}

            {!isMobile && (
              <div style={{ marginTop: isMobile ? '20px' : '40px' }}>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
                  Trusted by 10,000+ learners worldwide
                </Text>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;