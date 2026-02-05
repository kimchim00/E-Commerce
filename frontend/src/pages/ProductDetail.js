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
  Rate,
  Space,
  Divider,
} from 'antd';
import { ShoppingCartOutlined, HeartOutlined, HeartFilled, StarFilled } from '@ant-design/icons';
import { getProduct, addToCart, addToWishlist, removeFromWishlist, getWishlist, getUserProductReview, submitReview, getReviews } from '../services/api';
import './ProductDetail.css';

const { Title, Paragraph, Text } = Typography;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    loadProduct();
    checkWishlistStatus();
    checkUserReview();
    loadProductReviews();
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

  const checkWishlistStatus = async () => {
    if (!localStorage.getItem('token')) {
      return;
    }
    try {
      const response = await getWishlist();
      const inWishlist = response.data.some(item => item.id === parseInt(id));
      setIsInWishlist(inWishlist);
    } catch (error) {
      console.log('Could not check wishlist status');
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

  const handleToggleWishlist = async () => {
    if (!localStorage.getItem('token')) {
      message.warning('Please login to manage your wishlist');
      navigate('/login');
      return;
    }

    setAddingToWishlist(true);
    try {
      if (isInWishlist) {
        await removeFromWishlist(product.id);
        message.success('Removed from wishlist');
        setIsInWishlist(false);
      } else {
        await addToWishlist(product.id);
        message.success('Added to wishlist!');
        setIsInWishlist(true);
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      if (error.response?.status === 403 || error.response?.status === 401) {
        message.error('Please log in to manage your wishlist');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else if (error.response?.status === 400) {
        message.warning('This product is already in your wishlist');
        setIsInWishlist(true);
      } else {
        message.error('Failed to update wishlist');
      }
    } finally {
      setAddingToWishlist(false);
    }
  };

  const checkUserReview = async () => {
    if (!localStorage.getItem('token')) {
      return;
    }
    try {
      const response = await getUserProductReview(id);
      if (response.data) {
        setUserRating(response.data.rating);
      }
    } catch (error) {
      // No review found, this is fine
      console.log('No existing review found');
    }
  };

  const loadProductReviews = async () => {
    setLoadingReviews(true);
    try {
      const response = await getReviews(id);
      setReviews(response.data || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
      // Don't show error message as reviews are optional
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleRatingChange = async (value) => {
    if (!localStorage.getItem('token')) {
      message.warning('Please login to rate this product');
      navigate('/login');
      return;
    }

    setUserRating(value);
    try {
      await submitReview(product.id, value);
      message.success(`You rated this product ${value} star${value !== 1 ? 's' : ''}!`);
      // Reload product to get updated rating and reviews
      loadProduct();
      loadProductReviews();
    } catch (error) {
      console.error('Error submitting rating:', error);
      message.error('Failed to submit rating. Please try again.');
      // Revert rating on error
      checkUserReview();
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

  const effectivePrice = product.discount_price && product.is_flash_sale ? product.discount_price : product.price;
  const hasDiscount = product.discount_price && product.is_flash_sale;

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

            {/* Rating Display */}
            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <Rate disabled value={product.rating || 0} allowHalf style={{ fontSize: 20 }} />
              <Text style={{ fontSize: 16, color: '#666' }}>
                {product.rating ? product.rating.toFixed(1) : '0.0'} ({product.review_count || 0} reviews)
              </Text>
              {product.is_flash_sale && (
                <Tag color="red">
                  <StarFilled /> Flash Sale!
                </Tag>
              )}
              {product.is_featured && (
                <Tag color="blue">Featured</Tag>
              )}
            </div>

            {/* Price Section */}
            <div className="product-price-section" style={{ marginBottom: 24 }}>
              {hasDiscount ? (
                <div>
                  <div>
                    <span style={{ textDecoration: 'line-through', color: '#999', fontSize: 20, marginRight: 12 }}>
                      ${product.price}
                    </span>
                    <Tag color="red" style={{ fontSize: 14, padding: '4px 12px' }}>
                      -{product.discount_percentage}% OFF
                    </Tag>
                  </div>
                  <span style={{ color: '#f5222d', fontSize: 32, fontWeight: 700 }}>
                    ${effectivePrice}
                  </span>
                </div>
              ) : (
                <span style={{ fontSize: 32, fontWeight: 700, color: '#667eea' }}>
                  ${product.price}
                </span>
              )}
              {product.stock > 0 && (
                <Tag color="green" style={{ marginLeft: 12, fontSize: 14 }}>
                  In Stock
                </Tag>
              )}
            </div>

            <Paragraph className="product-description" style={{ fontSize: 16, lineHeight: 1.8 }}>
              {product.description}
            </Paragraph>

            <Divider />

            {/* User Rating Section */}
            <Card className="product-rating-card" style={{ marginBottom: 16, background: '#fafafa' }}>
              <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 12 }}>
                Rate this product:
              </Text>
              <Rate
                value={userRating}
                onChange={handleRatingChange}
                style={{ fontSize: 24 }}
              />
              {userRating > 0 && (
                <Text style={{ marginLeft: 12, color: '#666' }}>
                  You rated: {userRating} star{userRating !== 1 ? 's' : ''}
                </Text>
              )}
            </Card>

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

            <div className="product-actions" style={{ marginTop: 24 }}>
              <div className="quantity-section" style={{ marginBottom: 16 }}>
                <div className="quantity-label" style={{ marginBottom: 8, fontWeight: 600 }}>Quantity:</div>
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
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<ShoppingCartOutlined />}
                  onClick={handleAddToCart}
                  loading={addingToCart}
                  disabled={product.stock === 0 || !product.available}
                  className="add-to-cart-btn"
                  style={{
                    height: 50,
                    fontSize: 16,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                  }}
                >
                  Add to Cart
                </Button>
                <Button
                  size="large"
                  block
                  icon={isInWishlist ? <HeartFilled /> : <HeartOutlined />}
                  onClick={handleToggleWishlist}
                  loading={addingToWishlist}
                  danger={isInWishlist}
                  style={{
                    height: 50,
                    fontSize: 16,
                  }}
                >
                  {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                </Button>
              </Space>
            </div>
          </div>
        </div>
      </Card>

      {/* Customer Reviews Section */}
      <Card
        title={
          <span style={{ fontSize: 20, fontWeight: 600 }}>
            Customer Reviews ({product.review_count || 0})
          </span>
        }
        style={{ marginTop: 24, borderRadius: 12 }}
      >
        {loadingReviews ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin />
          </div>
        ) : reviews.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {reviews.map((review) => (
              <Card
                key={review.id}
                type="inner"
                style={{ background: '#fafafa' }}
              >
                <div style={{ marginBottom: 8 }}>
                  <Text strong style={{ fontSize: 16 }}>
                    {review.user?.username || 'Anonymous'}
                  </Text>
                  <div style={{ marginTop: 8 }}>
                    <Rate disabled value={review.rating} style={{ fontSize: 16 }} />
                    <Text style={{ marginLeft: 12, color: '#999' }}>
                      {new Date(review.created_at).toLocaleDateString()}
                    </Text>
                  </div>
                </div>
                {review.comment && (
                  <Paragraph style={{ margin: '8px 0 0 0', color: '#666' }}>
                    {review.comment}
                  </Paragraph>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <Text>No reviews yet. Be the first to review this product!</Text>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProductDetail;

