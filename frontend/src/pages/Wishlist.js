import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Empty,
  Spin,
  message,
} from 'antd';
import { HeartFilled, ShoppingCartOutlined, DeleteOutlined } from '@ant-design/icons';
import { getWishlist, removeFromWishlist, addToCart } from '../services/api';
import DigikalaProductCard from '../components/DigikalaProductCard';
import './Wishlist.css';

const { Title } = Typography;

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const response = await getWishlist();
      setWishlistItems(response.data);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      if (error.response?.status === 401) {
        message.warning('Please login to view your wishlist');
        navigate('/login');
      } else {
        message.error('Failed to load wishlist');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    setRemoving({ ...removing, [productId]: true });
    try {
      await removeFromWishlist(productId);
      message.success('Removed from wishlist');
      await loadWishlist();
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      message.error('Failed to remove from wishlist');
    } finally {
      setRemoving({ ...removing, [productId]: false });
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      await addToCart(productId, 1);
      message.success('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        message.error('Please login to add items to cart');
        navigate('/login');
      } else {
        message.error('Failed to add to cart');
      }
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="page-container">
        <Title level={1} style={{ marginBottom: 24 }}>
          <HeartFilled style={{ color: '#f5222d', marginRight: 12 }} />
          My Wishlist
        </Title>
        <Card>
          <Empty
            description={
              <span style={{ fontSize: 16 }}>Your wishlist is empty</span>
            }
            style={{ padding: '60px 0' }}
          >
            <Button
              type="primary"
              size="large"
              onClick={() => navigate('/products')}
            >
              Browse Products
            </Button>
          </Empty>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-container wishlist-container">
      <Title level={1} style={{ marginBottom: 24 }}>
        <HeartFilled style={{ color: '#f5222d', marginRight: 12 }} />
        My Wishlist ({wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'})
      </Title>

      <Row gutter={[24, 24]}>
        {wishlistItems.map((product) => (
          <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
            <Card
              hoverable
              cover={
                <div
                  style={{
                    height: 240,
                    background: product.image
                      ? `url(${product.image}) center/cover`
                      : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#999',
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  {!product.image && 'No Image'}
                </div>
              }
              actions={[
                <Button
                  type="text"
                  icon={<ShoppingCartOutlined />}
                  onClick={() => handleAddToCart(product.id)}
                  disabled={product.stock === 0 || !product.available}
                >
                  Add to Cart
                </Button>,
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemoveFromWishlist(product.id)}
                  loading={removing[product.id]}
                >
                  Remove
                </Button>,
              ]}
            >
              <Card.Meta
                title={
                  <div
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                    }}
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    {product.name}
                  </div>
                }
                description={
                  <div>
                    <div style={{ marginBottom: 8 }}>
                      {product.discount_price && product.is_flash_sale ? (
                        <>
                          <span
                            style={{
                              textDecoration: 'line-through',
                              marginRight: 8,
                              color: '#999',
                              fontSize: 14,
                            }}
                          >
                            ${product.price}
                          </span>
                          <span
                            style={{
                              color: '#f5222d',
                              fontWeight: 700,
                              fontSize: 18,
                            }}
                          >
                            ${product.discount_price}
                          </span>
                        </>
                      ) : (
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: 18,
                            color: '#667eea',
                          }}
                        >
                          ${product.price}
                        </span>
                      )}
                    </div>
                    <div style={{ color: product.stock > 0 ? 'green' : 'red', fontSize: 12 }}>
                      {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                    </div>
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Wishlist;
