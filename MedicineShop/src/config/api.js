// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  ENDPOINTS: {
    // Auth
    AUTH: {
      REQUEST_OTP: '/auth/otp/request',
      LOGIN_OTP: '/auth/customer/login-otp',
      VERIFY_OTP: '/auth/otp/verify',
      LOGOUT: '/auth/logout',
    },
    // Cart
    CART: {
      GET: (customerId) => `/cart/${customerId}`,
      ADD: (customerId) => `/cart/${customerId}/add`,
      UPDATE_ITEM: (customerId, itemId) => `/cart/${customerId}/items/${itemId}`,
      REMOVE_ITEM: (customerId, itemId) => `/cart/${customerId}/items/${itemId}`,
      CLEAR: (customerId) => `/cart/${customerId}`,
    },
    // Products
    PRODUCTS: {
      BEST_SELLERS: '/products/best-sellers',
      BY_CATEGORY: (categoryName) => `/products/category/${categoryName}`,
      SEARCH: '/products/search',
      BY_ID: (id) => `/products/${id}`,
    },
    // Flash Sales
    FLASHSALES: {
      LIST: '/flashsales',
      BY_ID: (id) => `/flashsales/${id}`,
    },
  }
};

// Helper function to build full URL
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};
