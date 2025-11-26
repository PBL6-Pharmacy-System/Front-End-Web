import { useState } from 'react'
import Header from './components/Header';
import Footer from "./components/Footer";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CatalogPage from "./pages/CatalogPage";
import BannerSlider from './components/BannerSlider';
import FlashSaleSection from './components/FlashSaleSection';
import ProductListing from './components/ProductListing';
import MedicalProductsTabs from './components/MedicalProductsTabs';
import ChatBox from './components/ChatBox';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [productSource, setProductSource] = useState('listing');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleProductClick = (productId, source = 'listing') => {
    console.log('🎯 Product clicked with ID:', productId, 'Source:', source);
    setSelectedProductId(productId);
    setProductSource(source);
    setCurrentPage('productDetail'); // Chuyển đến ProductDetailPage
  };

  const handleNavigate = (page, params = {}) => {
    console.log('🔄 Navigating to:', page, 'with params:', params);
    
    if (page === 'product-detail' || page === 'productDetail') {
      if (params.productId) {
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
    switch (currentPage) {
      case 'cart':
        return <CartPage onNavigate={handleNavigate} />;
      case 'checkout':
        return <CheckoutPage onNavigate={handleNavigate} />;
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
            <MedicalProductsTabs 
              onNavigate={setCurrentPage}
              onProductClick={handleProductClick}
            />
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
