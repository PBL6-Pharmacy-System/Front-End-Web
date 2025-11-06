import { useState, useEffect } from 'react';
import { MockApiService } from '../services/productApi';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await MockApiService.getProducts();
        
        if (response.success) {
          setProducts(response.data);
        } else {
          setError(response.error);
          setProducts([]);
        }
      } catch (err) {
        setError('Unexpected error occurred');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
};

export const useTrendingProducts = (limit = 8) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await MockApiService.getTrendingProducts(limit);
        
        if (response.success) {
          setProducts(response.data);
        } else {
          setError(response.error);
          setProducts([]);
        }
      } catch (err) {
        setError('Unexpected error occurred');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingProducts();
  }, [limit]);

  return { products, loading, error };
};