import React, { useState } from 'react';
import axios from 'axios';
import { Form, Input, Button, Card, Typography, Row, Col, Divider, Space, Spin, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, LoadingOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const styles = `
  .ant-input::placeholder,
  .ant-input-password .ant-input::placeholder {
    color: #000 !important;
  }
`;
const AuthForm = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    
    try {
      const url = isLogin 
        ? 'http://localhost:5005/api/auth/login' 
        : 'http://localhost:5005/api/auth/signup';
      
      const response = await axios.post(url, values);
      
      if (isLogin) {
        localStorage.setItem('token', response.data.token);
        messageApi.success({
          content: 'Login successful! Redirecting...',
          duration: 2,
        });
        setTimeout(() => {
          onLoginSuccess(); // Call callback on successful login
        }, 1500);
      } else {
        messageApi.success({
          content: 'Account created successfully!',
          duration: 2,
        });
        // Auto-switch to login after successful signup
        setTimeout(() => {
          setIsLogin(true);
          form.resetFields();
        }, 1500);
      }
    } catch (err) {
      messageApi.error({
        content: err.response?.data?.message || 'An error occurred',
        duration: 4,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row className="min-h-screen bg-gray-900" align="middle" justify="center">
      <style>{styles}</style>
      {contextHolder}
      <Col xs={24} sm={22} md={18} lg={16} xl={14}>
        <Card className="shadow-lg rounded-lg" style={{width: '400px'}}>
          <div className="text-center mb-6">
            <Title level={2}>{isLogin ? 'Welcome Back' : 'Create Account'}</Title>
            <Text type="secondary">
              {isLogin ? 'Sign in to continue to your account' : 'Fill in your details to get started'}
            </Text>
          </div>

          <Spin spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}>
            <Form
              form={form}
              layout="vertical"
              name="auth_form"
              onFinish={handleSubmit}
              autoComplete="off"
            >
              {!isLogin && (
                <Form.Item
                  name="username"
                  rules={[{ required: true, message: 'Please enter your username' }]}
                >
                  <Input 
                    prefix={<UserOutlined className="text-gray-400" />} 
                    placeholder="Username"
                    size="large"
                  />
                </Form.Item>
              )}

              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input 
                  prefix={<MailOutlined className="text-gray-400" />} 
                  placeholder="Email"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: 'Please enter your password' }]}
              >
                <Input.Password 
                  prefix={<LockOutlined className="text-gray-400" />} 
                  placeholder="Password"
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  block 
                  size="large"
                  loading={loading}
                >
                  {isLogin ? 'Sign In' : 'Create Account'}
                </Button>
              </Form.Item>
            </Form>
          </Spin>

          <Divider plain>
            <Text type="secondary">OR</Text>
          </Divider>

          <div className="text-center">
            <Space direction="vertical" size="small">
              <Text>
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
              </Text>
              <Button type="link" onClick={toggleAuthMode}>
                {isLogin ? 'Create an account' : 'Sign in instead'}
              </Button>
            </Space>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default AuthForm;