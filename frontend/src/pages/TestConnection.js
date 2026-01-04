import React, { useState } from 'react';
import { Card, Button, Typography, Space, Alert } from 'antd';
import { getProducts, getCategories } from '../services/api';

const { Title, Paragraph } = Typography;

const TestConnection = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    const testResults = {};

    // Test 1: FastAPI root
    try {
      const response = await fetch('http://localhost:8001/');
      testResults.fastapi = {
        status: response.status,
        ok: response.ok,
        data: await response.json()
      };
    } catch (error) {
      testResults.fastapi = { error: error.message };
    }

    // Test 2: FastAPI products
    try {
      const response = await fetch('http://localhost:8001/products');
      testResults.fastapiProducts = {
        status: response.status,
        ok: response.ok,
        data: await response.json()
      };
    } catch (error) {
      testResults.fastapiProducts = { error: error.message };
    }

    // Test 3: Django products
    try {
      const response = await fetch('http://localhost:8000/api/products/');
      testResults.djangoProducts = {
        status: response.status,
        ok: response.ok,
        data: await response.json()
      };
    } catch (error) {
      testResults.djangoProducts = { error: error.message };
    }

    // Test 4: API service
    try {
      const response = await getProducts();
      testResults.apiService = {
        ok: true,
        data: response.data
      };
    } catch (error) {
      testResults.apiService = {
        error: error.message,
        response: error.response?.status,
        data: error.response?.data
      };
    }

    // Test 5: Categories
    try {
      const response = await getCategories();
      testResults.categories = {
        ok: true,
        data: response.data
      };
    } catch (error) {
      testResults.categories = {
        error: error.message,
        response: error.response?.status
      };
    }

    setResults(testResults);
    setLoading(false);
  };

  return (
    <div style={{ padding: '48px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <Title level={1}>Connection Test</Title>
      <Paragraph>Click the button below to test all connections</Paragraph>

      <Button
        type="primary"
        size="large"
        onClick={testConnection}
        loading={loading}
        style={{ marginBottom: 24 }}
      >
        Test All Connections
      </Button>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* FastAPI Root */}
        <Card title="1. FastAPI Root (http://localhost:8001/)" size="small">
          {results.fastapi ? (
            results.fastapi.error ? (
              <Alert type="error" message={results.fastapi.error} />
            ) : (
              <Alert
                type={results.fastapi.ok ? 'success' : 'warning'}
                message={`Status: ${results.fastapi.status}`}
                description={JSON.stringify(results.fastapi.data, null, 2)}
              />
            )
          ) : (
            <Paragraph>Not tested yet</Paragraph>
          )}
        </Card>

        {/* FastAPI Products */}
        <Card title="2. FastAPI Products (http://localhost:8001/products)" size="small">
          {results.fastapiProducts ? (
            results.fastapiProducts.error ? (
              <Alert type="error" message={results.fastapiProducts.error} />
            ) : (
              <Alert
                type={results.fastapiProducts.ok ? 'success' : 'warning'}
                message={`Status: ${results.fastapiProducts.status}`}
                description={`Products: ${JSON.stringify(results.fastapiProducts.data, null, 2)}`}
              />
            )
          ) : (
            <Paragraph>Not tested yet</Paragraph>
          )}
        </Card>

        {/* Django Products */}
        <Card title="3. Django Products (http://localhost:8000/api/products/)" size="small">
          {results.djangoProducts ? (
            results.djangoProducts.error ? (
              <Alert type="error" message={results.djangoProducts.error} />
            ) : (
              <Alert
                type={results.djangoProducts.ok ? 'success' : 'warning'}
                message={`Status: ${results.djangoProducts.status}`}
                description={`Products: ${JSON.stringify(results.djangoProducts.data, null, 2)}`}
              />
            )
          ) : (
            <Paragraph>Not tested yet</Paragraph>
          )}
        </Card>

        {/* API Service */}
        <Card title="4. API Service (getProducts())" size="small">
          {results.apiService ? (
            results.apiService.error ? (
              <Alert
                type="error"
                message={results.apiService.error}
                description={`Response Status: ${results.apiService.response || 'N/A'}`}
              />
            ) : (
              <Alert
                type="success"
                message="Success!"
                description={`Products: ${JSON.stringify(results.apiService.data, null, 2)}`}
              />
            )
          ) : (
            <Paragraph>Not tested yet</Paragraph>
          )}
        </Card>

        {/* Categories */}
        <Card title="5. Categories (getCategories())" size="small">
          {results.categories ? (
            results.categories.error ? (
              <Alert
                type="error"
                message={results.categories.error}
                description={`Response Status: ${results.categories.response || 'N/A'}`}
              />
            ) : (
              <Alert
                type="success"
                message="Success!"
                description={`Categories: ${JSON.stringify(results.categories.data, null, 2)}`}
              />
            )
          ) : (
            <Paragraph>Not tested yet</Paragraph>
          )}
        </Card>
      </Space>
    </div>
  );
};

export default TestConnection;



