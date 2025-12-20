import { getCustomerIdAsync, isAuthenticated, syncCustomerIdFromToken } from './authApi';
import { API_CONFIG } from '../config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

/**
 * Get cart for the currently logged-in customer
 * @returns {Promise<Object>} Cart data with items
 */
export const getCart = async () => {
  if (!isAuthenticated()) {
    throw new Error('User not authenticated');
  }

  // Sync customer_id from token first
  syncCustomerIdFromToken();

  const customerId = await getCustomerIdAsync();
  if (!customerId) {
    throw new Error('Customer ID not found');
  }

  const token = localStorage.getItem('authToken');
  const url = `${API_BASE_URL}/cart/${customerId}`;
  console.log('🛒 Fetching cart from:', url);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    console.log('📡 Cart response status:', response.status);

    // Handle 404 - cart doesn't exist yet (return empty cart)
    if (response.status === 404) {
      console.log('ℹ️ Cart not found, returning empty cart');
      return {
        success: true,
        data: {
          items: [],
          totalAmount: 0,
          totalQuantity: 0
        }
      };
    }

    const data = await response.json();
    console.log('📦 Cart data:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch cart');
    }

    return data;
  } catch (error) {
    console.error('❌ Error fetching cart:', error);
    // Return empty cart instead of throwing error
    return {
      success: true,
      data: {
        items: [],
        totalAmount: 0,
        totalQuantity: 0
      }
    };
  }
};

/**
 * Add item to cart
 * @param {number} productId - Product ID to add
 * @param {number} quantity - Quantity to add
 * @param {number} productUnitId - Product unit ID (default 1)
 * @returns {Promise<Object>} Updated cart data
 */
export const addToCart = async (productId, quantity = 1, productUnitId = 1) => {
  if (!isAuthenticated()) {
    throw new Error('User not authenticated');
  }

  // Sync customer_id from token first
  syncCustomerIdFromToken();

  const customerId = await getCustomerIdAsync();
  if (!customerId) {
    throw new Error('Customer ID not found');
  }

  const token = localStorage.getItem('authToken');
  const url = `${API_BASE_URL}/cart/${customerId}/add`;
  
  console.log('🛒 Adding to cart:', {
    url,
    customerId,
    productId,
    quantity,
    productUnitId,
    hasToken: !!token
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        productId: Number(productId), 
        quantity: Number(quantity),
        productUnitId: Number(productUnitId)
      }),
    });

    console.log('📦 Cart response status:', response.status);
    const data = await response.json();
    console.log('📦 Cart response data:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Failed to add to cart');
    }

    return data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

/**
 * Update cart item quantity
 * @param {number} cartItemId - Cart item ID to update
 * @param {number} quantity - New quantity
 * @returns {Promise<Object>} Updated cart data
 */
export const updateCartItem = async (cartItemId, quantity) => {
  if (!isAuthenticated()) {
    throw new Error('User not authenticated');
  }

  const customerId = await getCustomerIdAsync();
  if (!customerId) {
    throw new Error('Customer ID not found');
  }

  const token = localStorage.getItem('authToken');

  try {
    const response = await fetch(`${API_BASE_URL}/cart/${customerId}/items/${cartItemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ quantity }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update cart item');
    }

    return data;
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
};

/**
 * Remove item from cart
 * @param {number} itemId - Cart item ID to remove
 * @returns {Promise<Object>} Updated cart data
 */
export const removeFromCart = async (itemId) => {
  if (!isAuthenticated()) {
    throw new Error('User not authenticated');
  }

  const customerId = await getCustomerIdAsync();
  if (!customerId) {
    throw new Error('Customer ID not found');
  }

  const token = localStorage.getItem('authToken');

  try {
    const response = await fetch(`${API_BASE_URL}/cart/${customerId}/items/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to remove from cart');
    }

    return data;
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

/**
 * Clear entire cart
 * @returns {Promise<Object>} Empty cart data
 */
export const clearCart = async () => {
  if (!isAuthenticated()) {
    throw new Error('User not authenticated');
  }

  const customerId = await getCustomerIdAsync();
  if (!customerId) {
    throw new Error('Customer ID not found');
  }

  const token = localStorage.getItem('authToken');

  try {
    const response = await fetch(`${API_BASE_URL}/cart/${customerId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to clear cart');
    }

    return data;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};
