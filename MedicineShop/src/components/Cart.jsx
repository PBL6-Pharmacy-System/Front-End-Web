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
import './Cart.css';

export default function Cart({ onNavigate }) {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const selectedTotalAmount = useSelector(selectSelectedTotalAmount);
  
  const [selectAll, setSelectAll] = useState(true);

  useEffect(() => {
    // Cập nhật selectAll dựa trên state của items
    const allSelected = cartItems.length > 0 && cartItems.every(item => item.selected);
    setSelectAll(allSelected);
  }, [cartItems]);

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    dispatch(toggleSelectAll(newSelectAll));
  };

  const handleSelectItem = (id) => {
    dispatch(toggleSelectItem(id));
  };

  const handleQuantityChange = (id, change) => {
    if (change > 0) {
      dispatch(incrementQuantity(id));
    } else if (change < 0) {
      dispatch(decrementQuantity(id));
    }
  };

  const handleRemoveItem = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) {
      dispatch(removeFromCart(id));
    }
  };
  
  const handleBackToHome = () => {
    if (onNavigate) {
      onNavigate('home');
    }
  };
  
  const handleCheckout = () => {
    const selectedItems = cartItems.filter(item => item.selected);
    if (selectedItems.length === 0) {
      alert('Vui lòng chọn ít nhất một sản phẩm để thanh toán');
      return;
    }
    // Chuyển đến trang thanh toán
    if (onNavigate) {
      onNavigate('checkout');
    }
  };

  const selectedItems = cartItems.filter(item => item.selected);
  const selectedCount = selectedItems.length;

  return (
    <div className="cart-page">
      <div className="cart-container">
        {/* Header */}
        <div className="cart-header">
          <button className="back-btn" onClick={handleBackToHome}>
            <span className="back-icon">←</span>
            Tiếp tục mua sắm
          </button>
          <h1>Giỏ hàng của bạn ({cartItems.length} sản phẩm)</h1>
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
                Chọn tất cả ({cartItems.length})
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
              {cartItems.length === 0 ? (
                <div className="empty-cart">
                  <div className="empty-cart-icon">🛒</div>
                  <h3>Giỏ hàng trống</h3>
                  <p>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
                  <button className="continue-shopping-btn" onClick={handleBackToHome}>
                    Tiếp tục mua sắm
                  </button>
                </div>
              ) : (
                cartItems.map(item => (
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
                        onClick={() => handleQuantityChange(item.id, -1)}
                      >
                        −
                      </button>
                      <span className="qty-number">{item.quantity}</span>
                      <button 
                        className="qty-btn plus"
                        onClick={() => handleQuantityChange(item.id, 1)}
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
                      onClick={() => handleRemoveItem(item.id)}
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
                <span>Tổng tiền ({selectedCount} sản phẩm)</span>
                <span className="amount">{formatPrice(selectedTotalAmount)}đ</span>
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
                <span className="shipping">{selectedTotalAmount >= 300000 ? 'Miễn phí' : '30.000đ'}</span>
              </div>
              <div className="summary-total">
                <span>Thành tiền</span>
                <span className="total-amount">
                  {formatPrice(selectedTotalAmount + (selectedTotalAmount >= 300000 ? 0 : 30000))}đ
                </span>
              </div>
            </div>

            <button 
              className="checkout-btn"
              onClick={handleCheckout}
              disabled={selectedCount === 0}
            >
              Mua hàng ({selectedCount} sản phẩm)
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
  );
}