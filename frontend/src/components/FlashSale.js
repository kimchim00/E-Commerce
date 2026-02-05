import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Button, Tag, Statistic } from 'antd';
import { FireOutlined, ShoppingCartOutlined, HeartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getProducts, normalizeList } from '../services/api';
import './FlashSale.css';

const { Title } = Typography;

const FlashSale = () => {
  const [products, setProducts] = useState([]);
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59,
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadFlashSaleProducts();
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const loadFlashSaleProducts = async () => {
    try {
      const response = await getProducts({ flash_sale: true });
      setProducts(normalizeList(response.data).slice(0, 8));
    } catch (error) {
      console.error('Error loading flash sale products:', error);
    }
  };

  const formatTime = (value) => String(value).padStart(2, '0');

  return (
    <div className="flash-sale-section">
      <div className="flash-sale-header">
        <div>
          <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
            <FireOutlined style={{ color: '#ff6b6b', fontSize: 28 }} />
            Flash Sale
          </Title>
          <p style={{ color: '#666', margin: '8px 0 0 0' }}>
            Limited time offers - Don't miss out!
          </p>
        </div>
        <div className="countdown-timer">
          <div className="timer-label">Ends in:</div>
          <div className="timer-display">
            <Statistic.Countdown
              value={Date.now() + 24 * 60 * 60 * 1000}
              format="HH:mm:ss"
              valueStyle={{ color: '#ff6b6b', fontSize: 24, fontWeight: 700 }}
            />
          </div>
        </div>
      </div>

      {products.length > 0 ? (
        <Row gutter={[16, 16]} className="flash-sale-products">
          {products.map((product) => (
            <Col xs={12} sm={8} md={6} lg={3} key={product.id}>
              <Card
                hoverable
                className="flash-sale-card"
                cover={
                  <div className="product-image-container">
                    {product.image ? (
                      <img
                        alt={product.name}
                        src={product.image}
                        className="product-image"
                      />
                    ) : (
                      <div className="no-image">No Image</div>
                    )}
                    {product.discount_percentage > 0 && (
                      <Tag
                        color="red"
                        className="discount-badge"
                      >
                        {product.discount_percentage}% OFF
                      </Tag>
                    )}
                    <Button
                      className="wishlist-button"
                      icon={<HeartOutlined />}
                      shape="circle"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add to wishlist
                      }}
                    />
                  </div>
                }
                onClick={() => navigate(`/products/${product.id}`)}
                styles={{ body: { padding: 12 } }}
              >
                <div className="product-info">
                  <div className="product-name" title={product.name}>
                    {product.name}
                  </div>
                  <div className="product-rating">
                    ⭐ {product.rating || '4.5'} ({product.review_count || 0})
                  </div>
                  <div className="product-price">
                    {product.discount_price ? (
                      <>
                        <span className="original-price">${product.price}</span>
                        <span className="discount-price">${product.discount_price}</span>
                      </>
                    ) : (
                      <span className="current-price">${product.price}</span>
                    )}
                  </div>
                  <Button
                    type="primary"
                    icon={<ShoppingCartOutlined />}
                    block
                    size="small"
                    className="add-to-cart-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/products/${product.id}`);
                    }}
                  >
                    Add to Cart
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          No flash sale products available
        </div>
      )}
    </div>
  );
};

export default FlashSale;





