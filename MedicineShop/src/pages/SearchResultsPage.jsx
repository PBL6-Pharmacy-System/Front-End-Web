import { useState, useEffect } from 'react';
import { searchProducts } from '../services/searchApi';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import PaginationControls from '../components/PaginationControls';
import './SearchResultsPage.css';

export default function SearchResultsPage({ searchKeyword, onNavigate, onProductClick }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const limit = 12;

  useEffect(() => {
    if (searchKeyword) {
      fetchSearchResults(currentPage);
    }
  }, [searchKeyword, currentPage]);

  const fetchSearchResults = async (page) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await searchProducts(searchKeyword, page, limit);
      
      if (result.success) {
        setProducts(result.data.products || []);
        setTotalPages(result.data.pagination?.totalPages || 1);
        setTotalRecords(result.data.pagination?.totalRecords || 0);
      } else {
        setError(result.error || 'Không thể tìm kiếm sản phẩm');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Đã xảy ra lỗi khi tìm kiếm sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="search-results-page">
        <div className="search-loading">
          <LoadingSpinner />
          <p>Đang tìm kiếm...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="search-results-page">
        <div className="search-error">
          <p className="error-message">{error}</p>
          <button onClick={() => onNavigate('home')} className="back-home-btn">
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="search-results-page">
      {/* Breadcrumb */}
      <div className="search-breadcrumb">
        <span onClick={() => onNavigate('home')} className="breadcrumb-link">
          Trang chủ
        </span>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-current">Kết quả tìm kiếm</span>
      </div>

      <div className="search-header">
        <h1>Kết quả tìm kiếm</h1>
        <p className="search-query">
          Từ khóa: <strong>"{searchKeyword}"</strong>
        </p>
        <p className="search-count">
          Tìm thấy <strong>{totalRecords}</strong> sản phẩm
        </p>
      </div>

      {products.length === 0 ? (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <h2>Không tìm thấy sản phẩm nào</h2>
          <p>Vui lòng thử lại với từ khóa khác hoặc kiểm tra lỗi chính tả</p>
          <button onClick={() => onNavigate('home')} className="back-home-btn">
            Quay về trang chủ
          </button>
        </div>
      ) : (
        <>
          <div className="search-results-grid">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={onProductClick}
                source="search"
                showAddToCart={true}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
}
