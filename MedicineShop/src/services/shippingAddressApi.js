import { API_CONFIG } from '../config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Lấy tất cả địa chỉ giao hàng của customer
 * @param {number} customerId - ID của customer
 * @returns {Promise<Object>} - { success, data: addresses[] }
 */
export const getCustomerAddresses = async (customerId) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Chưa đăng nhập');
    }

    const response = await fetch(`${API_BASE_URL}/customers/${customerId}/shipping-addresses`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Lỗi khi lấy danh sách địa chỉ');
    }

    return {
      success: true,
      data: data.data || data
    };
  } catch (error) {
    console.error('❌ Error fetching addresses:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

/**
 * Lấy địa chỉ mặc định của customer
 * @param {number} customerId - ID của customer
 * @returns {Promise<Object>} - { success, data: address }
 */
export const getDefaultAddress = async (customerId) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Chưa đăng nhập');
    }

    const response = await fetch(`${API_BASE_URL}/customers/${customerId}/shipping-addresses/default`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Lỗi khi lấy địa chỉ mặc định');
    }

    return {
      success: true,
      data: data.data || data
    };
  } catch (error) {
    console.error('❌ Error fetching default address:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

/**
 * Tạo địa chỉ mới
 * @param {number} customerId - ID của customer
 * @param {Object} addressData - Dữ liệu địa chỉ
 * @returns {Promise<Object>} - { success, data: address }
 */
export const createAddress = async (customerId, addressData) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Chưa đăng nhập');
    }

    console.log('📍 Creating address:', { customerId, addressData });

    const response = await fetch(`${API_BASE_URL}/customers/${customerId}/shipping-addresses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(addressData)
    });

    const data = await response.json();
    console.log('📍 Create address response:', data);
    
    if (!response.ok) {
      throw new Error(data.error || 'Lỗi khi tạo địa chỉ');
    }

    return {
      success: true,
      data: data.data || data
    };
  } catch (error) {
    console.error('❌ Error creating address:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Cập nhật địa chỉ
 * @param {number} addressId - ID của địa chỉ
 * @param {Object} addressData - Dữ liệu cập nhật
 * @returns {Promise<Object>} - { success, data: address }
 */
export const updateAddress = async (addressId, addressData) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Chưa đăng nhập');
    }

    const response = await fetch(`${API_BASE_URL}/shipping-addresses/${addressId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(addressData)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Lỗi khi cập nhật địa chỉ');
    }

    return {
      success: true,
      data: data.data || data
    };
  } catch (error) {
    console.error('❌ Error updating address:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Đặt địa chỉ làm mặc định
 * @param {number} addressId - ID của địa chỉ
 * @returns {Promise<Object>} - { success }
 */
export const setDefaultAddress = async (addressId) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Chưa đăng nhập');
    }

    const response = await fetch(`${API_BASE_URL}/shipping-addresses/${addressId}/set-default`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Lỗi khi đặt địa chỉ mặc định');
    }

    return {
      success: true,
      data: data.data || data
    };
  } catch (error) {
    console.error('❌ Error setting default address:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Xóa địa chỉ
 * @param {number} addressId - ID của địa chỉ
 * @returns {Promise<Object>} - { success }
 */
export const deleteAddress = async (addressId) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Chưa đăng nhập');
    }

    const response = await fetch(`${API_BASE_URL}/shipping-addresses/${addressId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Lỗi khi xóa địa chỉ');
    }

    return {
      success: true
    };
  } catch (error) {
    console.error('❌ Error deleting address:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
