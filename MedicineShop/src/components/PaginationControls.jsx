import React from 'react';
import './PaginationControls.css';

const PaginationControls = ({ pagination }) => {
  // Check if pagination exists
  if (!pagination) return null;
  
  const {
    currentPage,
    totalPages,
    hasNext,
    hasPrevious,
    goToNextPage,
    goToPreviousPage,
    goToPage
  } = pagination;

  if (totalPages <= 1) return null;

  return (
    <div className="flash-sale-pagination-controls">
      <button 
        className="flash-sale-pagination-btn"
        onClick={goToPreviousPage}
        disabled={!hasPrevious}
        aria-label="Trang trước"
      >
        <span className="pagination-icon">‹</span>
        <span className="pagination-btn-text">Trước</span>
      </button>

      <div className="flash-sale-pagination-dots">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            className={`flash-sale-pagination-dot ${index === currentPage ? 'active' : ''}`}
            onClick={() => goToPage(index)}
            aria-label={`Trang ${index + 1}`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      <button 
        className="flash-sale-pagination-btn"
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

export default PaginationControls;