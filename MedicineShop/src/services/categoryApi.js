import { API_CONFIG } from '../config/api';
import { transformProductFromAPI, transformProductsFromAPI } from '../utils/productTransformer';

const API_BASE_URL = API_CONFIG.BASE_URL;

/**
 * Lấy category tree từ API
 * @returns {Promise<Object>} - { success, data: categories với id và count }
 */
export const fetchCategoryTree = async () => {
  try {
    const url = `${API_BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORIES.TREE}`;
    console.log('📡 Fetching category tree:', url);

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Category tree response:', data);
    
    return {
      success: true,
      data: data.data || data
    };
  } catch (error) {
    console.error('❌ Error fetching category tree:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

/**
 * Fetch products theo categoryId
 * @param {number} categoryId - ID của danh mục
 * @param {Object} params - Query parameters (page, limit, etc.)
 * @returns {Promise<Object>} - { products, total, pagination }
 */
export const fetchProductsByCategoryId = async (categoryId, params = {}) => {
  try {
    if (!categoryId) {
      throw new Error('Category ID is required');
    }

    // Build query string
    const queryParams = new URLSearchParams();
    queryParams.append('categoryId', categoryId);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.sort) queryParams.append('sort', params.sort);
    
    const url = `${API_BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS.LIST}?${queryParams.toString()}`;

    console.log('📡 Fetching products by categoryId:', { categoryId, url });

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Normalize response
    let products = [];
    let total = 0;

    if (data.success && data.data) {
      if (Array.isArray(data.data.products)) {
        products = data.data.products;
        total = data.data.total || data.data.pagination?.totalRecords || products.length;
      } else if (Array.isArray(data.data)) {
        products = data.data;
        total = data.total || products.length;
      }
    } else if (Array.isArray(data.products)) {
      products = data.products;
      total = data.total || products.length;
    } else if (Array.isArray(data)) {
      products = data;
      total = data.length;
    }

    // Transform products using the array transformer
    const transformedProducts = transformProductsFromAPI(products);

    console.log('✅ Transformed products:', transformedProducts.length, 'items');
    if (transformedProducts.length > 0) {
      console.log('📦 Sample product:', transformedProducts[0]);
    }

    // Calculate pagination
    const currentPage = params.page || 1;
    const pageSize = params.limit || 10;
    const totalPages = Math.ceil(total / pageSize);

    return {
      success: true,
      products: transformedProducts,
      total,
      pagination: {
        currentPage,
        pageSize,
        totalPages,
        hasMore: currentPage < totalPages
      }
    };

  } catch (error) {
    console.error('❌ Error fetching products by categoryId:', error);
    return {
      success: false,
      error: error.message,
      products: [],
      total: 0
    };
  }
};

/**
 * @deprecated - This endpoint /api/products/category/{name} does NOT exist in backend
 * Use fetchProductsByCategoryId instead with category ID from category tree
 * 
 * Tự động tạo endpoint từ category title (backward compatibility)
 * @param {string} categoryTitle - Tên hiển thị của danh mục (ví dụ: "Vitamin C các loại")
 * @returns {string} - Endpoint đầy đủ
 */
export const getCategoryEndpoint = (categoryTitle) => {
  console.warn('⚠️ getCategoryEndpoint is DEPRECATED - endpoint /api/products/category/{name} does NOT exist');
  console.warn('⚠️ Use fetchProductsByCategoryId with category ID from category tree instead');
  if (!categoryTitle) return null;
  // Encode để xử lý các ký tự đặc biệt và khoảng trắng
  const encodedTitle = encodeURIComponent(categoryTitle);
  return `/api/products/category/${encodedTitle}`;
};

/**
 * @deprecated - This function uses an endpoint that does NOT exist in backend
 * Use fetchProductsByCategoryId instead
 * 
 * Fetch products từ category
 * @param {string} categoryTitle - Tên hiển thị của danh mục
 * @param {Object} params - Query parameters (page, limit, etc.)
 * @returns {Promise<Object>} - { products, total, pagination }
 */
export const fetchProductsByCategory = async (categoryTitle, params = {}) => {
  console.warn('⚠️ fetchProductsByCategory is DEPRECATED - endpoint /api/products/category/{name} does NOT exist');
  console.warn('⚠️ Use fetchProductsByCategoryId with category ID from category tree instead');
  
  // Return empty result instead of making a failing API call
  return {
    products: [],
    total: 0,
    pagination: {
      currentPage: params.page || 1,
      pageSize: params.limit || 20,
      totalPages: 0,
      hasMore: false
    }
  };
};

/**
 * @deprecated - Uses getCategoryEndpoint which doesn't work
 * Tự động map tất cả subcategories từ MENU_DATA
 * @param {Object} menuData - MENU_DATA từ categories.js
 * @returns {Object} - Map { key: endpoint }
 */
export const buildCategoryMap = (menuData) => {
  console.warn('⚠️ buildCategoryMap is DEPRECATED - endpoint /api/products/category/{name} does NOT exist');
  const map = {};
  
  Object.values(menuData).forEach(mainMenu => {
    if (mainMenu.categories) {
      mainMenu.categories.forEach(parentCategory => {
        // Map parent category
        if (parentCategory.key && parentCategory.title) {
          map[parentCategory.key] = getCategoryEndpoint(parentCategory.title);
        }
        
        // Map subcategories
        if (parentCategory.subcategories) {
          parentCategory.subcategories.forEach(subCategory => {
            if (subCategory.key && subCategory.title) {
              map[subCategory.key] = getCategoryEndpoint(subCategory.title);
            }
          });
        }
      });
    }
  });
  
  return map;
};

/**
 * Export để backward compatibility với code cũ
 * NOTE: getCategoryEndpoint, fetchProductsByCategory, buildCategoryMap are DEPRECATED
 * because /api/products/category/{name} endpoint does NOT exist in backend
 * Use fetchProductsByCategoryId with category ID from fetchCategoryTree instead
 */
export const CATEGORY_API = {
  getCategoryEndpoint,      // DEPRECATED
  fetchProductsByCategory,  // DEPRECATED
  fetchProductsByCategoryId,  // USE THIS
  fetchCategoryTree,          // USE THIS
  buildCategoryMap          // DEPRECATED
};

export default CATEGORY_API;
