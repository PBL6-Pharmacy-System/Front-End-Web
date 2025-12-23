import { API_CONFIG } from '../config/api';

/**
 * Search products by keyword
 * @param {string} keyword - Search keyword
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 10)
 * @returns {Promise<Object>} Search results with products and pagination
 */
export const searchProducts = async (keyword, page = 1, limit = 10) => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/products/search?keyword=${encodeURIComponent(keyword)}&page=${page}&limit=${limit}`
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Lỗi khi tìm kiếm sản phẩm');
    }
    
    return data;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};
