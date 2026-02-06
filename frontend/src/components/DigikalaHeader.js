import React, { useState } from 'react';
import { Layout, Badge, Avatar, Button, Dropdown, Space, Input, AutoComplete, Menu, Drawer } from 'antd';
import { 
  ShoppingCartOutlined, 
  UserOutlined, 
  MenuOutlined,
  SearchOutlined,
  LogoutOutlined,
  ShoppingOutlined,
  HeartOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCart, getProducts, getCategories, normalizeList } from '../services/api';
import './DigikalaHeader.css';

const { Header } = Layout;

const DigikalaHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);
  const [searchOptions, setSearchOptions] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [categories, setCategories] = useState([]);
  const [megaMenuVisible, setMegaMenuVisible] = useState(false);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          setUser({ username: 'User' });
        }
      } else {
        setUser({ username: 'User' });
      }
      loadCart();
    } else {
      setCartCount(0);
      setUser(null);
    }
    loadCategories();
  }, [location]);

  const loadCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setCartCount(0);
      return;
    }
    
    try {
      const response = await getCart();
      const items = normalizeList(response.data);
      const count = items.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(count);
    } catch (error) {
      // 403 is expected when not authenticated, don't log it
      if (error.response?.status === 403 || error.response?.status === 401) {
        setCartCount(0);
        return;
      }
      // Only log unexpected errors
      console.error('Error loading cart:', error);
      setCartCount(0);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(normalizeList(response.data));
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
                style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
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
    ...(user?.is_staff
      ? [{
          key: 'admin-products',
          icon: <ShoppingOutlined />,
          label: 'Admin Products',
          onClick: () => navigate('/admin/products'),
        }]
      : []),
    {
      key: 'orders',
      icon: <ShoppingOutlined />,
      label: 'My Orders',
      onClick: () => navigate('/orders'),
    },
    {
      key: 'wishlist',
      icon: <HeartOutlined />,
      label: 'Wishlist',
      onClick: () => navigate('/wishlist'),
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

  return (
    <>
      {/* Main Header */}
      <Header className="digikala-header">
        <div className="header-container">
          {/* Logo */}
          <div className="logo-section" onClick={() => navigate('/')}>
            <div className="logo">ShopHub</div>
          </div>

          {/* Mega Menu Button */}
          <Button
            className="mega-menu-btn"
            icon={<MenuOutlined />}
            onClick={() => setMegaMenuVisible(true)}
          >
            Categories
          </Button>

          {/* Search Bar */}
          <div className="search-section">
            <AutoComplete
              options={searchOptions}
              onSearch={handleSearchChange}
              onSelect={handleSearch}
              style={{ width: '100%' }}
              value={searchValue}
            >
              <Input
                size="large"
                placeholder="What are you looking for?"
                prefix={<SearchOutlined />}
                onPressEnter={(e) => handleSearch(e.target.value)}
                className="search-input"
              />
            </AutoComplete>
          </div>

          {/* User Actions */}
          <Space className="header-actions" size="middle">
            {user ? (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <Button className="user-btn">
                  <UserOutlined />
                  <span>Account</span>
                </Button>
              </Dropdown>
            ) : (
              <Button className="login-btn" onClick={() => navigate('/login')}>
                <UserOutlined />
                <span>Login / Register</span>
              </Button>
            )}
            <Badge count={cartCount} showZero>
              <Button className="cart-btn" onClick={() => navigate('/cart')}>
                <ShoppingCartOutlined />
                <span>Cart</span>
              </Button>
            </Badge>
          </Space>
        </div>
      </Header>

      {/* Category Menu Bar */}
      <div className="category-menu-bar">
        <div className="category-menu-container">
          {categories.slice(0, 10).map((category) => (
            <Button
              key={category.id}
              type="text"
              className="category-menu-item"
              onClick={() => navigate(`/products?category=${category.slug}`)}
            >
              {category.icon || '📦'} {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Mega Menu Drawer */}
      <Drawer
        title="All Categories"
        placement="left"
        onClose={() => setMegaMenuVisible(false)}
        open={megaMenuVisible}
        width={300}
      >
        <Menu mode="vertical">
          {categories.map((category) => (
            <Menu.Item
              key={category.id}
              icon={<span style={{ fontSize: 20 }}>{category.icon || '📦'}</span>}
              onClick={() => {
                navigate(`/products?category=${category.slug}`);
                setMegaMenuVisible(false);
              }}
            >
              {category.name}
            </Menu.Item>
          ))}
        </Menu>
      </Drawer>
    </>
  );
};

export default DigikalaHeader;


