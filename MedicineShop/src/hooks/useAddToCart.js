import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { 
  normalizeProductForCart, 
  validateProductForCart 
} from '../utils/productHelpers';
import { addToCart as addToCartAPI } from '../services/cartApi';
import { isAuthenticated } from '../services/authApi';

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
          // Extract productUnitId from various possible fields
          // Backend returns: base_unit_id, product_unit_id, or productUnitId
          const productUnitId = product.base_unit_id || 
                                product.product_unit_id || 
                                product.productUnitId || 
                                product.baseUnitId;
          
          if (!productUnitId) {
            console.warn('⚠️ No productUnitId found for product:', product.id, product.name);
            console.warn('⚠️ Available fields:', Object.keys(product));
            throw new Error('Sản phẩm không có đơn vị tính hợp lệ');
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
