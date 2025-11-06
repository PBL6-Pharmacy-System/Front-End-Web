// Flash Sale API Service
// API endpoint: http://localhost:3000/api/flashsales

const API_BASE = '/api/flashsales';

const parseJSON = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

/**
 * Normalize API response to consistent format
 * Expected backend response format:
 * {
 *   success: true,
 *   data: {
 *     flashsales: [...],
 *     pagination: {...}
 *   }
 * }
 */
const normalizeFlashSaleResponse = (payload) => {
  if (!payload) return { data: [], total: 0, pagination: null };

  // Handle { success: true, data: { flashsales: [], pagination: {} } }
  if (payload.success && payload.data) {
    const flashsales = payload.data.flashsales || payload.data.flashSales || [];
    const pagination = payload.data.pagination;
    
    // Extract products from flashsales array
    let allProducts = [];
    if (Array.isArray(flashsales)) {
      flashsales.forEach(flashsale => {
        if (flashsale.products && Array.isArray(flashsale.products)) {
          // Each item in products array has structure: { id, product_id, flash_price, stock_limit, product: {...} }
          const productsWithFlashSaleInfo = flashsale.products.map(item => {
            const product = item.product || {};
            
            return {
              // Product data from nested product object
              ...product,
              // Flash sale specific data from the wrapper
              flashSaleItemId: item.id,
              flashSaleId: flashsale.id,
              flashSaleName: flashsale.name,
              flashSaleDescription: flashsale.description,
              startTime: flashsale.start_time,
              endTime: flashsale.end_time,
              flashSaleStatus: flashsale.status,
              // Price data from flash sale
              flashPrice: item.flash_price,
              flashStockLimit: item.stock_limit,
              flashSoldCount: item.sold_count,
            };
          });
          allProducts.push(...productsWithFlashSaleInfo);
        }
      });
    }
    
    return {
      data: allProducts,
      total: pagination?.totalRecords || allProducts.length,
      pagination: pagination
    };
  }

  // If backend returns { data: [...], total: N }
  if (payload.data && Array.isArray(payload.data)) {
    return { 
      data: payload.data, 
      total: payload.total || payload.data.length,
      pagination: payload.pagination || null
    };
  }

  // If payload itself is an array
  if (Array.isArray(payload)) {
    return { 
      data: payload, 
      total: payload.length,
      pagination: null
    };
  }

  // If backend returns { products: [...], total: N }
  if (payload.products && Array.isArray(payload.products)) {
    return { 
      data: payload.products, 
      total: payload.total || payload.products.length,
      pagination: payload.pagination || null
    };
  }

  // Unexpected shape: return empty
  return { data: [], total: 0, pagination: null };
};

/**
 * Transform product data from API to match frontend format
 */
const transformProduct = (product) => {
  if (!product) return null;

  // Get original price and flash sale price
  const originalPrice = parseFloat(product.price || '0');
  const flashPrice = parseFloat(product.flashPrice || product.flash_price || '0');
  const salePrice = flashPrice > 0 ? flashPrice : originalPrice;
  
  // Calculate discount percentage
  let discountPercent = 0;
  if (originalPrice > 0 && salePrice > 0 && salePrice < originalPrice) {
    discountPercent = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  }

  // Get stock information
  const stockLimit = product.flashStockLimit || product.flash_stock_limit || product.stock_limit;
  const soldCount = product.flashSoldCount || product.flash_sold_count || product.sold_count || 0;
  const availableStock = stockLimit ? (stockLimit - soldCount) : (product.stock || 99);

  return {
    id: product.id || product.product_id,
    name: product.name || '',
    // Original price (giá gốc)
    price: String(originalPrice),
    // Sale price (giá sau giảm = flash_price)
    support: String(salePrice),
    // Images
    image: product.image_url || product.images?.[0] || '',
    images: product.images || [],
    // Product details
    quantity: product.specification || product.dosage || '',
    stock: availableStock,
    totalStock: stockLimit || product.stock || 200,
    sold: soldCount,
    // Discount info
    discount: discountPercent > 0 ? `-${discountPercent}%` : '',
    discountPercent: discountPercent,
    // Category and brand
    category: product.category_id || product.category || '',
    brand: product.brand || '',
    manufacturer: product.manufacturer || product.producer || '',
    description: product.description || '',
    // Stock status
    inStock: availableStock > 0,
    // Flash sale specific fields
    flashSaleId: product.flashSaleId,
    flashSaleName: product.flashSaleName,
    flashSaleDescription: product.flashSaleDescription,
    startTime: product.startTime,
    endTime: product.endTime,
    flashSaleStatus: product.flashSaleStatus,
    // Additional product info
    usage: product.usage,
    faq: product.faq,
    registNum: product.registNum,
    manufactor: product.manufactor,
  };
};

/**
 * Get all flash sale products
 */
export const getFlashSaleProducts = async () => {
  try {
    console.log('🔥 Fetching flash sale products from:', API_BASE);
    
    const response = await fetch(API_BASE);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await parseJSON(response);
    console.log('📦 Raw API response:', data);
    
    const normalized = normalizeFlashSaleResponse(data);
    console.log('📦 Normalized response:', normalized);
    
    // Transform products to match frontend format
    const transformedProducts = normalized.data
      .map(transformProduct)
      .filter(p => p !== null);
    
    console.log('✅ Flash sale products loaded:', transformedProducts.length, 'products');
    if (transformedProducts.length > 0) {
      console.log('📦 Sample product:', transformedProducts[0]);
    }
    
    return { 
      success: true, 
      data: transformedProducts, 
      total: normalized.total,
      pagination: normalized.pagination
    };
  } catch (error) {
    console.error('❌ Error fetching flash sale products:', error);
    return { 
      success: false, 
      error: error.message,
      data: [],
      total: 0
    };
  }
};

/**
 * Get flash sale product by ID
 */
export const getFlashSaleProductById = async (productId) => {
  try {
    const response = await fetch(`${API_BASE}/${productId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await parseJSON(response);
    
    // Handle both wrapped and direct product responses
    const product = data.data || data;
    const transformed = transformProduct(product);
    
    return { 
      success: true, 
      data: transformed 
    };
  } catch (error) {
    console.error('❌ Error fetching flash sale product by ID:', error);
    return { 
      success: false, 
      error: error.message,
      data: null
    };
  }
};

/**
 * Get active flash sales
 * Optional: if backend supports filtering active sales
 */
export const getActiveFlashSales = async () => {
  try {
    const response = await fetch(`${API_BASE}/active`);
    
    if (!response.ok) {
      // Fallback to getting all products if endpoint doesn't exist
      return getFlashSaleProducts();
    }
    
    const data = await parseJSON(response);
    const normalized = normalizeFlashSaleResponse(data);
    
    const transformedProducts = normalized.data
      .map(transformProduct)
      .filter(p => p !== null);
    
    return { 
      success: true, 
      data: transformedProducts, 
      total: normalized.total 
    };
  } catch (error) {
    console.error('❌ Error fetching active flash sales:', error);
    // Fallback to getting all products
    return getFlashSaleProducts();
  }
};

export default {
  getFlashSaleProducts,
  getFlashSaleProductById,
  getActiveFlashSales
};
