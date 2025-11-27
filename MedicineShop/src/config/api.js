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
    // Categories
    CATEGORIES: {
      TREE: '/categories/tree',
    },
    // Products
    PRODUCTS: {
      LIST: '/products',
      BEST_SELLERS: '/products/best-sellers',
      // NOTE: BY_CATEGORY endpoint does NOT exist in backend - use BY_CATEGORY_ID instead
      // BY_CATEGORY: (categoryName) => `/products/category/${categoryName}`, // REMOVED - does not exist
      BY_CATEGORY_ID: (categoryId, limit = 10) => `/products?categoryId=${categoryId}&limit=${limit}`,
      SEARCH: '/products/search',
      BY_ID: (id) => `/products/${id}`,
    },
    // Flash Sales
    FLASHSALES: {
      LIST: '/flashsales', // NOTE: Requires auth - use ACTIVE for public access
      ACTIVE: '/flashsales/active', // Public endpoint
      BY_ID: (id) => `/flashsales/${id}`,
    },
  }
};

// Helper function to build full URL
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};
