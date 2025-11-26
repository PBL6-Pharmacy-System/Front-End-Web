import { API_CONFIG } from '../config/api';

// Base URL for API
const BASE_URL = API_CONFIG.BASE_URL;

/**
 * Request OTP for email or phone
 * @param {string} email - User email (optional)
 * @param {string} phone - User phone (optional)
 * @returns {Promise<Object>} Response data
 */
export const requestOTP = async (email = null, phone = null) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/otp/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        ...(email && { email }),
        ...(phone && { phone })
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Không thể gửi OTP');
    }

    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Request OTP error:', error);
    return {
      success: false,
      error: error.message || 'Có lỗi xảy ra khi gửi OTP'
    };
  }
};

/**
 * Login with email and OTP
 * @param {string} email - User email
 * @param {string} otp - OTP code
 * @returns {Promise<Object>} Response with user data and token
 */
export const loginWithEmailOTP = async (email, otp) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/customer/login-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();
    console.log('Login response:', data); // Debug log

    if (!response.ok) {
      throw new Error(data.error || 'Đăng nhập thất bại');
    }

    // Save token and user to localStorage
    // Handle different response structures
    const token = data.token || data.data?.token || data.access_token || data.accessToken;
    const userData = data.user || data.data?.user || data.customer || data.data?.customer;

    if (token) {
      localStorage.setItem('authToken', token);
      console.log('Token saved:', token); // Debug log
    }

    if (userData) {
      // Extract customer_id for easy access
      const customerId = userData.customers?.id || userData.customer_id;
      const userToSave = {
        ...userData,
        customer_id: customerId // Add customer_id at top level for easy access
      };
      localStorage.setItem('user', JSON.stringify(userToSave));
      console.log('User saved:', userToSave); // Debug log
      
      // Save customer_id separately for quick access
      if (customerId) {
        localStorage.setItem('customer_id', customerId.toString());
        console.log('Customer ID saved:', customerId);
      }
    }

    // If no token but login was successful, still save something to mark as logged in
    if (!token && response.ok) {
      localStorage.setItem('authToken', 'logged_in');
      localStorage.setItem('user', JSON.stringify({ email }));
    }

    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Login with email OTP error:', error);
    return {
      success: false,
      error: error.message || 'Đăng nhập thất bại'
    };
  }
};

/**
 * Verify OTP for phone login
 * @param {string} phone - User phone
 * @param {string} otp - OTP code
 * @returns {Promise<Object>} Response with user data and token
 */
export const verifyPhoneOTP = async (phone, otp) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/otp/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, otp }),
    });

    const data = await response.json();
    console.log('Verify phone response:', data); // Debug log

    if (!response.ok) {
      throw new Error(data.error || 'Xác minh OTP thất bại');
    }

    // Save token and user to localStorage
    // Handle different response structures
    const token = data.token || data.data?.token || data.access_token || data.accessToken;
    const userData = data.user || data.data?.user || data.customer || data.data?.customer;

    if (token) {
      localStorage.setItem('authToken', token);
      console.log('Token saved:', token); // Debug log
    }

    if (userData) {
      // Extract customer_id for easy access
      const customerId = userData.customers?.id || userData.customer_id;
      const userToSave = {
        ...userData,
        customer_id: customerId // Add customer_id at top level for easy access
      };
      localStorage.setItem('user', JSON.stringify(userToSave));
      console.log('User saved:', userToSave); // Debug log
      
      // Save customer_id separately for quick access
      if (customerId) {
        localStorage.setItem('customer_id', customerId.toString());
        console.log('Customer ID saved:', customerId);
      }
    }

    // If no token but login was successful, still save something to mark as logged in
    if (!token && response.ok) {
      localStorage.setItem('authToken', 'logged_in');
      localStorage.setItem('user', JSON.stringify({ phone }));
    }

    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Verify phone OTP error:', error);
    return {
      success: false,
      error: error.message || 'Xác minh OTP thất bại'
    };
  }
};

/**
 * Logout user
 */
export const logout = async () => {
  try {
    const token = localStorage.getItem('authToken');
    
    // Call backend logout API if token exists
    if (token) {
      await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
    }
  } catch (error) {
    console.error('Logout API error:', error);
    // Continue with local logout even if API call fails
  } finally {
    // Always clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('customer_id');
  }
};

/**
 * Get current user from localStorage
 */
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('authToken');
  console.log('Checking auth, token:', token); // Debug log
  return !!token;
};

/**
 * Get customer ID from localStorage
 */
export const getCustomerId = () => {
  // Try to get from separate storage first
  let customerId = localStorage.getItem('customer_id');
  
  // If not found, try to extract from user object
  if (!customerId) {
    try {
      const user = getCurrentUser();
      customerId = user?.customer_id || user?.customers?.id;
      
      // Save it for next time
      if (customerId) {
        localStorage.setItem('customer_id', customerId.toString());
      }
    } catch (error) {
      console.error('Error getting customer_id:', error);
    }
  }
  
  return customerId ? parseInt(customerId) : null;
};
