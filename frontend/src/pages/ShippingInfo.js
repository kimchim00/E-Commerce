import React from 'react';
import { Card, Row, Col, Typography, Timeline, Space, Tag } from 'antd';
import { 
  TruckOutlined, 
  ClockCircleOutlined, 
  DollarOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import './ShippingInfo.css';

const { Title, Paragraph } = Typography;

const ShippingInfo = () => {
  const shippingOptions = [
    {
      name: 'Standard Shipping',
      icon: <TruckOutlined />,
      time: '5-7 Business Days',
      cost: 'Free on orders over $50, otherwise $5.99',
      description: 'Our standard shipping option. Perfect for non-urgent orders.',
      color: '#667eea'
    },
    {
      name: 'Express Shipping',
      icon: <ClockCircleOutlined />,
      time: '2-3 Business Days',
      cost: '$12.99',
      description: 'Get your order faster with our express shipping option.',
      color: '#52c41a'
    },
    {
      name: 'Overnight Shipping',
      icon: <CheckCircleOutlined />,
      time: 'Next Business Day',
      cost: '$24.99',
      description: 'Need it urgently? Overnight shipping delivers by the next business day.',
      color: '#ff4d4f'
    }
  ];

  const shippingSteps = [
    {
      title: 'Order Placed',
      description: 'You place your order and receive a confirmation email',
      time: 'Immediate'
    },
    {
      title: 'Order Processing',
      description: 'We prepare your order for shipment',
      time: '1-2 business days'
    },
    {
      title: 'Order Shipped',
      description: 'Your order is shipped and you receive a tracking number',
      time: 'Within 2-3 business days'
    },
    {
      title: 'In Transit',
      description: 'Your order is on its way to you',
      time: 'Varies by shipping method'
    },
    {
      title: 'Delivered',
      description: 'Your order arrives at your doorstep',
      time: 'As per shipping method'
    }
  ];

  return (
    <div className="shipping-info-page">
      <div className="page-header">
        <Title level={1}>
          <TruckOutlined /> Shipping Information
        </Title>
        <Paragraph style={{ fontSize: 16, color: '#666' }}>
          Everything you need to know about shipping, delivery times, and tracking your orders.
        </Paragraph>
      </div>

      {/* Shipping Options */}
      <Card className="section-card" style={{ marginBottom: 32 }}>
        <Title level={2} style={{ marginBottom: 24 }}>Shipping Options</Title>
        <Row gutter={[24, 24]}>
          {shippingOptions.map((option, index) => (
            <Col xs={24} md={8} key={index}>
              <Card className="shipping-option-card" style={{ borderColor: option.color }}>
                <div className="shipping-option-header" style={{ color: option.color }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{option.icon}</div>
                  <Title level={4} style={{ margin: 0, color: option.color }}>
                    {option.name}
                  </Title>
                </div>
                <div className="shipping-option-body">
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div>
                      <strong>Delivery Time:</strong>
                      <Tag color={option.color} style={{ marginLeft: 8 }}>
                        {option.time}
                      </Tag>
                    </div>
                    <div>
                      <strong>Cost:</strong> {option.cost}
                    </div>
                    <Paragraph style={{ marginTop: 12, color: '#666' }}>
                      {option.description}
                    </Paragraph>
                  </Space>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      <Row gutter={[32, 32]}>
        {/* Shipping Process */}
        <Col xs={24} lg={12}>
          <Card className="section-card">
            <Title level={2} style={{ marginBottom: 24 }}>Shipping Process</Title>
            <Timeline
              items={shippingSteps.map((step, index) => ({
                color: '#667eea',
                children: (
                  <div>
                    <Title level={5} style={{ marginBottom: 4 }}>
                      {step.title}
                    </Title>
                    <Paragraph style={{ color: '#666', marginBottom: 4 }}>
                      {step.description}
                    </Paragraph>
                    <Tag color="blue">{step.time}</Tag>
                  </div>
                )
              }))}
            />
          </Card>
        </Col>

        {/* Important Information */}
        <Col xs={24} lg={12}>
          <Card className="section-card">
            <Title level={2} style={{ marginBottom: 24 }}>Important Information</Title>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div className="info-item">
                <EnvironmentOutlined className="info-icon" />
                <div>
                  <Title level={5}>Shipping Address</Title>
                  <Paragraph>
                    Please ensure your shipping address is correct before placing your order.
                    We cannot change the address after the order has been shipped.
                  </Paragraph>
                </div>
              </div>

              <div className="info-item">
                <ClockCircleOutlined className="info-icon" />
                <div>
                  <Title level={5}>Processing Time</Title>
                  <Paragraph>
                    Orders are typically processed within 1-2 business days. During peak seasons
                    or sales, processing may take up to 3 business days.
                  </Paragraph>
                </div>
              </div>

              <div className="info-item">
                <TruckOutlined className="info-icon" />
                <div>
                  <Title level={5}>Tracking Your Order</Title>
                  <Paragraph>
                    Once your order ships, you'll receive a tracking number via email.
                    You can also track your order in your account under "My Orders".
                  </Paragraph>
                </div>
              </div>

              <div className="info-item">
                <DollarOutlined className="info-icon" />
                <div>
                  <Title level={5}>Free Shipping</Title>
                  <Paragraph>
                    Free standard shipping is available on all orders over $50.
                    This applies automatically at checkout.
                  </Paragraph>
                </div>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* International Shipping */}
      <Card className="section-card" style={{ marginTop: 32 }}>
        <Title level={2} style={{ marginBottom: 24 }}>International Shipping</Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <div className="international-info">
              <Title level={4}>Countries We Ship To</Title>
              <Paragraph>
                We currently ship to the following countries:
              </Paragraph>
              <ul className="country-list">
                <li>United States</li>
                <li>Canada</li>
                <li>United Kingdom</li>
                <li>Germany</li>
                <li>France</li>
                <li>Australia</li>
                <li>And more...</li>
              </ul>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="international-info">
              <Title level={4}>International Shipping Rates</Title>
              <Paragraph>
                International shipping rates vary by destination, weight, and shipping method.
                You'll see the exact shipping cost at checkout before you place your order.
              </Paragraph>
              <Paragraph>
                <strong>Note:</strong> International orders may be subject to customs duties
                and taxes, which are the responsibility of the customer.
              </Paragraph>
            </div>
          </Col>
        </Row>
      </Card>

      {/* FAQ Section */}
      <Card className="section-card" style={{ marginTop: 32 }}>
        <Title level={2} style={{ marginBottom: 24 }}>
          <QuestionCircleOutlined /> Shipping FAQ
        </Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <div className="faq-item">
              <Title level={5}>How long does shipping take?</Title>
              <Paragraph>
                Standard shipping takes 5-7 business days. Express shipping takes 2-3 business days,
                and overnight shipping delivers the next business day.
              </Paragraph>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="faq-item">
              <Title level={5}>Can I change my shipping address?</Title>
              <Paragraph>
                You can change your shipping address before your order ships. Once shipped,
                you'll need to contact the carrier directly.
              </Paragraph>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="faq-item">
              <Title level={5}>What if my package is damaged?</Title>
              <Paragraph>
                If your package arrives damaged, please contact us within 48 hours with photos.
                We'll arrange a replacement or refund.
              </Paragraph>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="faq-item">
              <Title level={5}>Do you offer same-day delivery?</Title>
              <Paragraph>
                Same-day delivery is available in select metropolitan areas. Check availability
                at checkout for eligible locations.
              </Paragraph>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ShippingInfo;




