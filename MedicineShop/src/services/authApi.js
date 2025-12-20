import { API_CONFIG } from '../config/api';

// Base URL for API
const BASE_URL = API_CONFIG.BASE_URL;

/**
 * Sync customer_id from JWT token to localStorage
 * This ensures customer_id in localStorage matches the token
 */
export const syncCustomerIdFromToken = () => {
  const token = localStorage.getItem('authToken');
  if (token && token !== 'logged_in') {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const tokenCustomerId = payload.customer_id;
      
      if (tokenCustomerId) {
        const storedCustomerId = localStorage.getItem('customer_id');
        if (storedCustomerId !== tokenCustomerId.toString()) {
          console.log('🔄 Syncing customer_id from token:', tokenCustomerId);
          localStorage.setItem('customer_id', tokenCustomerId.toString());
          
          // Also update user object
          const userStr = localStorage.getItem('user');
          if (userStr) {
            try {
              const user = JSON.parse(userStr);
              user.customer_id = tokenCustomerId;
              localStorage.setItem('user', JSON.stringify(user));
            } catch (e) {
              console.error('Error updating user object:', e);
            }
          }
        }
        return tokenCustomerId;
      }
    } catch (e) {
      console.error('Error syncing customer_id from token:', e);
    }
  }
  return null;
};

/**
 * Request OTP for email or phone
 * @param {string} email - User email (optional)
 * @param {string} phone - User phone (optional)
 * @returns {Promise<Object>} Response data
 */
export const requestOTP = async (email = null, phone = null) => {
  try {
    console.log('📧 Requesting OTP for:', { email, phone });
    
    // Validate input
    if (!email && !phone) {
      throw new Error('Vui lòng cung cấp email hoặc số điện thoại');
    }
    
    const payload = {};
    if (email) {
      payload.email = email.trim().toLowerCase();
    }
    if (phone) {
      payload.phone = phone.trim();
    }
    
    console.log('📤 Sending OTP request:', payload);
    
    const response = await fetch(`${BASE_URL}/auth/otp/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log('📥 OTP request response:', { status: response.status, data });

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Không thể gửi OTP');
    }

    console.log('✅ OTP sent successfully');
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('❌ Request OTP error:', error);
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
    console.log('🔐 Attempting login with:', { email, otp: otp.substring(0, 2) + '****' }); // Debug log (hide full OTP)
    
    // Ensure OTP is a string and trim whitespace
    const otpString = String(otp).trim();
    
    if (!email || !otpString) {
      throw new Error('Email và OTP không được để trống');
    }
    
    if (otpString.length !== 6) {
      throw new Error('Mã OTP phải gồm 6 chữ số');
    }
    
    const response = await fetch(`${BASE_URL}/auth/customer/login-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email: email.trim().toLowerCase(), 
        otp: otpString 
      }),
    });

    console.log('📡 Response status:', response.status, response.statusText); // Debug log
    
    let data;
    try {
      data = await response.json();
      console.log('📦 Login response data:', data); // Debug log
    } catch (jsonError) {
      console.error('❌ Failed to parse JSON response:', jsonError);
      throw new Error('Server trả về dữ liệu không hợp lệ');
    }

    if (!response.ok) {
      // Extract detailed error message from various possible formats
      const errorMsg = data.error || data.message || data.msg || data.details || 
                       data.error_description || (typeof data === 'string' ? data : null);
      
      console.error('❌ Login failed:', { 
        status: response.status, 
        statusText: response.statusText,
        data 
      });
      
      // Provide user-friendly error messages
      if (response.status === 500) {
        throw new Error(errorMsg || 'Lỗi server. Vui lòng thử lại sau.');
      } else if (response.status === 401 || response.status === 403) {
        throw new Error(errorMsg || 'Mã OTP không đúng hoặc đã hết hạn');
      } else if (response.status === 404) {
        throw new Error('Email chưa được đăng ký');
      } else {
        throw new Error(errorMsg || `Đăng nhập thất bại (HTTP ${response.status})`);
      }
    }

    // Save token and user to localStorage
    // Handle different response structures
    const token = data.token || data.data?.token || data.access_token || data.accessToken;
    const userData = data.user || data.data?.user || data.customer || data.data?.customer;

    console.log('🔑 Token found:', !!token);
    console.log('👤 User data found:', !!userData);

    if (token) {
      localStorage.setItem('authToken', token);
      console.log('✅ Token saved successfully');
    }

    if (userData) {
      // Extract customer_id from token JWT first (most reliable)
      let customerId = null;
      if (token) {
        try {
          const decoded = JSON.parse(atob(token.split('.')[1]));
          customerId = decoded.customer_id;
          console.log('✅ Extracted customer_id from token:', customerId);
        } catch (e) {
          console.warn('⚠️ Failed to parse token');
        }
      }
      
      // Fallback to userData if token parsing failed
      if (!customerId) {
        customerId = userData.customer_id || userData.id || userData.customers?.id;
        console.log('✅ Extracted customer_id from userData:', customerId);
      }
      
      const userToSave = {
        ...userData,
        customer_id: customerId
      };
      localStorage.setItem('user', JSON.stringify(userToSave));
      
      if (customerId) {
        localStorage.setItem('customer_id', customerId.toString());
        console.log('✅ Final customer_id saved:', customerId);
      } else {
        console.error('❌ No customer_id found!');
      }
    }

    // If no token but login was successful, still save something to mark as logged in
    if (!token && response.ok) {
      console.log('⚠️ No token received, saving fallback auth');
      localStorage.setItem('authToken', 'logged_in');
      localStorage.setItem('user', JSON.stringify({ email }));
    }

    console.log('✅ Login successful!');
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('💥 Login with email OTP error:', error);
    console.error('💥 Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    
    // Extract more detailed error message
    let errorMessage = 'Đăng nhập thất bại';
    
    if (error.message) {
      errorMessage = error.message;
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

// Phone login removed - only email login supported

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
  return !!token;
};

/**
 * Get access token from localStorage
 */
export const getAccessToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Fetch and cache customer ID by phone number
 */
const fetchCustomerIdByPhone = async (phone) => {
  try {
    console.log('🔍 [fetchCustomerIdByPhone] Fetching customer for phone:', phone);
    const response = await fetch(`${BASE_URL}/customers/by-phone/${phone}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📦 [fetchCustomerIdByPhone] Response:', data);
      
      const customerId = data?.id || data?.customer?.id || data?.data?.id;
      if (customerId) {
        localStorage.setItem('customer_id', customerId.toString());
        console.log('✅ [fetchCustomerIdByPhone] Saved customer_id:', customerId);
        return customerId;
      }
    }
  } catch (e) {
    console.error('❌ [fetchCustomerIdByPhone] Failed:', e);
  }
  return null;
};

/**
 * Get customer ID from localStorage (async version)
 */
export const getCustomerIdAsync = async () => {
  let customerId = localStorage.getItem('customer_id');
  
  if (!customerId) {
    const user = getCurrentUser();
    customerId = user?.customer_id || user?.id || user?.customers?.id || user?.user_id;
    
    if (!customerId) {
      const token = localStorage.getItem('authToken');
      if (token && token !== 'logged_in') {
        try {
          const parts = token.split('.');
          if (parts.length === 3) {
            const decoded = JSON.parse(atob(parts[1]));
            customerId = decoded.customer_id;
          }
        } catch (e) {
          // Token parsing failed
        }
      }
    }
    
    // If still no customer_id but we have phone, fetch from API
    if (!customerId && user?.phone) {
      customerId = await fetchCustomerIdByPhone(user.phone);
    }
    
    if (customerId) {
      localStorage.setItem('customer_id', customerId.toString());
    }
  }
  
  return customerId ? parseInt(customerId) : null;
};

/**
 * Get customer ID from localStorage (sync version - deprecated, use getCustomerIdAsync)
 */
export const getCustomerId = () => {
  // Try to get from separate storage first
  let customerId = localStorage.getItem('customer_id');
  console.log('🔍 [getCustomerId] localStorage customer_id:', customerId);
  
  // If not found, try to extract from user object
  if (!customerId) {
    try {
      const user = getCurrentUser();
      console.log('🔍 [getCustomerId] user object:', user);
      
      // Priority: customer_id field first, then id, then customers?.id, user_id (fallback)
      customerId = user?.customer_id || user?.id || user?.customers?.id || user?.user_id;
      console.log('🔍 [getCustomerId] from user object:', customerId);
      
      // If still no customer_id, try to extract from token JWT
      if (!customerId) {
        const token = localStorage.getItem('authToken');
        console.log('🔍 [getCustomerId] token:', token ? `${token.substring(0, 50)}...` : 'null');
        
        if (token && token !== 'logged_in') {
          try {
            const parts = token.split('.');
            console.log('🔍 [getCustomerId] token parts count:', parts.length);
            
            if (parts.length === 3) {
              const decoded = JSON.parse(atob(parts[1]));
              console.log('🔍 [getCustomerId] decoded token:', decoded);
              customerId = decoded.customer_id;
              console.log('🔍 [getCustomerId] customer_id from token:', customerId);
            }
          } catch (e) {
            console.error('❌ [getCustomerId] Token parsing failed:', e);
          }
        }
      }
      
      // Save it for next time
      if (customerId) {
        localStorage.setItem('customer_id', customerId.toString());
        console.log('✅ [getCustomerId] Saved to localStorage:', customerId);
      }
    } catch (error) {
      console.error('❌ Error getting customer_id:', error);
    }
  }
  
  // Last resort: if still no customer_id but we have phone, fetch from API synchronously
  if (!customerId) {
    const user = getCurrentUser();
    if (user?.phone) {
      console.log('🔍 [getCustomerId] No customer_id found, will fetch by phone:', user.phone);
      // Note: This is a synchronous function, so we can't await. 
      // We'll return null here and the caller should handle the fallback
      // Better approach: cache the phone and fetch customer_id lazily
    }
  }
  
  const result = customerId ? parseInt(customerId) : null;
  console.log('🎯 [getCustomerId] Final result:', result);
  return result;
};
