import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#667eea',
          borderRadius: 12,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          fontSize: 14,
          lineHeight: 1.6,
        },
        components: {
          Button: {
            borderRadius: 12,
            controlHeight: 44,
            fontWeight: 600,
          },
          Card: {
            borderRadius: 20,
            paddingLG: 24,
          },
          Input: {
            borderRadius: 12,
            controlHeight: 44,
          },
          Select: {
            borderRadius: 12,
            controlHeight: 44,
          },
        },
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>
);

