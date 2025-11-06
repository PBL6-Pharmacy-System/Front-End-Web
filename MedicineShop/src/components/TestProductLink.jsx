import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProductsApi } from '../hooks/useProductsApi';
import './TestProductLink.css';

export default function TestProductLink() {
  const { 
    products, 
    loading, 
    error, 
    searchProducts, 
    filterByCategory, 
    refetch,
    totalProducts 
  } = useProductsApi();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Handle search
  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Reset category when searching
    if (query.trim() !== '' && selectedCategory) {
      setSelectedCategory('');
    }
    
    if (query.trim() === '') {
      refetch(); // Reload all products
    } else {
      await searchProducts(query);
    }
  };

  // Handle category filter
  const handleCategoryFilter = async (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    
    // Reset search when filtering
    if (category && searchQuery) {
      setSearchQuery('');
    }
    
    if (!category) {
      refetch(); // Show all products
    } else {
      await filterByCategory(category);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    setSearchQuery('');
    setSelectedCategory('');
    refetch();
  };

  // Loading state
  if (loading) {
    return (
      <div className="test-product-page">
        <div className="test-container">
          <div className="loading-state">
            <div className="spinner">⏳</div>
            <p>Đang tải sản phẩm từ API...</p>
            <div className="loading-dots">
              <span>.</span><span>.</span><span>.</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="test-product-page">
        <div className="test-container">
          <div className="error-state">
            <h2>❌ Lỗi tải dữ liệu từ API</h2>
            <p className="error-message">{error}</p>
            <div className="error-actions">
              <button onClick={refetch} className="retry-btn">
                🔄 Thử lại
              </button>
              <button onClick={() => window.location.reload()} className="reload-btn">
                ↻ Tải lại trang
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="test-product-page">
      <div className="test-container">
        <header className="page-header">
          <h1>🛍️ Cửa hàng thuốc trực tuyến</h1>
          <p className="subtitle">
            Hiện có <strong>{totalProducts} sản phẩm</strong> từ API
          </p>
        </header>
        
        {/* Controls Section */}
        <div className="controls-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Tìm kiếm sản phẩm, thương hiệu..."
              value={searchQuery}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
          
          <div className="filter-box">
            <select 
              value={selectedCategory} 
              onChange={handleCategoryFilter}
              className="category-select"
            >
              <option value="">🏷️ Tất cả danh mục</option>
              <option value="nutrition">🥛 Dinh dưỡng</option>
              <option value="skincare">🧴 Chăm sóc da</option>
              <option value="vitamins">💊 Vitamin</option>
              <option value="supplements">🌿 Thực phẩm chức năng</option>
            </select>
          </div>
          
          <button onClick={handleRefresh} className="refresh-btn">
            🔄 Làm mới
          </button>
        </div>
        
        {/* Products Grid */}
        <div className="test-product-grid">
          {products.map(product => (
            <Link 
              to={`/product/${product.id}`} 
              key={product.id}
              className="test-product-card"
            >
              <div className="test-product-image">
                <img 
                  src={product.image || 'https://via.placeholder.com/200x200'} 
                  alt={product.name}
                  loading="lazy"
                />
                <div className="test-discount-badge">-10%</div>
                {product.category && (
                  <div className="category-tag">
                    {product.category}
                  </div>
                )}
              </div>
              
              <div className="test-product-info">
                <h3 title={product.name}>{product.name}</h3>
                
                {product.brand && (
                  <p className="product-brand">🏢 {product.brand}</p>
                )}
                
                {product.description && (
                  <p className="product-description">
                    {product.description.length > 80 
                      ? product.description.substring(0, 80) + '...'
                      : product.description
                    }
                  </p>
                )}
                
                <div className="test-price-section">
                  <span className="test-current-price">
                    {product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="test-original-price">
                      {product.originalPrice}
                    </span>
                  )}
                </div>
                
                <button className="test-view-btn">
                  👁️ Xem chi tiết →
                </button>
              </div>
            </Link>
          ))}
        </div>
        
        {/* Empty State */}
        {products.length === 0 && (searchQuery || selectedCategory) && (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>Không tìm thấy sản phẩm</h3>
            <p>
              {searchQuery && `Không có kết quả cho "${searchQuery}"`}
              {selectedCategory && `Không có sản phẩm trong danh mục này`}
            </p>
            <button onClick={handleRefresh} className="back-to-all-btn">
              ← Xem tất cả sản phẩm
            </button>
          </div>
        )}
        
        {/* API Status */}
        <div className="api-status">
          <span className="status-indicator">🟢</span>
          <span>Kết nối API thành công</span>
        </div>
      </div>
    </div>
  );
}