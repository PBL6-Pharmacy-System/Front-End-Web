import React, { useState, useEffect } from 'react';
import { getMyOrders, getOrderById } from '../services/orderApi';
import { formatPrice } from '../utils/productHelpers';
import { useToast } from '../components/Toast';
import './OrderHistoryPage.css';

export default function OrderHistoryPage({ onNavigate }) {
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [orderDetails, setOrderDetails] = useState({});

  // Order status config
  const statusConfig = {
    pending: { label: 'Chờ xác nhận', color: '#f59e0b', bgColor: '#fef3c7' },
    confirmed: { label: 'Đã xác nhận', color: '#3b82f6', bgColor: '#dbeafe' },
    processing: { label: 'Đang xử lý', color: '#8b5cf6', bgColor: '#ede9fe' },
    shipping: { label: 'Đang giao hàng', color: '#06b6d4', bgColor: '#cffafe' },
    delivered: { label: 'Đã giao hàng', color: '#10b981', bgColor: '#d1fae5' },
    completed: { label: 'Hoàn thành', color: '#059669', bgColor: '#a7f3d0' },
    cancelled: { label: 'Đã hủy', color: '#ef4444', bgColor: '#fee2e2' },
  };

  const statusTabs = [
    { key: 'all', label: 'Tất cả' },
    { key: 'pending', label: 'Chờ xác nhận' },
    { key: 'confirmed', label: 'Đã xác nhận' },
    { key: 'shipping', label: 'Đang giao' },
    { key: 'delivered', label: 'Đã giao' },
    { key: 'completed', label: 'Hoàn thành' },
    { key: 'cancelled', label: 'Đã hủy' },
  ];

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const fetchOrders = async () => {
    console.log('🔄 fetchOrders called, selectedStatus:', selectedStatus);
    try {
      setIsLoading(true);
      const params = {};
      if (selectedStatus !== 'all') {
        params.status = selectedStatus;
      }
      console.log('📤 Calling getMyOrders with params:', params);
      
      const response = await getMyOrders(params);
      console.log('📦 Orders response:', response);
      
      // Handle different response formats:
      // Format 1: { success: true, data: { orders: [...] } }
      // Format 2: { orders: [...], pagination: {...} }
      let ordersData = [];
      
      if (response.success && response.data) {
        // Format 1
        ordersData = response.data.orders || response.data || [];
      } else if (response.orders) {
        // Format 2 - direct orders array
        ordersData = response.orders;
      } else if (Array.isArray(response)) {
        // Format 3 - direct array
        ordersData = response;
      }
      
      console.log('✅ Orders data to set:', ordersData);
      console.log('✅ Is array:', Array.isArray(ordersData));
      console.log('✅ Length:', ordersData.length);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      toast.error('Không thể tải danh sách đơn hàng');
      setOrders([]);
    } finally {
      setIsLoading(false);
      console.log('✅ fetchOrders completed');
    }
  };

  const handleExpandOrder = async (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      return;
    }

    setExpandedOrderId(orderId);

    // Fetch order details if not already loaded
    if (!orderDetails[orderId]) {
      try {
        const response = await getOrderById(orderId);
        if (response.success) {
          setOrderDetails(prev => ({
            ...prev,
            [orderId]: response.data
          }));
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '---';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusInfo = (status) => {
    return statusConfig[status] || { label: status, color: '#64748b', bgColor: '#f1f5f9' };
  };

  const handleBackToHome = () => {
    if (onNavigate) {
      onNavigate('home');
    }
  };

  return (
    <div className="order-history-page">
      <div className="order-history-container">
        {/* Header */}
        <div className="order-history-header">
          <button className="back-btn" onClick={handleBackToHome}>
            <span className="back-icon">←</span>
            Quay lại
          </button>
          <h1>Lịch sử đơn hàng</h1>
        </div>

        {/* Status Tabs */}
        <div className="order-status-tabs">
          {statusTabs.map(tab => (
            <button
              key={tab.key}
              className={`status-tab ${selectedStatus === tab.key ? 'active' : ''}`}
              onClick={() => setSelectedStatus(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="orders-list">
          {isLoading ? (
            <div className="orders-loading">
              <div className="loading-spinner"></div>
              <p>Đang tải đơn hàng...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="orders-empty">
              <div className="empty-icon">📦</div>
              <h3>Không có đơn hàng nào</h3>
              <p>Bạn chưa có đơn hàng nào {selectedStatus !== 'all' ? `ở trạng thái "${statusTabs.find(t => t.key === selectedStatus)?.label}"` : ''}</p>
              <button className="btn-shop-now" onClick={handleBackToHome}>
                Mua sắm ngay
              </button>
            </div>
          ) : (
            orders.map(order => {
              const statusInfo = getStatusInfo(order.status);
              const isExpanded = expandedOrderId === order.id;
              const details = orderDetails[order.id];

              return (
                <div key={order.id} className={`order-card ${isExpanded ? 'expanded' : ''}`}>
                  {/* Order Header */}
                  <div className="order-card-header" onClick={() => handleExpandOrder(order.id)}>
                    <div className="order-info">
                      <div className="order-id">
                        <span className="label">Mã đơn hàng:</span>
                        <span className="value">#{order.id}</span>
                      </div>
                      <div className="order-date">
                        <span className="label">Ngày đặt:</span>
                        <span className="value">{formatDate(order.created_at || order.order_date)}</span>
                      </div>
                    </div>
                    <div className="order-status-price">
                      <span 
                        className="order-status-badge"
                        style={{ 
                          color: statusInfo.color, 
                          backgroundColor: statusInfo.bgColor 
                        }}
                      >
                        {statusInfo.label}
                      </span>
                      <span className="order-total">{formatPrice(order.total_amount)}đ</span>
                    </div>
                    <button className={`expand-btn ${isExpanded ? 'expanded' : ''}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                  </div>

                  {/* Order Items Preview */}
                  <div className="order-items-preview">
                    {(order.orderitems || order.items || []).slice(0, 2).map((item, index) => (
                      <div key={index} className="preview-item">
                        <img 
                          src={item.products?.image_url || item.products?.images?.[0] || item.image || '/api/placeholder/60/60'} 
                          alt={item.products?.name || item.name}
                          className="preview-item-image"
                        />
                        <div className="preview-item-info">
                          <span className="preview-item-name">
                            {item.products?.name || item.name || 'Sản phẩm'}
                          </span>
                          <span className="preview-item-qty">x{item.quantity}</span>
                        </div>
                        <span className="preview-item-price">{formatPrice(item.subtotal || item.price * item.quantity)}đ</span>
                      </div>
                    ))}
                    {(order.orderitems || order.items || []).length > 2 && (
                      <div className="preview-more">
                        +{(order.orderitems || order.items).length - 2} sản phẩm khác
                      </div>
                    )}
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="order-details">
                      {/* All Items */}
                      <div className="order-details-section">
                        <h4>Chi tiết sản phẩm</h4>
                        <div className="order-items-list">
                          {(details?.orderitems || order.orderitems || order.items || []).map((item, index) => (
                            <div key={index} className="order-item">
                              <img 
                                src={item.products?.image_url || item.products?.images?.[0] || item.image || '/api/placeholder/80/80'} 
                                alt={item.products?.name || item.name}
                                className="order-item-image"
                              />
                              <div className="order-item-info">
                                <h5 className="order-item-name">{item.products?.name || item.name}</h5>
                                <p className="order-item-unit">
                                  Đơn vị: {item.productunits?.unit_name || item.unit || 'Hộp'}
                                </p>
                                <p className="order-item-price-qty">
                                  {formatPrice(item.price)}đ x {item.quantity}
                                </p>
                              </div>
                              <span className="order-item-subtotal">
                                {formatPrice(item.subtotal || item.price * item.quantity)}đ
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipping Info */}
                      <div className="order-details-section">
                        <h4>Thông tin giao hàng</h4>
                        <div className="shipping-info">
                          <p>
                            <strong>{details?.shippingaddresses?.recipient_name || order.shippingaddresses?.recipient_name || order.recipient_name || '---'}</strong>
                            {' - '}
                            {details?.shippingaddresses?.recipient_phone || order.shippingaddresses?.recipient_phone || order.recipient_phone || '---'}
                          </p>
                          <p>
                            {[
                              details?.shippingaddresses?.address_line || order.shippingaddresses?.address_line || order.address_line,
                              details?.shippingaddresses?.state || order.shippingaddresses?.state || order.state,
                              details?.shippingaddresses?.city || order.shippingaddresses?.city || order.city
                            ].filter(Boolean).join(', ') || 'Chưa có địa chỉ'}
                          </p>
                        </div>
                      </div>

                      {/* Payment Info */}
                      <div className="order-details-section">
                        <h4>Thanh toán</h4>
                        <div className="payment-summary">
                          <div className="payment-row">
                            <span>Tạm tính:</span>
                            <span>{formatPrice(order.subtotal || order.total_amount)}đ</span>
                          </div>
                          <div className="payment-row">
                            <span>Phí vận chuyển:</span>
                            <span>{formatPrice(order.shipping_fee || 0)}đ</span>
                          </div>
                          {order.discount_amount > 0 && (
                            <div className="payment-row discount">
                              <span>Giảm giá:</span>
                              <span>-{formatPrice(order.discount_amount)}đ</span>
                            </div>
                          )}
                          <div className="payment-row total">
                            <span>Tổng cộng:</span>
                            <span>{formatPrice(order.total_amount)}đ</span>
                          </div>
                          <div className="payment-method">
                            <span>Phương thức: </span>
                            <span>
                              {(() => {
                                const method = order.payments?.[0]?.payment_method || order.payment_method;
                                return method === 'cod' ? 'Thanh toán khi nhận hàng' :
                                       method === 'momo' ? 'Ví MoMo' :
                                       method === 'vnpay' ? 'VNPay' : method || 'Không xác định';
                              })()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Order Note */}
                      {order.note && (
                        <div className="order-details-section">
                          <h4>Ghi chú</h4>
                          <p className="order-note">{order.note}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="order-actions">
                        {order.status === 'delivered' && (
                          <button className="btn-review">
                            Đánh giá sản phẩm
                          </button>
                        )}
                        {order.status === 'completed' && (
                          <button className="btn-reorder" onClick={() => onNavigate('home')}>
                            Mua lại
                          </button>
                        )}
                        {(order.status === 'pending' || order.status === 'confirmed') && (
                          <button className="btn-contact">
                            Liên hệ hỗ trợ
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
