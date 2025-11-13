import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectCartTotalQuantity } from '../store/cartSlice';
import { MENU_DATA } from '../constants/categories';
import LoginModal from './LoginModal';
import './Header.css';

export default function Header({ onNavigate, onCategoryClick }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const cartTotalQuantity = useSelector(selectCartTotalQuantity);
  
  // Thêm timeout để delay việc ẩn dropdown
  const [hideTimeout, setHideTimeout] = useState(null);

  const handleMouseEnter = (menuId) => {
    // Clear timeout nếu đang có
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }
    setActiveDropdown(menuId);
  };

  const handleMouseLeave = () => {
    // Delay 200ms trước khi ẩn dropdown
    const timeout = setTimeout(() => {
      setActiveDropdown(null);
      setHoveredCategory(null);
    }, 200);
    setHideTimeout(timeout);
  };

  const handleDropdownMouseEnter = () => {
    // Giữ dropdown hiển thị khi hover vào nó
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }
  };

  const handleDropdownMouseLeave = () => {
    // Ẩn ngay khi rời khỏi dropdown
    setActiveDropdown(null);
    setHoveredCategory(null);
  };

  const handleCategoryMouseEnter = (categoryKey) => {
    setHoveredCategory(categoryKey);
  };

  const handleCategoryMouseLeave = () => {
    setHoveredCategory(null);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
    }
  };

  const handleCartClick = () => {
    console.log('Cart button clicked!');
    onNavigate('cart');
  };

  const handleLogoClick = () => {
    onNavigate('home');
  };

  // Handle category clicks
  const handleMainCategoryClick = (categoryKey) => {
    const category = MENU_DATA[categoryKey];
    if (category && onCategoryClick) {
      onCategoryClick({
        key: categoryKey,
        name: category.title,
        type: 'main',
        data: category
      });
    }
    setActiveDropdown(null);
  };

  const handleSubcategoryClick = (mainKey, subKey, subData, type = 'category') => {
    const mainCategory = MENU_DATA[mainKey];
    if (mainCategory && onCategoryClick) {
      onCategoryClick({
        key: subKey,
        name: subData.title,
        type: type,
        parent: {
          key: mainKey,
          name: mainCategory.title
        },
        data: subData
      });
    }
    setActiveDropdown(null);
  };

  return (
    <header className="header-main">
      {/* Top Bar */}
      <div className="header-top-bar">
        <div className="header-container">
          <div className="header-top-bar-left">
            <span className="header-search-info">
              🔍 Trung tâm tiêm chủng Long Châu 
              <a href="#" className="header-highlight-link">Tìm hiểu ngay</a>
            </span>
          </div>
          <div className="header-top-bar-right">
            <span className="header-app-download">📱 Tải ứng dụng</span>
            <span className="header-hotline">📞 Tư vấn ngay: 1800 6928</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="header-main-header">
        <div className="header-container">
          <div className="header-logo" onClick={handleLogoClick} style={{cursor: 'pointer'}}>
            <div className="header-logo-icon">🏥</div>
            <div className="header-logo-text">
              <div className="header-logo-main">NHÀ THUỐC</div>
              <div className="header-logo-sub">LONG CHÂU</div>
            </div>
          </div>

          <div className="header-search-container">
            <form className="header-search-box" onSubmit={handleSearchSubmit}>
              <input 
                type="text" 
                className="header-search-input" 
                placeholder="Số Thuốc kê đơn bệnh viện"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="header-search-btn">🔍</button>
            </form>
          </div>

          <div className="header-actions">
            <button 
              className="header-btn header-login-btn"
              onClick={() => setIsLoginModalOpen(true)}
            >
              <span className="header-btn-icon">👤</span>
              <span>Đăng nhập</span>
            </button>

            <button className="header-btn header-cart-btn" onClick={handleCartClick}>
              <span className="header-btn-icon">🛒</span>
              <span>Giỏ hàng</span>
              {cartTotalQuantity > 0 && (
                <span className="cart-badge">{cartTotalQuantity}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation with Dropdowns - DI CHUYỂN LÊN TOP */}
      <nav className="header-main-nav">
        <div className="header-container">
          <ul className="header-main-nav-list">
            {Object.entries(MENU_DATA).map(([key, menuItem]) => (
              <li 
                key={key}
                className="header-main-nav-item"
                onMouseEnter={() => handleMouseEnter(key)}
                onMouseLeave={handleMouseLeave}
              >
                <a 
                  href="#" 
                  className="header-main-nav-link"
                  onClick={(e) => {
                    e.preventDefault();
                    handleMainCategoryClick(key);
                  }}
                >
                  {menuItem.title}
                  {(menuItem.categories || menuItem.featured) && (
                    <span className="header-dropdown-arrow">▼</span>
                  )}
                </a>
                
                {activeDropdown === key && (menuItem.categories || menuItem.featured) && (
                  <div 
                    className="header-dropdown-menu"
                    style={{ 
                      opacity: 1, 
                      visibility: 'visible',
                      transform: 'translateX(-50%) translateY(0)',
                      transitionDelay: '0s'
                    }}
                    onMouseEnter={handleDropdownMouseEnter}
                    onMouseLeave={handleDropdownMouseLeave}
                  >
                    <div className="header-dropdown-content">
                      {/* Categories Section */}
                      {menuItem.categories && (
                        <div className="header-dropdown-section">
                          <div className="header-category-list">
                            {menuItem.categories.map((category, index) => (
                              <div 
                                key={index} 
                                className="header-category-group"
                                onMouseEnter={() => handleCategoryMouseEnter(category.key)}
                                onMouseLeave={handleCategoryMouseLeave}
                              >
                                <a 
                                  href="#" 
                                  className="header-category-item header-category-parent"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleSubcategoryClick(key, category.key, category, 'category');
                                  }}
                                >
                                  <span className="header-category-icon">{category.icon}</span>
                                  <span>{category.title}</span>
                                  {category.subcategories && (
                                    <span className="header-subcategory-arrow">›</span>
                                  )}
                                </a>
                                
                                {/* Subcategories - chỉ hiển thị khi hover */}
                                {category.subcategories && hoveredCategory === category.key && (
                                  <div className="header-subcategory-list">
                                    {category.subcategories.map((subcategory, subIndex) => (
                                      <a 
                                        key={subIndex} 
                                        href="#" 
                                        className="header-subcategory-item"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          handleSubcategoryClick(key, subcategory.key, subcategory, 'subcategory');
                                        }}
                                      >
                                        <span className="header-subcategory-icon">{subcategory.icon}</span>
                                        <span>{subcategory.title}</span>
                                      </a>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Featured Section */}
                      {menuItem.featured && (
                        <div className="header-dropdown-section">
                          <div className="header-featured-grid">
                            {menuItem.featured.map((item, index) => (
                              <a 
                                key={index} 
                                href="#" 
                                className="header-featured-item"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleSubcategoryClick(key, item.key, item, 'featured');
                                }}
                              >
                                <span className="header-featured-icon">{item.icon}</span>
                                <span>{item.title}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Bestsellers Section */}
                      {menuItem.bestsellers && (
                        <div className="header-dropdown-section header-bestsellers">
                          <h4>Bán chạy nhất</h4>
                          <div className="header-bestseller-grid">
                            {menuItem.bestsellers.map((product, index) => (
                              <div key={index} className="header-bestseller-item">
                                {product.discount && (
                                  <div className="header-discount-badge">{product.discount}</div>
                                )}
                                <div className="header-product-image">{product.image}</div>
                                <div className="header-product-info">
                                  <p className="header-product-name">{product.name}</p>
                                  <p className="header-product-price">{product.price}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </li>
            ))}
            
            {/* Static menu items */}
            <li className="header-main-nav-item">
              <a href="#" className="header-main-nav-link">Tiêm chủng</a>
            </li>
            <li className="header-main-nav-item">
              <a href="#" className="header-main-nav-link">Hệ thống nhà thuốc</a>
            </li>
          </ul>
        </div>
      </nav>

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </header>
  );
}
