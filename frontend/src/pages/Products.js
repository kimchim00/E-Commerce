import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Input,
  Select,
  Typography,
  Spin,
  Empty,
  Button,
  Card,
  Slider,
  Checkbox,
  Radio,
  Collapse,
  Space,
  Divider,
} from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  SearchOutlined, 
  FilterOutlined,
  ClearOutlined,
  DollarOutlined,
  StarOutlined,
  CheckCircleOutlined,
  FireOutlined,
} from '@ant-design/icons';
import { getProducts, getCategories, addToWishlist, addToCart, normalizeList } from '../services/api';
import { message } from 'antd';
import DigikalaProductCard from '../components/DigikalaProductCard';
import './Products.css';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Filter states
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    minPrice: null,
    maxPrice: null,
    minRating: null,
    inStock: false,
    hasDiscount: false,
    featured: false,
    flashSale: false,
    sortBy: 'newest',
  });

  useEffect(() => {
    loadCategories();
    loadPriceRange();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters]);

  const loadCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(normalizeList(response.data));
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadPriceRange = async () => {
    try {
      const response = await getProducts({});
      setAllProducts(normalizeList(response.data));
    } catch (error) {
      console.error('Error loading products for price range:', error);
    }
  };

  const applyFilters = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.search) params.search = filters.search;
      if (filters.minPrice !== null) params.min_price = filters.minPrice;
      if (filters.maxPrice !== null) params.max_price = filters.maxPrice;
      if (filters.minRating !== null) params.min_rating = filters.minRating;
      if (filters.inStock) params.in_stock = true;
      if (filters.hasDiscount) params.has_discount = true;
      if (filters.featured) params.featured = true;
      if (filters.flashSale) params.flash_sale = true;
      if (filters.sortBy) params.sort_by = filters.sortBy;

      const response = await getProducts(params);
      setProducts(normalizeList(response.data));
    } catch (error) {
      console.error('Error filtering products:', error);
      message.error('Failed to filter products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setFilters({ ...filters, search: value });
    if (value) {
      setSearchParams({ ...Object.fromEntries(searchParams), search: value });
    } else {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('search');
      setSearchParams(newParams);
    }
  };

  const handleCategoryChange = (value) => {
    setFilters({ ...filters, category: value || '' });
    if (value) {
      setSearchParams({ ...Object.fromEntries(searchParams), category: value });
    } else {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('category');
      setSearchParams(newParams);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      category: '',
      search: '',
      minPrice: null,
      maxPrice: null,
      minRating: null,
      inStock: false,
      hasDiscount: false,
      featured: false,
      flashSale: false,
      sortBy: 'newest',
    };
    setFilters(clearedFilters);
    setSearchParams({});
  };

  const getPriceRange = () => {
    if (allProducts.length === 0) return [0, 1000];
    const prices = allProducts.map(p => parseFloat(p.price));
    return [Math.min(...prices), Math.max(...prices)];
  };

  const priceRange = getPriceRange();

  const handleAddToWishlist = async (productId) => {
    if (!localStorage.getItem('token')) {
      message.warning('Please login to add to wishlist');
      navigate('/login');
      return;
    }
    try {
      await addToWishlist(productId);
      message.success('Added to wishlist');
    } catch (error) {
      message.error('Failed to add to wishlist');
    }
  };

  const handleAddToCart = async (productId) => {
    if (!localStorage.getItem('token')) {
      message.warning('Please login to add to cart');
      navigate('/login');
      return;
    }
    try {
      await addToCart(productId, 1);
      message.success('Added to cart');
    } catch (error) {
      message.error('Failed to add to cart');
    }
  };

  const activeFiltersCount = Object.values(filters).filter(v => 
    v !== '' && v !== null && v !== false && v !== 'newest'
  ).length;

  return (
    <div className="digikala-products-page">
      <Row gutter={[24, 24]}>
        {/* Filter Sidebar */}
        <Col xs={24} sm={24} md={6} lg={5} xl={4}>
          <Card 
            className="filters-sidebar"
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span><FilterOutlined /> Filters</span>
                {activeFiltersCount > 0 && (
                  <Button 
                    type="link" 
                    size="small" 
                    icon={<ClearOutlined />}
                    onClick={clearAllFilters}
                    style={{ padding: 0 }}
                  >
                    Clear All
                  </Button>
                )}
              </div>
            }
          >
            <Collapse 
              defaultActiveKey={['1', '2', '3', '4', '5']} 
              ghost
              items={[
                {
                  key: '1',
                  label: <span><StarOutlined /> Sort By</span>,
                  children: (
                    <Radio.Group
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      style={{ width: '100%' }}
                    >
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Radio value="newest">Newest First</Radio>
                        <Radio value="oldest">Oldest First</Radio>
                        <Radio value="price_low">Price: Low to High</Radio>
                        <Radio value="price_high">Price: High to Low</Radio>
                        <Radio value="rating">Highest Rated</Radio>
                        <Radio value="discount">Biggest Discount</Radio>
                      </Space>
                    </Radio.Group>
                  ),
                },
                {
                  key: '2',
                  label: <span><DollarOutlined /> Price Range</span>,
                  children: (
                    <>
                      <Slider
                        range
                        min={priceRange[0]}
                        max={priceRange[1]}
                        value={[
                          filters.minPrice !== null ? filters.minPrice : priceRange[0],
                          filters.maxPrice !== null ? filters.maxPrice : priceRange[1]
                        ]}
                        onChange={(value) => {
                          handleFilterChange('minPrice', value[0]);
                          handleFilterChange('maxPrice', value[1]);
                        }}
                        marks={{
                          [priceRange[0]]: `$${priceRange[0]}`,
                          [priceRange[1]]: `$${priceRange[1]}`,
                        }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                        <Input
                          size="small"
                          prefix="$"
                          value={filters.minPrice !== null ? String(filters.minPrice) : String(priceRange[0])}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || priceRange[0];
                            handleFilterChange('minPrice', val);
                          }}
                          style={{ width: '45%' }}
                        />
                        <Input
                          size="small"
                          prefix="$"
                          value={filters.maxPrice !== null ? String(filters.maxPrice) : String(priceRange[1])}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || priceRange[1];
                            handleFilterChange('maxPrice', val);
                          }}
                          style={{ width: '45%' }}
                        />
                      </div>
                    </>
                  ),
                },
                {
                  key: '3',
                  label: <span>📦 Category</span>,
                  children: (
                    <Select
                      placeholder="All Categories"
                      allowClear
                      style={{ width: '100%' }}
                      value={filters.category || undefined}
                      onChange={handleCategoryChange}
                    >
                      {categories.map((cat) => (
                        <Option key={cat.id} value={cat.slug}>
                          {cat.name}
                        </Option>
                      ))}
                    </Select>
                  ),
                },
                {
                  key: '4',
                  label: <span><StarOutlined /> Rating</span>,
                  children: (
                    <Radio.Group
                      value={filters.minRating !== null ? filters.minRating : ''}
                      onChange={(e) => handleFilterChange('minRating', e.target.value === '' ? null : e.target.value)}
                      style={{ width: '100%' }}
                    >
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Radio value="">All Ratings</Radio>
                        <Radio value={4.5}>4.5+ Stars</Radio>
                        <Radio value={4.0}>4.0+ Stars</Radio>
                        <Radio value={3.5}>3.5+ Stars</Radio>
                        <Radio value={3.0}>3.0+ Stars</Radio>
                      </Space>
                    </Radio.Group>
                  ),
                },
                {
                  key: '5',
                  label: <span><CheckCircleOutlined /> More Filters</span>,
                  children: (
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Checkbox
                        checked={filters.inStock}
                        onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                      >
                        In Stock Only
                      </Checkbox>
                      <Checkbox
                        checked={filters.hasDiscount}
                        onChange={(e) => handleFilterChange('hasDiscount', e.target.checked)}
                      >
                        On Sale / Discounted
                      </Checkbox>
                      <Checkbox
                        checked={filters.featured}
                        onChange={(e) => handleFilterChange('featured', e.target.checked)}
                      >
                        Featured Products
                      </Checkbox>
                      <Checkbox
                        checked={filters.flashSale}
                        onChange={(e) => handleFilterChange('flashSale', e.target.checked)}
                      >
                        <FireOutlined /> Flash Sale
                      </Checkbox>
                    </Space>
                  ),
                },
              ]}
            />
          </Card>
        </Col>

        {/* Products Section */}
        <Col xs={24} sm={24} md={18} lg={19} xl={20}>
          <Card className="products-header-card">
            <div className="products-header">
              <Input.Search
                placeholder="Search products..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                style={{ flex: 1, maxWidth: 600 }}
                onSearch={handleSearch}
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
              <div className="results-info">
                <strong>{products.length}</strong> product{products.length !== 1 ? 's' : ''} found
                {activeFiltersCount > 0 && (
                  <span style={{ color: '#667eea', marginLeft: 8 }}>
                    ({activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active)
                  </span>
                )}
              </div>
            </div>
          </Card>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px 24px' }}>
              <Spin size="large" />
            </div>
          ) : products.length === 0 ? (
            <Card style={{ marginTop: 24 }}>
              <Empty
                description={
                  <span style={{ fontSize: 16 }}>
                    No products found matching your criteria
                  </span>
                }
                style={{ padding: '60px 0' }}
              >
                <Button type="primary" onClick={clearAllFilters}>
                  Clear All Filters
                </Button>
              </Empty>
            </Card>
          ) : (
            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
              {products.map((product) => (
                <Col xs={12} sm={8} md={8} lg={6} xl={4} key={product.id}>
                  <DigikalaProductCard
                    product={product}
                    onAddToWishlist={handleAddToWishlist}
                    onAddToCart={handleAddToCart}
                  />
                </Col>
              ))}
            </Row>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default Products;
