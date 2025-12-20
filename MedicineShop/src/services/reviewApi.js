import { API_CONFIG } from '../config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Get product reviews (public)
export const getProductReviews = async (productId, params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 10,
      ...(params.rating && { rating: params.rating }),
      sortBy: params.sortBy || 'created_at',
      sortOrder: params.sortOrder || 'desc'
    });

    const response = await fetch(`${API_BASE_URL}/products/${productId}/reviews?${queryParams}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    return { success: false, error: error.message };
  }
};

// Get product rating statistics (public)
export const getProductRatingStats = async (productId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}/rating-stats`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching rating stats:', error);
    return { success: false, error: error.message };
  }
};

// Get customer's own reviews (protected)
export const getMyReviews = async (params = {}) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 10,
      ...(params.rating && { rating: params.rating }),
      sortBy: params.sortBy || 'created_at',
      sortOrder: params.sortOrder || 'desc'
    });

    const response = await fetch(`${API_BASE_URL}/customers/me/reviews?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching my reviews:', error);
    return { success: false, error: error.message };
  }
};

// Create review (protected)
export const createReview = async (reviewData) => {
  try {
    const token = getAuthToken();
    console.log('🔐 Auth token:', token ? '✅ Token exists' : '❌ No token');
    console.log('🔐 Token value:', token);
    
    if (!token) {
      throw new Error('Authentication required');
    }

    console.log('📤 Sending review request:', reviewData);
    console.log('📤 Request headers:', {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(reviewData)
    });

    console.log('📥 Response status:', response.status);
    const result = await response.json();
    console.log('📥 Response data:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Error creating review:', error);
    return { success: false, error: error.message };
  }
};

// Update review (protected)
export const updateReview = async (reviewId, reviewData) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(reviewData)
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error updating review:', error);
    return { success: false, error: error.message };
  }
};

// Delete review (protected)
export const deleteReview = async (reviewId) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error deleting review:', error);
    return { success: false, error: error.message };
  }
};

// Get review by ID (public)
export const getReviewById = async (reviewId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching review:', error);
    return { success: false, error: error.message };
  }
};
