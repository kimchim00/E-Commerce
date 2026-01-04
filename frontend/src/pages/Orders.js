import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  List,
  Typography,
  Tag,
  Empty,
  Spin,
  message,
  Descriptions,
  Button,
} from 'antd';
import { getOrders } from '../services/api';
import './Orders.css';

const { Title } = Typography;

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await getOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Error loading orders:', error);
      if (error.response?.status === 401) {
        message.warning('Please login to view your orders');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      processing: 'blue',
      shipped: 'cyan',
      delivered: 'green',
      cancelled: 'red',
    };
    return colors[status] || 'default';
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="page-container">
        <Title level={1} style={{ marginBottom: 24 }}>
          My Orders
        </Title>
        <Card>
          <Empty
            description={
              <span style={{ fontSize: 16 }}>You have no orders yet</span>
            }
            style={{ padding: '60px 0' }}
          >
            <Button
              type="primary"
              size="large"
              onClick={() => navigate('/products')}
            >
              Start Shopping
            </Button>
          </Empty>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-container orders-container">
      <Title level={1} className="orders-title">
        My Orders ({orders.length})
      </Title>
      <List
        dataSource={orders}
        renderItem={(order) => (
          <List.Item style={{ marginBottom: 24, padding: 0 }}>
            <Card
              style={{
                width: '100%',
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 20,
                  paddingBottom: 16,
                  borderBottom: '2px solid #f0f0f0',
                }}
              >
                <div>
                  <Title level={4} style={{ margin: 0, marginBottom: 4 }}>
                    Order #{order.id}
                  </Title>
                  <div style={{ color: '#666', fontSize: 14 }}>
                    Placed on{' '}
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
                <Tag
                  color={getStatusColor(order.status)}
                  style={{
                    fontSize: 14,
                    padding: '4px 16px',
                    borderRadius: 16,
                    textTransform: 'capitalize',
                  }}
                >
                  {order.status}
                </Tag>
              </div>
              <Descriptions
                column={{ xs: 1, sm: 2 }}
                bordered={false}
                size="middle"
                style={{ marginBottom: 20 }}
              >
                <Descriptions.Item label="Total Amount">
                  <span
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: '#667eea',
                    }}
                  >
                    ${(order.total_amount || 0).toFixed(2)}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Shipping Address">
                  {order.shipping_address}
                </Descriptions.Item>
              </Descriptions>
              <div
                style={{
                  marginTop: 20,
                  padding: 16,
                  background: '#f9f9f9',
                  borderRadius: 8,
                }}
              >
                <Title level={5} style={{ marginBottom: 12 }}>
                  Order Items ({order.items?.length || 0})
                </Title>
                <List
                  dataSource={order.items}
                  renderItem={(item) => (
                    <List.Item
                      style={{
                        padding: '8px 0',
                        borderBottom: '1px solid #f0f0f0',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          width: '100%',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 500 }}>
                            {item.product?.name || 'Unknown Product'}
                          </div>
                          <div style={{ color: '#666', fontSize: 12 }}>
                            Quantity: {item.quantity} × ${(item.price || 0).toFixed(2)}
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: 16,
                            fontWeight: 600,
                            color: '#667eea',
                          }}
                        >
                          ${(item.total_price || 0).toFixed(2)}
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              </div>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default Orders;

