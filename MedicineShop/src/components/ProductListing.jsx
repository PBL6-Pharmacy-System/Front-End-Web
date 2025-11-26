import React from 'react';
import { useListingProducts } from '../hooks/useListingProducts';
import { useAddToCart } from '../hooks/useAddToCart';
import ProductListingPagination from './ProductListingPagination';
import './ProductListingPagination.css';

export default function ProductListing({ onNavigate, onProductClick }) {
  const { products, loading, error, pagination } = useListingProducts(6);
  const { handleAddToCart } = useAddToCart();

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
    console.log(`🛒 [Listing] Adding to cart:`, product.name);
    
    const result = await handleAddToCart(product, 'listing', 1);
    
    if (result.success) {
      alert(`✅ ${result.message}`);
    } else {
      alert(`❌ ${result.message}`);
    }
  };

  const handleProductClick = (product) => {
    if (onProductClick) {
      // Use API-backed listing source so ProductDetailPage fetches from backend
      onProductClick(product.id || product.product_id || product.productId, 'listing-api');
    }
  };

  if (loading) {
    return (
      <section className="product-listing">
        <div className="container">
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
      <section className="product-listing">
        <div className="container">
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
    <section className="product-listing">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">
            <span>Sản phẩm nổi bật</span>
          </h2>
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
                  
                  {/* Số sản phẩm mở bán */}
                  {/* <div className="stock-info">
                    <div className="available-stock">
                      Còn lại: <span className="stock-number">{product.stock || 150}</span> sản phẩm
                    </div>
                    <div className="total-stock">
                      Tổng cộng: <span className="total-number">{product.totalStock || 300}</span> sản phẩm
                    </div>
                  </div> */}
                  
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
        
        <ProductListingPagination pagination={pagination} />
      </div>
    </section>
  );
}