import { fetchCategoryTree, fetchProductsByCategoryId } from './categoryApi';
import { MockApiService } from './productApi';
import { MENU_DATA } from '../constants/categories';
import { API_CONFIG } from '../config/api';
import { transformProductFromAPI, transformProductsFromAPI } from '../utils/productTransformer';

const API_BASE_URL = API_CONFIG.BASE_URL;
const API_BASE = `${API_BASE_URL}/products`;

// ==================== CACHE SYSTEM ====================
const CACHE_PREFIX = 'catalog_cache_';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 phút (ms)

// 🚀 Clear old cache on module load (for development - remove in production)
if (typeof window !== 'undefined') {
  console.log('🧹 Clearing old catalog cache on module load...');
  Object.keys(localStorage)
    .filter(k => k.startsWith(CACHE_PREFIX))
    .forEach(k => localStorage.removeItem(k));
}

// Lưu vào localStorage với timestamp
const setCache = (key, data) => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
      expiry: CACHE_EXPIRY
    };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(cacheData));
    console.log(`💾 Cached: ${key}`);
  } catch (e) {
    console.warn('⚠️ Cache save failed:', e.message);
    // Nếu localStorage đầy, xóa cache cũ
    clearExpiredCache();
  }
};

// Lấy từ localStorage nếu chưa hết hạn
const getCache = (key) => {
  try {
    const cached = localStorage.getItem(CACHE_PREFIX + key);
    if (!cached) return null;
    
    const { data, timestamp, expiry } = JSON.parse(cached);
    const isExpired = Date.now() - timestamp > expiry;
    
    if (isExpired) {
      localStorage.removeItem(CACHE_PREFIX + key);
      console.log(`🗑️ Cache expired: ${key}`);
      return null;
    }
    
    console.log(`📦 Cache hit: ${key}`);
    return data;
  } catch (e) {
    console.warn('⚠️ Cache read failed:', e.message);
    return null;
  }
};

// Xóa cache đã hết hạn
const clearExpiredCache = () => {
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        const cached = localStorage.getItem(key);
        if (cached) {
          const { timestamp, expiry } = JSON.parse(cached);
          if (Date.now() - timestamp > expiry) {
            keysToRemove.push(key);
          }
        }
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    if (keysToRemove.length > 0) {
      console.log(`🧹 Cleared ${keysToRemove.length} expired cache entries`);
    }
  } catch (e) {
    console.warn('⚠️ Clear cache failed:', e.message);
  }
};

// Xóa toàn bộ cache (khi cần refresh)
export const clearAllCache = () => {
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    categoryTreeCache = null;
    categoryTreePromise = null;
    console.log(`🧹 Cleared all ${keysToRemove.length} cache entries`);
  } catch (e) {
    console.warn('⚠️ Clear all cache failed:', e.message);
  }
};

// ==================== CATEGORY TREE CACHE ====================
// Cache category tree
let categoryTreeCache = null;
let categoryTreePromise = null;

// Fetch and cache category tree (với localStorage)
const getCategoryTree = async () => {
  // Check memory cache first
  if (categoryTreeCache) return categoryTreeCache;
  
  // Check localStorage cache
  const cachedTree = getCache('category_tree');
  if (cachedTree) {
    categoryTreeCache = cachedTree;
    return categoryTreeCache;
  }
  
  if (!categoryTreePromise) {
    categoryTreePromise = fetchCategoryTree().then(response => {
      if (response.success) {
        categoryTreeCache = response.data;
        // Save to localStorage
        setCache('category_tree', categoryTreeCache);
        return categoryTreeCache;
      }
      return [];
    });
  }
  
  return categoryTreePromise;
};

// Find category ID from tree by name or key
const findCategoryIdFromTree = (tree, searchKey) => {
  if (!tree || !Array.isArray(tree)) return null;
  
  // Normalize search key - decode special characters
  const normalizeString = (str) => {
    if (!str) return '';
    return str
      .toLowerCase()
      .replace(/&amp;/g, '&')
      .replace(/\u0026/g, '&')
      .trim();
  };
  
  const searchLower = normalizeString(searchKey);
  
  for (const cat of tree) {
    const catNameNormalized = normalizeString(cat.name);
    
    // Exact match first
    if (catNameNormalized === searchLower) {
      console.log(`✅ Exact match found: "${cat.name}" (ID: ${cat.id})`);
      return { id: cat.id, name: cat.name, count: cat.count || cat.product_count || 0 };
    }
    
    // Partial match
    if (catNameNormalized.includes(searchLower) || searchLower.includes(catNameNormalized)) {
      console.log(`✅ Partial match found: "${cat.name}" (ID: ${cat.id}) for search: "${searchKey}"`);
      return { id: cat.id, name: cat.name, count: cat.count || cat.product_count || 0 };
    }
    
    // Search in children recursively
    if (cat.children && cat.children.length > 0) {
      const found = findCategoryIdFromTree(cat.children, searchKey);
      if (found) return found;
    }
  }
  return null;
};

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
export const getAllCatalogProducts = async (limit = 50) => {
  try {
    const url = `${API_BASE}?limit=${limit}`;
    console.log('🔄 Fetching all catalog products from:', url);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await parseJSON(response);
    const normalized = normalizeApiResponse(data);
    const products = normalizeProducts(normalized.data);
    // Transform products
    const transformed = transformProductsFromAPI(products);
    console.log(`✅ Successfully fetched ${transformed.length} products`);
    return { success: true, data: transformed, total: normalized.total };
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

// Helper: Get all subcategory titles for fetching by categoryId
// - Cấp 1 (Parent Menu): Lấy tất cả subcategories của tất cả categories
// - Cấp 2 (Category): Lấy tất cả subcategories của category đó
// NOTE: We only return titles now, NOT endpoints, because /api/products/category/{name} does NOT exist
// Instead, we use titles to find categoryId from category tree, then fetch by categoryId
const getSubcategoryEndpoints = (categoryKey) => {
  const subcategories = [];

  // Case 1: Parent Menu (Cấp 1) - Thực phẩm chức năng
  if (isParentMenu(categoryKey)) {
    const category = MENU_DATA[categoryKey];
    console.log(`📋 "${categoryKey}" is a PARENT MENU (Level 1)`);
    
    if (category.categories && Array.isArray(category.categories)) {
      category.categories.forEach(cat => {
        // Lấy tất cả subcategories của mỗi category
        if (cat.subcategories && Array.isArray(cat.subcategories)) {
          cat.subcategories.forEach(sub => {
            if (sub.key && sub.title) {
              subcategories.push({
                key: sub.key,
                title: sub.title
              });
            }
          });
        }
      });
    }
    
    return subcategories.length > 0 ? subcategories : null;
  }

  // Case 2: Category (Cấp 2) - Vitamin & Khoáng chất
  const categoryData = findCategoryInParent(categoryKey);
  if (categoryData) {
    console.log(`📋 "${categoryKey}" is a CATEGORY (Level 2)`);
    
    if (categoryData.subcategories && Array.isArray(categoryData.subcategories)) {
      categoryData.subcategories.forEach(sub => {
        if (sub.key && sub.title) {
          subcategories.push({
            key: sub.key,
            title: sub.title
          });
        }
      });
    }
    
    return subcategories.length > 0 ? subcategories : null;
  }

  // Case 3: Subcategory (Cấp 3) - Bổ sung Canxi & Vitamin D
  // Sẽ được xử lý ở phần sau (direct API call)
  console.log(`📋 "${categoryKey}" is a SUBCATEGORY (Level 3) or unknown`);
  return null;
};

// Helper: Find category title from MENU_DATA
const findCategoryTitle = (categoryKey) => {
  if (!MENU_DATA) return null;
  
  let categoryTitle = null;
  
  // 🔹 Check if categoryKey matches a main menu (Level 1)
  if (MENU_DATA[categoryKey]) {
    return MENU_DATA[categoryKey].title;
  }
  
  Object.values(MENU_DATA).forEach(mainMenu => {
    // 🔹 Also check by mainMenu.key (in case categoryKey matches)
    if (mainMenu.key === categoryKey && mainMenu.title) {
      categoryTitle = mainMenu.title;
    }
    
    if (mainMenu.categories) {
      mainMenu.categories.forEach(parentCat => {
        if (parentCat.key === categoryKey && parentCat.title) {
          categoryTitle = parentCat.title;
        }
        if (parentCat.subcategories) {
          parentCat.subcategories.forEach(sub => {
            if (sub.key === categoryKey && sub.title) {
              categoryTitle = sub.title;
            }
          });
        }
      });
    }
  });
  
  return categoryTitle;
};

// 🔹 Lấy sản phẩm theo danh mục - SỬ DỤNG API MỚI VỚI categoryId
export const getProductsByCategory = async (categoryKey, limit = 50) => {
  try {
    // no key -> return all
    if (!categoryKey || categoryKey === 'all') {
      return getAllCatalogProducts(limit);
    }

    console.log(`🔍 Getting products for category key: "${categoryKey}"`);
    
    // ✨ CHECK CACHE FIRST
    const cacheKey = `products_${categoryKey}_${limit}`;
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      console.log(`📦 Using cached products for "${categoryKey}": ${cachedData.data?.length || 0} items`);
      return cachedData;
    }

    // 1. Lấy category tree từ API
    const categoryTree = await getCategoryTree();
    console.log(`📂 Category tree loaded:`, categoryTree?.length || 0, 'top-level categories');
    
    if (categoryTree && categoryTree.length > 0) {
      // 2. Tìm category title từ MENU_DATA
      const categoryTitle = findCategoryTitle(categoryKey);
      console.log(`📋 Category title from MENU_DATA for key "${categoryKey}":`, categoryTitle);
      
      if (categoryTitle) {
        console.log(`📋 Found category title: "${categoryTitle}" for key: "${categoryKey}"`);
        
        // 3. Tìm categoryId từ tree bằng title
        const categoryInfo = findCategoryIdFromTree(categoryTree, categoryTitle);
        console.log(`🔍 Search result for "${categoryTitle}":`, categoryInfo);
        
        if (categoryInfo) {
          console.log(`✅ Found category in tree: ID=${categoryInfo.id}, Name="${categoryInfo.name}", Count=${categoryInfo.count}`);
          
          // 4. Fetch products bằng categoryId
          const response = await fetchProductsByCategoryId(categoryInfo.id, { limit });
          console.log(`📦 fetchProductsByCategoryId response:`, response);
          
          if (response.success && response.products.length > 0) {
            console.log(`✅ Fetched ${response.products.length} products for category ID ${categoryInfo.id}`);
            const result = { success: true, data: response.products, total: response.total };
            setCache(cacheKey, result); // 💾 Save to cache
            return result;
          }
          
          console.log(`⚠️ No products found for category ID ${categoryInfo.id}, trying subcategories...`);
        } else {
          console.warn(`❌ Category "${categoryTitle}" not found in tree`);
        }
      } else {
        console.warn(`❌ No title found in MENU_DATA for key: "${categoryKey}"`);
      }
      
      // 5. Nếu không tìm thấy, thử tìm trực tiếp bằng key trong tree
      const directMatch = findCategoryIdFromTree(categoryTree, categoryKey);
      if (directMatch) {
        console.log(`✅ Direct match found: ID=${directMatch.id}, Name="${directMatch.name}"`);
        
        const response = await fetchProductsByCategoryId(directMatch.id, { limit });
        
        if (response.success && response.products.length > 0) {
          console.log(`✅ Fetched ${response.products.length} products for category ID ${directMatch.id}`);
          const result = { success: true, data: response.products, total: response.total };
          setCache(cacheKey, result); // 💾 Save to cache
          return result;
        }
      }
    }

    // 6. Fallback: Check if this is a parent category - fetch all subcategories
    const subcategoryEndpoints = getSubcategoryEndpoints(categoryKey);
    if (subcategoryEndpoints && subcategoryEndpoints.length > 0) {
      console.log(`🎯 "${categoryKey}" is a parent category, fetching from ${subcategoryEndpoints.length} subcategories by ID`);
      
      // Lấy tất cả categoryInfo trước
      const categoryInfos = subcategoryEndpoints
        .map(({ title }) => findCategoryIdFromTree(categoryTree, title))
        .filter(Boolean);
      
      console.log(`📋 Found ${categoryInfos.length} valid category IDs to fetch`);
      
      // Fetch SONG SONG tất cả subcategories (thay vì tuần tự)
      const fetchPromises = categoryInfos.map(catInfo => 
        fetchProductsByCategoryId(catInfo.id, { limit: 10 })
          .catch(err => {
            console.warn(`⚠️ Failed to fetch category ${catInfo.id}:`, err.message);
            return { success: false, products: [] };
          })
      );
      
      const results = await Promise.all(fetchPromises);
      
      // Gom tất cả sản phẩm
      const allProducts = results
        .filter(r => r.success && r.products.length > 0)
        .flatMap(r => r.products);

      // Remove duplicates based on product ID
      const uniqueProducts = Array.from(
        new Map(allProducts.map(p => [p.id, p])).values()
      );

      if (uniqueProducts.length > 0) {
        console.log(`✅ Combined ${uniqueProducts.length} unique products from ${categoryInfos.length} subcategories (parallel fetch)`);
        const result = { success: true, data: uniqueProducts, total: uniqueProducts.length };
        setCache(cacheKey, result); // 💾 Save to cache
        return result;
      }
    }

    // 7. OLD FALLBACK REMOVED - endpoint /api/products/category/{name} does not exist in backend
    // The backend only supports /api/products?categoryId={id}
    // If we reach here, it means no products were found via categoryId method

    console.error(`❌ No products found for category "${categoryKey}"`);
    return { success: false, error: 'No products found', data: [], total: 0 };
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
    // Use correct endpoint for single product
    const url = `${API_BASE_URL}/products/${productId}`;
    const response = await fetch(url);
    
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
    // Transform single product
    const transformed = transformProductFromAPI(normalizedProduct);
    console.log('✅ Product found and normalized:', transformed.name || transformed.id);
    return { success: true, data: transformed };
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
  getCategoryTree,
  filterHelpers
};
