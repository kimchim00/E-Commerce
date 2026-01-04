import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, Row, Col, message, Space } from 'antd';
import { MailOutlined, PhoneOutlined, EnvironmentOutlined, SendOutlined } from '@ant-design/icons';
import './ContactUs.css';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

const ContactUs = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // In a real app, you would send this to your backend
      console.log('Contact form submitted:', values);
      message.success('Thank you for contacting us! We will get back to you soon.');
      form.resetFields();
    } catch (error) {
      message.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-us-page">
      <div className="page-header">
        <Title level={1}>Contact Us</Title>
        <Paragraph style={{ fontSize: 16, color: '#666' }}>
          We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </Paragraph>
      </div>

      <Row gutter={[32, 32]}>
        <Col xs={24} lg={8}>
          <Card className="info-card">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div className="contact-info-item">
                <PhoneOutlined className="contact-icon" />
                <div>
                  <Title level={5}>Phone</Title>
                  <Paragraph>+1 (555) 123-4567</Paragraph>
                  <Paragraph>Mon-Fri: 9:00 AM - 6:00 PM</Paragraph>
                </div>
              </div>

              <div className="contact-info-item">
                <MailOutlined className="contact-icon" />
                <div>
                  <Title level={5}>Email</Title>
                  <Paragraph>support@shophub.com</Paragraph>
                  <Paragraph>info@shophub.com</Paragraph>
                </div>
              </div>

              <div className="contact-info-item">
                <EnvironmentOutlined className="contact-icon" />
                <div>
                  <Title level={5}>Address</Title>
                  <Paragraph>123 Commerce Street</Paragraph>
                  <Paragraph>New York, NY 10001</Paragraph>
                  <Paragraph>United States</Paragraph>
                </div>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card className="form-card">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              size="large"
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="firstName"
                    label="First Name"
                    rules={[{ required: true, message: 'Please enter your first name' }]}
                  >
                    <Input placeholder="John" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="lastName"
                    label="Last Name"
                    rules={[{ required: true, message: 'Please enter your last name' }]}
                  >
                    <Input placeholder="Doe" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input placeholder="john.doe@example.com" />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Phone Number"
                rules={[{ required: true, message: 'Please enter your phone number' }]}
              >
                <Input placeholder="+1 (555) 123-4567" />
              </Form.Item>

              <Form.Item
                name="subject"
                label="Subject"
                rules={[{ required: true, message: 'Please enter a subject' }]}
              >
                <Input placeholder="How can we help you?" />
              </Form.Item>

              <Form.Item
                name="message"
                label="Message"
                rules={[{ required: true, message: 'Please enter your message' }]}
              >
                <TextArea
                  rows={6}
                  placeholder="Tell us more about your inquiry..."
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<SendOutlined />}
                  size="large"
                  block
                  className="submit-button"
                >
                  Send Message
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ContactUs;




