import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout, App as AntApp } from 'antd';
import DigikalaHeader from './components/DigikalaHeader';
import AppFooter from './components/AppFooter';
import Home from './pages/Home';
import DigikalaHome from './pages/DigikalaHome';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Register from './pages/Register';
import ContactUs from './pages/ContactUs';
import FAQ from './pages/FAQ';
import ShippingInfo from './pages/ShippingInfo';
import Returns from './pages/Returns';
import TestConnection from './pages/TestConnection';
import './App.css';

const { Content } = Layout;

function App() {
  return (
    <AntApp>
      <Layout className="layout">
        <DigikalaHeader />
        <Content style={{ marginTop: 0, background: '#f5f5f5' }}>
          <div className="site-layout-content">
            <Routes>
              <Route path="/" element={<DigikalaHome />} />
              <Route path="/old-home" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/shipping" element={<ShippingInfo />} />
              <Route path="/returns" element={<Returns />} />
              <Route path="/test-connection" element={<TestConnection />} />
            </Routes>
          </div>
        </Content>
        <AppFooter />
      </Layout>
    </AntApp>
  );
}

export default App;

