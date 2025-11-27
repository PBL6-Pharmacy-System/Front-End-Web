const API_BASE_URL = 'http://localhost:3000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to get customer ID (same logic as authApi.js)
const getCustomerId = () => {
  console.log('🔍 Getting customer ID...');
  
  // Try to get from separate storage first
  let customerId = localStorage.getItem('customer_id');
  console.log('📦 customer_id from localStorage:', customerId);
  
  // If not found, try to extract from user object
  if (!customerId) {
    const userStr = localStorage.getItem('user');
    console.log('👤 user from localStorage:', userStr);
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('👤 Parsed user object:', user);
        customerId = user.customer_id || user.customerId || user.customers?.id || user.id;
        console.log('🎯 Extracted customerId from user:', customerId);
        
        // Save it for next time
        if (customerId) {
          localStorage.setItem('customer_id', customerId.toString());
        }
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }
  }
  
  // If still not found, try to decode from JWT token
  if (!customerId) {
    const token = localStorage.getItem('authToken');
    console.log('🔑 Trying to extract from JWT token...');
    if (token && token !== 'logged_in') {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('🔑 JWT payload:', payload);
        customerId = payload.customer_id || payload.customerId;
        console.log('🎯 Extracted customerId from JWT:', customerId);
        
        if (customerId) {
          localStorage.setItem('customer_id', customerId.toString());
        }
      } catch (e) {
        console.error('Error decoding JWT:', e);
      }
    }
  }
  
  const result = customerId ? parseInt(customerId) : null;
  console.log('✅ Final customerId:', result);
  return result;
};

// Helper function for authenticated requests
const authFetch = async (url, options = {}) => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  return response;
};

/**
 * Lấy danh sách đơn hàng của customer hiện tại
 * GET /customers/:customerId/orders
 */
export const getMyOrders = async (params = {}) => {
  try {
    console.log('📋 getMyOrders called with params:', params);
    
    const customerId = getCustomerId();
    console.log('👤 Customer ID for orders:', customerId);
    
    if (!customerId) {
      console.error('❌ No customer ID found!');
      throw new Error('Không tìm thấy thông tin khách hàng');
    }

    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);
    
    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/customers/${customerId}/orders${queryString ? `?${queryString}` : ''}`;
    console.log('🌐 Fetching orders from URL:', url);
    
    const token = getAuthToken();
    console.log('🔑 Auth token:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
    
    const response = await authFetch(url);
    console.log('📡 Response status:', response.status);
    
    const data = await response.json();
    console.log('📦 Response data:', data);
    
    if (!response.ok) {
      console.error('❌ Response not OK:', data);
      throw new Error(data.message || 'Không thể lấy danh sách đơn hàng');
    }
    
    return data;
  } catch (error) {
    console.error('❌ Get orders error:', error);
    throw error;
  }
};

/**
 * Lấy chi tiết đơn hàng theo ID
 * GET /orders/:id
 */
export const getOrderById = async (orderId) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/orders/${orderId}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Không thể lấy chi tiết đơn hàng');
    }
    
    return data;
  } catch (error) {
    console.error('Get order detail error:', error);
    throw error;
  }
};

/**
 * Hủy đơn hàng (nếu API hỗ trợ customer cancel)
 * POST /orders/:id/cancel
 */
export const cancelOrder = async (orderId, reason = '') => {
  try {
    const response = await authFetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Không thể hủy đơn hàng');
    }
    
    return data;
  } catch (error) {
    console.error('Cancel order error:', error);
    throw error;
  }
};

export default {
  getMyOrders,
  getOrderById,
  cancelOrder,
};
