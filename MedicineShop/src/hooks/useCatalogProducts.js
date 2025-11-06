import { useState, useEffect } from 'react';
import { 
  getAllCatalogProducts, 
  getProductsByCategory, 
  searchProducts 
} from '../services/catalogProductApi';

export const useCatalogProducts = ({ categoryKey, searchQuery }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 useCatalogProducts - Fetching with filters:', { categoryKey, searchQuery });
        
        let result;
        
        // Priority: Search > Category > All
        if (searchQuery && searchQuery.trim() !== '') {
          console.log('🔍 Searching products:', searchQuery);
          result = await searchProducts(searchQuery);
        } else if (categoryKey && categoryKey !== 'all') {
          console.log('📂 Getting products by category:', categoryKey);
          result = await getProductsByCategory(categoryKey);
        } else {
          console.log('📦 Getting all products');
          result = await getAllCatalogProducts();
        }

        console.log('📊 API Result:', result);

        if (result && result.success) {
          // Be defensive: backend can return different shapes.
          // Normalize accepted shapes to an array of products.
          let productsData = [];

          if (Array.isArray(result.data)) {
            productsData = result.data;
          } else if (result.data && Array.isArray(result.data.products)) {
            productsData = result.data.products;
          } else if (Array.isArray(result.products)) {
            productsData = result.products;
          } else if (result.data && Array.isArray(result.data.data)) {
            productsData = result.data.data;
          } else if (result.data && typeof result.data === 'object') {
            // sometimes API returns { data: { products: [...] } }
            const maybeProducts = result.data.products || result.data.data;
            if (Array.isArray(maybeProducts)) productsData = maybeProducts;
          }

          console.log('✅ useCatalogProducts - Received:', productsData.length, 'products');
          setProducts(productsData);
          setTotalProducts(result.total || result.data?.total || productsData.length);
        } else {
          throw new Error(result?.error || 'Failed to fetch products');
        }
      } catch (err) {
        console.error('❌ Error fetching products:', err);
        setError(err.message);
        setProducts([]);
        setTotalProducts(0);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryKey, searchQuery]);

  return {
    products,
    loading,
    error,
    totalProducts
  };
};

export default useCatalogProducts;