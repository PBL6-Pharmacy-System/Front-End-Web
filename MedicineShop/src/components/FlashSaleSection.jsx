import React, { useState, useEffect } from 'react';
import './FlashSaleSection.css';
import { useFlashSaleProducts } from '../hooks/useFlashSaleProducts';
import { useAddToCart } from '../hooks/useAddToCart';
import ProductCard from './ProductCard';
import PaginationControls from './PaginationControls';

export default function FlashSaleSection({ onNavigate, onProductClick }) {
  const { products, loading, error, pagination } = useFlashSaleProducts(6);
  const { handleAddToCart } = useAddToCart();

  // Dynamic countdown based on product start/end times
  const [timeLeft, setTimeLeft] = useState(null); // { hours, minutes, seconds }
  const [countdownLabel, setCountdownLabel] = useState('Kết thúc trong');

  useEffect(() => {
    let timerId = null;

    const parseDate = (v) => {
      if (!v) return null;
      try {
        const d = new Date(v);
        return isNaN(d.getTime()) ? null : d;
      } catch {
        return null;
      }
    };

    const compute = (startDate, endDate) => {
      const now = new Date();
      if (startDate && now < startDate) {
        // upcoming
        const diff = startDate.getTime() - now.getTime();
        setCountdownLabel('Bắt đầu trong');
        return diff;
      }
      if (endDate) {
        const diff = endDate.getTime() - now.getTime();
        setCountdownLabel('Kết thúc trong');
        return diff;
      }
      return 0;
    };

    const msToHms = (ms) => {
      if (!ms || ms <= 0) return { hours: 0, minutes: 0, seconds: 0 };
      const total = Math.max(0, Math.floor(ms / 1000));
      const hours = Math.floor(total / 3600);
      const minutes = Math.floor((total % 3600) / 60);
      const seconds = total % 60;
      return { hours, minutes, seconds };
    };

    // Only setup timer when the sale timeframe changes (avoid effect retriggering when `products` reference
    // changes but content is the same). Use first product's start/end and product count as the key.
    const p0 = products && products.length > 0 ? products[0] : null;
    const startKey = p0 ? (p0.startTimeISO || p0.startTime || p0.start_time) : '';
    const endKey = p0 ? (p0.endTimeISO || p0.endTime || p0.end_time) : '';

    const setupTimerFromProducts = () => {
      if (!p0) {
        setTimeLeft(null);
        return;
      }

      const startDate = parseDate(startKey);
      const endDate = parseDate(endKey);

      const update = () => {
        const ms = compute(startDate, endDate);
        setTimeLeft(prev => {
          const next = msToHms(ms);
          // only update state if values changed to avoid extra re-renders
          if (!prev || prev.hours !== next.hours || prev.minutes !== next.minutes || prev.seconds !== next.seconds) {
            return next;
          }
          return prev;
        });
        // stop when expired
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
  // Depend only on number of products and the first product's timeframe strings
  }, [products?.length, products?.[0]?.startTimeISO, products?.[0]?.endTimeISO, products?.[0]?.startTime, products?.[0]?.endTime, products?.[0]?.start_time, products?.[0]?.end_time]);

  const handleBuyNow = (product) => {
    console.log(`Mua ngay: ${product.name}`);
  };

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
      // Hiển thị thông báo thành công
      alert(`✅ ${result.message}`);
    } else {
      // Hiển thị thông báo lỗi
      alert(`❌ ${result.message}`);
    }
  };

  const handleProductClick = (product) => {
    if (onProductClick) {
      onProductClick(product.id, 'flash-sale');
    }
  };

  const getProgressPercentage = (sold, stock) => {
    return Math.min((sold / stock) * 100, 100);
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
            <p>Không thể tải sản phẩm: {error}</p>
            <button 
              className="retry-btn"
              onClick={() => window.location.reload()}
            >
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
              <span>
                {timeLeft ? (
                  <>
                    {String(timeLeft.hours).padStart(2, '0')}:
                    {String(timeLeft.minutes).padStart(2, '0')}:
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </>
                ) : (
                  '--:--:--'
                )}
              </span>
            </div>
          </div>
        </div>
        
        <div className="products-grid">
          {products.map(product => {
            const discountPercent = calculateDiscount(product.price, product.support);
            const hasImage =
              (product.images && Array.isArray(product.images) && product.images.length > 0 && typeof product.images[0] === 'string' && product.images[0]) ||
              (product.image && typeof product.image === 'string' && product.image);
            return (
              <div 
                key={product.id}
                className="product-card"
                onClick={() => handleProductClick(product)}
                style={{ cursor: 'pointer' }}
              >
                {discountPercent > 0 && (
                  <div className="discount-badge">-{discountPercent}%</div>
                )}
                <div className="product-image">
                  {hasImage ? (
                    <img 
                      src={(() => {
                        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
                          const firstImage = product.images[0];
                          if (typeof firstImage === 'string') {
                            return encodeURI(decodeURI(firstImage));
                          }
                          if (firstImage && typeof firstImage === 'object' && firstImage.url) {
                            return encodeURI(decodeURI(firstImage.url));
                          }
                        }
                        if (product.image && typeof product.image === 'string') {
                          return encodeURI(decodeURI(product.image));
                        }
                        return "";
                      })()}
                      alt={product.name || 'Sản phẩm'} 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : null}
                </div>
                
                <div className="product-info">
                  <h3 className="product-name">
                    {product.name}
                  </h3>
                  
                  {/* Giá bán sau giảm giá */}
                  <div className="sale-price">
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
                  
                  {/* Định lượng */}
                  {product.quantity && (
                    <div className="product-quantity">
                      Quy cách: {product.quantity}
                    </div>
                  )}
                  
                  {/* Trạng thái hàng hóa */}
                  <div className="stock-info">
                    <div className={`available-stock ${product.inStock === 0 || product.stock === 0 ? 'out-of-stock' : ''}`}>
                      {product.inStock === 0 || product.stock === 0 ? (
                        <span className="stock-status">❌ Hết hàng</span>
                      ) : (
                        <span className="stock-status">✅ Còn hàng</span>
                      )}
                    </div>
                  </div>
                  
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
                      disabled={product.inStock === 0 || product.stock === 0}
                    >
                      {(product.inStock === 0 || product.stock === 0) ? '❌ Hết hàng' : '🛒 Thêm vào giỏ'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {pagination && pagination.totalPages > 1 && (
          <PaginationControls pagination={pagination} />
        )}
      </div>
    </section>
  );
}