import React, { useState, useMemo } from 'react';
import ProductCard from './ProductCard';
import { useCatalogProducts } from '../hooks/useCatalogProducts';
import { useAddToCart } from '../hooks/useAddToCart';
import { useToast } from './Toast';
import LoadingSpinner from './LoadingSpinner';
import { 
  FILTER_CONFIG, 
  INITIAL_FILTER_STATE, 
  INITIAL_EXPANDED_STATE,
  SORT_OPTIONS,
  VIEW_MODES,
  filterHelpers 
} from '../constants/filters';
import { normalizePrice, formatPrice } from '../utils/productHelpers';
import './CatalogProducts.css';

const CatalogProducts = ({ onNavigate, onProductClick, category, searchQuery = '' }) => {
  const [sortBy, setSortBy] = useState('bestselling');
  const [viewMode, setViewMode] = useState(VIEW_MODES.GRID);
  const [filters, setFilters] = useState(INITIAL_FILTER_STATE);
  const [expandedSections, setExpandedSections] = useState(INITIAL_EXPANDED_STATE);
  const [searchTerms, setSearchTerms] = useState({});
  const [displayCount, setDisplayCount] = useState(10); // Mặc định hiển thị 10 sản phẩm
  const { handleAddToCart } = useAddToCart();
  const toast = useToast();

  // Xử lý categoryKey từ nhiều dạng input
  const categoryKey = useMemo(() => {
    if (!category) return null;
    
    // Nếu là object có key
    if (typeof category === 'object' && category.key) {
      return category.key;
    }
    
    // Nếu là string
    if (typeof category === 'string') {
      return category;
    }
    
    return null;
  }, [category]);

  // Lấy categoryName để hiển thị
  const categoryName = useMemo(() => {
    if (!category) return 'Tất cả sản phẩm';
    
    if (typeof category === 'object' && category.title) {
      return category.title;
    }
    
    if (typeof category === 'object' && category.name) {
      return category.name;
    }
    
    if (typeof category === 'string') {
      return filterHelpers.getCategoryFromKey(category);
    }
    
    return 'Danh mục sản phẩm';
  }, [category]);

  // Load products với hook
  const { products: rawProducts, loading, error, pagination } = useCatalogProducts({
    categoryKey: categoryKey,
    searchQuery: searchQuery
  });

  // Debug log
  console.log('🎯 CatalogProducts State:', {
    categoryKey,
    categoryName,
    rawProductsLength: rawProducts?.length,
    loading,
    error
  });

  // Áp dụng filters và sorting - Kiểm tra rawProducts trước khi xử lý
  const filteredAndSortedProducts = useMemo(() => {
    // Kiểm tra rawProducts có hợp lệ không
    if (!rawProducts || !Array.isArray(rawProducts) || rawProducts.length === 0) {
      console.warn('⚠️ rawProducts is empty or invalid:', rawProducts);
      return [];
    }
    
    console.log('🔧 Applying filters and sorting to', rawProducts.length, 'products');
    
    let result = filterHelpers.applyFilters(rawProducts, filters);
    result = filterHelpers.sortProducts(result, sortBy);
    
    console.log('✅ After filters and sort:', result.length, 'products');
    return result;
  }, [rawProducts, filters, sortBy]);

  // Sản phẩm hiển thị (giới hạn theo displayCount)
  const displayedProducts = useMemo(() => {
    return filteredAndSortedProducts.slice(0, displayCount);
  }, [filteredAndSortedProducts, displayCount]);

  // Kiểm tra có còn sản phẩm để load thêm không
  const hasMoreProducts = displayCount < filteredAndSortedProducts.length;

  // Xử lý load more
  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 8); // Mỗi lần thêm 8 sản phẩm
  };

  // Reset displayCount khi thay đổi category hoặc filters
  useMemo(() => {
    setDisplayCount(10);
  }, [categoryKey, searchQuery, filters, sortBy]);

  // Xử lý thay đổi filter
  const handleFilterChange = (filterType, filterKey) => {
    const newFilters = filterHelpers.handleFilterChange(filters, filterType, filterKey);
    setFilters(newFilters);
  };

  // Xử lý price range filter
  const handlePriceRangeChange = (rangeKey) => {
    const newFilters = filterHelpers.handlePriceRangeFilter(filters, rangeKey);
    setFilters(newFilters);
  };

  // Toggle section
  const toggleSection = (section) => {
    setExpandedSections(filterHelpers.toggleSection(expandedSections, section));
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters(filterHelpers.resetAllFilters());
  };

  // Xử lý click sản phẩm
  const handleProductClick = (product) => {
    console.log('🔍 Product clicked:', product.id); // THÊM log để debug
    
    if (onProductClick) {
      onProductClick(product.id, 'catalog');
    }
    
    // ĐẢM BẢO gọi onNavigate với đúng tham số
    onNavigate('product-detail', { 
      productId: product.id, 
      productSource: 'catalog' 
    });
  };

  // Xử lý mua sản phẩm
  const handleBuyProduct = async (product, e) => {
    e.stopPropagation();
    console.log('🛒 [Catalog] Adding to cart:', product.name);
    
    const result = await handleAddToCart(product, 'catalog', 1);
    
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  // Get filtered options for searchable filters
  const getFilteredOptions = (filterType) => {
    const searchTerm = searchTerms[filterType] || '';
    const options = FILTER_CONFIG[filterType]?.options || [];
    return filterHelpers.searchFilterOptions(options, searchTerm);
  };

  // Render filter section
  const renderFilterSection = (filterType) => {
    const config = FILTER_CONFIG[filterType];
    if (!config) return null;

    const isExpanded = expandedSections[filterType];
    const isPriceRange = config.type === 'price';

    return (
      <div key={filterType} className="filter-section">
        <div 
          className="filter-section-header"
          onClick={() => toggleSection(filterType)}
        >
          <h4 className="filter-subtitle">{config.title}</h4>
          <span className="filter-toggle">{isExpanded ? '▲' : '▼'}</span>
        </div>

        {isExpanded && (
          <div className="filter-section-content">
            {/* Search box for searchable filters */}
            {config.hasSearch && (
              <input
                type="text"
                className="filter-search"
                placeholder="Tìm kiếm..."
                value={searchTerms[filterType] || ''}
                onChange={(e) => setSearchTerms({
                  ...searchTerms,
                  [filterType]: e.target.value
                })}
              />
            )}

            {/* Price Range Buttons */}
            {isPriceRange ? (
              <div className="price-options">
                {config.options.map(option => (
                  <button
                    key={option.key}
                    className={`price-option ${filters.priceRange[option.key] ? 'active' : ''}`}
                    onClick={() => handlePriceRangeChange(option.key)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : (
              /* Regular Checkboxes */
              <div className="filter-options">
                {getFilteredOptions(filterType).map(option => (
                  <label key={option.key} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={filters[filterType][option.key] || false}
                      onChange={() => handleFilterChange(filterType, option.key)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="catalog-loading">
        <LoadingSpinner />
        <p>Đang tải sản phẩm...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="catalog-error">
        <p>❌ Lỗi: {error}</p>
        <button onClick={() => window.location.reload()}>Thử lại</button>
      </div>
    );
  }

  const activeFilterCount = filterHelpers.getActiveFilterCount(filters);

  return (
    <div className="catalog-container">
      {/* Sidebar Filters */}
      <aside className="catalog-sidebar">
        {/* Filter Header */}
        <div className="filter-section filter-header">
          <h3 className="filter-title">
            <span>🎯</span> Bộ lọc nâng cao
            {activeFilterCount > 0 && (
              <span className="filter-badge">{activeFilterCount}</span>
            )}
          </h3>
          {activeFilterCount > 0 && (
            <button 
              className="btn-reset-filters"
              onClick={handleResetFilters}
            >
              Xóa bộ lọc
            </button>
          )}
        </div>

        {/* Dynamic Filter Sections */}
        {Object.keys(FILTER_CONFIG).map(filterType => 
          renderFilterSection(filterType)
        )}
      </aside>

      {/* Main Content */}
      <main className="catalog-main">
        {/* Header */}
        <div className="catalog-header">
          <div className="catalog-info">
            <h2>{categoryName}</h2>
            <p>
              {searchQuery && `Kết quả tìm kiếm: "${searchQuery}" - `}
              Hiển thị {displayCount} / {filteredAndSortedProducts.length} sản phẩm
              {pagination?.total && ` (Tổng: ${pagination.total})`}
            </p>
          </div>
          
          <div className="catalog-controls">
            <div className="sort-controls">
              <label>Sắp xếp theo:</label>
              {SORT_OPTIONS.map(option => (
                <button
                  key={option.key}
                  className={sortBy === option.key ? 'active' : ''}
                  onClick={() => setSortBy(option.key)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            
            <div className="view-controls">
              <button 
                className={viewMode === VIEW_MODES.GRID ? 'active' : ''}
                onClick={() => setViewMode(VIEW_MODES.GRID)}
              >
                <span>⊞</span>
              </button>
              <button 
                className={viewMode === VIEW_MODES.LIST ? 'active' : ''}
                onClick={() => setViewMode(VIEW_MODES.LIST)}
              >
                <span>☰</span>
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className={`products-grid ${viewMode === VIEW_MODES.LIST ? 'list-view' : ''}`}>
          {displayedProducts.length > 0 ? (
            displayedProducts.map((product) => {
              // Sử dụng normalizePrice để chuẩn hóa giá
              const currentPriceRaw = product.support || product.price;
              const currentPrice = normalizePrice(currentPriceRaw);
              
              const originalPriceRaw = product.price && product.support && product.price !== product.support ? product.price : null;
              const originalPrice = originalPriceRaw ? normalizePrice(originalPriceRaw) : null;
              
              const discountPercent = originalPrice && currentPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;
              
              return (
                <div 
                  key={product.id} 
                  className="catalog-product-card"
                >
                  {discountPercent > 0 && (
                    <div className="discount-badge">-{discountPercent}%</div>
                  )}
                  
                  <div 
                    className="product-image"
                    onClick={() => handleProductClick(product)}
                    style={{ cursor: 'pointer' }}
                  >
                    <img 
                      src={(() => {
                        // Priority: images[0] → image_url → image → imageUrl → thumbnail → placeholder
                        if (Array.isArray(product.images) && product.images.length > 0) {
                          console.log('🖼️ CatalogProducts using images[0]:', product.images[0]);
                          return product.images[0];
                        }
                        if (product.image_url) {
                          console.log('🖼️ CatalogProducts using image_url:', product.image_url);
                          return product.image_url;
                        }
                        if (product.image) {
                          console.log('🖼️ CatalogProducts using image:', product.image);
                          return product.image;
                        }
                        if (product.imageUrl) {
                          console.log('🖼️ CatalogProducts using imageUrl:', product.imageUrl);
                          return product.imageUrl;
                        }
                        if (product.thumbnail) {
                          console.log('🖼️ CatalogProducts using thumbnail:', product.thumbnail);
                          return product.thumbnail;
                        }
                        console.log('⚠️ CatalogProducts: No image found, using placeholder');
                        return "/api/placeholder/150/150";
                      })()} 
                      alt={product.name || 'Sản phẩm'} 
                    />
                  </div>
                  
                  <div className="product-info">
                    <h3 
                      className="product-name"
                      onClick={() => handleProductClick(product)}
                      style={{ cursor: 'pointer' }}
                    >
                      {product.name}
                    </h3>
                    
                    {/* Giá bán sau giảm giá */}
                    <div className="current-price">
                      {formatPrice(currentPrice)}đ
                      <span className="price-unit"> / {product.quantity || product.unit || 'Hộp'}</span>
                    </div>
                    
                    {/* Giá gốc */}
                    {originalPrice && originalPrice > currentPrice && (
                      <div className="original-price">
                        Giá gốc: {formatPrice(originalPrice)}đ
                      </div>
                    )}
                    
                    {/* Phần trăm giảm giá */}
                    {discountPercent > 0 && (
                      <div className="discount-info">
                        Tiết kiệm: {discountPercent}% ({formatPrice(originalPrice - currentPrice)}đ)
                      </div>
                    )}
                    
                    
                    {/* Rating nếu có */}
                    {product.rating && (
                      <div className="product-rating">
                        <span className="stars">{'★'.repeat(Math.floor(product.rating))}{'☆'.repeat(5 - Math.floor(product.rating))}</span>
                        <span className="rating-text">({product.rating}/5)</span>
                      </div>
                    )}
                    
                    {/* Stock info - Chỉ hiển thị nếu có thông tin stock */}
                    <div className="stock-info">
                      {product.stock !== undefined && product.stock !== null ? (
                        <div className={`available-stock ${product.stock === 0 ? 'out-of-stock' : product.stock < 10 ? 'low-stock' : ''}`}>
                          {product.stock === 0 ? (
                            <span className="stock-status">❌ Hết hàng</span>
                          ) : product.stock < 10 ? (
                            <>
                              ⚠️ Còn lại: <span className="stock-number warning">{product.stock}</span> sản phẩm
                            </>
                          ) : (
                            <>
                              ✅ Còn lại: <span className="stock-number">{product.stock}</span> sản phẩm
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="available-stock">
                          <span className="stock-status">📦 Liên hệ để biết tồn kho</span>
                        </div>
                      )}
                    </div>
                    
                    {/* 2 buttons */}
                    <div className="product-actions">
                      <button 
                        className="view-detail-btn"
                        onClick={() => handleProductClick(product)}
                      >
                        👁 Xem chi tiết
                      </button>
                      <button 
                        className="add-to-cart-btn"
                        onClick={(e) => handleBuyProduct(product, e)}
                      >
                        🛒 Thêm vào giỏ
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-products">
              <p>😔 Không tìm thấy sản phẩm nào</p>
              {activeFilterCount > 0 && (
                <button 
                  className="btn-reset-filters"
                  onClick={handleResetFilters}
                >
                  Xóa bộ lọc và thử lại
                </button>
              )}
            </div>
          )}
        </div>

        {/* Load More Button */}
        {hasMoreProducts && (
          <div className="load-more-container">
            <button 
              className="load-more-btn"
              onClick={handleLoadMore}
            >
              <span className="load-more-icon">⬇️</span>
              <span className="load-more-text">
                Xem thêm {Math.min(8, filteredAndSortedProducts.length - displayCount)} sản phẩm
              </span>
              <span className="load-more-count">
                (Đang hiển thị {displayCount}/{filteredAndSortedProducts.length})
              </span>
            </button>
          </div>
        )}

        {/* Pagination nếu có */}
        {pagination && pagination.totalPages > 1 && (
          <div className="catalog-pagination">
            {/* Pagination controls */}
          </div>
        )}
      </main>
    </div>
  );
};

export default CatalogProducts;