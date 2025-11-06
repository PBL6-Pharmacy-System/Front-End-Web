import { useState, useEffect } from 'react';
import { MockApiService } from '../services/productApi';

export const useMedicalProducts = (category, itemsPerPage = 4) => {
  const [categoryData, setCategoryData] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching medical products for category:', category);
        
        const response = await MockApiService.getMedicalProductsByCategory(category);
        console.log('Medical products response:', response);
        
        if (response.success) {
          setCategoryData(response.data);
          
          // Handle different data structures
          if (Array.isArray(response.data)) {
            // If data is directly an array
            setProducts(response.data);
          } else if (response.data && Array.isArray(response.data.products)) {
            // If data has products property
            setProducts(response.data.products);
          } else {
            console.warn('Unexpected data structure:', response.data);
            setProducts([]);
          }
        } else {
          setError(response.error);
          setProducts([]);
        }
      } catch (err) {
        console.error('Error fetching medical products:', err);
        setError(err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (category) {
      fetchData();
    }
  }, [category]);

  // Pagination logic
  const totalProducts = products.length;
  const totalPages = Math.ceil(totalProducts / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalProducts);
  const currentProducts = products.slice(startIndex, endIndex);

  const pagination = {
    currentPage,
    totalPages,
    totalProducts,
    startIndex: startIndex + 1,
    endIndex,
    hasNext: currentPage < totalPages,
    hasPrevious: currentPage > 1,
    goToPage: (page) => setCurrentPage(page),
    goToNextPage: () => setCurrentPage(prev => Math.min(prev + 1, totalPages)),
    goToPreviousPage: () => setCurrentPage(prev => Math.max(prev - 1, 1))
  };

  return {
    categoryData,
    products: currentProducts,
    allProducts: products,
    loading,
    error,
    pagination
  };
};

export const useMedicalCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await MockApiService.getMedicalCategories();
        
        if (response.success) {
          setCategories(response.data);
        } else {
          setError(response.error);
        }
      } catch (err) {
        console.error('Error fetching medical categories:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
};