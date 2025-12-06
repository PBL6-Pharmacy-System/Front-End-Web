/**
 * Transform product data from backend API to frontend format
 * Ensures all products have consistent field names including productUnitId for cart
 */
export const transformProductFromAPI = (product) => {
  if (!product) return null;

  // Extract the correct product unit ID from productunits table
  // Priority: productunits[0].id (this is the ID needed for add to cart API)
  let productUnitId = null;
  
  // If product has productunits array, use the first unit's ID (this is the correct ID)
  if (Array.isArray(product.productunits) && product.productunits.length > 0) {
    productUnitId = product.productunits[0].id;
    console.log(`🔧 Using productunits[0].id for product ${product.id}: ${productUnitId}`);
  }
  // Fallback to other fields if productunits not available
  else {
    productUnitId = product.productUnitId || product.product_unit_id;
    if (productUnitId) {
      console.log(`🔧 Using fallback productUnitId for product ${product.id}: ${productUnitId}`);
    } else {
      console.warn(`⚠️ No productUnitId found for product ${product.id}`);
    }
  }

  // Handle stock quantity for display
  // stock: actual quantity number (from flash sale: stock_limit - sold_count)
  // in_stock: boolean 0/1 (0 = out of stock, 1 = in stock) - used for cart validation
  let stockValue;
  if (product.stock !== undefined && product.stock !== null) {
    // If stock is explicitly provided (from flash sale or other sources), use it
    stockValue = Number(product.stock);
  } else if (product.totalStock !== undefined && product.totalStock !== null) {
    stockValue = Number(product.totalStock);
  } else {
    // No quantity specified, will rely on in_stock flag only
    stockValue = undefined;
  }

  return {
    ...product,
    // Ensure base_unit_id is available with multiple fallbacks
    base_unit_id: productUnitId,
    productUnitId: productUnitId,
    // Normalize other common fields
    id: product.id || product.product_id,
    name: product.name || product.product_name || '',
    price: product.price || product.price_amount || '0',
    image: product.image_url || product.image || (Array.isArray(product.images) && product.images[0]) || '',
    images: product.images || [],
    category_id: product.category_id || product.categoryId,
    description: product.description || '',
    manufacturer: product.manufacturer || product.producer || '',
    specification: product.specification || product.dosage || '',
    brand: product.brand || '',
    // in_stock: 0 = out of stock, 1 = in stock (can add to cart)
    inStock: product.in_stock !== undefined ? Number(product.in_stock) : 1,
    stock: stockValue,
  };
};

/**
 * Transform array of products
 */
export const transformProductsFromAPI = (products) => {
  if (!Array.isArray(products)) return [];
  return products.map(transformProductFromAPI).filter(p => p !== null);
};
