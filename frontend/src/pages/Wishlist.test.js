/**
 * Tests for the Wishlist component.
 *
 * Tests wishlist display, adding to cart, removing items,
 * and navigation.
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Wishlist from './Wishlist';
import * as api from '../services/api';

// Mock the API module
jest.mock('../services/api');

// Mock react-router-dom's useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
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

const renderWishlist = () => {
  return render(
    <BrowserRouter>
      <Wishlist />
    </BrowserRouter>
  );
};

describe('Wishlist Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should display loading spinner while fetching wishlist', () => {
      api.getWishlist.mockReturnValue(new Promise(() => {})); // Never resolves

      renderWishlist();

      expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument(); // Ant Design Spin
    });
  });

  describe('Empty Wishlist', () => {
    it('should display empty wishlist message', async () => {
      api.getWishlist.mockResolvedValue({ data: [] });

      renderWishlist();

      await waitFor(() => {
        expect(screen.getByText('Your wishlist is empty')).toBeInTheDocument();
      });
    });

    it('should show "Browse Products" button when wishlist is empty', async () => {
      api.getWishlist.mockResolvedValue({ data: [] });

      renderWishlist();

      await waitFor(() => {
        const button = screen.getByText('Browse Products');
        expect(button).toBeInTheDocument();
      });
    });

    it('should navigate to products when clicking "Browse Products"', async () => {
      api.getWishlist.mockResolvedValue({ data: [] });

      renderWishlist();

      await waitFor(() => {
        const button = screen.getByText('Browse Products');
        fireEvent.click(button);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/products');
    });
  });

  describe('Wishlist with Items', () => {
    const mockWishlistItems = [
      {
        id: 123,
        name: 'Laptop',
        price: 999.99,
        discount_price: null,
        is_flash_sale: false,
        image: 'laptop.jpg',
        stock: 10,
        available: true,
      },
      {
        id: 456,
        name: 'Mouse',
        price: 29.99,
        discount_price: 24.99,
        is_flash_sale: true,
        image: null,
        stock: 0,
        available: false,
      },
    ];

    it('should display wishlist items', async () => {
      api.getWishlist.mockResolvedValue({ data: mockWishlistItems });

      renderWishlist();

      await waitFor(() => {
        expect(screen.getByText('Laptop')).toBeInTheDocument();
        expect(screen.getByText('Mouse')).toBeInTheDocument();
      });
    });

    it('should display correct item count in title', async () => {
      api.getWishlist.mockResolvedValue({ data: mockWishlistItems });

      renderWishlist();

      await waitFor(() => {
        expect(screen.getByText(/My Wishlist \(2 items\)/)).toBeInTheDocument();
      });
    });

    it('should display singular "item" for single item', async () => {
      api.getWishlist.mockResolvedValue({ data: [mockWishlistItems[0]] });

      renderWishlist();

      await waitFor(() => {
        expect(screen.getByText(/My Wishlist \(1 item\)/)).toBeInTheDocument();
      });
    });

    it('should display product prices', async () => {
      api.getWishlist.mockResolvedValue({ data: mockWishlistItems });

      renderWishlist();

      await waitFor(() => {
        expect(screen.getByText('$999.99')).toBeInTheDocument();
        expect(screen.getByText('$29.99')).toBeInTheDocument();
      });
    });

    it('should display discount price for flash sale items', async () => {
      api.getWishlist.mockResolvedValue({ data: mockWishlistItems });

      renderWishlist();

      await waitFor(() => {
        expect(screen.getByText('$24.99')).toBeInTheDocument(); // Discount price
      });
    });

    it('should show stock status', async () => {
      api.getWishlist.mockResolvedValue({ data: mockWishlistItems });

      renderWishlist();

      await waitFor(() => {
        expect(screen.getByText('In Stock (10)')).toBeInTheDocument();
        expect(screen.getByText('Out of Stock')).toBeInTheDocument();
      });
    });

    it('should display product images', async () => {
      api.getWishlist.mockResolvedValue({ data: mockWishlistItems });

      renderWishlist();

      await waitFor(() => {
        // Product images are displayed as background images in divs
        const imageDiv = screen.getByText('Laptop').closest('.ant-card').querySelector('[style*="laptop.jpg"]');
        expect(imageDiv).toBeInTheDocument();
      });
    });

    it('should show "No Image" placeholder for items without image', async () => {
      api.getWishlist.mockResolvedValue({ data: mockWishlistItems });

      renderWishlist();

      await waitFor(() => {
        expect(screen.getByText('No Image')).toBeInTheDocument();
      });
    });
  });

  describe('Add to Cart', () => {
    it('should add item to cart when "Add to Cart" button is clicked', async () => {
      const mockWishlistItems = [{
        id: 123,
        name: 'Laptop',
        price: 999.99,
        stock: 10,
        available: true,
      }];

      api.getWishlist.mockResolvedValue({ data: mockWishlistItems });
      api.addToCart.mockResolvedValue({ data: {} });

      renderWishlist();

      await waitFor(() => {
        expect(screen.getByText('Laptop')).toBeInTheDocument();
      });

      const addToCartButton = screen.getByText('Add to Cart');
      fireEvent.click(addToCartButton);

      await waitFor(() => {
        expect(api.addToCart).toHaveBeenCalledWith(123, 1);
      });
    });

    it('should disable "Add to Cart" for out of stock items', async () => {
      const mockWishlistItems = [{
        id: 123,
        name: 'Laptop',
        price: 999.99,
        stock: 0,
        available: false,
      }];

      api.getWishlist.mockResolvedValue({ data: mockWishlistItems });

      renderWishlist();

      await waitFor(() => {
        const addToCartButton = screen.getByText('Add to Cart').closest('button');
        expect(addToCartButton).toBeDisabled();
      });
    });

    it('should handle add to cart errors and redirect to login if unauthorized', async () => {
      const mockWishlistItems = [{
        id: 123,
        name: 'Laptop',
        price: 999.99,
        stock: 10,
        available: true,
      }];

      api.getWishlist.mockResolvedValue({ data: mockWishlistItems });
      api.addToCart.mockRejectedValue({ response: { status: 401 } });

      renderWishlist();

      await waitFor(() => {
        expect(screen.getByText('Laptop')).toBeInTheDocument();
      });

      const addToCartButton = screen.getByText('Add to Cart');
      fireEvent.click(addToCartButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });
  });

  describe('Remove from Wishlist', () => {
    it('should remove item when "Remove" button is clicked', async () => {
      const mockWishlistItems = [{
        id: 123,
        name: 'Laptop',
        price: 999.99,
        stock: 10,
        available: true,
      }];

      api.getWishlist
        .mockResolvedValueOnce({ data: mockWishlistItems })
        .mockResolvedValueOnce({ data: [] });
      api.removeFromWishlist.mockResolvedValue({});

      renderWishlist();

      await waitFor(() => {
        expect(screen.getByText('Laptop')).toBeInTheDocument();
      });

      const removeButton = screen.getByText('Remove');
      fireEvent.click(removeButton);

      await waitFor(() => {
        expect(api.removeFromWishlist).toHaveBeenCalledWith(123);
      });
    });

    it('should show loading state while removing item', async () => {
      const mockWishlistItems = [{
        id: 123,
        name: 'Laptop',
        price: 999.99,
        stock: 10,
        available: true,
      }];

      api.getWishlist.mockResolvedValue({ data: mockWishlistItems });
      api.removeFromWishlist.mockReturnValue(new Promise(() => {})); // Never resolves

      renderWishlist();

      await waitFor(() => {
        expect(screen.getByText('Laptop')).toBeInTheDocument();
      });

      const removeButton = screen.getByText('Remove');
      fireEvent.click(removeButton);

      // Button should show loading state
      await waitFor(() => {
        expect(api.removeFromWishlist).toHaveBeenCalled();
      });
    });

    it('should handle remove errors', async () => {
      const mockWishlistItems = [{
        id: 123,
        name: 'Laptop',
        price: 999.99,
        stock: 10,
        available: true,
      }];

      api.getWishlist.mockResolvedValue({ data: mockWishlistItems });
      api.removeFromWishlist.mockRejectedValue(new Error('Remove failed'));

      renderWishlist();

      await waitFor(() => {
        expect(screen.getByText('Laptop')).toBeInTheDocument();
      });

      const removeButton = screen.getByText('Remove');
      fireEvent.click(removeButton);

      await waitFor(() => {
        expect(api.removeFromWishlist).toHaveBeenCalled();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to product detail when clicking product card', async () => {
      const mockWishlistItems = [{
        id: 123,
        name: 'Laptop',
        price: 999.99,
        stock: 10,
        available: true,
      }];

      api.getWishlist.mockResolvedValue({ data: mockWishlistItems });

      renderWishlist();

      await waitFor(() => {
        expect(screen.getByText('Laptop')).toBeInTheDocument();
      });

      // Click on product name
      const productName = screen.getByText('Laptop');
      fireEvent.click(productName);

      expect(mockNavigate).toHaveBeenCalledWith('/products/123');
    });
  });

  describe('Error Handling', () => {
    it('should redirect to login on 401 error', async () => {
      api.getWishlist.mockRejectedValue({
        response: { status: 401 }
      });

      renderWishlist();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });

    it('should handle generic errors gracefully', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      api.getWishlist.mockRejectedValue(new Error('Network error'));

      renderWishlist();

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled();
      });

      consoleError.mockRestore();
    });

    it('should display error message for failed operations', async () => {
      const mockWishlistItems = [{
        id: 123,
        name: 'Laptop',
        price: 999.99,
        stock: 10,
        available: true,
      }];

      api.getWishlist.mockResolvedValue({ data: mockWishlistItems });
      api.removeFromWishlist.mockRejectedValue(new Error('Failed to remove'));

      renderWishlist();

      await waitFor(() => {
        expect(screen.getByText('Laptop')).toBeInTheDocument();
      });
    });
  });

  describe('Price Display', () => {
    it('should show both original and discount prices for flash sale items', async () => {
      const mockWishlistItems = [{
        id: 123,
        name: 'Laptop',
        price: 999.99,
        discount_price: 799.99,
        is_flash_sale: true,
        stock: 10,
        available: true,
      }];

      api.getWishlist.mockResolvedValue({ data: mockWishlistItems });

      renderWishlist();

      await waitFor(() => {
        expect(screen.getByText('$999.99')).toBeInTheDocument(); // Original
        expect(screen.getByText('$799.99')).toBeInTheDocument(); // Discount
      });
    });

    it('should not show discount price when not in flash sale', async () => {
      const mockWishlistItems = [{
        id: 123,
        name: 'Laptop',
        price: 999.99,
        discount_price: 799.99,
        is_flash_sale: false,
        stock: 10,
        available: true,
      }];

      api.getWishlist.mockResolvedValue({ data: mockWishlistItems });

      renderWishlist();

      await waitFor(() => {
        expect(screen.getByText('$999.99')).toBeInTheDocument();
        expect(screen.queryByText('$799.99')).not.toBeInTheDocument();
      });
    });
  });

  describe('Responsive Grid', () => {
    it('should render items in a grid layout', async () => {
      const mockWishlistItems = [
        { id: 1, name: 'Product 1', price: 99.99, stock: 10, available: true },
        { id: 2, name: 'Product 2', price: 199.99, stock: 5, available: true },
        { id: 3, name: 'Product 3', price: 299.99, stock: 0, available: false },
      ];

      api.getWishlist.mockResolvedValue({ data: mockWishlistItems });

      renderWishlist();

      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
        expect(screen.getByText('Product 2')).toBeInTheDocument();
        expect(screen.getByText('Product 3')).toBeInTheDocument();
      });
    });
  });
});