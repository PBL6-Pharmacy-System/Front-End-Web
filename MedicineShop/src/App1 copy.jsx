import { useState } from 'react'
import Header from './components/Header';
import Footer from "./components/Footer";
import LoginPage from "./pages/LoginPage";
import CartPage from "./pages/CartPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import BannerSlider from './components/BannerSlider';
import ServiceMenu from './components/ServiceMenu';
import FlashSaleSection from './components/FlashSaleSection';
import ProductListing from './components/ProductListing';
import MedicalProductsTabs from './components/MedicalProductsTabs';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState(null);

  const handleProductClick = (productId) => {
    console.log('Product clicked with ID:', productId);
    setSelectedProductId(productId);
    setCurrentPage('productDetail');
  };

  const renderPage = () => {
    switch(currentPage) {
      case 'login':
        return <LoginPage onNavigate={setCurrentPage} />;
      case 'cart':
        return <CartPage onNavigate={setCurrentPage} />;
      case 'productDetail':
        return (
          <ProductDetailPage 
            onNavigate={setCurrentPage} 
            productId={selectedProductId}
          />
        );
      default:
        return (
          <div className="home-page">
            <BannerSlider onNavigate={setCurrentPage} />
            <ServiceMenu onNavigate={setCurrentPage} />
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
      {currentPage !== 'login' && <Header onNavigate={setCurrentPage} />}
      <main className={currentPage === 'login' ? '' : 'main-content'}>
        {renderPage()}
      </main>
      {currentPage !== 'login' && <Footer onNavigate={setCurrentPage} />}
    </div>
  );
}
