/**
 * Tests for the API service module.
 *
 * Tests all API calls including interceptors, error handling,
 * and various endpoint methods.
 */

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import * as api from './api';

// Create a mock adapter for axios
const mock = new MockAdapter(axios);

describe('API Service', () => {
  beforeEach(() => {
    // Reset mock and localStorage before each test
    mock.reset();
    localStorage.clear();
  });

  afterEach(() => {
    mock.reset();
  });

  describe('Request Interceptor', () => {
    it('should add Authorization header when token exists', async () => {
      localStorage.setItem('token', 'test-token');

      mock.onGet('http://localhost:8001/categories').reply((config) => {
        expect(config.headers.Authorization).toBe('Bearer test-token');
        return [200, []];
      });

      await api.getCategories();
    });

    it('should not add Authorization header when token does not exist', async () => {
      mock.onGet('http://localhost:8001/categories').reply((config) => {
        expect(config.headers.Authorization).toBeUndefined();
        return [200, []];
      });

      await api.getCategories();
    });

    it('should include withCredentials for all requests', async () => {
      mock.onGet('http://localhost:8001/categories').reply((config) => {
        expect(config.withCredentials).toBe(true);
        return [200, []];
      });

      await api.getCategories();
    });
  });

  describe('Categories API', () => {
    it('should fetch categories successfully', async () => {
      const mockData = [
        { id: 1, name: 'Electronics', slug: 'electronics' },
        { id: 2, name: 'Clothing', slug: 'clothing' }
      ];

      mock.onGet('http://localhost:8001/categories').reply(200, mockData);

      const response = await api.getCategories();
      expect(response.data).toEqual(mockData);
    });

    it('should fetch a single category by slug', async () => {
      const mockData = { id: 1, name: 'Electronics', slug: 'electronics' };

      mock.onGet('http://localhost:8001/categories/electronics').reply(200, mockData);

      const response = await api.getCategory('electronics');
      expect(response.data).toEqual(mockData);
    });
  });

  describe('Products API', () => {
    it('should fetch products without parameters', async () => {
      const mockData = [{ id: 1, name: 'Laptop', price: 999.99 }];

      mock.onGet('http://localhost:8001/products').reply(200, mockData);

      const response = await api.getProducts();
      expect(response.data).toEqual(mockData);
    });

    it('should fetch products with filter parameters', async () => {
      const mockData = [{ id: 1, name: 'Laptop', price: 999.99 }];
      const params = { category: 'electronics', search: 'laptop', min_price: 500 };

      mock.onGet('http://localhost:8001/products', { params }).reply(200, mockData);

      const response = await api.getProducts(params);
      expect(response.data).toEqual(mockData);
    });

    it('should fetch a single product by id', async () => {
      const mockData = { id: 123, name: 'Laptop', price: 999.99 };

      mock.onGet('http://localhost:8001/products/123').reply(200, mockData);

      const response = await api.getProduct(123);
      expect(response.data).toEqual(mockData);
    });
  });

  describe('Cart API', () => {
    it('should fetch cart items', async () => {
      const mockData = [
        { id: 1, product: { id: 123, name: 'Laptop' }, quantity: 2, total_price: 1999.98 }
      ];

      mock.onGet('http://localhost:8001/cart').reply(200, mockData);

      const response = await api.getCart();
      expect(response.data).toEqual(mockData);
    });

    it('should add item to cart', async () => {
      const mockData = { id: 1, product: { id: 123 }, quantity: 1 };

      mock.onPost('http://localhost:8001/cart').reply(200, mockData);

      const response = await api.addToCart(123, 1);
      expect(response.data).toEqual(mockData);
    });

    it('should add item to cart with default quantity', async () => {
      const mockData = { id: 1, product: { id: 123 }, quantity: 1 };

      mock.onPost('http://localhost:8001/cart', { product_id: 123, quantity: 1 }).reply(200, mockData);

      const response = await api.addToCart(123);
      expect(response.data).toEqual(mockData);
    });

    it('should update cart item quantity', async () => {
      const mockData = { id: 1, quantity: 3 };

      mock.onPut('http://localhost:8001/cart/1?quantity=3').reply(200, mockData);

      const response = await api.updateCartItem(1, 3);
      expect(response.data).toEqual(mockData);
    });

    it('should remove item from cart', async () => {
      mock.onDelete('http://localhost:8001/cart/1').reply(200, { message: 'Removed' });

      const response = await api.removeFromCart(1);
      expect(response.status).toBe(200);
    });

    it('should clear cart', async () => {
      mock.onDelete('http://localhost:8001/cart').reply(200, { message: 'Cart cleared' });

      const response = await api.clearCart();
      expect(response.status).toBe(200);
    });
  });

  describe('Wishlist API', () => {
    it('should fetch wishlist items', async () => {
      const mockData = [{ id: 123, name: 'Laptop', price: 999.99 }];

      mock.onGet('http://localhost:8001/wishlist').reply(200, mockData);

      const response = await api.getWishlist();
      expect(response.data).toEqual(mockData);
    });

    it('should add item to wishlist', async () => {
      const mockData = { message: 'Added to wishlist' };

      mock.onPost('http://localhost:8001/wishlist/add').reply(200, mockData);

      const response = await api.addToWishlist(123);
      expect(response.data).toEqual(mockData);
    });

    it('should remove item from wishlist', async () => {
      mock.onDelete('http://localhost:8001/wishlist/remove').reply(200, { message: 'Removed' });

      const response = await api.removeFromWishlist(123);
      expect(response.status).toBe(200);
    });
  });

  describe('Orders API', () => {
    it('should fetch orders', async () => {
      const mockData = [{ id: 1, total_amount: 1999.98 }];

      mock.onGet('http://localhost:8001/orders').reply(200, mockData);

      const response = await api.getOrders();
      expect(response.data).toEqual(mockData);
    });

    it('should fetch a single order', async () => {
      const mockData = { id: 1, total_amount: 1999.98 };

      mock.onGet('http://localhost:8001/orders/1').reply(200, mockData);

      const response = await api.getOrder(1);
      expect(response.data).toEqual(mockData);
    });

    it('should create an order', async () => {
      const mockData = { id: 1, shipping_address: '123 Main St' };

      mock.onPost('http://localhost:8001/orders').reply(201, mockData);

      const response = await api.createOrder('123 Main St');
      expect(response.data).toEqual(mockData);
    });
  });

  describe('Authentication API', () => {
    it('should register a new user', async () => {
      const mockData = { id: 1, username: 'testuser', email: 'test@example.com' };

      mock.onPost('http://localhost:8001/auth/register').reply(201, mockData);

      const response = await api.register('testuser', 'test@example.com', 'password123');
      expect(response.data).toEqual(mockData);
    });

    it('should login a user', async () => {
      const mockData = { token: 'test-token', user: { id: 1, username: 'testuser' } };

      mock.onPost('http://localhost:8001/auth/login').reply(200, mockData);

      const response = await api.login('testuser', 'password123');
      expect(response.data).toEqual(mockData);
    });
  });

  describe('Reviews API', () => {
    it('should fetch reviews for a product', async () => {
      const mockData = [
        { id: 1, rating: 5, comment: 'Great!', user: { username: 'user1' } }
      ];

      mock.onGet('http://localhost:8001/reviews').reply(200, mockData);

      const response = await api.getReviews(123);
      expect(response.data).toEqual(mockData);
    });

    it('should get user product review', async () => {
      const mockData = { id: 1, rating: 4, comment: 'Good' };

      mock.onGet('http://localhost:8001/reviews/user_product_review').reply(200, mockData);

      const response = await api.getUserProductReview(123);
      expect(response.data).toEqual(mockData);
    });

    it('should submit a review', async () => {
      const mockData = { id: 1, rating: 5, comment: 'Excellent!' };

      mock.onPost('http://localhost:8001/reviews').reply(201, mockData);

      const response = await api.submitReview(123, 5, 'Excellent!');
      expect(response.data).toEqual(mockData);
    });

    it('should submit a review with default empty comment', async () => {
      const mockData = { id: 1, rating: 5, comment: '' };

      mock.onPost('http://localhost:8001/reviews', {
        product_id: 123,
        rating: 5,
        comment: ''
      }).reply(201, mockData);

      const response = await api.submitReview(123, 5);
      expect(response.data).toEqual(mockData);
    });

    it('should get my reviews', async () => {
      const mockData = [
        { id: 1, rating: 5, comment: 'Great!' }
      ];

      mock.onGet('http://localhost:8001/reviews/my_reviews').reply(200, mockData);

      const response = await api.getMyReviews();
      expect(response.data).toEqual(mockData);
    });
  });

  describe('Error Handling', () => {
    it('should handle 401 errors gracefully for cart', async () => {
      mock.onGet('http://localhost:8001/cart').reply(401);

      try {
        await api.getCart();
      } catch (error) {
        expect(error.response.status).toBe(401);
      }
    });

    it('should handle network errors', async () => {
      mock.onGet('http://localhost:8001/products').networkError();

      try {
        await api.getProducts();
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toContain('Network Error');
      }
    });

    it('should handle 500 server errors', async () => {
      mock.onGet('http://localhost:8001/products').reply(500, { error: 'Internal Server Error' });

      try {
        await api.getProducts();
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(500);
      }
    });

    it('should handle 404 not found errors', async () => {
      mock.onGet('http://localhost:8001/products/999').reply(404, { error: 'Not Found' });

      try {
        await api.getProduct(999);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(404);
      }
    });
  });

  describe('Response Interceptor', () => {
    it('should not log expected auth errors for cart without token', async () => {
      // No token set
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      mock.onGet('http://localhost:8001/cart').reply(403);

      try {
        await api.getCart();
      } catch (error) {
        // Error should be silently handled
      }

      // console.error should not be called for expected auth errors
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should log unexpected errors', async () => {
      localStorage.setItem('token', 'test-token');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      mock.onGet('http://localhost:8001/products').reply(500);

      try {
        await api.getProducts();
      } catch (error) {
        // Unexpected error
      }

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty response data', async () => {
      mock.onGet('http://localhost:8001/categories').reply(200, null);

      const response = await api.getCategories();
      expect(response.data).toBeNull();
    });

    it('should handle requests with special characters', async () => {
      const mockData = [{ id: 1, name: 'Product' }];

      mock.onGet('http://localhost:8001/products').reply((config) => {
        expect(config.params.search).toBe('laptop & mouse');
        return [200, mockData];
      });

      await api.getProducts({ search: 'laptop & mouse' });
    });

    it('should handle very large product IDs', async () => {
      const mockData = { id: 999999999, name: 'Product' };

      mock.onGet('http://localhost:8001/products/999999999').reply(200, mockData);

      const response = await api.getProduct(999999999);
      expect(response.data.id).toBe(999999999);
    });
  });
});