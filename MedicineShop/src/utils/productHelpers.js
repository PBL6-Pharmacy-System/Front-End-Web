/**
 * Utility functions để chuẩn hóa dữ liệu sản phẩm từ các nguồn khác nhau
 * và chuẩn bị cho việc thêm vào giỏ hàng
 */

/**
 * Chuẩn hóa giá tiền từ string sang number
 * @param {string|number} price - Giá dạng string (VD: "150.000", "150,000") hoặc number
 * @returns {number} - Giá dạng number
 */
export const normalizePrice = (price) => {
  if (typeof price === 'number') return price;
  if (!price) return 0;
  
  // Remove all dots, commas, and 'đ' symbol
  const cleanPrice = String(price).replace(/[.,đ\s]/g, '');
  const numPrice = parseInt(cleanPrice, 10);
  
  return isNaN(numPrice) ? 0 : numPrice;
};

/**
 * Lấy giá hiện tại của sản phẩm (ưu tiên giá khuyến mãi)
 * @param {object} product - Object sản phẩm
 * @returns {number} - Giá hiện tại
 */
export const getCurrentPrice = (product) => {
  // Ưu tiên: flashPrice (Flash Sale) > support (giá KM) > price > originalPrice
  const priceToUse = product.flashPrice || product.flash_price || product.support || product.price || product.originalPrice || 0;
  return normalizePrice(priceToUse);
};

/**
 * Lấy giá gốc của sản phẩm
 * @param {object} product - Object sản phẩm
 * @returns {number|null} - Giá gốc hoặc null nếu không có
 */
export const getOriginalPrice = (product) => {
  // Nếu có flashPrice (Flash Sale) và price khác nhau
  const flashPrice = product.flashPrice || product.flash_price;
  if (flashPrice && product.price && flashPrice !== product.price) {
    return normalizePrice(product.price);
  }
  // Nếu có support (giá KM) và price khác nhau
  if (product.support && product.price && product.support !== product.price) {
    return normalizePrice(product.price);
  }
  // Nếu có price và originalPrice khác nhau
  if (product.price && product.originalPrice && product.price !== product.originalPrice) {
    return normalizePrice(product.originalPrice);
  }
  return null;
};

/**
 * Lấy đơn vị của sản phẩm
 * @param {object} product - Object sản phẩm
 * @returns {string} - Đơn vị (Hộp, Chai, Viên, etc.)
 */
export const getProductUnit = (product) => {
  return product.quantity || product.unit || 'Hộp';
};

/**
 * Chuẩn hóa dữ liệu sản phẩm cho giỏ hàng
 * @param {object} product - Dữ liệu sản phẩm từ bất kỳ nguồn nào
 * @param {string} source - Nguồn sản phẩm (flash-sale, listing, medical, catalog)
 * @param {number} quantity - Số lượng thêm vào giỏ (mặc định 1)
 * @returns {object} - Object sản phẩm đã chuẩn hóa
 */
export const normalizeProductForCart = (product, source = 'unknown', quantity = 1) => {
  console.log('🔧 Normalizing product for cart:', { product, source, quantity });
  
  if (!product || !product.id) {
    console.error('❌ Invalid product data:', product);
    throw new Error('Product data is invalid or missing ID');
  }
  
  const currentPrice = getCurrentPrice(product);
  const originalPrice = getOriginalPrice(product);
  const unit = getProductUnit(product);
  
  const normalizedProduct = {
    id: product.id,
    name: product.name || 'Sản phẩm không tên',
    price: currentPrice,
    originalPrice: originalPrice,
    image: product.image || '/api/placeholder/150/150',
    quantity: quantity,
    unit: unit,
    discount: product.discount || null,
    category: product.category || product.categoryName || 'Không phân loại',
    source: source,
    description: product.description || '',
  };
  
  console.log('✅ Normalized product:', normalizedProduct);
  return normalizedProduct;
};

/**
 * Format giá tiền theo định dạng VND
 * @param {number} price - Giá tiền
 * @returns {string} - Chuỗi giá đã format
 */
export const formatPrice = (price) => {
  if (!price && price !== 0) return '0';
  return new Intl.NumberFormat('vi-VN').format(price);
};

/**
 * Tính phần trăm giảm giá
 * @param {number} originalPrice - Giá gốc
 * @param {number} currentPrice - Giá hiện tại
 * @returns {number} - Phần trăm giảm giá
 */
export const calculateDiscountPercent = (originalPrice, currentPrice) => {
  if (!originalPrice || !currentPrice || originalPrice <= currentPrice) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

/**
 * Kiểm tra sản phẩm có còn hàng không
 * @param {object} product - Object sản phẩm
 * @returns {boolean} - true nếu còn hàng
 */
export const isProductInStock = (product) => {
  // Kiểm tra các trường có thể chứa thông tin stock
  if (product.inStock !== undefined) return product.inStock;
  if (product.stock !== undefined) return product.stock > 0;
  if (product.totalStock !== undefined) return product.totalStock > 0;
  
  // Mặc định coi như còn hàng nếu không có thông tin
  return true;
};

/**
 * Validate product data trước khi thêm vào giỏ
 * @param {object} product - Object sản phẩm
 * @returns {object} - { valid: boolean, error: string|null }
 */
export const validateProductForCart = (product) => {
  if (!product) {
    return { valid: false, error: 'Dữ liệu sản phẩm không hợp lệ' };
  }
  
  if (!product.id) {
    return { valid: false, error: 'Sản phẩm thiếu ID' };
  }
  
  if (!product.name) {
    return { valid: false, error: 'Sản phẩm thiếu tên' };
  }
  
  const currentPrice = getCurrentPrice(product);
  if (currentPrice <= 0) {
    return { valid: false, error: 'Giá sản phẩm không hợp lệ' };
  }
  
  if (!isProductInStock(product)) {
    return { valid: false, error: 'Sản phẩm hiện đang hết hàng' };
  }
  
  return { valid: true, error: null };
};
