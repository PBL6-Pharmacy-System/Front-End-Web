import { useState, useEffect } from 'react';
import { API_CONFIG } from '../config/api';
import { transformProductFromAPI } from '../utils/productTransformer';

const API_BASE_URL = API_CONFIG.BASE_URL;

export const useFlashSaleProducts = (itemsPerPage = 6) => {
  const [allProducts, setAllProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE_URL}/flashsales/active`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!res.ok) {
          throw new Error(`API returned status ${res.status}`);
        }

        const payload = await res.json();

        // Extract products from flashsale response
        let products = [];
        if (payload && payload.success && payload.data) {
          const flashsale = payload.data;
          const items = flashsale.flashsale_products || [];
                    
          items.forEach(item => {
            const product = item.products || item.product;
            if (product && product.id) {
              // Add flash sale specific fields
              products.push({
                ...product,
                flashSaleId: flashsale.id,
                flashSaleName: flashsale.name,
                startTime: flashsale.start_time,
                endTime: flashsale.end_time,
                flashPrice: item.flash_price,
                originalPrice: product.price,
                flashStock: item.stock_limit - (item.sold_count || 0)
              });
            }
          });
        }
        
        // Transform products similar to ProductListing
        const transformedProducts = products.map(p => {
          const base = transformProductFromAPI(p);
          // Override price with flash price
          return {
            ...base,
            price: p.originalPrice || p.price,
            support: p.flashPrice || p.price,
            startTime: p.startTime,
            endTime: p.endTime,
            flashSaleId: p.flashSaleId,
            flashSaleName: p.flashSaleName
          };
        });
        
        setAllProducts(transformedProducts);
      } catch (err) {
        console.error('❌ Failed to fetch flash sale products:', err);
        setError(err.message || 'Không thể tải sản phẩm flash sale');
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
        top: document.querySelector('.flash-sale-section')?.offsetTop - 100 || 0,
        behavior: 'smooth'
      });
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      // Scroll to top khi chuyển trang
      window.scrollTo({
        top: document.querySelector('.flash-sale-section')?.offsetTop - 100 || 0,
        behavior: 'smooth'
      });
    }
  };

  const goToPage = (pageIndex) => {
    if (pageIndex >= 0 && pageIndex < totalPages) {
      setCurrentPage(pageIndex);
      // Scroll to top khi chuyển trang
      window.scrollTo({
        top: document.querySelector('.flash-sale-section')?.offsetTop - 100 || 0,
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