import React, { useState } from 'react';
import { useMedicalProducts, useMedicalCategories } from '../hooks/useMedicalProducts';
import { useAddToCart } from '../hooks/useAddToCart';
import { useToast } from './Toast';
import './MedicalProductsTabs.css';

const MedicalProductsTabs = ({ onNavigate, onProductClick }) => {
  const [activeTab, setActiveTab] = useState('vitaminTab'); // Đổi sang tab có dữ liệu
  const toast = useToast();
  
  // Sử dụng hooks thay vì hardcoded data
  const { categories } = useMedicalCategories();
  const { 
    categoryData, 
    products, 
    loading, 
    error, 
    pagination 
  } = useMedicalProducts(activeTab, 4); // 4 sản phẩm mỗi trang
  const { handleAddToCart } = useAddToCart();

  const formatPrice = (price) => {
    if (!price) return '0';
    const numPrice = typeof price === 'string' ? parseInt(price.replace(/[^\d]/g, '')) : price;
    return new Intl.NumberFormat('vi-VN').format(numPrice);
  };

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
  };

  const handleProductClick = (product) => {
    console.log('Medical product clicked:', product);
    if (onProductClick) {
      onProductClick(product.id, 'medical'); // THÊM source: 'medical'
    }
  };

  const handleBuyProduct = async (product, event) => {
    // Ngăn event bubbling để không trigger handleProductClick
    event.stopPropagation();
    
    console.log(`[Medical] Adding to cart:`, product.name);
    
    // Kiểm tra stock trước
    if (product.in_stock === false) {
      toast.error(`Sản phẩm "${product.name}" hiện đang hết hàng!`);
      return;
    }
    
    const result = await handleAddToCart(product, 'medical', 1);
    
    if (result.success) {
      toast.success(`${result.message}\nGiá: ${formatPrice(product.support || product.price)}đ`);
    } else {
      toast.error(result.message);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="medical-tabs-container">
        <div className="medical-tabs-header">
          <div className="medical-tabs-header-icon">
            <h2 className="medical-tabs-title">Sản phẩm y tế</h2>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="medical-tabs-container">
        <div className="medical-tabs-header">
          <div className="medical-tabs-header-icon">
            <h2 className="medical-tabs-title">Sản phẩm y tế</h2>
          </div>
        </div>
        <div className="medical-tabs-error">
          <p>Lỗi: {error}</p>
          <button onClick={() => window.location.reload()}>Thử lại</button>
        </div>
      </div>
    );
  }

  // Tab configuration - sử dụng các tab có dữ liệu trong medicalProducts.json
  const tabs = [
    { key: 'vitaminTab', label: 'Vitamin' },
    { key: 'functionalFoodTab', label: 'Thực phẩm chức năng' },
    { key: 'supplementTab', label: 'Thực phẩm bổ sung' },
    { key: 'beautyTab', label: 'Mỹ phẩm' },
    { key: 'equipmentTab', label: 'Thiết bị y tế' }
  ];

  return (
    <div className="medical-tabs-container">
      <div className="medical-tabs-header">
        <div className="medical-tabs-header-icon">
          <h2 className="medical-tabs-title">Sản phẩm y tế</h2>
        </div>
        
        <div className="medical-tabs-nav-container">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`medical-tabs-nav-button ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="medical-tabs-content-section">
        <div className="medical-tabs-info-panel">
          <h3 className="medical-tabs-info-title">
            Sản phẩm y tế <span className="medical-tabs-highlight">chất lượng cao</span> từ các thương hiệu uy tín.
          </h3>
          <p className="medical-tabs-description">
            Chúng tôi cung cấp đầy đủ các sản phẩm y tế, từ vitamin, thực phẩm chức năng đến thiết bị y tế chuyên dụng.
          </p>
          <div className="medical-tabs-mascot-section">
            <button className="medical-tabs-solution-btn">
              Khám phá ngay
            </button>
          </div>
        </div>

        <div className="medical-tabs-right-section">
          {/* Pagination info */}
          {pagination && (
            <div className="medical-tabs-info">
              Hiển thị {pagination.startIndex} - {pagination.endIndex} trong tổng số {pagination.totalProducts} sản phẩm
            </div>
          )}

          {/* Products Grid */}
          <div className="medical-tabs-products-grid">
            {products && products.length > 0 ? products.map((product) => (
              <div 
                key={product.id} 
                className={`medical-tabs-product-card ${!product.inStock ? 'out-of-stock' : ''}`}
                onClick={() => handleProductClick(product)}
                style={{ cursor: 'pointer' }}
              >
                {product.discount && (
                  <div className="medical-tabs-discount-badge">{product.discount}</div>
                )}
                {product.in_stock === false && (
                  <div className="medical-tabs-stock-badge">Hết hàng</div>
                )}
                
                <div className="medical-tabs-product-image">
                  <img 
                    src={product.image || "https://via.placeholder.com/150x150/f5f5f5/ccc?text=No+Image"} 
                    alt={product.name}
                    style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                  />
                </div>
                
                <div className="medical-tabs-product-info">
                  <h4 className="medical-tabs-product-name">{product.name}</h4>
                  <p className="medical-tabs-product-description">
                    {product.description && product.description.length > 50 
                      ? product.description.substring(0, 50) + '...' 
                      : product.description}
                  </p>
                  <div className="medical-tabs-price-section">
                    <span className="medical-tabs-current-price">
                      {formatPrice(product.support || product.price)}đ
                    </span>
                    {product.price && product.support && product.price !== product.support && (
                      <span className="medical-tabs-original-price">
                        {formatPrice(product.price)}đ
                      </span>
                    )}
                    <span className="medical-tabs-unit">/ {product.quantity}</span>
                  </div>
                  <button 
                    className={`medical-tabs-buy-button ${product.in_stock !== false ? 'available' : 'out-of-stock'}`}
                    onClick={(e) => handleBuyProduct(product, e)}
                    disabled={product.in_stock === false}
                    style={product.in_stock === false ? {
                      backgroundColor: '#ccc',
                      color: '#666',
                      cursor: 'not-allowed',
                      opacity: 0.6
                    } : {}}
                  >
                    {product.in_stock === false ? 'Hết hàng' : 'Chọn mua'}
                  </button>
                </div>
              </div>
            )) : (
              <div className="medical-tabs-no-products">
                <p>Không có sản phẩm trong danh mục này</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="medical-tabs-pagination">
              <button
                className={`medical-tabs-page-button ${!pagination.hasPrevious ? 'disabled' : ''}`}
                onClick={pagination.goToPreviousPage}
                disabled={!pagination.hasPrevious}
              >
                ← Trước
              </button>
              
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(pageNum => (
                <button
                  key={pageNum}
                  className={`medical-tabs-page-button ${pagination.currentPage === pageNum ? 'active' : ''}`}
                  onClick={() => pagination.goToPage(pageNum)}
                >
                  {pageNum}
                </button>
              ))}
              
              <button
                className={`medical-tabs-page-button ${!pagination.hasNext ? 'disabled' : ''}`}
                onClick={pagination.goToNextPage}
                disabled={!pagination.hasNext}
              >
                Sau →
              </button>
              
              <div className="medical-tabs-page-info">
                Trang {pagination.currentPage} / {pagination.totalPages} ({pagination.totalProducts} sản phẩm)
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalProductsTabs;