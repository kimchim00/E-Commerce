import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Typography,
  Button,
  InputNumber,
  Input,
  Spin,
  message,
  Image,
  Tag,
  Rate,
  Divider,
  Progress,
  Tooltip,
} from 'antd';
import {
  ShoppingCartOutlined,
  HeartOutlined,
  HeartFilled,
  StarFilled,
  SafetyOutlined,
  TruckOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { getProduct, addToCart, addToWishlist, removeFromWishlist, getWishlist, getUserProductReview, submitReview, getReviews, normalizeList } from '../services/api';
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
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
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
      const inWishlist = normalizeList(response.data).some(item => item.id === parseInt(id, 10));
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
      setReviews(normalizeList(response.data));
    } catch (error) {
      console.error('Error loading reviews:', error);
      // Don't show error message as reviews are optional
    } finally {
      setLoadingReviews(false);
    }
  };

  const ratingStats = React.useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    reviews.forEach((review) => {
      const value = Number(review.rating || 0);
      if (value >= 1 && value <= 5) {
        counts[value - 1] += 1;
      }
    });
    const total = counts.reduce((sum, value) => sum + value, 0);
    return { counts, total };
  }, [reviews]);

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

  const handleSubmitComment = async () => {
    if (!localStorage.getItem('token')) {
      message.warning('Please login to leave a comment');
      navigate('/login');
      return;
    }

    if (!commentText.trim()) {
      message.warning('Please write a comment before submitting');
      return;
    }

    if (!userRating) {
      message.warning('Please rate this product before submitting a comment');
      return;
    }

    setSubmittingComment(true);
    try {
      await submitReview(product.id, userRating, commentText.trim());
      message.success('Thanks! Your comment has been submitted.');
      setCommentText('');
      loadProduct();
      loadProductReviews();
    } catch (error) {
      console.error('Error submitting comment:', error);
      message.error('Failed to submit comment. Please try again.');
    } finally {
      setSubmittingComment(false);
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
  const formattedCreatedAt = product.created_at ? new Date(product.created_at).toLocaleDateString() : null;
  const formattedUpdatedAt = product.updated_at ? new Date(product.updated_at).toLocaleDateString() : null;

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

            <div className="image-features">
              <div className="quick-facts">
                <div className="quick-fact-card">
                  <CheckCircleOutlined />
                  <div>
                    <div className="quick-fact-title">Quality Checked</div>
                    <div className="quick-fact-text">Inspected before shipping</div>
                  </div>
                </div>
                <div className="quick-fact-card">
                  <TruckOutlined />
                  <div>
                    <div className="quick-fact-title">Fast Delivery</div>
                    <div className="quick-fact-text">2-5 business days</div>
                  </div>
                </div>
                <div className="quick-fact-card">
                  <SafetyOutlined />
                  <div>
                    <div className="quick-fact-title">Secure Checkout</div>
                    <div className="quick-fact-text">Protected payment options</div>
                  </div>
                </div>
              </div>
              <Card className="product-highlights-card image-highlights-card">
                <div className="highlights-header">
                  <CheckCircleOutlined />
                  <Text strong>Highlights</Text>
                </div>
                <ul className="highlights-list">
                  <li>Premium quality materials with a long-lasting finish</li>
                  <li>Designed to balance comfort with everyday performance</li>
                  <li>Curated to complement modern lifestyles and spaces</li>
                </ul>
              </Card>
              <div className="product-meta-row image-meta-row">
                <Tooltip title="Learn more about shipping and returns">
                  <div className="meta-card">
                    <InfoCircleOutlined />
                    <div>
                      <div className="meta-title">Shipping</div>
                      <div className="meta-text">Free over $50. Tracked delivery.</div>
                    </div>
                  </div>
                </Tooltip>
                <div className="meta-card">
                  <SyncOutlined />
                  <div>
                    <div className="meta-title">Returns</div>
                    <div className="meta-text">Easy 7-day return policy.</div>
                  </div>
                </div>
              </div>
              <Card className="comment-card">
                <div className="comment-card-header">
                  <Text strong>Leave a comment</Text>
                  <Text className="comment-hint">Share your experience with this product.</Text>
                </div>
                <Input.TextArea
                  rows={4}
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  placeholder="Write your comment here..."
                />
                <div className="comment-actions">
                  <Button
                    type="primary"
                    onClick={handleSubmitComment}
                    loading={submittingComment}
                  >
                    Submit Comment
                  </Button>
                  <Text className="comment-note">Rating is required for comments.</Text>
                </div>
              </Card>
            </div>
          </div>
          <div className="product-info-section">
            <Title level={1} className="product-title">
              {product.name}
            </Title>

            <div className="product-subtitle-row">
              <Text className="product-subtitle">
                {product.category?.name ? product.category.name : 'General'} Collection
              </Text>
              <div className="product-badge-row">
                {product.is_flash_sale && (
                  <Tag color="red">
                    <StarFilled /> Flash Sale
                  </Tag>
                )}
                {product.is_featured && <Tag color="blue">Featured</Tag>}
                {product.available ? (
                  <Tag color="green">Available</Tag>
                ) : (
                  <Tag color="volcano">Unavailable</Tag>
                )}
              </div>
            </div>

            {/* Rating Display */}
            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <Rate disabled value={Number(product.rating || 0)} allowHalf style={{ fontSize: 20 }} />
              <Text style={{ fontSize: 16, color: '#666' }}>
                {product.rating ? Number(product.rating).toFixed(1) : '0.0'} ({product.review_count || 0} reviews)
              </Text>
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

            <div className="purchase-panel">
              <div className="purchase-quantity">
                <Text className="quantity-label">Quantity</Text>
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
              <div className="purchase-actions">
                <Button
                  type="primary"
                  icon={<ShoppingCartOutlined />}
                  onClick={handleAddToCart}
                  loading={addingToCart}
                  disabled={product.stock === 0 || !product.available}
                  className="add-to-cart-btn"
                >
                  Add to Cart
                </Button>
                <Button
                  icon={isInWishlist ? <HeartFilled /> : <HeartOutlined />} 
                  onClick={handleToggleWishlist}
                  loading={addingToWishlist}
                  className="wishlist-btn"
                >
                  {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                </Button>
              </div>
              <div className="product-trust-row">
                <div className="trust-pill">
                  <SafetyOutlined />
                  Secure payment
                </div>
                <div className="trust-pill">
                  <TruckOutlined />
                  Fast delivery
                </div>
                <div className="trust-pill">
                  <SyncOutlined />
                  7-day returns
                </div>
              </div>
            </div>

            <Paragraph className="product-description" style={{ fontSize: 16, lineHeight: 1.8 }}>
              {product.description}
            </Paragraph>

            <Divider />

            <div className="detail-panels">
              <Card className="detail-card">
                <div className="detail-card-title">Specifications</div>
                <div className="detail-row">
                  <span className="detail-label">Category</span>
                  <span className="detail-value">{product.category?.name || 'General'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">SKU</span>
                  <span className="detail-value">SKU-{product.id}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Availability</span>
                  <span className="detail-value">{product.available ? 'Available' : 'Unavailable'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Stock</span>
                  <span className="detail-value">{product.stock > 0 ? `${product.stock} units` : 'Out of stock'}</span>
                </div>
                {formattedCreatedAt && (
                  <div className="detail-row">
                    <span className="detail-label">Added</span>
                    <span className="detail-value">{formattedCreatedAt}</span>
                  </div>
                )}
                {formattedUpdatedAt && (
                  <div className="detail-row">
                    <span className="detail-label">Updated</span>
                    <span className="detail-value">{formattedUpdatedAt}</span>
                  </div>
                )}
              </Card>

              <Card className="detail-card">
                <div className="detail-card-title">Materials & Care</div>
                <div className="chip-row">
                  <span className="detail-chip">Wipe clean</span>
                  <span className="detail-chip">Cool, dry storage</span>
                  <span className="detail-chip">Avoid direct sunlight</span>
                </div>
              </Card>

              <Card className="detail-card">
                <div className="detail-card-title">Delivery & Returns</div>
                <div className="detail-row">
                  <span className="detail-label">Dispatch</span>
                  <span className="detail-value">Within 24 hours</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Delivery</span>
                  <span className="detail-value">2-5 business days</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Returns</span>
                  <span className="detail-value">Free within 7 days</span>
                </div>
              </Card>

              <Card className="detail-card">
                <div className="detail-card-title">What's Included</div>
                <div className="chip-row">
                  <span className="detail-chip">Protective packaging</span>
                  <span className="detail-chip">Care guide</span>
                  <span className="detail-chip">Warranty details</span>
                  <span className="detail-chip">Customer support</span>
                </div>
              </Card>
            </div>

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
        <div className="rating-summary">
          <div className="rating-overview">
            <div className="rating-score">
              {product.rating ? Number(product.rating).toFixed(1) : '0.0'}
            </div>
            <Rate disabled value={Number(product.rating || 0)} allowHalf />
            <div className="rating-count-text">
              {product.review_count || 0} review{product.review_count === 1 ? '' : 's'}
            </div>
          </div>
          <div className="rating-breakdown">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = ratingStats.counts[stars - 1] || 0;
              const percent = ratingStats.total ? Math.round((count / ratingStats.total) * 100) : 0;
              return (
                <div key={stars} className="rating-row">
                  <span className="rating-label">{stars} stars</span>
                  <Progress percent={percent} showInfo={false} strokeColor="#667eea" />
                  <span className="rating-value">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <Divider />

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

