import React, { useState } from 'react';
import { Layout, Menu, Badge, Avatar, Button, Dropdown, Space, Input, AutoComplete } from 'antd';
import { 
  ShoppingCartOutlined, 
  UserOutlined, 
  HomeOutlined,
  AppstoreOutlined,
  LogoutOutlined,
  ShoppingOutlined,
  SearchOutlined,
  MenuOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCart, getProducts, normalizeList } from '../services/api';
import './AppHeader.css';

const { Header } = Layout;

const AppHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);
  const [searchOptions, setSearchOptions] = useState([]);
  const [searchValue, setSearchValue] = useState('');

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // In a real app, decode token to get user info
      setUser({ username: 'User' });
    }
    loadCart();
  }, [location]);

  const loadCart = async () => {
    try {
      const response = await getCart();
      const items = normalizeList(response.data);
      const count = items.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(count);
    } catch (error) {
      // Silently fail if not authenticated
      setCartCount(0);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
    window.location.reload();
  };

  const handleSearch = async (value) => {
    if (value) {
      navigate(`/products?search=${encodeURIComponent(value)}`);
    }
  };

  const handleSearchChange = async (value) => {
    setSearchValue(value);
    if (value && value.length > 2) {
      try {
        const response = await getProducts({ search: value });
        const products = normalizeList(response.data).slice(0, 5);
        setSearchOptions(
          products.map((product) => ({
            value: product.name,
            label: (
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                onClick={() => navigate(`/products/${product.id}`)}
              >
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
                  />
                )}
                <span>{product.name}</span>
              </div>
            ),
          }))
        );
      } catch (error) {
        console.error('Search error:', error);
      }
    } else {
      setSearchOptions([]);
    }
  };

  const userMenuItems = [
    {
      key: 'orders',
      icon: <ShoppingOutlined />,
      label: 'My Orders',
      onClick: () => navigate('/orders'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: 'Home',
      onClick: () => navigate('/'),
    },
    {
      key: '/products',
      icon: <AppstoreOutlined />,
      label: 'Products',
      onClick: () => navigate('/products'),
    },
  ];

  return (
    <>
      <Header className="app-header">
        <div className="header-top">
          <div className="logo" onClick={() => navigate('/')}>
            <span className="logo-icon">🛍️</span>
            <span className="logo-text">ShopHub</span>
          </div>
          <div className="header-search">
            <AutoComplete
              options={searchOptions}
              onSearch={handleSearchChange}
              onSelect={handleSearch}
              style={{ width: '100%' }}
              value={searchValue}
            >
              <Input
                size="large"
                placeholder="Search for products, brands, and more..."
                prefix={<SearchOutlined />}
                onPressEnter={(e) => handleSearch(e.target.value)}
                style={{ borderRadius: 8 }}
              />
            </AutoComplete>
          </div>
          <Space size="large" className="header-actions">
            {user ? (
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                arrow
              >
                <Button
                  type="text"
                  icon={<Avatar icon={<UserOutlined />} size="small" />}
                  className="user-button"
                >
                  <span style={{ color: 'white', marginLeft: 8 }}>{user.username}</span>
                </Button>
              </Dropdown>
            ) : (
              <Button
                type="primary"
                ghost
                onClick={() => navigate('/login')}
                className="login-button"
              >
                Login
              </Button>
            )}
            <Badge count={cartCount} showZero size="small">
              <Button
                type="text"
                icon={<ShoppingCartOutlined style={{ fontSize: 20, color: 'white' }} />}
                onClick={() => navigate('/cart')}
                className="cart-button"
              />
            </Badge>
          </Space>
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          className="header-menu"
        />
      </Header>
    </>
  );
};

export default AppHeader;

