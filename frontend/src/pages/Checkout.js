import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Spin,
  message,
  Descriptions,
  Space,
} from 'antd';
import { getCart, createOrder, normalizeList } from '../services/api';
import './Checkout.css';

const { Title } = Typography;
const { TextArea } = Input;

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    setLoading(true);
    try {
      const response = await getCart();
      const items = normalizeList(response.data);
      setCartItems(items);
      if (items.length === 0) {
        message.warning('Your cart is empty');
        navigate('/cart');
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      if (error.response?.status === 401) {
        message.warning('Please login to checkout');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    if (!localStorage.getItem('token')) {
      message.warning('Please login to place an order');
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      const response = await createOrder(values.shipping_address);
      message.success('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      console.error('Error creating order:', error);
      message.error('Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.total_price || 0), 0);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="page-container checkout-container">
      <Title level={1} className="checkout-title">
        Checkout
      </Title>
      <div className="checkout-layout">
        <Card className="checkout-summary-card">
          <Title level={3} className="summary-title">
            Order Summary
          </Title>
          <div style={{ marginBottom: 24 }}>
            {cartItems.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <div>
                  <div style={{ fontWeight: 500 }}>{item.product?.name || 'Unknown Product'}</div>
                  <div style={{ color: '#666', fontSize: 12 }}>
                    Qty: {item.quantity} × ${Number(item.product?.price || 0).toFixed(2)}
                  </div>
                </div>
                <div style={{ fontWeight: 600 }}>${Number(item.total_price || 0).toFixed(2)}</div>
              </div>
            ))}
          </div>
          <div
            style={{
              padding: '16px',
              background: '#f9f9f9',
              borderRadius: 8,
              marginTop: 16,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: 18, fontWeight: 600 }}>Total:</span>
              <span
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: '#667eea',
                }}
              >
                ${Number(calculateTotal() || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </Card>

        <Card className="checkout-form-card">
          <Title level={3} className="form-title">
            Shipping Information
          </Title>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="shipping_address"
              label="Shipping Address"
              rules={[
                { required: true, message: 'Please enter shipping address' },
                { min: 10, message: 'Address must be at least 10 characters' },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Enter your complete shipping address including street, city, state, and zip code"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item style={{ marginTop: 32, marginBottom: 0 }}>
              <Space style={{ width: '100%' }} direction="vertical" size="middle">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  block
                  style={{
                    height: 48,
                    fontSize: 16,
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                  }}
                >
                  Place Order
                </Button>
                <Button
                  onClick={() => navigate('/cart')}
                  block
                  style={{ height: 40, borderRadius: 8 }}
                >
                  Back to Cart
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default Checkout;

