import { SUBCATEGORY_API_MAP } from './subcategoryApiMap';
import { MockApiService } from './productApi';
import { MENU_DATA } from '../constants/categories';
import { API_CONFIG } from '../config/api';
import { transformProductsFromAPI } from '../utils/productTransformer';

const API_BASE_URL = API_CONFIG.BASE_URL;
const API_BASE = `${API_BASE_URL}/products/category`;

const parseJSON = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

// Normalize various backend shapes into { data: Array, total: number }
const normalizeApiResponse = (payload) => {
  if (!payload) {
    console.warn('⚠️ normalizeApiResponse: payload is null/undefined');
    return { data: [], total: 0 };
  }

  // Format 1: { success: true, data: { products: [...], total: N } }
  if (payload.success && payload.data) {
    if (Array.isArray(payload.data.products)) {
      return { 
        data: payload.data.products, 
        total: payload.data.total || payload.data.products.length 
      };
    }
    // Format: { success: true, data: [...] }
    if (Array.isArray(payload.data)) {
      return { 
        data: payload.data, 
        total: payload.total || payload.data.length 
      };
    }
  }

  // Format 2: { products: [...], total: N }
  if (payload.products && Array.isArray(payload.products)) {
    return { 
      data: payload.products, 
      total: payload.total || payload.products.length 
    };
  }

  // Format 3: { data: [...], total: N }
  if (payload.data && Array.isArray(payload.data)) {
    return { 
      data: payload.data, 
      total: payload.total || payload.data.length 
    };
  }

  // Format 4: Direct array [...]
  if (Array.isArray(payload)) {
    return { 
      data: payload, 
      total: payload.length 
    };
  }

  // Unexpected shape: log warning and return empty
  console.warn('⚠️ normalizeApiResponse: Unexpected payload shape:', payload);
  return { data: [], total: 0 };
};

// Normalize product data to ensure consistent structure
const normalizeProduct = (product) => {
  if (!product) return null;
  
  // Ensure images field is populated
  const normalizedProduct = { ...product };
  
  // If images array exists and is valid, use it
  if (Array.isArray(normalizedProduct.images) && normalizedProduct.images.length > 0) {
    // Already has images, keep it
  } 
  // If image_url exists but images doesn't, create images array
  else if (normalizedProduct.image_url && typeof normalizedProduct.image_url === 'string') {
    normalizedProduct.images = [normalizedProduct.image_url];
  }
  // If neither exists, try other fields
  else if (normalizedProduct.imageUrl) {
    normalizedProduct.images = [normalizedProduct.imageUrl];
  } else if (normalizedProduct.thumbnail) {
    normalizedProduct.images = [normalizedProduct.thumbnail];
  }
  
  return normalizedProduct;
};

// Apply normalization to all products in response
const normalizeProducts = (data) => {
  if (!Array.isArray(data)) return [];
  return data.map(normalizeProduct).filter(Boolean);
};

// 🔹 Lấy toàn bộ sản phẩm
export const getAllCatalogProducts = async () => {
  try {
    console.log('🔄 Fetching all catalog products from:', API_BASE);
    const response = await fetch(API_BASE);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await parseJSON(response);
    const normalized = normalizeApiResponse(data);
    const products = normalizeProducts(normalized.data);
    console.log(`✅ Successfully fetched ${products.length} products`);
    return { success: true, data: products, total: normalized.total };
  } catch (error) {
    console.error("❌ Error fetching all products:", error.message);
    return { success: false, error: error.message, data: [], total: 0 };
  }
};

// Helper: Check if key is a parent menu (Cấp 1)
const isParentMenu = (categoryKey) => {
  return MENU_DATA && MENU_DATA[categoryKey] && MENU_DATA[categoryKey].categories;
};

// Helper: Check if key is a category (Cấp 2) và tìm trong parent menu
const findCategoryInParent = (categoryKey) => {
  if (!MENU_DATA) return null;
  
  for (const [parentKey, parentData] of Object.entries(MENU_DATA)) {
    if (parentData.categories && Array.isArray(parentData.categories)) {
      for (const cat of parentData.categories) {
        if (cat.key === categoryKey) {
          return cat; // Đây là category cấp 2
        }
      }
    }
  }
  return null;
};

// Helper: Get all subcategory API endpoints
// - Cấp 1 (Parent Menu): Lấy tất cả subcategories của tất cả categories
// - Cấp 2 (Category): Lấy tất cả subcategories của category đó
const getSubcategoryEndpoints = (categoryKey) => {
  const endpoints = [];

  // Case 1: Parent Menu (Cấp 1) - Thực phẩm chức năng
  if (isParentMenu(categoryKey)) {
    const category = MENU_DATA[categoryKey];
    console.log(`📋 "${categoryKey}" is a PARENT MENU (Level 1)`);
    
    if (category.categories && Array.isArray(category.categories)) {
      category.categories.forEach(cat => {
        // Lấy tất cả subcategories của mỗi category
        if (cat.subcategories && Array.isArray(cat.subcategories)) {
          cat.subcategories.forEach(sub => {
            if (sub.key && SUBCATEGORY_API_MAP[sub.key]) {
              endpoints.push({
                key: sub.key,
                title: sub.title,
                endpoint: SUBCATEGORY_API_MAP[sub.key]
              });
            }
          });
        }
      });
    }
    
    return endpoints.length > 0 ? endpoints : null;
  }

  // Case 2: Category (Cấp 2) - Vitamin & Khoáng chất
  const categoryData = findCategoryInParent(categoryKey);
  if (categoryData) {
    console.log(`📋 "${categoryKey}" is a CATEGORY (Level 2)`);
    
    if (categoryData.subcategories && Array.isArray(categoryData.subcategories)) {
      categoryData.subcategories.forEach(sub => {
        if (sub.key && SUBCATEGORY_API_MAP[sub.key]) {
          endpoints.push({
            key: sub.key,
            title: sub.title,
            endpoint: SUBCATEGORY_API_MAP[sub.key]
          });
        }
      });
    }
    
    return endpoints.length > 0 ? endpoints : null;
  }

  // Case 3: Subcategory (Cấp 3) - Bổ sung Canxi & Vitamin D
  // Sẽ được xử lý ở phần sau (direct API call)
  console.log(`📋 "${categoryKey}" is a SUBCATEGORY (Level 3) or unknown`);
  return null;
};

// 🔹 Lấy sản phẩm theo danh mục
export const getProductsByCategory = async (categoryKey) => {
  try {
    // no key -> return all
    if (!categoryKey || categoryKey === 'all') {
      return getAllCatalogProducts();
    }

    // Check if this is a parent category - if so, fetch all subcategories
    const subcategoryEndpoints = getSubcategoryEndpoints(categoryKey);
    if (subcategoryEndpoints && subcategoryEndpoints.length > 0) {
      console.log(`🎯 "${categoryKey}" is a parent category with ${subcategoryEndpoints.length} subcategories:`, 
        subcategoryEndpoints.map(s => s.title));
      
      // Fetch products from all subcategories in parallel
      const allProducts = [];
      const fetchPromises = subcategoryEndpoints.map(async ({ key, title, endpoint }) => {
        try {
          console.log(`🔄 Fetching "${title}" from:`, endpoint);
          const res = await fetch(endpoint);
          
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          }
          
          const data = await parseJSON(res);
          const normalized = normalizeApiResponse(data);
          const products = normalizeProducts(normalized.data);
          console.log(`✅ Fetched ${products.length} products from "${title}"`);
          return products;
        } catch (err) {
          console.warn(`⚠️ Failed to fetch "${title}":`, err.message);
          return [];
        }
      });

      // Wait for all fetches to complete
      const results = await Promise.all(fetchPromises);
      results.forEach(products => {
        if (products && products.length > 0) {
          allProducts.push(...products);
        }
      });

      // Remove duplicates based on product ID
      const uniqueProducts = Array.from(
        new Map(allProducts.map(p => [p.id, p])).values()
      );

      console.log(`✅ Combined ${uniqueProducts.length} unique products from parent category "${categoryKey}"`);
      
      if (uniqueProducts.length > 0) {
        // Transform products to ensure base_unit_id
        const transformed = transformProductsFromAPI(uniqueProducts);
        return { success: true, data: transformed, total: transformed.length };
      }
      
      console.log(`⚠️ No products found from subcategories, trying normal flow...`);
    }

    // If a mapped endpoint exists for this subcategory, call it directly
    // Use exact matching only for safety (no fuzzy matching to avoid wrong matches)
    let mappedEndpoint = null;
    if (SUBCATEGORY_API_MAP && SUBCATEGORY_API_MAP[categoryKey]) {
      mappedEndpoint = SUBCATEGORY_API_MAP[categoryKey];
      console.log(`🎯 Found mapped endpoint for "${categoryKey}":`, mappedEndpoint);
    } else {
      console.log(`⚠️ No mapped endpoint found for "${categoryKey}"`);
    }
    
    if (mappedEndpoint) {
      const endpoint = mappedEndpoint;
      try {
        console.log(`🔄 Fetching from mapped endpoint:`, endpoint);
        const res = await fetch(endpoint);
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const data = await parseJSON(res);
        const normalized = normalizeApiResponse(data);
        const products = normalizeProducts(normalized.data);
        // Transform to ensure base_unit_id
        const transformed = transformProductsFromAPI(products);
        console.log(`✅ Successfully fetched ${transformed.length} products from mapped endpoint`);
        return { success: true, data: transformed, total: normalized.total };
      } catch (err) {
        console.warn('⚠️ Fetch to mapped subcategory endpoint failed, falling back to mock data.', err.message);
        // fallthrough to mock fallback below
      }
    }

    // Fallback 1: Try default endpoint with category key
    console.log(`🔄 Trying default endpoint with categoryKey: "${categoryKey}"`);
    try {
      const url = `${API_BASE}/${encodeURIComponent(categoryKey)}`;
      console.log('🔄 Fetching from default endpoint:', url);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await parseJSON(response);
      const normalized = normalizeApiResponse(data);
      const products = normalizeProducts(normalized.data);
      // Transform to ensure base_unit_id
      const transformed = transformProductsFromAPI(products);
      console.log(`✅ Successfully fetched ${transformed.length} products from default endpoint`);
      return { success: true, data: transformed, total: normalized.total };
    } catch (err) {
      console.warn('⚠️ Default endpoint also failed:', err.message);
    }
    
    // Fallback 2: Use local mock data as last resort
    console.log('🔄 Falling back to mock data...');
    try {
      const mockRes = await MockApiService.getAllCatalogProducts();
      if (mockRes && mockRes.success && Array.isArray(mockRes.data)) {
        const filtered = mockRes.data.filter(p => 
          p.categoryKey === categoryKey || 
          p.subcategory === categoryKey ||
          p.category === categoryKey
        );
        // Transform to ensure base_unit_id
        const transformed = transformProductsFromAPI(filtered);
        console.log(`✅ Found ${transformed.length} products in mock data`);
        return { success: true, data: transformed, total: transformed.length };
      }
    } catch (err) {
      console.error('❌ Mock fallback also failed:', err.message);
    }
    
    // All attempts failed
    console.error(`❌ All attempts to fetch products for category "${categoryKey}" failed`);
    return { success: false, error: 'Unable to fetch products', data: [], total: 0 };
  } catch (error) {
    console.error("❌ Unexpected error in getProductsByCategory:", error.message);
    return { success: false, error: error.message, data: [], total: 0 };
  }
};

// 🔹 Tìm kiếm sản phẩm theo từ khóa
export const searchProducts = async (query) => {
  try {
    const url = `${API_BASE}/search?q=${encodeURIComponent(query)}`;
    console.log('🔍 Searching products with query:', query);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await parseJSON(response);
    const normalized = normalizeApiResponse(data);
    const products = normalizeProducts(normalized.data);
    console.log(`✅ Found ${products.length} products matching "${query}"`);
    return { success: true, data: products, total: normalized.total };
  } catch (error) {
    console.error("❌ Error searching products:", error.message);
    return { success: false, error: error.message, data: [], total: 0 };
  }
};

// 🔹 Lấy sản phẩm theo ID
export const getProductById = async (productId) => {
  try {
    console.log('🔍 Fetching product by ID:', productId);
    // Use correct endpoint for single product: /api/products/:id (not /api/products/category/:id)
    const response = await fetch(`/api/products/${productId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await parseJSON(response);
    if (!data) throw new Error("Product not found");
    
    console.log('📦 Raw API response for product ID', productId, ':', data);
    
    // If backend returns wrapper, try to extract the actual object
    let product = data;
    if (data.data && !Array.isArray(data.data)) {
      product = data.data;
    }
    
    // Normalize the product
    const normalizedProduct = normalizeProduct(product);
    console.log('✅ Product found and normalized:', normalizedProduct.name || normalizedProduct.id);
    return { success: true, data: normalizedProduct };
  } catch (error) {
    console.error("❌ Error fetching product by ID:", error.message);
    return { success: false, error: error.message, data: null };
  }
};

// 🔹 Bộ lọc và sắp xếp (vẫn giữ lại vì xử lý phía client)
export const filterHelpers = {
  applyFilters: (products, filters) => {
    if (!Array.isArray(products)) return [];
    let filtered = [...products];

    if (filters.priceRange?.length === 2) {
      const [min, max] = filters.priceRange;
      filtered = filtered.filter(p => p.supportPrice >= min && p.supportPrice <= max);
    }
    if (filters.inStock) {
      filtered = filtered.filter(p => p.inStock);
    }
    if (filters.selectedBrands?.length > 0) {
      filtered = filtered.filter(p => filters.selectedBrands.includes(p.brand));
    }
    return filtered;
  },

  sortProducts: (products, sortBy) => {
    if (!Array.isArray(products)) return [];
    const sorted = [...products];
    switch (sortBy) {
      case 'price-asc': return sorted.sort((a, b) => a.supportPrice - b.supportPrice);
      case 'price-desc': return sorted.sort((a, b) => b.supportPrice - a.supportPrice);
      case 'name':
      case 'name-asc': return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc': return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'rating': return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'bestselling': return sorted.sort((a, b) => b.sold - a.sold);
      default: return sorted.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
    }
  }
};

export default {
  getAllCatalogProducts,
  getProductsByCategory,
  searchProducts,
  getProductById,
  filterHelpers
};
