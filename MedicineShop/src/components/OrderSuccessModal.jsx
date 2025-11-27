import React from 'react';
import './OrderSuccessModal.css';

export default function OrderSuccessModal({ 
  isOpen, 
  onClose, 
  orderInfo,
  onNavigateHome,
  onNavigateOrders 
}) {
  if (!isOpen) return null;

  const { orderId, totalAmount, paymentMethod, shippingAddress } = orderInfo || {};

  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'cod':
        return 'Thanh toán khi nhận hàng (COD)';
      case 'momo':
        return 'Ví MoMo';
      case 'vnpay':
        return 'VNPay';
      default:
        return method;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price || 0);
  };

  return (
    <div className="order-success-overlay" onClick={onClose}>
      <div className="order-success-modal" onClick={e => e.stopPropagation()}>
        {/* Success Icon */}
        <div className="order-success-icon">
          <div className="success-circle">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M5 13l4 4L19 7" 
                stroke="white" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="order-success-title">Đặt hàng thành công!</h2>
        <p className="order-success-subtitle">Cảm ơn bạn đã mua hàng tại Nhà thuốc FPT Long Châu</p>

        {/* Order Details */}
        <div className="order-success-details">
          <div className="order-detail-row">
            <span className="detail-label">Mã đơn hàng:</span>
            <span className="detail-value order-id">#{orderId || '---'}</span>
          </div>
          
          <div className="order-detail-row">
            <span className="detail-label">Tổng tiền:</span>
            <span className="detail-value total-amount">{formatPrice(totalAmount)}đ</span>
          </div>

          <div className="order-detail-row">
            <span className="detail-label">Phương thức thanh toán:</span>
            <span className="detail-value">{getPaymentMethodText(paymentMethod)}</span>
          </div>

          {shippingAddress && (
            <div className="order-detail-row address-row">
              <span className="detail-label">Địa chỉ giao hàng:</span>
              <span className="detail-value address-value">
                {shippingAddress.recipient_name} - {shippingAddress.recipient_phone}
                <br />
                {[shippingAddress.address_line, shippingAddress.state, shippingAddress.city].filter(Boolean).join(', ')}
              </span>
            </div>
          )}
        </div>

        {/* Info Note */}
        <div className="order-success-note">
          <span className="note-icon">📦</span>
          <p>Đơn hàng của bạn đang được xử lý. Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất!</p>
        </div>

        {/* Actions */}
        <div className="order-success-actions">
          <button 
            className="btn-view-orders"
            onClick={onNavigateOrders}
          >
            Xem đơn hàng
          </button>
          <button 
            className="btn-continue-shopping"
            onClick={onNavigateHome}
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    </div>
  );
}
