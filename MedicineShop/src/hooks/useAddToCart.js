import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { 
  normalizeProductForCart, 
  validateProductForCart 
} from '../utils/productHelpers';

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
      
      // Dispatch add to cart action
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
