const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ;

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
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
 * Checkout - Tạo đơn hàng và payment
 * POST /cart/checkout
 */
export const checkout = async (checkoutData) => {
  try {
    console.log('🛒 checkout API called with data:', checkoutData);
    console.log('🛒 URL:', `${API_BASE_URL}/cart/checkout`);
    
    const response = await authFetch(`${API_BASE_URL}/cart/checkout`, {
      method: 'POST',
      body: JSON.stringify(checkoutData),
    });
    
    console.log('🛒 Response status:', response.status);
    const data = await response.json();
    console.log('🛒 Response data:', data);
    
    if (!response.ok) {
      console.error('🛒 Checkout failed with error:', data);
      throw new Error(data.message || data.error || 'Checkout failed');
    }
    
    return data;
  } catch (error) {
    console.error('Checkout error:', error);
    throw error;
  }
};

/**
 * Lấy thông tin payment theo ID
 * GET /payments/:id
 */
export const getPaymentById = async (paymentId) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/payments/${paymentId}`);
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get payment');
    }
    
    return data;
  } catch (error) {
    console.error('Get payment error:', error);
    throw error;
  }
};

/**
 * Process COD payment
 * POST /payments/:id/process-cod
 */
export const processCodPayment = async (paymentId) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/payments/${paymentId}/process-cod`, {
      method: 'POST',
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to process COD payment');
    }
    
    return data;
  } catch (error) {
    console.error('Process COD error:', error);
    throw error;
  }
};

/**
 * Tạo MoMo payment URL
 * POST /payments/momo/create-payment
 */
export const createMomoPayment = async (paymentData) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/payments/momo/create-payment`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create MoMo payment');
    }
    
    return data;
  } catch (error) {
    console.error('Create MoMo payment error:', error);
    throw error;
  }
};

/**
 * Tạo VNPay payment URL
 * POST /payments/vnpay/create-payment-url
 */
export const createVnpayPayment = async (paymentData) => {
  try {
    console.log('💳 VNPay API called with data:', paymentData);
    console.log('💳 VNPay URL:', `${API_BASE_URL}/payments/vnpay/create-payment-url`);
    
    const response = await authFetch(`${API_BASE_URL}/payments/vnpay/create-payment-url`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
    
    console.log('💳 VNPay Response status:', response.status);
    const data = await response.json();
    console.log('💳 VNPay Response data:', data);
    
    if (!response.ok) {
      console.error('💳 VNPay failed:', data);
      throw new Error(data.message || data.error || 'Failed to create VNPay payment');
    }
    
    return data;
  } catch (error) {
    console.error('Create VNPay payment error:', error);
    throw error;
  }
};

/**
 * Tạo PayPal payment
 * POST /payments/paypal/create
 */
export const createPaypalPayment = async (paymentData) => {
  try {
    console.log('💰 PayPal API called with data:', paymentData);
    console.log('💰 PayPal URL:', `${API_BASE_URL}/payments/paypal/create`);
    
    const response = await authFetch(`${API_BASE_URL}/payments/paypal/create`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
    
    console.log('💰 PayPal Response status:', response.status);
    const data = await response.json();
    console.log('💰 PayPal Response data:', data);
    
    if (!response.ok) {
      console.error('💰 PayPal failed:', data);
      throw new Error(data.message || data.error || 'Failed to create PayPal payment');
    }
    
    return data;
  } catch (error) {
    console.error('Create PayPal payment error:', error);
    throw error;
  }
};

export default {
  checkout,
  getPaymentById,
  processCodPayment,
  createMomoPayment,
  createVnpayPayment,
  createPaypalPayment,
};
