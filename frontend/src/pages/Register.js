import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/api';
import './Register.css';

const { Title } = Typography;

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    if (values.password !== values.confirm_password) {
      message.error('Passwords do not match!');
      return;
    }

    setLoading(true);
    try {
      await register(values.username, values.email, values.password);
      message.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Registration failed. Please try again.';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <Card className="register-card">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              fontSize: 48,
              marginBottom: 16,
            }}
          >
            🎉
          </div>
          <Title level={2} style={{ margin: 0, marginBottom: 8 }}>
            Create Account
          </Title>
          <p style={{ color: '#666', margin: 0 }}>
            Join us and start shopping today
          </p>
        </div>
        <Form
          name="register"
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
            <Input placeholder="Choose a username" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input placeholder="Enter your email address" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password placeholder="Create a password" />
          </Form.Item>

          <Form.Item
            label="Confirm Password"
            name="confirm_password"
            rules={[{ required: true, message: 'Please confirm your password!' }]}
          >
            <Input.Password placeholder="Confirm your password" />
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
              Create Account
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <span style={{ color: '#666' }}>Already have an account? </span>
            <Link
              to="/login"
              style={{
                color: '#667eea',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Sign In
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Register;

