// Flash Sale API Service
// Public endpoints do NOT require Authorization header
import { API_CONFIG } from '../config/api';
import { transformProductFromAPI } from '../utils/productTransformer';

const API_BASE_URL = API_CONFIG.BASE_URL;
const API_BASE = `${API_BASE_URL}/flashsales`;

const parseJSON = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

/**
 * Normalize API response to consistent format
 */
const normalizeFlashSaleResponse = (payload) => {
  if (!payload) return { data: [], total: 0, pagination: null };

  // Case: { success: true, data: { flashsales: [...], pagination: {} } }
  if (
    payload.success &&
    payload.data &&
    typeof payload.data === 'object' &&
    !Array.isArray(payload.data) &&
    (payload.data.flashsales || payload.data.flashSales || payload.data.pagination)
  ) {
    const flashsales = payload.data.flashsales || payload.data.flashSales || [];
    const pagination = payload.data.pagination || null;

    // Flatten products from flashsales
    const allProducts = [];
    if (Array.isArray(flashsales)) {
        flashsales.forEach(fs => {
          console.log('🔍 Processing flashsale:', fs.id, fs.name);
          // Backend returns: flashsale_products array with nested products object
          const items = fs.flashsale_products || fs.flashsaleProducts || fs.products || [];
          console.log('📦 Flashsale items count:', items.length);
          
          if (Array.isArray(items) && items.length > 0) {
            items.forEach(item => {
              // Extract product from flashsale_product item
              const product = item.products || item.product || item;
              
              if (product && product.id) {
                console.log('✅ Found product:', product.id, product.name);
                allProducts.push({
                  ...product,
                  flashSaleItemId: item.id,
                  flashSaleId: fs.id,
                  flashSaleName: fs.name,
                  flashSaleDescription: fs.description,
                  startTime: fs.start_time || fs.startTime,
                  endTime: fs.end_time || fs.endTime,
                  flashSaleStatus: fs.status,
                  flashPrice: item.flash_price || item.flashPrice,
                  flashStockLimit: item.stock_limit || item.stockLimit,
                  flashSoldCount: item.sold_count || item.soldCount || 0
                });
              } else {
                console.warn('⚠️ No product found in item:', item);
              }
            });
          } else {
            console.warn('⚠️ No flashsale_products array found for:', fs.name);
          }
        });
    }

    return {
      data: allProducts,
      total: pagination?.totalRecords || allProducts.length,
      pagination
    };
  }

  // Case: { data: [...] }
  if (payload.data && Array.isArray(payload.data)) {
    return {
      data: payload.data,
      total: payload.total || payload.data.length,
      pagination: payload.pagination || null
    };
  }

  // Case: payload is an array
  if (Array.isArray(payload)) {
    return { data: payload, total: payload.length, pagination: null };
  }

  // Case: { products: [...] }
  if (payload.products && Array.isArray(payload.products)) {
    return { data: payload.products, total: payload.total || payload.products.length, pagination: payload.pagination || null };
  }

  // Fallback
  return { data: [], total: 0, pagination: null };
};

const transformProduct = (product) => {
  if (!product) return null;
  
  // First apply basic product transformation
  const baseTransformed = transformProductFromAPI(product);
  
  // Then add flash-sale specific fields
  const originalPrice = parseFloat(product.price || product.price_amount || '0');
  const flashPrice = parseFloat(product.flashPrice || product.flash_price || '0');
  const salePrice = flashPrice > 0 ? flashPrice : originalPrice;

  let discountPercent = 0;
  if (originalPrice > 0 && salePrice > 0 && salePrice < originalPrice) {
    discountPercent = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  }

  // Calculate available stock from flash sale limits
  const stockLimit = product.flashStockLimit || product.stock_limit || product.stock || product.totalStock || 100;
  const soldCount = product.flashSoldCount || product.sold_count || product.sold || 0;
  const availableStock = Math.max(0, stockLimit - soldCount);
  
  console.log(`📦 Product ${product.id || product.name}: stock_limit=${stockLimit}, sold_count=${soldCount}, available=${availableStock}`);
  console.log(`📦 Product ${product.id || product.name}: stock_limit=${stockLimit}, sold_count=${soldCount}, available=${availableStock}`);
  
  // Time fields: prefer product.startTime / product.endTime, fallback to start_time/end_time
  const startTimeRaw = product.startTime || product.start_time || product.start;
  const endTimeRaw = product.endTime || product.end_time || product.end;

  const safeParseDate = (v) => {
    try {
      const d = new Date(v);
      return isNaN(d.getTime()) ? null : d;
    } catch {
      return null;
    }
  };

  const startDate = safeParseDate(startTimeRaw);
  const endDate = safeParseDate(endTimeRaw);

  const startTimeISO = startDate ? startDate.toISOString() : null;
  const endTimeISO = endDate ? endDate.toISOString() : null;
  const startTimeLocal = startDate ? startDate.toLocaleString() : null;
  const endTimeLocal = endDate ? endDate.toLocaleString() : null;

  const now = new Date();
  const isActive = startDate && endDate ? (now >= startDate && now <= endDate) : false;

  return {
    ...baseTransformed,
    // Override with flash sale specific data
    price: String(originalPrice),
    support: String(salePrice),
    stock: availableStock,
    totalStock: stockLimit,
    sold: soldCount,
    discount: discountPercent > 0 ? `-${discountPercent}%` : '',
    discountPercent,
    // Flash sale specific fields
    flashSaleId: product.flashSaleId || product.flash_sale_id,
    flashSaleName: product.flashSaleName,
    flashSaleDescription: product.flashSaleDescription,
    startTime: product.startTime || startTimeISO,
    endTime: product.endTime || endTimeISO,
    startTimeISO,
    endTimeISO,
    startTimeLocal,
    endTimeLocal,
    isActive,
    flashSaleStatus: product.flashSaleStatus,
  };
};

// Fetch helper for public flashsale endpoints (no auth header)
const defaultHeaders = { 'Content-Type': 'application/json' };

export const getFlashSaleProducts = async () => {
  try {
    console.log('🔥 Fetching flash sale products from flash sale API');

    const wait = (ms) => new Promise(res => setTimeout(res, ms));

    // Try active endpoint first
    let url = `${API_BASE}/active`;
    let response = await fetch(url, { method: 'GET', headers: defaultHeaders });

    // If no active flashsales (data: null), get all flashsales
    if (response.ok) {
      const activeData = await parseJSON(response);
      console.log('📦 Active flashsales response:', activeData);
      
      // If no active flashsales, fallback to all flashsales
      if (!activeData || !activeData.data || (Array.isArray(activeData.data) && activeData.data.length === 0) || activeData.data === null) {
        console.log('⚠️ No active flashsales, fetching all flashsales...');
        url = API_BASE;
        response = await fetch(url, { method: 'GET', headers: defaultHeaders });
      } else {
        // Use active flashsales data
        const normalized = normalizeFlashSaleResponse(activeData);
        console.log('📦 Normalized active flashsales:', normalized);
        const transformed = (normalized.data || []).map(transformProduct).filter(p => p !== null);
        return { success: true, data: transformed, total: normalized.total, pagination: normalized.pagination };
      }
    } else if (response.status === 404) {
      url = API_BASE;
      response = await fetch(url, { method: 'GET', headers: defaultHeaders });
    }

    if (response.status === 429) {
      const ra = response.headers.get('Retry-After');
      let waitMs = 5000;
      if (ra) {
        const raInt = parseInt(ra, 10);
        if (!isNaN(raInt)) waitMs = raInt * 1000;
      }
      console.warn(`Received 429, retrying after ${waitMs}ms`);
      await wait(waitMs);
      response = await fetch(url, { method: 'GET', headers: defaultHeaders });
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await parseJSON(response);
    console.log('📦 Raw API response:', data);
    
    // Filter to only show active or pending flashsales (not ended)
    if (data && data.data && Array.isArray(data.data.flashsales)) {
      const activeOrPending = data.data.flashsales.filter(fs => 
        fs.status === 'active' || fs.status === 'pending'
      );
      console.log(`📦 Filtered ${activeOrPending.length} active/pending flashsales from ${data.data.flashsales.length} total`);
      data.data.flashsales = activeOrPending;
      
      if (activeOrPending.length > 0) {
        console.log('📦 First flashsale object:', activeOrPending[0]);
      }
    }

    const normalized = normalizeFlashSaleResponse(data);
    console.log('📦 Normalized response:', normalized);

    const transformed = (normalized.data || []).map(transformProduct).filter(p => p !== null);

    return { success: true, data: transformed, total: normalized.total, pagination: normalized.pagination };
  } catch (error) {
    console.error('❌ Error fetching flash sale products:', error);
    return { success: false, error: error.message, data: [], total: 0 };
  }
};

export const getFlashSaleProductById = async (productId) => {
  try {
    const response = await fetch(`${API_BASE}/${productId}`, { method: 'GET', headers: defaultHeaders });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await parseJSON(response);
    const product = (data && data.data) ? data.data : data;
    return { success: true, data: transformProduct(product) };
  } catch (error) {
    console.error('❌ Error fetching flash sale product by ID:', error);
    return { success: false, error: error.message, data: null };
  }
};

export const getActiveFlashSales = async () => {
  try {
    const response = await fetch(`${API_BASE}/active`, { method: 'GET', headers: defaultHeaders });
    if (!response.ok) return getFlashSaleProducts();
    const data = await parseJSON(response);
    const normalized = normalizeFlashSaleResponse(data);
    const transformed = (normalized.data || []).map(transformProduct).filter(p => p !== null);
    return { success: true, data: transformed, total: normalized.total };
  } catch (error) {
    console.error('❌ Error fetching active flash sales:', error);
    return getFlashSaleProducts();
  }
};

export default {
  getFlashSaleProducts,
  getFlashSaleProductById,
  getActiveFlashSales
};