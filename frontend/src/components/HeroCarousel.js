import React from 'react';
import { Carousel, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import './HeroCarousel.css';

const HeroCarousel = () => {
  const navigate = useNavigate();
  
  const banners = [
    {
      id: 1,
      title: 'Summer Sale',
      subtitle: 'Up to 50% Off',
      image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1200&h=400&fit=crop',
      link: '/products?flash_sale=true',
    },
    {
      id: 2,
      title: 'New Arrivals',
      subtitle: 'Discover Latest Products',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop',
      link: '/products?featured=true',
    },
    {
      id: 3,
      title: 'Free Shipping',
      subtitle: 'On Orders Over $50',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=400&fit=crop',
      link: '/products',
    },
  ];

  return (
    <div className="hero-carousel">
      <Carousel autoplay effect="fade" dots={true}>
        {banners.map((banner) => (
          <div key={banner.id}>
            <div
              className="carousel-slide"
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${banner.image})`,
              }}
            >
              <div className="carousel-content">
                <h2 className="carousel-title">{banner.title}</h2>
                <p className="carousel-subtitle">{banner.subtitle}</p>
                <Button
                  type="primary"
                  size="large"
                  className="carousel-button"
                  onClick={() => navigate(banner.link)}
                >
                  Shop Now
                </Button>
              </div>
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default HeroCarousel;

