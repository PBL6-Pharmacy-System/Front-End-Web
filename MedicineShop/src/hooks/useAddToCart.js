import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { 
  normalizeProductForCart, 
  validateProductForCart 
} from '../utils/productHelpers';
import { addToCart as addToCartAPI } from '../services/cartApi';
import { isAuthenticated } from '../services/authApi';
import { API_CONFIG } from '../config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

/**
 * Custom hook để xử lý thêm sản phẩm vào giỏ hàng
 * @returns {object} - { handleAddToCart, isAdding }
 */
export const useAddToCart = () => {
  const dispatch = useDispatch();

  /**
   * Thêm sản phẩm vào giỏ hàng
   * @param {object} product - Dữ liệu sản phẩm
   * @param {string} source - Nguồn sản phẩm (flash-sale, listing, medical, catalog)
   * @param {number} quantity - Số lượng (mặc định 1)
   * @returns {Promise<{success: boolean, message: string}>}
   */
  const handleAddToCart = async (product, source = 'unknown', quantity = 1) => {
    console.log('🛒 useAddToCart - Attempting to add product:', {
      productId: product?.id,
      productName: product?.name,
      source,
      quantity
    });

    try {
      // Validate product data
      const validation = validateProductForCart(product);
      if (!validation.valid) {
        console.error('❌ Product validation failed:', validation.error);
        return {
          success: false,
          message: validation.error
        };
      }

      // Normalize product data
      const normalizedProduct = normalizeProductForCart(product, source, quantity);
      
      // If user is authenticated, call backend API
      if (isAuthenticated()) {
        try {
          // Extract productUnitId - need to find valid ID from productunits table
          // This is required for add to cart API
          let productUnitId = null;
          
          // Priority 1: productunits array from API (most reliable)
          if (Array.isArray(product.productunits) && product.productunits.length > 0 && product.productunits[0].id) {
            productUnitId = product.productunits[0].id;
            console.log('🔧 Using productunits[0].id:', productUnitId);
          }
          // Priority 2: productUnitId field (if not null/undefined)
          else if (product.productUnitId && product.productUnitId !== null) {
            productUnitId = product.productUnitId;
            console.log('🔧 Using productUnitId field:', productUnitId);
          }
          // Priority 3: product_unit_id field
          else if (product.product_unit_id && product.product_unit_id !== null) {
            productUnitId = product.product_unit_id;
            console.log('🔧 Using product_unit_id:', productUnitId);
          }
          // Priority 4: base_unit_id - this might be unittype ID, but try it as fallback
          else if (product.base_unit_id && product.base_unit_id !== null) {
            productUnitId = product.base_unit_id;
            console.log('🔧 Using base_unit_id as fallback:', productUnitId);
          }
          
          if (!productUnitId) {
            console.warn('⚠️ No productUnitId found for product:', product.id, product.name);
            // Try to fetch product details to get productUnitId
            try {
              const productDetailResponse = await fetch(`${API_BASE_URL}/products/${product.id}`);
              if (productDetailResponse.ok) {
                const productDetail = await productDetailResponse.json();
                const detailProduct = productDetail.success ? productDetail.data : productDetail;
                
                if (Array.isArray(detailProduct.productunits) && detailProduct.productunits.length > 0) {
                  productUnitId = detailProduct.productunits[0].id;
                  console.log('✅ Fetched productUnitId from product detail API:', productUnitId);
                }
              }
            } catch (fetchError) {
              console.error('❌ Failed to fetch product details:', fetchError);
            }
            
            // If still no productUnitId, use product.id as fallback (might work for some backends)
            if (!productUnitId) {
              console.warn('⚠️ Using product.id as fallback productUnitId');
              productUnitId = product.id;
            }
          }
          
          // Call backend API - need productId and productUnitId
          const requestData = {
            productId: product.id,
            quantity: quantity,
            productUnitId: Number(productUnitId)
          };
          console.log('🚀 Calling backend addToCart API:', requestData);
          
          const response = await addToCartAPI(
            product.id,
            quantity,
            productUnitId
          );
          console.log('✅ Backend response:', response);
          
          // Trigger cart count refresh by dispatching custom event
          window.dispatchEvent(new Event('cartUpdated'));
        } catch (apiError) {
          console.error('❌ Backend API error:', apiError);
          // Continue to add to local cart even if API fails
        }
      }
      
      // Always update Redux store for UI consistency
      dispatch(addToCart(normalizedProduct));
      
      console.log('✅ Product added to cart successfully');
      return {
        success: true,
        message: `Đã thêm "${product.name}" vào giỏ hàng`
      };
      
    } catch (error) {
      console.error('❌ Error adding product to cart:', error);
      return {
        success: false,
        message: error.message || 'Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng'
      };
    }
  };

  return { handleAddToCart };
};

export default useAddToCart;
