import { useState, useEffect } from 'react';
import { getFlashSaleProducts } from '../services/flashSaleApi';

export const useFlashSaleProducts = (itemsPerPage = 6) => {
  const [allProducts, setAllProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let didFetch = false;
    const fetchProducts = async () => {
      if (didFetch) return;
      didFetch = true;
      try {
        setLoading(true);
        setError(null);
        console.log('🔄 Fetching flash sale products from API...');
        const response = await getFlashSaleProducts();
        if (response.success) {
          console.log('✅ Flash sale products loaded:', response.data.length);
          setAllProducts(response.data);
        } else {
          console.error('❌ Failed to load flash sale products:', response.error);
          setError(response.error);
          setAllProducts([]);
        }
      } catch (err) {
        console.error('❌ Unexpected error:', err);
        setError('Không thể tải sản phẩm flash sale');
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate pagination data
  const totalPages = Math.ceil(allProducts.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = allProducts.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageIndex) => {
    if (pageIndex >= 0 && pageIndex < totalPages) {
      setCurrentPage(pageIndex);
    }
  };

  return {
    products: currentProducts,
    loading,
    error,
    pagination: {
      currentPage,
      totalPages,
      totalProducts: allProducts.length,
      hasNext: currentPage < totalPages - 1,
      hasPrevious: currentPage > 0,
      goToNextPage,
      goToPreviousPage,
      goToPage
    }
  };
};