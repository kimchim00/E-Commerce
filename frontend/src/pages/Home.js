import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Spin, Button, Tag, Empty } from 'antd';
import { ShoppingCartOutlined, ArrowRightOutlined, FireOutlined, HeartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getCategories, getProducts } from '../services/api';
import HeroCarousel from '../components/HeroCarousel';
import FlashSale from '../components/FlashSale';
import './Home.css';

const { Title, Paragraph } = Typography;

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        getCategories(),
        getProducts(),
      ]);
      setCategories(categoriesRes.data);
      // Get first 8 products as featured
      setFeaturedProducts(productsRes.data.slice(0, 8));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 24px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Carousel */}
      <div className="hero-section">
        <HeroCarousel />
      </div>

      {/* Flash Sale Section */}
      <FlashSale />

      {/* Categories Section */}
      <div className="categories-section">
        <Title level={2} className="section-title">
          Shop by Category
        </Title>
        {categories.length > 0 ? (
          <Row gutter={[16, 16]}>
            {categories.map((category) => (
              <Col xs={12} sm={8} md={6} lg={4} xl={3} key={category.id}>
                <Card
                  hoverable
                  className="category-card"
                  onClick={() => navigate(`/products?category=${category.slug}`)}
                  style={{
                    height: '100%',
                    borderRadius: 12,
                    overflow: 'hidden',
                    textAlign: 'center',
                  }}
                  styles={{ body: { padding: 20 } }}
                >
                  <div
                    style={{
                      fontSize: 48,
                      marginBottom: 12,
                      height: 60,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {category.icon || '📦'}
                  </div>
                  <Title level={5} style={{ margin: 0, fontSize: 14 }}>
                    {category.name}
                  </Title>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Empty description="No categories available" />
        )}
      </div>

      {/* Featured Products Section */}
      <div className="featured-section">
        <div className="section-header">
          <Title level={2} className="section-title">
            <FireOutlined className="section-icon" />
            Featured Products
          </Title>
          <Button
            type="link"
            icon={<ArrowRightOutlined />}
            onClick={() => navigate('/products')}
            className="view-all-button"
          >
            View All
          </Button>
        </div>
        {featuredProducts.length > 0 ? (
          <Row gutter={[24, 24]}>
            {featuredProducts.map((product) => (
              <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                <Card
                  hoverable
                  className="product-card"
                  cover={
                    <div
                      style={{
                        height: 240,
                        overflow: 'hidden',
                        background: '#f5f5f5',
                        position: 'relative',
                      }}
                    >
                      {product.image ? (
                        <img
                          alt={product.name}
                          src={product.image}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.3s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#999',
                            fontSize: 16,
                          }}
                        >
                          No Image
                        </div>
                      )}
                      {product.discount_percentage > 0 && (
                        <Tag
                          color="red"
                          style={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            borderRadius: 4,
                            fontWeight: 700,
                          }}
                        >
                          {product.discount_percentage}% OFF
                        </Tag>
                      )}
                      {product.stock > 0 && !product.discount_percentage && (
                        <Tag
                          color="green"
                          style={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            borderRadius: 4,
                          }}
                        >
                          In Stock
                        </Tag>
                      )}
                      <Button
                        className="wishlist-button"
                        icon={<HeartOutlined />}
                        shape="circle"
                        style={{
                          position: 'absolute',
                          top: 12,
                          left: 12,
                          background: 'rgba(255, 255, 255, 0.9)',
                          border: 'none',
                          opacity: 0,
                          transition: 'opacity 0.3s',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add to wishlist
                        }}
                      />
                    </div>
                  }
                  onClick={() => navigate(`/products/${product.id}`)}
                  styles={{ body: { padding: 16 } }}
                >
                  <Card.Meta
                    title={
                      <Title level={5} style={{ margin: 0, fontSize: 16 }}>
                        {product.name}
                      </Title>
                    }
                    description={
                      <div style={{ marginTop: 12 }}>
                        <div style={{ marginBottom: 8 }}>
                          {product.rating > 0 && (
                            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                              ⭐ {product.rating} ({product.review_count || 0})
                            </div>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: 20,
                            fontWeight: 700,
                            color: '#667eea',
                            marginBottom: 4,
                          }}
                        >
                          {product.discount_price ? (
                            <>
                              <span style={{ textDecoration: 'line-through', color: '#999', fontSize: 14, marginRight: 8 }}>
                                ${product.price}
                              </span>
                              <span style={{ color: '#ff6b6b' }}>
                                ${product.discount_price}
                              </span>
                            </>
                          ) : (
                            `$${product.price}`
                          )}
                        </div>
                        {product.stock === 0 && (
                          <Tag color="red" style={{ marginTop: 4 }}>
                            Out of Stock
                          </Tag>
                        )}
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Empty description="No products available" />
        )}
      </div>
    </div>
  );
};

export default Home;

