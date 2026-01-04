import React from 'react';
import { Layout, Row, Col, Typography, Space } from 'antd';
import { Link } from 'react-router-dom';
import {
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  MailOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import './AppFooter.css';

const { Footer } = Layout;
const { Title, Text } = Typography;

const AppFooter = () => {
  return (
    <Footer className="app-footer">
      <div className="footer-content">
        <Row gutter={[32, 32]}>
          <Col xs={24} sm={12} md={6}>
            <Title level={5} className="footer-title">
              ShopHub
            </Title>
            <Text className="footer-text">
              Your one-stop destination for quality products at great prices.
              Shop with confidence and enjoy fast delivery.
            </Text>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Title level={5} className="footer-title">Quick Links</Title>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">Products</Link></li>
              <li><Link to="/cart">Shopping Cart</Link></li>
              <li><Link to="/orders">My Orders</Link></li>
            </ul>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Title level={5} className="footer-title">Customer Service</Title>
            <ul className="footer-links">
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/shipping">Shipping Info</Link></li>
              <li><Link to="/returns">Returns</Link></li>
            </ul>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Title level={5} className="footer-title">Contact</Title>
            <Space direction="vertical" size="small">
              <Text className="footer-text">
                <MailOutlined /> support@shophub.com
              </Text>
              <Text className="footer-text">
                <PhoneOutlined /> +1 (555) 123-4567
              </Text>
              <Space size="middle" style={{ marginTop: 8 }}>
                <a href="#" className="social-icon">
                  <FacebookOutlined />
                </a>
                <a href="#" className="social-icon">
                  <TwitterOutlined />
                </a>
                <a href="#" className="social-icon">
                  <InstagramOutlined />
                </a>
              </Space>
            </Space>
          </Col>
        </Row>
        <div className="footer-bottom">
          <Text className="footer-copyright">
            © 2024 ShopHub. All rights reserved.
          </Text>
        </div>
      </div>
    </Footer>
  );
};

export default AppFooter;


