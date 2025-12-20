import { useState, useEffect } from 'react';
import { API_CONFIG } from '../config/api';
import { transformProductsFromAPI } from '../utils/productTransformer';

const API_BASE_URL = API_CONFIG.BASE_URL;

export const useListingProducts = (itemsPerPage = 6) => {
  const [allProducts, setAllProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔄 Fetching best-sellers from API...');
        const res = await fetch(`${API_BASE_URL}/products/best-sellers`, { 
          method: 'GET', 
          headers: { 'Content-Type': 'application/json' } 
        });
        
        if (!res.ok) {
          throw new Error(`API returned status ${res.status}`);
        }

        const payload = await res.json();
      
        // Support multiple response shapes
        let items = [];
        if (payload) {
          if (payload.success && Array.isArray(payload.data)) {
            items = payload.data;
          } else if (Array.isArray(payload.data)) {
            items = payload.data;
          } else if (Array.isArray(payload)) {
            items = payload;
          } else if (Array.isArray(payload.products)) {
            items = payload.products;
          }
        }
        
        // Transform products to ensure all have base_unit_id
        const transformedProducts = transformProductsFromAPI(items);
        console.log('📦 Transformed products:', transformedProducts.length);
        
        setAllProducts(transformedProducts);
      } catch (err) {
        console.error('❌ Failed to fetch products:', err);
        setError(err.message || 'Failed to load products');
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