import React, { useState, useEffect } from 'react';
import './FlashSaleSection.css';
import { useFlashSaleProducts } from '../hooks/useFlashSaleProducts';
import { useAddToCart } from '../hooks/useAddToCart';
import ProductCard from './ProductCard';
import PaginationControls from './PaginationControls';

export default function FlashSaleSection({ onNavigate, onProductClick }) {
  const { products, loading, error, pagination } = useFlashSaleProducts(6);
  const { handleAddToCart } = useAddToCart();

  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 58,
    seconds: 34
  });

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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
            <span>Kết thúc trong: </span>
            <div className="timer">
              <span>
                {String(timeLeft.hours).padStart(2, '0')}:
                {String(timeLeft.minutes).padStart(2, '0')}:
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
        
        <div className="products-grid">
          {products.map(product => {
            const discountPercent = calculateDiscount(product.price, product.support);
            
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
                  <img 
                    src={(() => {
                      // Handle images array
                      if (product.images && Array.isArray(product.images) && product.images.length > 0) {
                        const firstImage = product.images[0];
                        // Normalize URL encoding
                        if (typeof firstImage === 'string') {
                          return encodeURI(decodeURI(firstImage));
                        }
                        if (firstImage && typeof firstImage === 'object' && firstImage.url) {
                          return encodeURI(decodeURI(firstImage.url));
                        }
                      }
                      // Fallback to single image field
                      if (product.image && typeof product.image === 'string') {
                        return encodeURI(decodeURI(product.image));
                      }
                      // Default placeholder
                      return "/api/placeholder/150/150";
                    })()}
                    alt={product.name || 'Sản phẩm'} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/api/placeholder/150/150";
                    }}
                  />
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
                  
                  {/* Số sản phẩm mở bán - Hiển thị chính xác */}
                  <div className="stock-info">
                    {product.stock !== undefined && product.stock !== null ? (
                      <div className={`available-stock ${product.stock === 0 ? 'out-of-stock' : product.stock < 10 ? 'low-stock' : ''}`}>
                        {product.stock === 0 ? (
                          <span className="stock-status">❌ Hết hàng</span>
                        ) : product.stock < 20 ? (
                          <>
                            ⚡ Chỉ còn: <span className="stock-number warning">{product.stock}</span> sản phẩm
                          </>
                        ) : (
                          <>
                            ✅ Còn lại: <span className="stock-number">{product.stock}</span> sản phẩm
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="available-stock">
                        <span className="stock-status">🔥 Flash Sale - Số lượng có hạn</span>
                      </div>
                    )}
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
                    >
                      🛒 Thêm vào giỏ
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