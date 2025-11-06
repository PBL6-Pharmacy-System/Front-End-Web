import { useState, useEffect } from 'react';
import { MockApiService } from '../services/productApi';

export const useListingProducts = (itemsPerPage = 6) => { // Đổi từ 8 thành 6
  const [allProducts, setAllProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await MockApiService.getListingProducts();
        
        if (response.success) {
          setAllProducts(response.data);
        } else {
          setError(response.error);
          setAllProducts([]);
        }
      } catch (err) {
        setError('Unexpected error occurred');
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Calculate pagination data
  const totalPages = Math.ceil(allProducts.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = allProducts.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
      // Scroll to top khi chuyển trang
      window.scrollTo({
        top: document.querySelector('.product-listing')?.offsetTop - 100 || 0,
        behavior: 'smooth'
      });
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      // Scroll to top khi chuyển trang
      window.scrollTo({
        top: document.querySelector('.product-listing')?.offsetTop - 100 || 0,
        behavior: 'smooth'
      });
    }
  };

  const goToPage = (pageIndex) => {
    if (pageIndex >= 0 && pageIndex < totalPages) {
      setCurrentPage(pageIndex);
      // Scroll to top khi chuyển trang
      window.scrollTo({
        top: document.querySelector('.product-listing')?.offsetTop - 100 || 0,
        behavior: 'smooth'
      });
    }
  };

  return {
    products: currentProducts,
    loading,
    error,
    pagination: totalPages > 1 ? {
      currentPage,
      totalPages,
      totalProducts: allProducts.length,
      hasNext: currentPage < totalPages - 1,
      hasPrevious: currentPage > 0,
      goToNextPage,
      goToPreviousPage,
      goToPage,
      // Thêm thông tin để debug
      startIndex: startIndex + 1,
      endIndex: Math.min(endIndex, allProducts.length)
    } : null
  };
};