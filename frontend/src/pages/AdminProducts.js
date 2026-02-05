import React, { useEffect, useMemo, useState } from 'react';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Button,
  Upload,
  Table,
  Space,
  Typography,
  message,
  Popconfirm,
  Result,
  Drawer,
  Tag,
} from 'antd';
import { UploadOutlined, DeleteOutlined, EditOutlined, ReloadOutlined } from '@ant-design/icons';
import { getCategories, getProducts, createProduct, deleteProduct, updateProduct, normalizeList } from '../services/api';
import './AdminProducts.css';

const { Title, Paragraph } = Typography;

const AdminProducts = () => {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    availability: 'all',
  });

  const user = useMemo(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      return null;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }, []);

  const isAdmin = !!(user?.is_staff || user?.is_superuser);

  useEffect(() => {
    if (isAdmin) {
      loadCategories();
      loadProducts();
    }
  }, [isAdmin]);

  useEffect(() => {
    applyFilters();
  }, [filters, products]);

  const loadCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(normalizeList(response.data));
    } catch (error) {
      message.error('Failed to load categories');
      console.error(error);
    }
  };

  const loadProducts = async () => {
    setTableLoading(true);
    try {
      const response = await getProducts();
      setProducts(normalizeList(response.data));
    } catch (error) {
      message.error('Failed to load products');
      console.error(error);
    } finally {
      setTableLoading(false);
    }
  };

  const applyFilters = () => {
    const { search, category, availability } = filters;
    let next = [...products];
    if (search) {
      const lower = search.toLowerCase();
      next = next.filter((product) =>
        product.name?.toLowerCase().includes(lower) ||
        product.description?.toLowerCase().includes(lower)
      );
    }
    if (category) {
      next = next.filter((product) => product.category?.id === category);
    }
    if (availability !== 'all') {
      const available = availability === 'available';
      next = next.filter((product) => !!product.available === available);
    }
    setFilteredProducts(next);
  };

  const handleCreate = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      if (values.slug) {
        formData.append('slug', values.slug);
      }
      formData.append('description', values.description);
      formData.append('price', values.price);
      if (values.discount_price !== undefined && values.discount_price !== null) {
        formData.append('discount_price', values.discount_price);
      }
      formData.append('category_id', values.category_id);
      formData.append('stock', values.stock);
      formData.append('available', values.available);
      formData.append('is_featured', values.is_featured);
      formData.append('is_flash_sale', values.is_flash_sale);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await createProduct(formData);
      message.success('Product created');
      form.resetFields();
      setImageFile(null);
      loadProducts();
    } catch (error) {
      const detail = error.response?.data || {};
      message.error(detail?.detail || detail?.error || 'Failed to create product');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    editForm.setFieldsValue({
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: Number(product.price),
      discount_price: product.discount_price !== null ? Number(product.discount_price) : null,
      category_id: product.category?.id,
      stock: product.stock,
      available: product.available,
      is_featured: product.is_featured,
      is_flash_sale: product.is_flash_sale,
    });
    setEditImageFile(null);
    setEditOpen(true);
  };

  const handleUpdate = async (values) => {
    if (!editingProduct) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      if (values.slug) {
        formData.append('slug', values.slug);
      }
      formData.append('description', values.description);
      formData.append('price', values.price);
      if (values.discount_price !== undefined && values.discount_price !== null) {
        formData.append('discount_price', values.discount_price);
      } else {
        formData.append('discount_price', '');
      }
      formData.append('category_id', values.category_id);
      formData.append('stock', values.stock);
      formData.append('available', values.available);
      formData.append('is_featured', values.is_featured);
      formData.append('is_flash_sale', values.is_flash_sale);
      if (editImageFile) {
        formData.append('image', editImageFile);
      }

      await updateProduct(editingProduct.id, formData);
      message.success('Product updated');
      setEditOpen(false);
      setEditingProduct(null);
      editForm.resetFields();
      loadProducts();
    } catch (error) {
      const detail = error.response?.data || {};
      message.error(detail?.detail || detail?.error || 'Failed to update product');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    try {
      await deleteProduct(productId);
      message.success('Product deleted');
      loadProducts();
    } catch (error) {
      message.error('Failed to delete product');
      console.error(error);
    }
  };

  if (!isAdmin) {
    return (
      <div className="page-container admin-products-container">
        <Result
          status="403"
          title="Admin Access Required"
          subTitle="You must be logged in as an admin to manage products."
          extra={
            <Button type="primary" href="/login">
              Go to Login
            </Button>
          }
        />
      </div>
    );
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Category',
      dataIndex: ['category', 'name'],
      key: 'category',
      render: (_, record) => record.category?.name || 'N/A',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (value) => `$${value}`,
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
    },
    {
      title: 'Status',
      dataIndex: 'available',
      key: 'available',
      render: (value) => (
        <Tag color={value ? 'green' : 'red'}>
          {value ? 'Available' : 'Unavailable'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete this product?"
            onConfirm={() => handleDelete(record.id)}
            okText="Delete"
            cancelText="Cancel"
          >
            <Button danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container admin-products-container">
      <div className="admin-products-grid">
        <Card className="admin-form-card">
          <Title level={3}>Add New Product</Title>
          <Paragraph type="secondary">
            Create products with pricing, stock, and optional image.
          </Paragraph>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreate}
            initialValues={{
              available: true,
              is_featured: false,
              is_flash_sale: false,
              stock: 0,
            }}
          >
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: 'Name is required' }]}
            >
              <Input placeholder="Product name" />
            </Form.Item>

            <Form.Item label="Slug" name="slug">
              <Input placeholder="Optional (auto-generated if empty)" />
            </Form.Item>

            <Form.Item
              label="Description"
              name="description"
              rules={[{ required: true, message: 'Description is required' }]}
            >
              <Input.TextArea rows={4} placeholder="Product description" />
            </Form.Item>

            <div className="admin-form-row">
              <Form.Item
                label="Price"
                name="price"
                rules={[{ required: true, message: 'Price is required' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item label="Discount Price" name="discount_price">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </div>

            <div className="admin-form-row">
              <Form.Item
                label="Category"
                name="category_id"
                rules={[{ required: true, message: 'Category is required' }]}
              >
                <Select
                  placeholder="Select category"
                  options={categories.map((cat) => ({
                    label: cat.name,
                    value: cat.id,
                  }))}
                />
              </Form.Item>
              <Form.Item
                label="Stock"
                name="stock"
                rules={[{ required: true, message: 'Stock is required' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </div>

            <div className="admin-form-row switches">
              <Form.Item label="Available" name="available" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item label="Featured" name="is_featured" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item label="Flash Sale" name="is_flash_sale" valuePropName="checked">
                <Switch />
              </Form.Item>
            </div>

            <Form.Item label="Image">
              <Upload
                beforeUpload={(file) => {
                  setImageFile(file);
                  return false;
                }}
                onRemove={() => setImageFile(null)}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>Select Image</Button>
              </Upload>
            </Form.Item>

            <Button type="primary" htmlType="submit" loading={loading} block>
              Create Product
            </Button>
          </Form>
        </Card>

        <Card className="admin-table-card">
          <div className="admin-table-header">
            <div>
              <Title level={3} style={{ marginBottom: 0 }}>
                Products
              </Title>
              <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                Manage your catalog with quick filters.
              </Paragraph>
            </div>
            <Button icon={<ReloadOutlined />} onClick={loadProducts}>
              Refresh
            </Button>
          </div>
          <div className="admin-filters">
            <Input
              placeholder="Search by name or description"
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            />
            <Select
              placeholder="Filter by category"
              allowClear
              value={filters.category || undefined}
              onChange={(value) => setFilters((prev) => ({ ...prev, category: value || '' }))}
              options={categories.map((cat) => ({
                label: cat.name,
                value: cat.id,
              }))}
            />
            <Select
              value={filters.availability}
              onChange={(value) => setFilters((prev) => ({ ...prev, availability: value }))}
              options={[
                { label: 'All', value: 'all' },
                { label: 'Available', value: 'available' },
                { label: 'Unavailable', value: 'unavailable' },
              ]}
            />
          </div>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={filteredProducts}
            loading={tableLoading}
            pagination={{ pageSize: 8 }}
          />
        </Card>
      </div>

      <Drawer
        title="Edit Product"
        width={520}
        onClose={() => setEditOpen(false)}
        open={editOpen}
        destroyOnClose
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdate}
          initialValues={{
            available: true,
            is_featured: false,
            is_flash_sale: false,
            stock: 0,
          }}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Name is required' }]}
          >
            <Input placeholder="Product name" />
          </Form.Item>

          <Form.Item label="Slug" name="slug">
            <Input placeholder="Optional (auto-generated if empty)" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Description is required' }]}
          >
            <Input.TextArea rows={4} placeholder="Product description" />
          </Form.Item>

          <div className="admin-form-row">
            <Form.Item
              label="Price"
              name="price"
              rules={[{ required: true, message: 'Price is required' }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="Discount Price" name="discount_price">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </div>

          <div className="admin-form-row">
            <Form.Item
              label="Category"
              name="category_id"
              rules={[{ required: true, message: 'Category is required' }]}
            >
              <Select
                placeholder="Select category"
                options={categories.map((cat) => ({
                  label: cat.name,
                  value: cat.id,
                }))}
              />
            </Form.Item>
            <Form.Item
              label="Stock"
              name="stock"
              rules={[{ required: true, message: 'Stock is required' }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </div>

          <div className="admin-form-row switches">
            <Form.Item label="Available" name="available" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item label="Featured" name="is_featured" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item label="Flash Sale" name="is_flash_sale" valuePropName="checked">
              <Switch />
            </Form.Item>
          </div>

          <Form.Item label="Replace Image">
            <Upload
              beforeUpload={(file) => {
                setEditImageFile(file);
                return false;
              }}
              onRemove={() => setEditImageFile(null)}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Select Image</Button>
            </Upload>
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={loading} block>
            Save Changes
          </Button>
        </Form>
      </Drawer>
    </div>
  );
};

export default AdminProducts;
