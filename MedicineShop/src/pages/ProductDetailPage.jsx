import React, { useState, useEffect } from 'react';
import ProductDetail from '../components/ProductDetail';
import './ProductDetailPage.css';
import { MockApiService } from '../services/productApi';

export default function ProductDetailPage({ onNavigate, productId, productSource = 'listing' }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log('=== PRODUCT DETAIL PAGE ===');
  console.log('Product ID:', productId, 'Source:', productSource);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setError('Không tìm thấy ID sản phẩm');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        let response = null;

        switch(productSource) {
          case 'chatbot':
            console.log('🤖 Fetching product from chatbot - using backend API');
            try {
              const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
              const res = await fetch(`${baseUrl}/products/${productId}`, { 
                method: 'GET', 
                headers: { 'Content-Type': 'application/json' } 
              });
              if (res.ok) {
                const payload = await res.json();
                if (payload && payload.success && payload.data) {
                  response = { success: true, data: payload.data };
                } else if (payload && payload.data) {
                  response = { success: true, data: payload.data };
                } else if (payload) {
                  response = { success: true, data: payload };
                } else {
                  response = { success: false, error: 'Không tìm thấy sản phẩm' };
                }
              } else {
                response = { success: false, error: `HTTP ${res.status}` };
              }
            } catch (err) {
              console.error('❌ Fetch product API failed:', err);
              response = { success: false, error: err.message };
            }
            break;
            
          case 'flash-sale':
            console.log('🔥 Fetching Flash Sale product');
            // Flash sale products cũng dùng API /api/products/{id}
            const { getProductById: getFlashSaleProduct } = await import('../services/catalogProductApi');
            response = await getFlashSaleProduct(productId);
            break;
          
          case 'listing-api':
            console.log('📡 Fetching listing product from backend API');
            try {
              const res = await fetch(`/api/products/${productId}`, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
              if (res.ok) {
                const payload = await res.json();
                if (payload && (payload.success && payload.data)) {
                  response = { success: true, data: payload.data };
                } else if (payload && payload.data) {
                  response = { success: true, data: payload.data };
                } else if (payload) {
                  // payload may be product object
                  response = { success: true, data: payload };
                } else {
                  response = { success: false, error: 'Không tìm thấy sản phẩm' };
                }
              } else {
                response = { success: false, error: `HTTP ${res.status}` };
              }
            } catch (err) {
              console.warn('Fetch product API failed, falling back to mock:', err);
              response = null;
            }
            break;
            
          case 'catalog':
            console.log('📂 Fetching Catalog product');
            // Import và sử dụng catalogProductApi
            const { getProductById } = await import('../services/catalogProductApi');
            response = await getProductById(productId);
            break;
            
          case 'medical':
            console.log('💊 Fetching Medical product');
            response = await MockApiService.getMedicalProductById(productId);
            break;
            
          default:
            console.log('📦 Default to listing product');
            response = await MockApiService.getProductById(productId);
        }
        
        if (response && response.success && response.data) {
          setProduct(response.data);
        } else {
          setError(response?.error || 'Không tìm thấy sản phẩm');
        }
        
      } catch (err) {
        console.error('❌ Error fetching product:', err);
        setError(err.message || 'Không thể tải thông tin sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, productSource]);

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Đang tải thông tin sản phẩm...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="error-container">
            <p className="error-message">❌ {error}</p>
            <button 
              className="back-btn"
              onClick={() => onNavigate('home')}
            >
              Quay lại trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="error-container">
            <p className="error-message">Không tìm thấy sản phẩm</p>
            <button 
              className="back-btn"
              onClick={() => onNavigate('home')}
            >
              Quay lại trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <ProductDetail 
        product={product}
        onNavigate={onNavigate}
      />
    </div>
  );
}
