import React from 'react';
import './ChatOrderCard.css';

export default function ChatOrderCard({ order }) {
  if (!order) return null;

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format currency
  const formatPrice = (price) => {
    if (!price) return '0₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Get status label and color
  const getStatusInfo = (status) => {
    const statusMap = {
      'pending': { label: 'Chờ xử lý', color: '#FFA500' },
      'processing': { label: 'Đang xử lý', color: '#2196F3' },
      'shipping': { label: 'Đang giao', color: '#9C27B0' },
      'delivered': { label: 'Đã giao', color: '#4CAF50' },
      'cancelled': { label: 'Đã hủy', color: '#F44336' },
      'returned': { label: 'Đã trả', color: '#FF9800' }
    };
    return statusMap[status] || { label: status, color: '#757575' };
  };

  const statusInfo = getStatusInfo(order.status);

  // Navigate to order detail
  const handleViewOrder = () => {
    window.location.href = `/order/${order.id}`;
  };

  return (
    <div className="chat-order-card">
      <div className="chat-order-header">
        <div className="chat-order-id">
          <strong>Đơn hàng #{order.id}</strong>
        </div>
        <div 
          className="chat-order-status"
          style={{ backgroundColor: statusInfo.color }}
        >
          {statusInfo.label}
        </div>
      </div>
      
      <div className="chat-order-info">
        <div className="chat-order-date">
          <span className="label">Ngày đặt:</span>
          <span className="value">{formatDate(order.created_at || order.order_date)}</span>
        </div>
        
        <div className="chat-order-total">
          <span className="label">Tổng tiền:</span>
          <span className="value price">{formatPrice(order.total_amount || order.total)}</span>
        </div>

        {order.items && order.items.length > 0 && (
          <div className="chat-order-items">
            <span className="label">Sản phẩm:</span>
            <ul className="items-list">
              {order.items.slice(0, 3).map((item, index) => (
                <li key={index}>
                  {item.product_name || item.name} × {item.quantity}
                </li>
              ))}
              {order.items.length > 3 && (
                <li className="more-items">và {order.items.length - 3} sản phẩm khác...</li>
              )}
            </ul>
          </div>
        )}
      </div>
      
      <button 
        className="chat-order-view-btn"
        onClick={handleViewOrder}
      >
        Xem chi tiết
      </button>
    </div>
  );
}
