import { useState, useEffect } from 'react';
import { fetchCategoryTree, fetchProductsByCategoryId } from '../services/categoryApi';

// Map từ tab key sang category name để tìm trong tree
const TAB_TO_CATEGORY_MAP = {
  'vitaminTab': 'Vitamin',
  'functionalFoodTab': 'Thực phẩm chức năng',
  'supplementTab': 'Thực phẩm bổ sung',
  'beautyTab': 'Mỹ phẩm',
  'equipmentTab': 'Thiết bị y tế'
};

export const useMedicalProducts = (category, itemsPerPage = 4) => {
  const [categoryData, setCategoryData] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryTree, setCategoryTree] = useState([]);
  
  // Fetch category tree on mount
  useEffect(() => {
    const fetchTree = async () => {
      try {
        const response = await fetchCategoryTree();
        if (response.success) {
          setCategoryTree(response.data);
          console.log('✅ Category tree loaded:', response.data);
        }
      } catch (err) {
        console.error('❌ Error loading category tree:', err);
      }
    };
    fetchTree();
  }, []);

  // Find category ID from tree based on tab
  const findCategoryId = (tree, categoryName) => {
    if (!tree || !Array.isArray(tree)) return null;
    
    for (const cat of tree) {
      // Match by name (case insensitive, partial match)
      if (cat.name && cat.name.toLowerCase().includes(categoryName.toLowerCase())) {
        return cat.id;
      }
      // Search in children
      if (cat.children && cat.children.length > 0) {
        const found = findCategoryId(cat.children, categoryName);
        if (found) return found;
      }
    }
    return null;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get category name from tab key
        const categoryName = TAB_TO_CATEGORY_MAP[category];
        if (!categoryName) {
          console.warn('Unknown category tab:', category);
          setProducts([]);
          setLoading(false);
          return;
        }

        console.log('🔍 Searching for category:', categoryName);
        
        // Find category ID from tree
        const categoryId = findCategoryId(categoryTree, categoryName);
        
        if (!categoryId) {
          console.warn('Category not found in tree:', categoryName);
          // Try to fetch with a default ID or show empty
          setProducts([]);
          setLoading(false);
          return;
        }

        console.log(`📡 Fetching products for category ID: ${categoryId} (${categoryName})`);
        
        // Fetch products by category ID
        const response = await fetchProductsByCategoryId(categoryId, {
          limit: 20, // Fetch more to allow client-side pagination
          page: 1
        });
        
        console.log('Products response:', response);
        
        if (response.success) {
          setCategoryData({ id: categoryId, name: categoryName });
          setProducts(response.products || []);
        } else {
          setError(response.error);
          setProducts([]);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (category && categoryTree.length > 0) {
      fetchData();
    }
  }, [category, categoryTree]);

  // Reset page when category changes
  useEffect(() => {
    setCurrentPage(1);
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
        const response = await fetchCategoryTree();
        
        if (response.success) {
          setCategories(response.data);
        } else {
          setError(response.error);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
};