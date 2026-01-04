import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  List,
  Typography,
  Button,
  InputNumber,
  Empty,
  Spin,
  message,
  Space,
  Divider,
} from 'antd';
import { DeleteOutlined, ShoppingOutlined } from '@ant-design/icons';
import {
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../services/api';
import './Cart.css';

const { Title } = Typography;

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    setLoading(true);
    try {
      const response = await getCart();
      setCartItems(response.data);
    } catch (error) {
      console.error('Error loading cart:', error);
      if (error.response?.status === 401) {
        message.warning('Please login to view your cart');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId, quantity) => {
    if (quantity < 1) {
      handleRemoveItem(itemId);
      return;
    }

    setUpdating({ ...updating, [itemId]: true });
    try {
      await updateCartItem(itemId, quantity);
      await loadCart();
      message.success('Cart updated');
    } catch (error) {
      console.error('Error updating cart:', error);
      message.error('Failed to update cart');
    } finally {
      setUpdating({ ...updating, [itemId]: false });
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeFromCart(itemId);
      await loadCart();
      message.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      message.error('Failed to remove item');
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      await loadCart();
      message.success('Cart cleared');
    } catch (error) {
      console.error('Error clearing cart:', error);
      message.error('Failed to clear cart');
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

  if (cartItems.length === 0) {
    return (
      <div className="page-container">
        <Title level={1} style={{ marginBottom: 24 }}>
          Shopping Cart
        </Title>
        <Card>
          <Empty
            description={
              <span style={{ fontSize: 16 }}>Your cart is empty</span>
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
    <div className="page-container cart-container">
      <Title level={1} className="cart-title">
        Shopping Cart ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
      </Title>
      <div className="cart-layout">
        <Card className="cart-items-card">
          <List
            dataSource={cartItems}
            renderItem={(item) => (
              <List.Item className="cart-item">
                <div
                  style={{
                    display: 'flex',
                    width: '100%',
                    gap: 24,
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 8,
                      overflow: 'hidden',
                      background: '#f5f5f5',
                      flexShrink: 0,
                    }}
                  >
                    {item.product?.image ? (
                      <img
                        src={item.product.image}
                        alt={item.product?.name || 'Product'}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#999',
                          fontSize: 12,
                        }}
                      >
                        No Image
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Title level={5} style={{ margin: 0, marginBottom: 8 }}>
                      {item.product?.name || 'Unknown Product'}
                    </Title>
                    <div style={{ color: '#666', fontSize: 14 }}>
                      ${item.product?.price?.toFixed(2) || '0.00'} each
                    </div>
                  </div>
                  <Space size="middle" align="center">
                    <div>
                      <div style={{ marginBottom: 8, color: '#666', fontSize: 12 }}>
                        Qty:
                      </div>
                      <InputNumber
                        min={1}
                        max={item.product?.stock || 999}
                        value={item.quantity}
                        onChange={(value) => handleUpdateQuantity(item.id, value)}
                        disabled={updating[item.id]}
                        size="middle"
                      />
                    </div>
                    <div style={{ textAlign: 'right', minWidth: 100 }}>
                      <div style={{ color: '#666', fontSize: 12, marginBottom: 4 }}>
                        Subtotal:
                      </div>
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          color: '#667eea',
                        }}
                      >
                        ${(item.total_price || 0).toFixed(2)}
                      </div>
                    </div>
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveItem(item.id)}
                      shape="circle"
                    />
                  </Space>
                </div>
              </List.Item>
            )}
          />
        </Card>
        <Card className="cart-summary-card">
          <Title level={4} className="summary-title">
            Order Summary
          </Title>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 16,
              paddingBottom: 16,
              borderBottom: '1px solid #f0f0f0',
            }}
          >
            <span style={{ color: '#666' }}>Subtotal:</span>
            <strong>${calculateTotal().toFixed(2)}</strong>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 16,
              paddingBottom: 16,
              borderBottom: '1px solid #f0f0f0',
            }}
          >
            <span style={{ color: '#666' }}>Shipping:</span>
            <strong>Free</strong>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 24,
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
              ${calculateTotal().toFixed(2)}
            </span>
          </div>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Button
              type="primary"
              size="large"
              icon={<ShoppingOutlined />}
              onClick={() => navigate('/checkout')}
              block
              style={{
                height: 48,
                fontSize: 16,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
              }}
            >
              Proceed to Checkout
            </Button>
            <Button
              onClick={handleClearCart}
              block
              danger
              style={{ height: 40, borderRadius: 8 }}
            >
              Clear Cart
            </Button>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default Cart;

