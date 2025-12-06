import { API_CONFIG } from '../config/api';
import { getAccessToken, getCustomerId } from './authApi';

const BASE_URL = API_CONFIG.BASE_URL;

/**
 * Get customer information
 * @param {number} customerId - Customer ID (optional, uses logged in customer if not provided)
 * @returns {Promise<Object>} Customer data
 */
export const getCustomerInfo = async (customerId = null) => {
  try {
    const token = getAccessToken();
    const id = customerId || getCustomerId();

    if (!id) {
      throw new Error('Customer ID không tồn tại');
    }

    const response = await fetch(`${BASE_URL}/customers/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Không thể lấy thông tin khách hàng');
    }

    return {
      success: true,
      data: data.data || data
    };
  } catch (error) {
    console.error('Get customer info error:', error);
    return {
      success: false,
      error: error.message || 'Có lỗi xảy ra khi lấy thông tin khách hàng'
    };
  }
};

/**
 * Update customer information
 * @param {number} customerId - Customer ID (optional, uses logged in customer if not provided)
 * @param {Object} updateData - Data to update
 * @param {string} updateData.full_name - Full name
 * @param {string} updateData.phone - Phone number
 * @param {string} updateData.email - Email
 * @param {string} updateData.date_of_birth - Date of birth (YYYY-MM-DD)
 * @param {string} updateData.gender - Gender (male/female/other)
 * @returns {Promise<Object>} Updated customer data
 */
export const updateCustomerInfo = async (customerId = null, updateData) => {
  try {
    const token = getAccessToken();
    const id = customerId || getCustomerId();

    if (!id) {
      throw new Error('Customer ID không tồn tại');
    }

    if (!token) {
      throw new Error('Vui lòng đăng nhập để cập nhật thông tin');
    }

    // Validate required fields
    if (!updateData || Object.keys(updateData).length === 0) {
      throw new Error('Dữ liệu cập nhật không hợp lệ');
    }

    // Build request body with only provided fields
    const requestBody = {};
    if (updateData.full_name !== undefined) requestBody.full_name = updateData.full_name;
    if (updateData.phone !== undefined) requestBody.phone = updateData.phone;
    if (updateData.email !== undefined) requestBody.email = updateData.email;
    if (updateData.date_of_birth !== undefined) requestBody.date_of_birth = updateData.date_of_birth;
    if (updateData.gender !== undefined) requestBody.gender = updateData.gender;

    console.log('Updating customer:', id, 'with data:', requestBody);

    const response = await fetch(`${BASE_URL}/customers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Không thể cập nhật thông tin khách hàng');
    }

    // Update user in localStorage
    try {
      const currentUser = localStorage.getItem('user');
      if (currentUser) {
        const user = JSON.parse(currentUser);
        const updatedUser = {
          ...user,
          ...requestBody,
          // Update nested customer object if exists
          ...(user.customers && {
            customers: {
              ...user.customers,
              ...requestBody
            }
          })
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Error updating localStorage:', error);
    }

    return {
      success: true,
      data: data.data || data,
      message: data.message || 'Cập nhật thông tin thành công'
    };
  } catch (error) {
    console.error('Update customer info error:', error);
    return {
      success: false,
      error: error.message || 'Có lỗi xảy ra khi cập nhật thông tin khách hàng'
    };
  }
};

/**
 * Delete/Deactivate customer account
 * @param {number} customerId - Customer ID (optional, uses logged in customer if not provided)
 * @returns {Promise<Object>} Response data
 */
export const deleteCustomer = async (customerId = null) => {
  try {
    const token = getAccessToken();
    const id = customerId || getCustomerId();

    if (!id) {
      throw new Error('Customer ID không tồn tại');
    }

    if (!token) {
      throw new Error('Vui lòng đăng nhập');
    }

    const response = await fetch(`${BASE_URL}/customers/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Không thể xóa tài khoản');
    }

    return {
      success: true,
      data: data.data || data,
      message: data.message || 'Xóa tài khoản thành công'
    };
  } catch (error) {
    console.error('Delete customer error:', error);
    return {
      success: false,
      error: error.message || 'Có lỗi xảy ra khi xóa tài khoản'
    };
  }
};

/**
 * Get customer orders
 * @param {number} customerId - Customer ID (optional, uses logged in customer if not provided)
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Orders data
 */
export const getCustomerOrders = async (customerId = null, params = {}) => {
  try {
    const token = getAccessToken();
    const id = customerId || getCustomerId();

    if (!id) {
      throw new Error('Customer ID không tồn tại');
    }

    const queryParams = new URLSearchParams(params).toString();
    const url = `${BASE_URL}/customers/${id}/orders${queryParams ? `?${queryParams}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Không thể lấy danh sách đơn hàng');
    }

    return {
      success: true,
      data: data.data || data
    };
  } catch (error) {
    console.error('Get customer orders error:', error);
    return {
      success: false,
      error: error.message || 'Có lỗi xảy ra khi lấy danh sách đơn hàng'
    };
  }
};

/**
 * Get customer addresses
 * @param {number} customerId - Customer ID (optional, uses logged in customer if not provided)
 * @returns {Promise<Object>} Addresses data
 */
export const getCustomerAddresses = async (customerId = null) => {
  try {
    const token = getAccessToken();
    const id = customerId || getCustomerId();

    if (!id) {
      throw new Error('Customer ID không tồn tại');
    }

    const response = await fetch(`${BASE_URL}/customers/${id}/addresses`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Không thể lấy danh sách địa chỉ');
    }

    return {
      success: true,
      data: data.data || data
    };
  } catch (error) {
    console.error('Get customer addresses error:', error);
    return {
      success: false,
      error: error.message || 'Có lỗi xảy ra khi lấy danh sách địa chỉ'
    };
  }
};
