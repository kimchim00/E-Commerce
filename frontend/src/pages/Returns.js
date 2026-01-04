import React from 'react';
import { Card, Row, Col, Typography, Steps, Space, Tag, Alert, Timeline } from 'antd';
import { 
  UndoOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  DollarOutlined,
  QuestionCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';
import './Returns.css';

const { Title, Paragraph } = Typography;
const { Step } = Steps;

const Returns = () => {
  const returnSteps = [
    {
      title: 'Initiate Return',
      description: 'Go to "My Orders" and select the item you want to return',
      icon: <UndoOutlined />
    },
    {
      title: 'Print Label',
      description: 'Download and print the prepaid return shipping label',
      icon: <CheckCircleOutlined />
    },
    {
      title: 'Package Item',
      description: 'Pack the item securely in its original packaging with all accessories',
      icon: <ClockCircleOutlined />
    },
    {
      title: 'Ship Back',
      description: 'Drop off the package at any authorized shipping location',
      icon: <DollarOutlined />
    },
    {
      title: 'Refund Processed',
      description: 'Receive your refund within 5-7 business days after we receive the item',
      icon: <CheckCircleOutlined />
    }
  ];

  const returnPolicy = [
    {
      title: '30-Day Return Window',
      description: 'You have 30 days from the date of delivery to initiate a return.',
      color: '#52c41a'
    },
    {
      title: 'Original Condition Required',
      description: 'Items must be unused, in original packaging, with all tags and accessories included.',
      color: '#faad14'
    },
    {
      title: 'Free Returns',
      description: 'Returns are free for defective items or if we made an error. Otherwise, return shipping is $5.99.',
      color: '#1890ff'
    },
    {
      title: 'Refund Timeline',
      description: 'Refunds are processed within 5-7 business days after we receive your returned item.',
      color: '#722ed1'
    }
  ];

  const nonReturnableItems = [
    'Personalized or customized items',
    'Items without original packaging',
    'Used or damaged items (unless defective)',
    'Items returned after 30 days',
    'Digital products or gift cards',
    'Items purchased during final sale events'
  ];

  return (
    <div className="returns-page">
      <div className="page-header">
        <Title level={1}>
          <UndoOutlined /> Returns & Refunds
        </Title>
        <Paragraph style={{ fontSize: 16, color: '#666' }}>
          Our hassle-free return policy ensures you can shop with confidence.
        </Paragraph>
      </div>

      {/* Return Policy Overview */}
      <Card className="section-card" style={{ marginBottom: 32 }}>
        <Title level={2} style={{ marginBottom: 24 }}>Return Policy Overview</Title>
        <Row gutter={[24, 24]}>
          {returnPolicy.map((policy, index) => (
            <Col xs={24} sm={12} md={6} key={index}>
              <Card className="policy-card" style={{ borderColor: policy.color }}>
                <div className="policy-icon" style={{ color: policy.color }}>
                  <CheckCircleOutlined style={{ fontSize: 32 }} />
                </div>
                <Title level={4} style={{ marginTop: 16, marginBottom: 8 }}>
                  {policy.title}
                </Title>
                <Paragraph style={{ color: '#666', margin: 0 }}>
                  {policy.description}
                </Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Return Process */}
      <Card className="section-card" style={{ marginBottom: 32 }}>
        <Title level={2} style={{ marginBottom: 32 }}>How to Return an Item</Title>
        <Steps
          direction="horizontal"
          current={-1}
          items={returnSteps}
          responsive={true}
          className="return-steps"
        />
        <div style={{ marginTop: 32 }}>
          <Row gutter={[24, 24]}>
            {returnSteps.map((step, index) => (
              <Col xs={24} md={12} lg={8} key={index}>
                <Card className="step-card">
                  <div className="step-icon">{step.icon}</div>
                  <Title level={5} style={{ marginTop: 16 }}>
                    Step {index + 1}: {step.title}
                  </Title>
                  <Paragraph style={{ color: '#666', margin: 0 }}>
                    {step.description}
                  </Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </Card>

      <Row gutter={[32, 32]}>
        {/* Refund Information */}
        <Col xs={24} lg={12}>
          <Card className="section-card">
            <Title level={2} style={{ marginBottom: 24 }}>Refund Information</Title>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div className="info-item">
                <DollarOutlined className="info-icon" />
                <div>
                  <Title level={5}>Refund Method</Title>
                  <Paragraph>
                    Refunds are issued to your original payment method. Credit card refunds
                    typically appear within 5-7 business days, while PayPal refunds may
                    appear immediately.
                  </Paragraph>
                </div>
              </div>

              <div className="info-item">
                <ClockCircleOutlined className="info-icon" />
                <div>
                  <Title level={5}>Processing Time</Title>
                  <Paragraph>
                    Once we receive your returned item, we'll inspect it and process your
                    refund within 5-7 business days. You'll receive an email confirmation
                    when the refund is processed.
                  </Paragraph>
                </div>
              </div>

              <div className="info-item">
                <CheckCircleOutlined className="info-icon" />
                <div>
                  <Title level={5}>Partial Refunds</Title>
                  <Paragraph>
                    If you're returning part of an order, you'll receive a partial refund
                    for the returned items. Shipping costs are non-refundable unless the
                    return is due to our error.
                  </Paragraph>
                </div>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Non-Returnable Items */}
        <Col xs={24} lg={12}>
          <Card className="section-card">
            <Title level={2} style={{ marginBottom: 24 }}>
              <WarningOutlined /> Non-Returnable Items
            </Title>
            <Alert
              message="Important"
              description="The following items cannot be returned or exchanged:"
              type="warning"
              showIcon
              style={{ marginBottom: 24 }}
            />
            <ul className="non-returnable-list">
              {nonReturnableItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <Paragraph style={{ marginTop: 16, color: '#999', fontSize: 12 }}>
              <strong>Note:</strong> If you receive a defective item, please contact us
              immediately. We'll arrange a replacement or full refund regardless of the
              return policy.
            </Paragraph>
          </Card>
        </Col>
      </Row>

      {/* Return Timeline */}
      <Card className="section-card" style={{ marginTop: 32 }}>
        <Title level={2} style={{ marginBottom: 24 }}>Return Timeline</Title>
        <Timeline
          items={[
            {
              color: '#667eea',
              children: (
                <div>
                  <Title level={5}>Day 1: Initiate Return</Title>
                  <Paragraph>You request a return through your account</Paragraph>
                </div>
              )
            },
            {
              color: '#667eea',
              children: (
                <div>
                  <Title level={5}>Day 1-2: Ship Item</Title>
                  <Paragraph>You package and ship the item back to us</Paragraph>
                </div>
              )
            },
            {
              color: '#667eea',
              children: (
                <div>
                  <Title level={5}>Day 3-5: In Transit</Title>
                  <Paragraph>Item is on its way back to our warehouse</Paragraph>
                </div>
              )
            },
            {
              color: '#667eea',
              children: (
                <div>
                  <Title level={5}>Day 6-7: Received & Inspected</Title>
                  <Paragraph>We receive and inspect the returned item</Paragraph>
                </div>
              )
            },
            {
              color: '#52c41a',
              children: (
                <div>
                  <Title level={5}>Day 8-12: Refund Processed</Title>
                  <Paragraph>Refund is processed and issued to your payment method</Paragraph>
                </div>
              )
            }
          ]}
        />
      </Card>

      {/* FAQ Section */}
      <Card className="section-card" style={{ marginTop: 32 }}>
        <Title level={2} style={{ marginBottom: 24 }}>
          <QuestionCircleOutlined /> Returns FAQ
        </Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <div className="faq-item">
              <Title level={5}>How long do I have to return an item?</Title>
              <Paragraph>
                You have 30 days from the date of delivery to initiate a return.
                The item must be shipped back within 5 days of initiating the return.
              </Paragraph>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="faq-item">
              <Title level={5}>Do I have to pay for return shipping?</Title>
              <Paragraph>
                Return shipping is free if the item is defective or if we made an error.
                Otherwise, return shipping costs $5.99, which is deducted from your refund.
              </Paragraph>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="faq-item">
              <Title level={5}>Can I exchange an item instead of returning it?</Title>
              <Paragraph>
                Yes! You can request an exchange for a different size or color. Exchanges
                follow the same process as returns, and we'll ship the new item once we
                receive the original.
              </Paragraph>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="faq-item">
              <Title level={5}>What if I received the wrong item?</Title>
              <Paragraph>
                If you received the wrong item, contact us immediately. We'll send you
                a prepaid return label and ship the correct item right away at no cost to you.
              </Paragraph>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Returns;




