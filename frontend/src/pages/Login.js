import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';
import './Login.css';

const { Title } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await login(values.username, values.password);
      // Store token if provided, otherwise rely on session cookies
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      } else {
        localStorage.setItem('token', 'session-auth');
      }
      message.success('Login successful!');
      navigate('/');
      window.location.reload(); // Reload to update header
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || 'Invalid credentials';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Card className="login-card">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              fontSize: 48,
              marginBottom: 16,
            }}
          >
            🛍️
          </div>
          <Title level={2} style={{ margin: 0, marginBottom: 8 }}>
            Welcome Back
          </Title>
          <p style={{ color: '#666', margin: 0 }}>
            Sign in to your account to continue shopping
          </p>
        </div>
        <Form
          name="login"
          onFinish={handleSubmit}
          autoComplete="off"
          layout="vertical"
          size="large"
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input placeholder="Enter your username" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password placeholder="Enter your password" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={{
                height: 48,
                fontSize: 16,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
              }}
            >
              Sign In
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <span style={{ color: '#666' }}>Don't have an account? </span>
            <Link
              to="/register"
              style={{
                color: '#667eea',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Create Account
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;

