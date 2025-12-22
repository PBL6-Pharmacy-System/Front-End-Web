import { useState, useEffect } from 'react'
import Header from './components/Header';
import Footer from "./components/Footer";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import UserProfilePage from "./pages/UserProfilePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CatalogPage from "./pages/CatalogPage";
import BannerSlider from './components/BannerSlider';
import FlashSaleSection from './components/FlashSaleSection';
import ProductListing from './components/ProductListing';
import ChatBox from './components/ChatBox';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [productSource, setProductSource] = useState('listing');
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Lắng nghe event từ ChatProductCard
  useEffect(() => {
    console.log('🎧 Event listener registered');
    
    const handleNavigateToProduct = (event) => {
      console.log('🛍️ Navigate to product from chatbot:', event.detail);
      const { productId, productSource: source } = event.detail;
      console.log('🔄 Setting states directly in event handler');
      
      // Set states trực tiếp thay vì gọi qua function
      setSelectedProductId(productId);
      setProductSource(source || 'chatbot');
      setCurrentPage('productDetail');
      
      console.log('✅ States updated:', { productId, source, page: 'productDetail' });
    };

    window.addEventListener('navigateToProduct', handleNavigateToProduct);

    return () => {
      window.removeEventListener('navigateToProduct', handleNavigateToProduct);
    };
  }, []); // Empty deps - sử dụng setState trực tiếp

  const handleProductClick = (productId, source = 'listing') => {
    console.log('🎯 Product clicked with ID:', productId, 'Source:', source);
    console.log('📍 Current page before:', currentPage);
    setSelectedProductId(productId);
    setProductSource(source);
    setCurrentPage('productDetail');
    console.log('📍 Set current page to: productDetail');
  };

  const handleNavigate = (page, params = {}) => {
    console.log('🔄 Navigating to:', page, 'with params:', params);
    
    // Handle product navigation - support both formats
    if (page === 'product' || page === 'product-detail' || page === 'productDetail') {
      // If params is a number/string (productId passed directly)
      if (typeof params === 'number' || typeof params === 'string') {
        setSelectedProductId(params);
        setProductSource('order-history');
      } else if (params.productId) {
        // If params is an object with productId
        setSelectedProductId(params.productId);
        setProductSource(params.productSource || 'listing');
      }
      setCurrentPage('productDetail');
    } else {
      setCurrentPage(page);
    }
  };

  const handleCategoryClick = (category) => {
    console.log('Category clicked:', category);
    setSelectedCategory(category);
    setCurrentPage('catalog');
  };

  const renderPage = () => {
    console.log('🎬 Rendering page:', currentPage, 'productId:', selectedProductId);
    
    switch (currentPage) {
      case 'cart':
        return <CartPage onNavigate={handleNavigate} />;
      case 'checkout':
        return <CheckoutPage onNavigate={handleNavigate} />;
      case 'orders':
      case 'account':
        return <UserProfilePage onNavigate={handleNavigate} />;
      case 'catalog':
        return (
          <CatalogPage 
            onNavigate={handleNavigate}
            onProductClick={handleProductClick} // QUAN TRỌNG: Truyền handleProductClick
            category={selectedCategory}
          />
        );
      case 'productDetail':
        return (
          <ProductDetailPage 
            onNavigate={handleNavigate}
            productId={selectedProductId}
            productSource={productSource} // Truyền source để load đúng data
          />
        );
      default:
        return (
          <div className="home-page">
            <BannerSlider onNavigate={setCurrentPage} />
            <FlashSaleSection 
              onNavigate={setCurrentPage}
              onProductClick={handleProductClick}
            />
            <ProductListing 
              onNavigate={setCurrentPage}
              onProductClick={handleProductClick}
            />
            {/* <MedicalProductsTabs 
              onNavigate={setCurrentPage}
              onProductClick={handleProductClick}
            /> */}
          </div>
        );
    }
  };

  return (
    <div className="app">
      {currentPage !== 'login' && (
        <Header 
          onNavigate={setCurrentPage} 
          onCategoryClick={handleCategoryClick}
        />
      )}
      <main className={currentPage === 'login' ? '' : 'main-content'}>
        {renderPage()}
      </main>
      {currentPage !== 'login' && currentPage !== 'checkout' && <Footer onNavigate={setCurrentPage} />}
      
      {/* ChatBox - hiển thị trên mọi trang */}
      <ChatBox />
    </div>
  );
}
