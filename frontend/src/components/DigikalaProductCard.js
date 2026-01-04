import React from 'react';
import { Card, Tag, Button, Rate, Tooltip } from 'antd';
import { HeartOutlined, ShoppingCartOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './DigikalaProductCard.css';

const DigikalaProductCard = ({ product, onAddToWishlist, onAddToCart }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/products/${product.id}`);
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    if (onAddToWishlist) {
      onAddToWishlist(product.id);
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product.id);
    } else {
      navigate(`/products/${product.id}`);
    }
  };

  const finalPrice = product.discount_price || product.price;
  const originalPrice = product.discount_price ? product.price : null;

  return (
    <Card
      hoverable
      className="digikala-product-card"
      cover={
        <div className="product-image-wrapper" onClick={handleCardClick}>
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="product-image"
            />
          ) : (
            <div className="no-image">No Image</div>
          )}
          {product.discount_percentage > 0 && (
            <Tag className="discount-badge" color="red">
              {product.discount_percentage}%
            </Tag>
          )}
          <div className="product-actions">
            <Tooltip title="Quick View">
              <Button
                shape="circle"
                icon={<EyeOutlined />}
                className="action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick();
                }}
              />
            </Tooltip>
            <Tooltip title="Add to Wishlist">
              <Button
                shape="circle"
                icon={<HeartOutlined />}
                className="action-btn"
                onClick={handleWishlist}
              />
            </Tooltip>
          </div>
        </div>
      }
      styles={{ body: { padding: 12 } }}
      onClick={handleCardClick}
    >
      <div className="product-info">
        <div className="product-name" title={product.name}>
          {product.name}
        </div>

        {product.rating > 0 && (
          <div className="product-rating">
            <Rate disabled defaultValue={product.rating} allowHalf style={{ fontSize: 12 }} />
            <span className="rating-text">({product.review_count || 0})</span>
          </div>
        )}

        <div className="product-price-section">
          {originalPrice ? (
            <>
              <div className="price-row">
                <span className="final-price">{finalPrice.toLocaleString()} $</span>
                <span className="original-price">{originalPrice.toLocaleString()} $</span>
              </div>
              <div className="discount-text">
                {product.discount_percentage}% discount
              </div>
            </>
          ) : (
            <div className="price-row">
              <span className="final-price">{finalPrice.toLocaleString()} $</span>
            </div>
          )}
        </div>

        {product.stock > 0 ? (
          <div className="stock-info">
            <span className="in-stock">In Stock</span>
            {product.stock < 10 && (
              <span className="low-stock">Only {product.stock} left!</span>
            )}
          </div>
        ) : (
          <div className="stock-info">
            <span className="out-of-stock">Out of Stock</span>
          </div>
        )}

        <Button
          type="primary"
          block
          className="add-to-cart-btn"
          icon={<ShoppingCartOutlined />}
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          Add to Cart
        </Button>
      </div>
    </Card>
  );
};

export default DigikalaProductCard;





