import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectCartItems,
  selectSelectedTotalAmount,
  removeFromCart,
  incrementQuantity,
  decrementQuantity,
  toggleSelectItem,
  toggleSelectAll,
} from '../store/cartSlice';
import { formatPrice } from '../utils/productHelpers';
import { getCart, removeFromCart as removeFromCartAPI, updateCartItem } from '../services/cartApi';
import { isAuthenticated } from '../services/authApi';
import { useToast } from './Toast';
import ConfirmDialog from './ConfirmDialog';
import './Cart.css';

// Helper function to get product image from multiple sources
const getProductImage = (product) => {
  const placeholder = '/api/placeholder/150/150';
  
  if (!product) return placeholder;
  
  // Priority 1: images array
  if (Array.isArray(product.images) && product.images.length > 0) {
    const firstImage = product.images[0];
    if (typeof firstImage === 'string' && firstImage.trim()) {
      return firstImage.trim();
    }
    if (typeof firstImage === 'object' && (firstImage.url || firstImage.path || firstImage.src)) {
      return firstImage.url || firstImage.path || firstImage.src;
    }
  }
  
  // Priority 2: image_url field
  if (product.image_url && typeof product.image_url === 'string') {
    return product.image_url.trim();
  }
  
  // Priority 3: Other fields
  if (product.image && typeof product.image === 'string') return product.image.trim();
  if (product.imageUrl && typeof product.imageUrl === 'string') return product.imageUrl.trim();
  if (product.thumbnail && typeof product.thumbnail === 'string') return product.thumbnail.trim();
  
  return placeholder;
};

export default function Cart({ onNavigate }) {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const selectedTotalAmount = useSelector(selectSelectedTotalAmount);
  const toast = useToast();
  
  const [selectAll, setSelectAll] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [backendCartItems, setBackendCartItems] = useState([]);
  const [displayItems, setDisplayItems] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, itemId: null });

  // Check authentication and fetch cart from backend
  useEffect(() => {
    const checkAuthAndFetchCart = async () => {
      if (!isAuthenticated()) {
        // Redirect to home if not authenticated
        toast.warning('Vui lòng đăng nhập để xem giỏ hàng');
        if (onNavigate) {
          onNavigate('home');
        }
        return;
      }

      try {
        setIsLoading(true);
        const response = await getCart();
        console.log('📦 Backend cart data:', response);
        
        if (response.success && response.data && response.data.orderitems) {
          const items = response.data.orderitems;
          setBackendCartItems(items);
          
          // Transform backend data to display format
          const transformedItems = items.map(item => ({
            id: item.id,
            backendItemId: item.id,
            productId: item.product_id,
            name: item.products?.name || 'Sản phẩm',
            price: Number(item.price) || 0,
            originalPrice: Number(item.products?.price) || null,
            image: getProductImage(item.products),
            quantity: item.quantity,
            unit: item.productunits?.unit_name || 'Hộp',
            totalPrice: Number(item.subtotal) || 0,
            selected: true
          }));
          
          setDisplayItems(transformedItems);
          console.log('✅ Transformed cart items:', transformedItems);
        }
      } catch (error) {
        console.error('❌ Error fetching cart:', error);
        // If error is authentication related, redirect to home
        if (error.message.includes('authenticated')) {
          toast.warning('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
          if (onNavigate) {
            onNavigate('home');
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndFetchCart();
  }, [onNavigate]);

  useEffect(() => {
    // Cập nhật selectAll dựa trên state của items
    const allSelected = displayItems.length > 0 && displayItems.every(item => item.selected);
    setSelectAll(allSelected);
  }, [displayItems]);

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setDisplayItems(displayItems.map(item => ({
      ...item,
      selected: newSelectAll
    })));
  };

  const handleSelectItem = (id) => {
    setDisplayItems(displayItems.map(item => 
      item.id === id ? { ...item, selected: !item.selected } : item
    ));
  };

  const handleQuantityChange = async (backendItemId, change, currentQuantity) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return;

    try {
      // Call backend API
      await updateCartItem(backendItemId, newQuantity);
      // Refresh cart from backend
      const response = await getCart();
      if (response.success && response.data && response.data.orderitems) {
        const items = response.data.orderitems;
        const transformedItems = items.map(item => ({
          id: item.id,
          backendItemId: item.id,
          productId: item.product_id,
          name: item.products?.name || 'Sản phẩm',
          price: Number(item.price) || 0,
          originalPrice: Number(item.products?.price) || null,
          image: getProductImage(item.products),
          quantity: item.quantity,
          unit: item.productunits?.unit_name || 'Hộp',
          totalPrice: Number(item.subtotal) || 0,
          selected: true
        }));
        setDisplayItems(transformedItems);
      }
      // Trigger cart count refresh in header
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('❌ Error updating quantity:', error);
      toast.error('Có lỗi xảy ra khi cập nhật số lượng');
    }
  };

  const handleRemoveItem = (backendItemId) => {
    setConfirmDialog({ isOpen: true, itemId: backendItemId });
  };

  const handleConfirmRemove = async () => {
    if (confirmDialog.itemId) {
      try {
        // Call backend API
        await removeFromCartAPI(confirmDialog.itemId);
        // Refresh cart from backend
        const response = await getCart();
        if (response.success && response.data && response.data.orderitems) {
          const items = response.data.orderitems;
          const transformedItems = items.map(item => ({
            id: item.id,
            backendItemId: item.id,
            productId: item.product_id,
            name: item.products?.name || 'Sản phẩm',
            price: Number(item.price) || 0,
            originalPrice: Number(item.products?.price) || null,
            image: getProductImage(item.products),
            quantity: item.quantity,
            unit: item.productunits?.unit_name || 'Hộp',
            totalPrice: Number(item.subtotal) || 0,
            selected: true
          }));
          setDisplayItems(transformedItems);
        }
        // Trigger cart count refresh in header
        window.dispatchEvent(new Event('cartUpdated'));
        toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
      } catch (error) {
        console.error('❌ Error removing item:', error);
        toast.error('Có lỗi xảy ra khi xóa sản phẩm');
      }
      setConfirmDialog({ isOpen: false, itemId: null });
    }
  };

  const handleCancelRemove = () => {
    setConfirmDialog({ isOpen: false, itemId: null });
  };
  
  const handleBackToHome = () => {
    if (onNavigate) {
      onNavigate('home');
    }
  };
  
  const handleCheckout = () => {
    const selectedItems = displayItems.filter(item => item.selected);
    if (selectedItems.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một sản phẩm để thanh toán');
      return;
    }
    // Chuyển đến trang thanh toán
    if (onNavigate) {
      onNavigate('checkout');
    }
  };

  const selectedItems = displayItems.filter(item => item.selected);
  const selectedCount = selectedItems.length;
  const selectedQuantityTotal = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const calculatedTotal = selectedItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalQuantityInCart = displayItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Xác nhận xóa"
        message="Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng không?"
        onConfirm={handleConfirmRemove}
        onCancel={handleCancelRemove}
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
      />
      <div className="cart-page">
      <div className="cart-container">
        {/* Header */}
        <div className="cart-header">
          <button className="back-btn" onClick={handleBackToHome}>
            <span className="back-icon">←</span>
            Tiếp tục mua sắm
          </button>
          <h1>Giỏ hàng của bạn ({totalQuantityInCart} sản phẩm)</h1>
        </div>

        {/* Free Shipping Banner */}
        <div className="free-shipping-banner">
          <span>Miễn phí vận chuyển đối với đơn hàng trên 300.000đ</span>
        </div>

        <div className="cart-content">
          {/* Cart Items */}
          <div className="cart-items-section">
            {/* Select All */}
            <div className="select-all-section">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
                <span className="checkmark"></span>
                Chọn tất cả ({displayItems.length})
              </label>
            </div>

            {/* Items Header */}
            <div className="items-header">
              <div className="header-col product">Giá thành</div>
              <div className="header-col quantity">Số lượng</div>
              <div className="header-col unit">Đơn vị</div>
            </div>

            {/* Cart Items */}
            <div className="cart-items-list">
              {isLoading ? (
                <div className="empty-cart">
                  <div className="empty-cart-icon">⏳</div>
                  <h3>Đang tải giỏ hàng...</h3>
                </div>
              ) : displayItems.length === 0 ? (
                <div className="empty-cart">
                  <div className="empty-cart-icon">🛒</div>
                  <h3>Giỏ hàng trống</h3>
                  <p>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
                  <button className="continue-shopping-btn" onClick={handleBackToHome}>
                    Tiếp tục mua sắm
                  </button>
                </div>
              ) : (
                displayItems.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="item-select">
                    <label className="checkbox-container">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => handleSelectItem(item.id)}
                      />
                      <span className="checkmark"></span>
                    </label>
                  </div>

                  <div className="item-image">
                    <img src={item.image} alt={item.name} />
                  </div>

                  <div className="item-details">
                    <h3 className="item-name">{item.name}</h3>
                  </div>

                  <div className="item-price">
                    <span className="price">{formatPrice(item.price)}đ</span>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <span className="original-price">{formatPrice(item.originalPrice)}đ</span>
                    )}
                  </div>

                  <div className="item-quantity">
                    <div className="quantity-controls">
                      <button 
                        className="qty-btn minus"
                        onClick={() => handleQuantityChange(item.backendItemId, -1, item.quantity)}
                      >
                        −
                      </button>
                      <span className="qty-number">{item.quantity}</span>
                      <button 
                        className="qty-btn plus"
                        onClick={() => handleQuantityChange(item.backendItemId, 1, item.quantity)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="item-unit">
                    <span className="unit-text">{item.unit || 'Hộp'}</span>
                    <div className="item-total-price">
                      Tổng: {formatPrice(item.totalPrice)}đ
                    </div>
                  </div>

                  <div className="item-actions">
                    <button 
                      className="remove-btn"
                      onClick={() => handleRemoveItem(item.backendItemId)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="order-summary">
            <div className="promo-banner">
              <span className="promo-icon">💳</span>
              <span>Áp dụng ưu đãi để được giảm giá</span>
              <button className="promo-arrow">→</button>
            </div>

            <div className="summary-details">
              <div className="summary-row">
                <span>Tổng tiền ({selectedQuantityTotal} sản phẩm)</span>
                <span className="amount">{formatPrice(calculatedTotal)}đ</span>
              </div>
              <div className="summary-row">
                <span>Giảm giá trực tiếp</span>
                <span className="discount">0đ</span>
              </div>
              <div className="summary-row">
                <span>Giảm giá voucher</span>
                <span className="discount">0đ</span>
              </div>
              <div className="summary-row">
                <span>Phí vận chuyển</span>
                <span className="shipping">{calculatedTotal >= 300000 ? 'Miễn phí' : '30.000đ'}</span>
              </div>
              <div className="summary-total">
                <span>Thành tiền</span>
                <span className="total-amount">
                  {formatPrice(calculatedTotal + (calculatedTotal >= 300000 ? 0 : 30000))}đ
                </span>
              </div>
            </div>

            <button 
              className="checkout-btn"
              onClick={handleCheckout}
              disabled={selectedCount === 0}
            >
              Mua hàng ({selectedQuantityTotal} sản phẩm)
            </button>

            <p className="checkout-note">
              Bằng việc tiến hành đặt mua hàng, bạn đồng ý với{' '}
              <a href="#" className="link">Điều khoản dịch vụ</a> và{' '}
              <a href="#" className="link">Chính sách xử lý dữ liệu cá nhân</a>{' '}
              của Nhà thuốc FPT Long Châu
            </p>

            {/* App Download Banner */}
            <div className="app-download-banner">
              <div className="app-info">
                <div className="app-icon">📱</div>
                <div className="app-text">
                  <div className="app-title">Tải ứng dụng</div>
                  <div className="app-subtitle">Miễn phí vận chuyển</div>
                  <div className="app-description">với mọi đơn hàng</div>
                </div>
              </div>
              <div className="qr-code">
                <div className="qr-placeholder">
                  <div className="qr-grid">
                    {Array.from({length: 64}).map((_, i) => (
                      <div key={i} className={`qr-dot ${Math.random() > 0.5 ? 'filled' : ''}`}></div>
                    ))}
                  </div>
                </div>
              </div>
              <button className="download-btn">Tải ngay</button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}