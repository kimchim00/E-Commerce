import React from 'react';
import { Card, Collapse, Typography, Input, Space } from 'antd';
import { SearchOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import './FAQ.css';

const { Title, Paragraph } = Typography;
const { Panel } = Collapse;

const FAQ = () => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const faqCategories = [
    {
      title: 'General Questions',
      icon: '❓',
      items: [
        {
          q: 'What is ShopHub?',
          a: 'ShopHub is an e-commerce platform where you can find a wide variety of products at competitive prices. We offer everything from electronics to fashion, home goods, and more.'
        },
        {
          q: 'How do I create an account?',
          a: 'Creating an account is easy! Click on "Register" in the top navigation, fill in your details, and you\'ll be ready to start shopping in minutes.'
        },
        {
          q: 'Is my personal information secure?',
          a: 'Yes, we take your privacy seriously. All your personal information is encrypted and stored securely. We never share your data with third parties without your consent.'
        },
        {
          q: 'Can I shop without creating an account?',
          a: 'You can browse our products without an account, but you\'ll need to create one to make purchases, save items to your wishlist, and track your orders.'
        }
      ]
    },
    {
      title: 'Orders & Shipping',
      icon: '📦',
      items: [
        {
          q: 'How long does shipping take?',
          a: 'Standard shipping typically takes 5-7 business days. Express shipping (2-3 business days) and overnight shipping options are also available at checkout.'
        },
        {
          q: 'What are the shipping costs?',
          a: 'Shipping costs vary based on the size, weight, and destination of your order. Free shipping is available on orders over $50. You\'ll see the exact shipping cost at checkout before you place your order.'
        },
        {
          q: 'Can I track my order?',
          a: 'Yes! Once your order ships, you\'ll receive a tracking number via email. You can also view your order status and tracking information in your account under "My Orders".'
        },
        {
          q: 'Do you ship internationally?',
          a: 'Currently, we ship to the United States, Canada, and select countries in Europe. International shipping rates and delivery times vary by destination.'
        },
        {
          q: 'What if my order hasn\'t arrived?',
          a: 'If your order hasn\'t arrived within the estimated delivery time, please contact our customer service team. We\'ll investigate and help resolve the issue.'
        }
      ]
    },
    {
      title: 'Returns & Refunds',
      icon: '↩️',
      items: [
        {
          q: 'What is your return policy?',
          a: 'We offer a 30-day return policy on most items. Items must be unused, in their original packaging, and with all tags attached. Some items like electronics may have different return policies.'
        },
        {
          q: 'How do I return an item?',
          a: 'To return an item, go to "My Orders" in your account, select the order, and click "Return Item". Follow the instructions to print a return label and send the item back to us.'
        },
        {
          q: 'How long does it take to process a refund?',
          a: 'Once we receive your returned item, we\'ll process your refund within 5-7 business days. The refund will be issued to your original payment method.'
        },
        {
          q: 'Do I have to pay for return shipping?',
          a: 'If the item is defective or we made an error, we\'ll cover the return shipping costs. Otherwise, return shipping is the customer\'s responsibility unless you have a premium membership.'
        }
      ]
    },
    {
      title: 'Payment',
      icon: '💳',
      items: [
        {
          q: 'What payment methods do you accept?',
          a: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, Apple Pay, Google Pay, and bank transfers for larger orders.'
        },
        {
          q: 'Is my payment information secure?',
          a: 'Absolutely! We use industry-standard SSL encryption to protect your payment information. We never store your full credit card details on our servers.'
        },
        {
          q: 'When will I be charged?',
          a: 'You\'ll be charged when your order is placed. If you\'re using a payment method that requires authorization, the charge will be processed when your order ships.'
        },
        {
          q: 'Can I pay in installments?',
          a: 'Yes! We offer "Buy Now, Pay Later" options through our partners. You can split your payment into installments at checkout if you qualify.'
        }
      ]
    },
    {
      title: 'Account & Profile',
      icon: '👤',
      items: [
        {
          q: 'How do I change my password?',
          a: 'Go to your account settings, click on "Security", and then "Change Password". Enter your current password and your new password twice to confirm.'
        },
        {
          q: 'Can I update my shipping address?',
          a: 'Yes, you can update your shipping address in your account settings under "Addresses". You can also add multiple addresses for convenience.'
        },
        {
          q: 'How do I unsubscribe from emails?',
          a: 'You can unsubscribe from marketing emails by clicking the unsubscribe link at the bottom of any email, or by going to your account settings and managing your email preferences.'
        },
        {
          q: 'What is a wishlist?',
          a: 'A wishlist allows you to save products you\'re interested in for later. You can add items to your wishlist and purchase them whenever you\'re ready.'
        }
      ]
    },
    {
      title: 'Products & Inventory',
      icon: '🛍️',
      items: [
        {
          q: 'How do I know if an item is in stock?',
          a: 'Items in stock will show "In Stock" with the available quantity. Out of stock items will be marked accordingly, and you can sign up for restock notifications.'
        },
        {
          q: 'Do you offer product warranties?',
          a: 'Many products come with manufacturer warranties. Electronics typically have 1-year warranties. Check the product page for specific warranty information.'
        },
        {
          q: 'Can I request a product that\'s not available?',
          a: 'Yes! Contact our customer service team with the product details, and we\'ll do our best to source it for you or notify you when it becomes available.'
        },
        {
          q: 'Are product reviews verified?',
          a: 'We verify that reviews are from customers who have purchased the product. This helps ensure authentic and helpful feedback for other shoppers.'
        }
      ]
    }
  ];

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  return (
    <div className="faq-page">
      <div className="page-header">
        <Title level={1}>
          <QuestionCircleOutlined /> Frequently Asked Questions
        </Title>
        <Paragraph style={{ fontSize: 16, color: '#666', marginBottom: 32 }}>
          Find answers to common questions about shopping, orders, shipping, returns, and more.
        </Paragraph>
        <Input
          size="large"
          placeholder="Search FAQs..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: 500, margin: '0 auto' }}
          allowClear
        />
      </div>

      <div className="faq-content">
        {filteredCategories.length === 0 ? (
          <Card>
            <Paragraph style={{ textAlign: 'center', fontSize: 16, color: '#999' }}>
              No FAQs found matching "{searchTerm}". Try a different search term.
            </Paragraph>
          </Card>
        ) : (
          filteredCategories.map((category, index) => (
            <Card key={index} className="faq-category-card">
              <Title level={3} className="category-title">
                <span style={{ marginRight: 12 }}>{category.icon}</span>
                {category.title}
              </Title>
              <Collapse
                accordion={false}
                defaultActiveKey={[]}
                className="faq-collapse"
              >
                {category.items.map((item, itemIndex) => (
                  <Panel
                    header={<strong>{item.q}</strong>}
                    key={itemIndex}
                    className="faq-panel"
                  >
                    <Paragraph style={{ margin: 0, color: '#666', lineHeight: 1.8 }}>
                      {item.a}
                    </Paragraph>
                  </Panel>
                ))}
              </Collapse>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default FAQ;




