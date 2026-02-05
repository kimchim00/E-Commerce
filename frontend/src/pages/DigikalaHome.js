import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, Button, Card, Statistic } from 'antd';
import { FireOutlined, ThunderboltOutlined, StarOutlined, RightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getCategories, getProducts, normalizeList } from '../services/api';
import HeroCarousel from '../components/HeroCarousel';
import DigikalaProductCard from '../components/DigikalaProductCard';
import { message } from 'antd';
import { addToWishlist, addToCart } from '../services/api';
import './DigikalaHome.css';

const { Title } = Typography;

const DigikalaHome = () => {
  const [categories, setCategories] = useState([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60); // 24 hours in seconds
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        getCategories(),
        getProducts(),
      ]);
      setCategories(normalizeList(categoriesRes.data));
      
      const products = normalizeList(productsRes.data);
      setFlashSaleProducts(products.filter(p => p.is_flash_sale).slice(0, 12));
      setFeaturedProducts(products.filter(p => p.is_featured).slice(0, 12));
      setBestSellers(products.slice(0, 12));
      setNewArrivals(products.slice(-12).reverse());
    } catch (error) {
      console.error('Error loading data:', error);
      if (error.response) {
        console.error('Response error:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('No response received. Is FastAPI running on http://localhost:8001?');
        message.error('Cannot connect to server. Please make sure the backend is running.');
      } else {
        console.error('Error:', error.message);
        message.error('Failed to load data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleAddToWishlist = async (productId) => {
    if (!localStorage.getItem('token')) {
      message.warning('Please login to add to wishlist');
      navigate('/login');
      return;
    }
    try {
      await addToWishlist(productId);
      message.success('Added to wishlist');
    } catch (error) {
      message.error('Failed to add to wishlist');
    }
  };

  const handleAddToCart = async (productId) => {
    if (!localStorage.getItem('token')) {
      message.warning('Please login to add to cart');
      navigate('/login');
      return;
    }
    try {
      await addToCart(productId, 1);
      message.success('Added to cart');
    } catch (error) {
      message.error('Failed to add to cart');
    }
  };

  const ProductSection = ({ title, icon, products, link, countdown }) => (
    <div className="product-section">
      <div className="section-header">
        <div className="section-title-wrapper">
          {icon}
          <Title level={3} className="section-title">{title}</Title>
        </div>
        {countdown && (
          <div className="countdown-wrapper">
            <span className="countdown-label">Ends in:</span>
            <span className="countdown-time">{formatTime(timeLeft)}</span>
          </div>
        )}
        <Button
          type="link"
          icon={<RightOutlined />}
          className="view-all-btn"
          onClick={() => navigate(link)}
        >
          View All
        </Button>
      </div>
      <Row gutter={[16, 16]}>
        {products.map((product) => (
          <Col xs={12} sm={8} md={6} lg={4} xl={3} key={product.id}>
            <DigikalaProductCard
              product={product}
              onAddToWishlist={handleAddToWishlist}
              onAddToCart={handleAddToCart}
            />
          </Col>
        ))}
      </Row>
    </div>
  );

  return (
    <div className="digikala-home">
      {/* Hero Banner */}
      <div className="hero-banner-section">
        <HeroCarousel />
      </div>

      {/* Quick Access Categories */}
      <div className="quick-categories-section">
        <Card className="categories-card">
          <Row gutter={[8, 8]}>
            {categories.slice(0, 12).map((category) => (
              <Col xs={6} sm={4} md={3} lg={2} xl={2} key={category.id}>
                <div
                  className="quick-category-item"
                  onClick={() => navigate(`/products?category=${category.slug}`)}
                >
                  <div className="category-icon">{category.icon || '📦'}</div>
                  <div className="category-name">{category.name}</div>
                </div>
              </Col>
            ))}
          </Row>
        </Card>
      </div>

      {/* Flash Sale */}
      {flashSaleProducts.length > 0 && (
        <ProductSection
          title="Flash Sale"
          icon={<FireOutlined className="section-icon" />}
          products={flashSaleProducts}
          link="/products?flash_sale=true"
          countdown={true}
        />
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <ProductSection
          title="Featured Products"
          icon={<StarOutlined className="section-icon" />}
          products={featuredProducts}
          link="/products?featured=true"
        />
      )}

      {/* Best Sellers */}
      <ProductSection
        title="Best Sellers"
        icon={<ThunderboltOutlined className="section-icon" />}
        products={bestSellers}
        link="/products"
      />

      {/* New Arrivals */}
      <ProductSection
        title="New Arrivals"
        icon={<StarOutlined className="section-icon" />}
        products={newArrivals}
        link="/products"
      />
    </div>
  );
};

export default DigikalaHome;



