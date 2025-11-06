import React from 'react';
import './ProductListingPagination.css';

const ProductListingPagination = ({ pagination }) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  const {
    currentPage,
    totalPages,
    hasNext,
    hasPrevious,
    goToNextPage,
    goToPreviousPage,
    goToPage
  } = pagination;

  return (
    <div className="product-listing-pagination-controls">
      <button 
        className="product-listing-pagination-btn"
        onClick={goToPreviousPage}
        disabled={!hasPrevious}
        aria-label="Trang trước"
      >
        <span className="pagination-icon">‹</span>
        <span className="pagination-btn-text">Trước</span>
      </button>

      <div className="product-listing-pagination-dots">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            className={`product-listing-pagination-dot ${index === currentPage ? 'active' : ''}`}
            onClick={() => goToPage(index)}
            aria-label={`Trang ${index + 1}`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      <button 
        className="product-listing-pagination-btn"
        onClick={goToNextPage}
        disabled={!hasNext}
        aria-label="Trang tiếp theo"
      >
        <span className="pagination-btn-text">Tiếp</span>
        <span className="pagination-icon">›</span>
      </button>
    </div>
  );
};

export default ProductListingPagination;