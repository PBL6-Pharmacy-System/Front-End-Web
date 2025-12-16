import React, { useState, useEffect } from 'react';
import { getAccessToken } from '../services/authApi';
import { useToast } from '../components/Toast';
import { formatPrice } from '../utils/productHelpers';
import './VouchersPage.css';

export default function VouchersPage({ onNavigate }) {
  const toast = useToast();
  const [vouchers, setVouchers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  const filterOptions = [
    { key: 'all', label: 'Tất cả' },
    { key: 'available', label: 'Có thể dùng' },
    { key: 'used', label: 'Đã sử dụng' },
    { key: 'expired', label: 'Hết hạn' }
  ];

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      setIsLoading(true);
      const token = getAccessToken();
      if (!token) {
        toast.warning('Vui lòng đăng nhập');
        return;
      }

      // TODO: Replace with actual API endpoint
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/vouchers/my-vouchers`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setVouchers(data.data || data || []);
      } else {
        // Mock data for demo
        setVouchers([
            
        ]);
      }
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      toast.error('Không thể tải danh sách voucher');
    } finally {
      setIsLoading(false);
    }
  };

  const getVoucherStatus = (voucher) => {
    const now = new Date();
    const endDate = new Date(voucher.end_date);
    
    if (voucher.used_count >= voucher.usage_limit) {
      return 'used';
    }
    if (endDate < now) {
      return 'expired';
    }
    return 'available';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getDiscountText = (voucher) => {
    if (voucher.discount_type === 'fixed') {
      return `Giảm ${formatPrice(voucher.discount_value)}đ`;
    } else if (voucher.discount_type === 'percentage') {
      return `Giảm ${voucher.discount_value}%`;
    } else if (voucher.discount_type === 'shipping') {
      return 'Miễn phí vận chuyển';
    }
    return '';
  };

  const filteredVouchers = vouchers.filter(voucher => {
    if (activeFilter === 'all') return true;
    return getVoucherStatus(voucher) === activeFilter;
  });

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Đã sao chép mã voucher');
  };

  const handleUseVoucher = (voucher) => {
    // Navigate to home/catalog and apply voucher
    toast.info('Vui lòng chọn sản phẩm để áp dụng voucher');
    onNavigate('home');
  };

  return (
    <div className="vouchers-tab">
      <div className="vouchers-header">
        <h2>Vouchers của tôi</h2>
        <p>Quản lý và sử dụng voucher giảm giá</p>
      </div>

      {/* Filter */}
      <div className="vouchers-filter">
        {filterOptions.map(option => (
          <button
            key={option.key}
            className={`filter-btn ${activeFilter === option.key ? 'active' : ''}`}
            onClick={() => setActiveFilter(option.key)}
          >
            {option.label}
            <span className="filter-count">
              ({vouchers.filter(v => option.key === 'all' || getVoucherStatus(v) === option.key).length})
            </span>
          </button>
        ))}
      </div>

      {/* Vouchers List */}
      <div className="vouchers-list">
        {isLoading ? (
          <div className="vouchers-loading">
            <div className="loading-spinner"></div>
            <p>Đang tải vouchers...</p>
          </div>
        ) : filteredVouchers.length === 0 ? (
          <div className="vouchers-empty">
            <div className="empty-icon">🎟️</div>
            <h3>Không có voucher nào</h3>
            <p>Bạn chưa có voucher {activeFilter !== 'all' ? `ở trạng thái "${filterOptions.find(f => f.key === activeFilter)?.label}"` : ''}</p>
            <button className="btn-shop-now" onClick={() => onNavigate('home')}>
              Mua sắm ngay
            </button>
          </div>
        ) : (
          filteredVouchers.map(voucher => {
            const status = getVoucherStatus(voucher);
            const isAvailable = status === 'available';

            return (
              <div key={voucher.id} className={`voucher-card ${status}`}>
                <div className="voucher-left">
                  <div className="voucher-icon">🎟️</div>
                  <div className="voucher-discount">
                    {getDiscountText(voucher)}
                  </div>
                </div>

                <div className="voucher-middle">
                  <h3 className="voucher-title">{voucher.title}</h3>
                  <p className="voucher-description">{voucher.description}</p>
                  
                  <div className="voucher-details">
                    <div className="detail-item">
                      <span className="label">Mã:</span>
                      <span className="value code">{voucher.code}</span>
                      <button 
                        className="copy-btn"
                        onClick={() => handleCopyCode(voucher.code)}
                      >
                        📋
                      </button>
                    </div>
                    <div className="detail-item">
                      <span className="label">Đơn tối thiểu:</span>
                      <span className="value">{formatPrice(voucher.min_order_value)}đ</span>
                    </div>
                    {voucher.max_discount && (
                      <div className="detail-item">
                        <span className="label">Giảm tối đa:</span>
                        <span className="value">{formatPrice(voucher.max_discount)}đ</span>
                      </div>
                    )}
                    <div className="detail-item">
                      <span className="label">Hạn sử dụng:</span>
                      <span className="value">{formatDate(voucher.end_date)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Đã dùng:</span>
                      <span className="value">{voucher.used_count}/{voucher.usage_limit}</span>
                    </div>
                  </div>
                </div>

                <div className="voucher-right">
                  {isAvailable ? (
                    <button 
                      className="use-voucher-btn"
                      onClick={() => handleUseVoucher(voucher)}
                    >
                      Sử dụng ngay
                    </button>
                  ) : (
                    <span className={`voucher-status-badge ${status}`}>
                      {status === 'used' ? 'Đã sử dụng' : 'Hết hạn'}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
