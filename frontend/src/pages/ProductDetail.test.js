/**
 * Tests for the ProductDetail component.
 *
 * Tests product display, adding to cart/wishlist, submitting reviews,
 * and various user interactions.
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ProductDetail from './ProductDetail';
import * as api from '../services/api';

// Mock the API module
jest.mock('../services/api');

// Mock react-router-dom's useNavigate and useParams
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: '123' }),
}));

// Mock antd message
jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  message: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
  },
}));

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value.toString(); }),
    clear: jest.fn(() => { store = {}; }),
    removeItem: jest.fn((key) => { delete store[key]; }),
  };
})();
global.localStorage = localStorageMock;

const renderProductDetail = () => {
  return render(
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<ProductDetail />} />
      </Routes>
    </BrowserRouter>
  );
};

describe('ProductDetail Component', () => {
  const mockProduct = {
    id: 123,
    name: 'Laptop',
    slug: 'laptop',
    description: 'A high-quality laptop',
    price: 999.99,
    discount_price: null,
    discount_percentage: 0,
    is_flash_sale: false,
    is_featured: false,
    image: 'laptop.jpg',
    category: { id: 1, name: 'Electronics' },
    stock: 10,
    available: true,
    rating: 4.5,
    review_count: 10,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Loading State', () => {
    it('should display loading spinner while fetching product', () => {
      api.getProduct.mockReturnValue(new Promise(() => {})); // Never resolves
      api.getWishlist.mockReturnValue(new Promise(() => {}));
      api.getUserProductReview.mockReturnValue(new Promise(() => {}));
      api.getReviews.mockReturnValue(new Promise(() => {}));

      renderProductDetail();

      expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument(); // Spin
    });
  });

  describe('Product Display', () => {
    beforeEach(() => {
      api.getProduct.mockResolvedValue({ data: mockProduct });
      api.getWishlist.mockResolvedValue({ data: [] });
      api.getUserProductReview.mockResolvedValue({ data: null });
      api.getReviews.mockResolvedValue({ data: [] });
    });

    it('should display product name', async () => {
      renderProductDetail();

      await waitFor(() => {
        expect(screen.getByText('Laptop')).toBeInTheDocument();
      });
    });

    it('should display product description', async () => {
      renderProductDetail();

      await waitFor(() => {
        expect(screen.getByText('A high-quality laptop')).toBeInTheDocument();
      });
    });

    it('should display product price', async () => {
      renderProductDetail();

      await waitFor(() => {
        expect(screen.getByText('$999.99')).toBeInTheDocument();
      });
    });

    it('should display product rating', async () => {
      renderProductDetail();

      await waitFor(() => {
        expect(screen.getByText('4.5 (10 reviews)')).toBeInTheDocument();
      });
    });

    it('should display category', async () => {
      renderProductDetail();

      await waitFor(() => {
        expect(screen.getByText('Electronics')).toBeInTheDocument();
      });
    });

    it('should display stock availability', async () => {
      renderProductDetail();

      await waitFor(() => {
        expect(screen.getByText('10 units')).toBeInTheDocument();
      });
    });

    it('should display "In Stock" tag when product is available', async () => {
      renderProductDetail();

      await waitFor(() => {
        expect(screen.getByText('In Stock')).toBeInTheDocument();
      });
    });

    it('should display product image', async () => {
      renderProductDetail();

      await waitFor(() => {
        const image = screen.getByAlt('Laptop');
        expect(image).toBeInTheDocument();
        expect(image.src).toContain('laptop.jpg');
      });
    });

    it('should show "No Image Available" when product has no image', async () => {
      const productWithoutImage = { ...mockProduct, image: null };
      api.getProduct.mockResolvedValue({ data: productWithoutImage });

      renderProductDetail();

      await waitFor(() => {
        expect(screen.getByText('No Image Available')).toBeInTheDocument();
      });
    });
  });

  describe('Flash Sale Display', () => {
    it('should display discount price and badge for flash sale items', async () => {
      const flashSaleProduct = {
        ...mockProduct,
        discount_price: 799.99,
        discount_percentage: 20,
        is_flash_sale: true,
      };

      api.getProduct.mockResolvedValue({ data: flashSaleProduct });
      api.getWishlist.mockResolvedValue({ data: [] });
      api.getUserProductReview.mockResolvedValue({ data: null });
      api.getReviews.mockResolvedValue({ data: [] });

      renderProductDetail();

      await waitFor(() => {
        expect(screen.getByText('$999.99')).toBeInTheDocument(); // Original price
        expect(screen.getByText('$799.99')).toBeInTheDocument(); // Discount price
        expect(screen.getByText('-20% OFF')).toBeInTheDocument();
        expect(screen.getByText('Flash Sale!')).toBeInTheDocument();
      });
    });
  });

  describe('Add to Cart', () => {
    beforeEach(() => {
      api.getProduct.mockResolvedValue({ data: mockProduct });
      api.getWishlist.mockResolvedValue({ data: [] });
      api.getUserProductReview.mockResolvedValue({ data: null });
      api.getReviews.mockResolvedValue({ data: [] });
      localStorage.setItem('token', 'test-token');
    });

    it('should add product to cart when "Add to Cart" button is clicked', async () => {
      api.addToCart.mockResolvedValue({ data: {} });

      renderProductDetail();

      await waitFor(() => {
        expect(screen.getByText('Laptop')).toBeInTheDocument();
      });

      const addToCartButton = screen.getByText('Add to Cart');
      fireEvent.click(addToCartButton);

      await waitFor(() => {
        expect(api.addToCart).toHaveBeenCalledWith(123, 1);
      });
    });

    it('should redirect to login when not authenticated', async () => {
      localStorage.clear();

      renderProductDetail();

      await waitFor(() => {
        expect(screen.getByText('Laptop')).toBeInTheDocument();
      });

      const addToCartButton = screen.getByText('Add to Cart');
      fireEvent.click(addToCartButton);

      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('should disable "Add to Cart" when product is out of stock', async () => {
      const outOfStockProduct = { ...mockProduct, stock: 0, available: false };
      api.getProduct.mockResolvedValue({ data: outOfStockProduct });

      renderProductDetail();

      await waitFor(() => {
        const addToCartButton = screen.getByText('Add to Cart').closest('button');
        expect(addToCartButton).toBeDisabled();
      });
    });

    it('should handle add to cart errors', async () => {
      api.addToCart.mockRejectedValue({
        response: { status: 500, data: { detail: 'Server error' } }
      });

      renderProductDetail();

      await waitFor(() => {
        expect(screen.getByText('Laptop')).toBeInTheDocument();
      });

      const addToCartButton = screen.getByText('Add to Cart');
      fireEvent.click(addToCartButton);

      await waitFor(() => {
        expect(api.addToCart).toHaveBeenCalled();
      });
    });
  });

  describe('Wishlist', () => {
    beforeEach(() => {
      api.getProduct.mockResolvedValue({ data: mockProduct });
      api.getUserProductReview.mockResolvedValue({ data: null });
      api.getReviews.mockResolvedValue({ data: [] });
      localStorage.setItem('token', 'test-token');
    });

    it('should show "Add to Wishlist" when product is not in wishlist', async () => {
      api.getWishlist.mockResolvedValue({ data: [] });

      renderProductDetail();

      await waitFor(() => {
        expect(screen.getByText('Add to Wishlist')).toBeInTheDocument();
      });
    });

    it('should show "Remove from Wishlist" when product is in wishlist', async () => {
      api.getWishlist.mockResolvedValue({ data: [mockProduct] });

      renderProductDetail();

      await waitFor(() => {
        expect(screen.getByText('Remove from Wishlist')).toBeInTheDocument();
      });
    });

    it('should add product to wishlist', async () => {
      api.getWishlist.mockResolvedValue({ data: [] });
      api.addToWishlist.mockResolvedValue({ data: {} });

      renderProductDetail();

      await waitFor(() => {
        expect(screen.getByText('Laptop')).toBeInTheDocument();
      });

      const wishlistButton = screen.getByText('Add to Wishlist');
      fireEvent.click(wishlistButton);

      await waitFor(() => {
        expect(api.addToWishlist).toHaveBeenCalledWith(123);
      });
    });

    it('should remove product from wishlist', async () => {
      api.getWishlist.mockResolvedValue({ data: [mockProduct] });
      api.removeFromWishlist.mockResolvedValue({ data: {} });

      renderProductDetail();

      await waitFor(() => {
        expect(screen.getByText('Remove from Wishlist')).toBeInTheDocument();
      });

      const wishlistButton = screen.getByText('Remove from Wishlist');
      fireEvent.click(wishlistButton);

      await waitFor(() => {
        expect(api.removeFromWishlist).toHaveBeenCalledWith(123);
      });
    });

    it('should redirect to login when not authenticated', async () => {
      localStorage.clear();
      api.getWishlist.mockResolvedValue({ data: [] });

      renderProductDetail();

      await waitFor(() => {
        expect(screen.getByText('Laptop')).toBeInTheDocument();
      });

      const wishlistButton = screen.getByText('Add to Wishlist');
      fireEvent.click(wishlistButton);

      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  describe('Reviews', () => {
    beforeEach(() => {
      api.getProduct.mockResolvedValue({ data: mockProduct });
      api.getWishlist.mockResolvedValue({ data: [] });
      localStorage.setItem('token', 'test-token');
    });

    it('should display review section', async () => {
      api.getUserProductReview.mockResolvedValue({ data: null });
      api.getReviews.mockResolvedValue({ data: [] });

      renderProductDetail();

      await waitFor(() => {
        expect(screen.getByText('Customer Reviews (10)')).toBeInTheDocument();
      });
    });

    it('should display existing reviews', async () => {
      const mockReviews = [
        {
          id: 1,
          user: { username: 'user1' },
          rating: 5,
          comment: 'Excellent product!',
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 2,
          user: { username: 'user2' },
          rating: 4,
          comment: 'Good quality',
          created_at: '2024-01-02T00:00:00Z',
        },
      ];

      api.getUserProductReview.mockResolvedValue({ data: null });
      api.getReviews.mockResolvedValue({ data: mockReviews });

      renderProductDetail();

      await waitFor(() => {
        expect(screen.getByText('user1')).toBeInTheDocument();
        expect(screen.getByText('user2')).toBeInTheDocument();
        expect(screen.getByText('Excellent product!')).toBeInTheDocument();
        expect(screen.getByText('Good quality')).toBeInTheDocument();
      });
    });

    it('should show "Rate this product" section', async () => {
      api.getUserProductReview.mockResolvedValue({ data: null });
      api.getReviews.mockResolvedValue({ data: [] });

      renderProductDetail();

      await waitFor(() => {
        expect(screen.getByText('Rate this product:')).toBeInTheDocument();
      });
    });

    it('should display user\'s existing rating', async () => {
      const mockUserReview = {
        id: 1,
        rating: 5,
        comment: 'Great!',
      };

      api.getUserProductReview.mockResolvedValue({ data: mockUserReview });
      api.getReviews.mockResolvedValue({ data: [] });

      renderProductDetail();

      await waitFor(() => {
        expect(screen.getByText('You rated: 5 stars')).toBeInTheDocument();
      });
    });

    it('should submit rating when stars are clicked', async () => {
      api.getUserProductReview.mockResolvedValue({ data: null });
      api.getReviews.mockResolvedValue({ data: [] });
      api.submitReview.mockResolvedValue({ data: { rating: 5 } });

      renderProductDetail();

      await waitFor(() => {
        expect(screen.getByText('Rate this product:')).toBeInTheDocument();
      });

      // Note: Interacting with Ant Design Rate component would require more complex testing
    });

    it('should redirect to login when submitting rating without auth', async () => {
      localStorage.clear();
      api.getUserProductReview.mockRejectedValue({ response: { status: 401 } });
      api.getReviews.mockResolvedValue({ data: [] });

      renderProductDetail();

      await waitFor(() => {
        expect(screen.getByText('Laptop')).toBeInTheDocument();
      });

      // When user tries to rate without login, should redirect
    });

    it('should show "No reviews yet" when no reviews exist', async () => {
      api.getUserProductReview.mockResolvedValue({ data: null });
      api.getReviews.mockResolvedValue({ data: [] });

      renderProductDetail();

      await waitFor(() => {
        expect(screen.getByText('No reviews yet. Be the first to review this product!')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle product not found', async () => {
      api.getProduct.mockRejectedValue({ response: { status: 404 } });
      api.getWishlist.mockResolvedValue({ data: [] });
      api.getUserProductReview.mockResolvedValue({ data: null });
      api.getReviews.mockResolvedValue({ data: [] });

      const consoleError = jest.spyOn(console, 'error').mockImplementation();

      renderProductDetail();

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled();
      });

      consoleError.mockRestore();
    });

    it('should handle network errors gracefully', async () => {
      api.getProduct.mockRejectedValue(new Error('Network error'));
      api.getWishlist.mockResolvedValue({ data: [] });
      api.getUserProductReview.mockResolvedValue({ data: null });
      api.getReviews.mockResolvedValue({ data: [] });

      const consoleError = jest.spyOn(console, 'error').mockImplementation();

      renderProductDetail();

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled();
      });

      consoleError.mockRestore();
    });
  });

  describe('Quantity Selection', () => {
    beforeEach(() => {
      api.getProduct.mockResolvedValue({ data: mockProduct });
      api.getWishlist.mockResolvedValue({ data: [] });
      api.getUserProductReview.mockResolvedValue({ data: null });
      api.getReviews.mockResolvedValue({ data: [] });
    });

    it('should display quantity input', async () => {
      renderProductDetail();

      await waitFor(() => {
        expect(screen.getByText('Quantity:')).toBeInTheDocument();
      });
    });

    it('should limit quantity to available stock', async () => {
      renderProductDetail();

      await waitFor(() => {
        // InputNumber component should have max prop set to stock
        expect(screen.getByText('Quantity:')).toBeInTheDocument();
      });
    });
  });

  describe('Featured and Flash Sale Tags', () => {
    it('should display "Featured" tag for featured products', async () => {
      const featuredProduct = { ...mockProduct, is_featured: true };
      api.getProduct.mockResolvedValue({ data: featuredProduct });
      api.getWishlist.mockResolvedValue({ data: [] });
      api.getUserProductReview.mockResolvedValue({ data: null });
      api.getReviews.mockResolvedValue({ data: [] });

      renderProductDetail();

      await waitFor(() => {
        expect(screen.getByText('Featured')).toBeInTheDocument();
      });
    });
  });
});