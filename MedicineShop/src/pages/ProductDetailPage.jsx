import React, { useState, useEffect } from 'react';
import ProductDetail from '../components/ProductDetail';
import './ProductDetailPage.css';
import { MockApiService } from '../services/productApi';
import { API_CONFIG } from '../config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

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
        
        // Fetch active flash sales to check if this product has a flash sale price
        let flashSaleProduct = null;
        try {
          const flashSaleResponse = await fetch(`${API_BASE_URL}/flashsales/active`);
          if (flashSaleResponse.ok) {
            const flashSales = await flashSaleResponse.json();
            console.log('🔍 Raw API Response from /flashsales/active:', JSON.stringify(flashSales, null, 2));
            
            // Check different possible response structures
            const flashSalesList = flashSales.data?.flashsales || flashSales.data || flashSales.flashsales || [];
            console.log('📋 Flashsales list:', flashSalesList);
            console.log('📋 Flashsales count:', Array.isArray(flashSalesList) ? flashSalesList.length : 'Not an array');
            
            // Find if current product is in any active flash sale
            if (Array.isArray(flashSalesList) && flashSalesList.length > 0) {
              for (const flashSale of flashSalesList) {
                console.log('🔍 Checking flashsale:', flashSale.id, flashSale.name || flashSale.title);
                
                // Check different possible item array names
                const items = flashSale.flashsale_products || flashSale.items || flashSale.products || [];
                console.log('   Items in this flashsale:', items.length);
                
                if (Array.isArray(items) && items.length > 0) {
                  console.log('   Searching for productId:', productId, 'in', items.length, 'items');
                  
                  const foundItem = items.find(item => {
                    const itemProductId = item.product_id || item.productId;
                    console.log('      Checking item:', itemProductId, '===', parseInt(productId));
                    return itemProductId === parseInt(productId);
                  });
                  
                  if (foundItem) {
                    console.log('✅ FOUND matching item:', foundItem);
                    
                    // Get product data from item
                    const productData = foundItem.products || foundItem.product || foundItem;
                    console.log('   Product data:', productData);
                    console.log('   Flash price:', foundItem.flash_price);
                    
                    if (productData) {
                      // Sản phẩm nằm trong Flash Sale - lấy toàn bộ thông tin từ API flash sale
                      flashSaleProduct = {
                        ...productData,
                        flashPrice: foundItem.flash_price,
                        flash_price: foundItem.flash_price,
                        flashSaleId: flashSale.id,
                        flashSaleItemId: foundItem.id,
                        startTime: flashSale.start_time,
                        endTime: flashSale.end_time,
                        flashSaleTitle: flashSale.title || flashSale.name,
                        flashSaleName: flashSale.name || flashSale.title,
                        flashSaleDescription: flashSale.description,
                        flashSaleStatus: flashSale.status,
                        flashStockLimit: foundItem.stock_limit,
                        flashSoldCount: foundItem.sold_count || 0
                      };
                      console.log('✨ Final flashSaleProduct object:', {
                        id: flashSaleProduct.id,
                        name: flashSaleProduct.name,
                        price: flashSaleProduct.price,
                        flashPrice: flashSaleProduct.flashPrice,
                        flash_price: flashSaleProduct.flash_price
                      });
                      break;
                    }
                  }
                }
              }
            }
          }
          
          if (!flashSaleProduct) {
            console.log('📦 Product NOT in any active Flash Sale, will fetch from regular API');
          }
        } catch (flashSaleError) {
          console.log('⚠️ Flash Sale check failed (non-critical):', flashSaleError.message);
        }
        
        // Nếu sản phẩm có trong Flash Sale, dùng luôn data từ Flash Sale
        if (flashSaleProduct) {
          console.log('🔥 Using Flash Sale product data directly');
          setProduct(flashSaleProduct);
          setLoading(false);
          return;
        }
        
        // Nếu không có trong Flash Sale, fetch từ nguồn bình thường
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
          console.log('📦 Using regular product data from API');
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
