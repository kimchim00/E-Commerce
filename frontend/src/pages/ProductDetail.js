import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Typography,
  Button,
  InputNumber,
  Spin,
  message,
  Descriptions,
  Image,
  Tag,
} from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { getProduct, addToCart } from '../services/api';
import './ProductDetail.css';

const { Title, Paragraph } = Typography;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const response = await getProduct(id);
      setProduct(response.data);
    } catch (error) {
      console.error('Error loading product:', error);
      message.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!localStorage.getItem('token')) {
      message.warning('Please login to add items to cart');
      navigate('/login');
      return;
    }

    setAddingToCart(true);
    try {
      await addToCart(product.id, quantity);
      message.success('Product added to cart!');
      setQuantity(1);
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (error.response?.status === 403 || error.response?.status === 401) {
        message.error('Please log in to add items to your cart', 5);
        // Optionally redirect to login
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        message.error(error.response?.data?.detail || 'Failed to add product to cart');
      }
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className="page-container product-detail-container">
      <Card style={{ borderRadius: 12, overflow: 'hidden' }}>
        <div className="product-detail-layout">
          <div className="product-image-section">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                style={{
                  width: '100%',
                  borderRadius: 12,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
                preview={{
                  mask: 'Preview',
                }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: 500,
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 12,
                  color: '#999',
                  fontSize: 18,
                }}
              >
                No Image Available
              </div>
            )}
          </div>
          <div className="product-info-section">
            <Title level={1} className="product-title">
              {product.name}
            </Title>
            <div className="product-price-section">
              <span className="product-price">
                ${product.price}
              </span>
              {product.stock > 0 && (
                <Tag color="green" className="stock-tag">
                  In Stock
                </Tag>
              )}
            </div>
            <Paragraph className="product-description">
              {product.description}
            </Paragraph>

            <Card className="product-details-card">
              <Descriptions column={1} bordered={false} size="middle">
                <Descriptions.Item label="Category">
                  <strong>{product.category?.name || 'N/A'}</strong>
                </Descriptions.Item>
                <Descriptions.Item label="Stock Available">
                  <strong>
                    {product.stock > 0
                      ? `${product.stock} units`
                      : 'Out of Stock'}
                  </strong>
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={product.available ? 'green' : 'red'}>
                    {product.available ? 'Available' : 'Unavailable'}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <div className="product-actions">
              <div className="quantity-section">
                <div className="quantity-label">Quantity:</div>
                <InputNumber
                  min={1}
                  max={product.stock}
                  value={quantity}
                  onChange={setQuantity}
                  disabled={product.stock === 0}
                  size="large"
                  className="quantity-input"
                />
              </div>
              <Button
                type="primary"
                size="large"
                icon={<ShoppingCartOutlined />}
                onClick={handleAddToCart}
                loading={addingToCart}
                disabled={product.stock === 0 || !product.available}
                className="add-to-cart-btn"
              >
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProductDetail;

