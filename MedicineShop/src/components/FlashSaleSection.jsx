import React, { useState, useEffect } from 'react';
import './FlashSaleSection.css';
import { useFlashSaleProducts } from '../hooks/useFlashSaleProducts';
import { useAddToCart } from '../hooks/useAddToCart';
import { useToast } from './Toast';
import PaginationControls from './PaginationControls';

export default function FlashSaleSection({ onNavigate, onProductClick }) {
  const { products, loading, error, pagination } = useFlashSaleProducts(6);
  const { handleAddToCart } = useAddToCart();
  const toast = useToast();

  // Dynamic countdown based on product start/end times
  const [timeLeft, setTimeLeft] = useState(null);
  const [countdownLabel, setCountdownLabel] = useState('Kết thúc trong');

  useEffect(() => {
    let timerId = null;

    const parseDate = (v) => {
      if (!v) return null;
      try {
        const d = new Date(v);
        console.log('📅 Parsing date:', v, '→', d.toISOString(), 'Valid:', !isNaN(d.getTime()));
        return isNaN(d.getTime()) ? null : d;
      } catch (e) {
        console.error('❌ Error parsing date:', v, e);
        return null;
      }
    };

    const compute = (startDate, endDate) => {
      const now = new Date();
      
      console.log('⏰ Computing countdown:', {
        now: now.toISOString(),
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString()
      });
      
      if (startDate && now < startDate) {
        const diff = startDate.getTime() - now.getTime();
        console.log('🚀 Event starts in:', diff, 'ms');
        setCountdownLabel('Bắt đầu trong');
        return diff;
      }
      if (endDate && now < endDate) {
        const diff = endDate.getTime() - now.getTime();
        console.log('⏳ Event ends in:', diff, 'ms');
        setCountdownLabel('Kết thúc trong');
        return diff;
      }
      console.log('⏹️ Event has ended');
      return 0;
    };

    const msToHms = (ms) => {
      if (!ms || ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      const total = Math.max(0, Math.floor(ms / 1000));
      const days = Math.floor(total / 86400); // 86400 seconds in a day
      const hours = Math.floor((total % 86400) / 3600);
      const minutes = Math.floor((total % 3600) / 60);
      const seconds = total % 60;
      return { days, hours, minutes, seconds };
    };

    const p0 = products && products.length > 0 ? products[0] : null;
    
    // Debug: log available time fields
    if (p0) {
      console.log('🕐 FlashSale - Product data:', p0);
      console.log('🕐 FlashSale - Available time fields:', {
        startTime: p0.startTime,
        endTime: p0.endTime,
        startTimeISO: p0.startTimeISO,
        endTimeISO: p0.endTimeISO,
        start_time: p0.start_time,
        end_time: p0.end_time
      });
    } else {
      console.warn('⚠️ No products available for Flash Sale timer');
    }
    
    const setupTimerFromProducts = () => {
      if (!p0) {
        setTimeLeft(null);
        return;
      }

      // Get time values directly from product
      const startKey = p0.startTime || p0.startTimeISO || p0.start_time;
      const endKey = p0.endTime || p0.endTimeISO || p0.end_time;
      
      console.log('🎯 Timer setup with:', { startKey, endKey });

      const startDate = parseDate(startKey);
      const endDate = parseDate(endKey);
      
      console.log('📅 Parsed dates:', { 
        startDate: startDate?.toISOString(), 
        endDate: endDate?.toISOString() 
      });

      const update = () => {
        const ms = compute(startDate, endDate);
        setTimeLeft(prev => {
          const next = msToHms(ms);
          if (!prev || prev.days !== next.days || prev.hours !== next.hours || prev.minutes !== next.minutes || prev.seconds !== next.seconds) {
            console.log('⏱️ Timer update:', next);
            return next;
          }
          return prev;
        });
        if (ms <= 0 && timerId) {
          clearInterval(timerId);
        }
      };

      update();
      timerId = setInterval(update, 1000);
    };

    setupTimerFromProducts();

    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [products?.length, products?.[0]?.startTimeISO, products?.[0]?.endTimeISO, products?.[0]?.startTime, products?.[0]?.endTime, products?.[0]?.start_time, products?.[0]?.end_time]);

  const formatPrice = (price) => {
    if (!price) return '0';
    return new Intl.NumberFormat('vi-VN').format(price.replace(/[.,]/g, ''));
  };

  const calculateDiscount = (originalPrice, salePrice) => {
    if (!originalPrice || !salePrice) return 0;
    const original = parseFloat(originalPrice.replace(/[.,]/g, ''));
    const sale = parseFloat(salePrice.replace(/[.,]/g, ''));
    return Math.round(((original - sale) / original) * 100);
  };

  const handleAddToCartClick = async (product, e) => {
    e.stopPropagation();
    console.log(`🛒 [FlashSale] Adding to cart:`, product.name);
    
    const result = await handleAddToCart(product, 'flash-sale', 1);
    
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const handleProductClick = (product) => {
    if (onProductClick) {
      onProductClick(product.id || product.product_id || product.productId, 'flash-sale');
    }
  };

  if (loading) {
    return (
      <section className="flash-sale-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">⚡ FLASH SALE</h2>
            <div className="countdown-timer">
              <span>Kết thúc trong: </span>
              <div className="timer">
                <span>--:--:--</span>
              </div>
            </div>
          </div>
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Đang tải sản phẩm...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flash-sale-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">⚡ FLASH SALE</h2>
            <div className="countdown-timer">
              <span>Kết thúc trong: </span>
              <div className="timer">
                <span>--:--:--</span>
              </div>
            </div>
          </div>
          <div className="error-message">
            <p>Lỗi: {error}</p>
            <button className="retry-btn" onClick={() => window.location.reload()}>
              Thử lại
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flash-sale-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">⚡ FLASH SALE</h2>
          <div className="countdown-timer">
            <span>{countdownLabel}: </span>
            <div className="timer">
              {timeLeft ? (
                <>
                  {timeLeft.days > 0 && (
                    <span className="time-unit">
                      <span className="time-value">{String(timeLeft.days).padStart(2, '0')}</span>
                      <span className="time-label">ngày</span>
                    </span>
                  )}
                  <span className="time-unit">
                    <span className="time-value">{String(timeLeft.hours).padStart(2, '0')}</span>
                    <span className="time-label">giờ</span>
                  </span>
                  <span className="time-unit">
                    <span className="time-value">{String(timeLeft.minutes).padStart(2, '0')}</span>
                    <span className="time-label">phút</span>
                  </span>
                  <span className="time-unit">
                    <span className="time-value">{String(timeLeft.seconds).padStart(2, '0')}</span>
                    <span className="time-label">giây</span>
                  </span>
                </>
              ) : (
                <span>00 giờ 00 phút 00 giây</span>
              )}
            </div>
          </div>
        </div>
        
        {pagination && (
          <div className="product-listing-info">
            Hiển thị {pagination.startIndex} - {pagination.endIndex} trong tổng số {pagination.totalProducts} sản phẩm
          </div>
        )}
        
        <div className="products-grid">
          {products.map(product => {
            const discountPercent = calculateDiscount(product.price, product.support);
            
            return (
              <div 
                key={product.id} 
                className="product-card"
              >
                {discountPercent > 0 && (
                  <div className="discount-badge">-{discountPercent}%</div>
                )}
                
                <div className="product-image">
                  <img 
                    src={product.image || "/api/placeholder/150/150"} 
                    alt={product.name || 'Sản phẩm'} 
                  />
                </div>
                
                <div className="product-info">
                  <h3 className="product-name">
                    {product.name}
                  </h3>
                  
                  {/* Giá bán sau giảm giá */}
                  <div className="current-price">
                    {formatPrice(product.support || product.price)}đ
                    <span className="price-unit"> / Hộp</span>
                  </div>
                  
                  {/* Giá gốc */}
                  {product.price && product.support && product.price !== product.support && (
                    <div className="original-price">
                      Giá gốc: {formatPrice(product.price)}đ
                    </div>
                  )}
                  
                  {/* Phần trăm giảm giá */}
                  {discountPercent > 0 && (
                    <div className="discount-info">
                      Tiết kiệm: {discountPercent}% ({formatPrice((parseFloat(product.price.replace(/[.,]/g, '')) - parseFloat(product.support.replace(/[.,]/g, ''))).toString())}đ)
                    </div>
                  )}
                  
                  {/* Mô tả ngắn */}
                  {product.description && (
                    <div className="product-description">
                      {product.description}
                    </div>
                  )}
                  
                  {/* Định lượng */}
                  {product.quantity && (
                    <div className="product-quantity">
                      Quy cách: {product.quantity}
                    </div>
                  )}
                  
                  {/* 2 buttons */}
                  <div className="product-actions">
                    <button 
                      className="view-detail-btn"
                      onClick={() => handleProductClick(product)}
                    >
                      Xem chi tiết
                    </button>
                    <button 
                      className="add-to-cart-btn"
                      onClick={(e) => handleAddToCartClick(product, e)}
                      disabled={product.in_stock === false}
                      style={product.in_stock === false ? {
                        backgroundColor: '#ccc',
                        color: '#666',
                        cursor: 'not-allowed',
                        opacity: 0.6
                      } : {}}
                    >
                      {product.in_stock === false ? 'Hết hàng' : '🛒 Thêm vào giỏ'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <PaginationControls pagination={pagination} />
      </div>
    </section>
  );
}
