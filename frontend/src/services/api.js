import axios from 'axios';

const API_BASE_URL = 'http://localhost:8001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Include credentials for session-based auth
  config.withCredentials = true;
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't log 403/401 errors for authenticated endpoints when user is not logged in
    // These are expected when accessing cart/wishlist/orders without authentication
    const isAuthError = error.response?.status === 403 || error.response?.status === 401;
    const isAuthEndpoint = error.config?.url?.includes('/cart') || 
                          error.config?.url?.includes('/wishlist') || 
                          error.config?.url?.includes('/orders');
    const hasToken = localStorage.getItem('token');
    
    // Only suppress logging if it's an auth error on an auth endpoint and user has no token
    if (isAuthError && isAuthEndpoint && !hasToken) {
      // Silently handle - this is expected behavior
      return Promise.reject(error);
    }
    
    // Log other errors
    if (error.response) {
      // Server responded with error status
      console.error('Response error:', error.response.status, error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('No response received:', error.request);
      console.error('Is FastAPI running on http://localhost:8001?');
    } else {
      // Error setting up request
      console.error('Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Categories
export const getCategories = () => api.get('/categories');
export const getCategory = (slug) => api.get(`/categories/${slug}`);

// Products
export const getProducts = (params) => api.get('/products', { params });
export const getProduct = (id) => api.get(`/products/${id}`);

// Wishlist
export const getWishlist = () => api.get('/wishlist');
export const addToWishlist = (productId) => api.post('/wishlist/add', null, { params: { product_id: productId } });
export const removeFromWishlist = (productId) => api.delete('/wishlist/remove', { params: { product_id: productId } });

// Cart
export const getCart = () => api.get('/cart');
export const addToCart = (productId, quantity = 1) =>
  api.post('/cart', { product_id: productId, quantity });
export const updateCartItem = (itemId, quantity) =>
  api.put(`/cart/${itemId}?quantity=${quantity}`, { quantity });
export const removeFromCart = (itemId) => api.delete(`/cart/${itemId}`);
export const clearCart = () => api.delete('/cart');

// Orders
export const getOrders = () => api.get('/orders');
export const getOrder = (id) => api.get(`/orders/${id}`);
export const createOrder = (shippingAddress) =>
  api.post('/orders', { shipping_address: shippingAddress });

// Authentication
export const register = (username, email, password) =>
  api.post('/auth/register', { username, email, password });
export const login = (username, password) =>
  api.post('/auth/login', { username, password });

// Reviews
export const getReviews = (productId) => api.get('/reviews', { params: { product_id: productId } });
export const getUserProductReview = (productId) => api.get('/reviews/user_product_review', { params: { product_id: productId } });
export const submitReview = (productId, rating, comment = '') =>
  api.post('/reviews', { product_id: productId, rating, comment });
export const getMyReviews = () => api.get('/reviews/my_reviews');

export default api;

