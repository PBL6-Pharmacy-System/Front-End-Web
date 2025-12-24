import { useState } from 'react';
import './ChatProductCard.css';

export default function ChatProductCard({ product, onNavigate }) {
  const [isLoading, setIsLoading] = useState(false);

  // Validate product data
  if (!product) {
    console.warn('⚠️ ChatProductCard: No product data provided');
    return null;
  }

  // Log product info for debugging
  console.log('🎯 ChatProductCard rendering:', {
    id: product.id,
    name: product.name,
    price: product.price,
    hasImages: !!product.images
  });

  // Format giá tiền
  const formatPrice = (price) => {
    if (!price) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Lấy ảnh đầu tiên từ mảng images
  const getProductImage = () => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    if (product.image_url) {
      return product.image_url;
    }
    if (product.imageUrl) {
      return product.imageUrl;
    }
    // Không dùng placeholder nữa, dùng ảnh mặc định từ CDN hoặc gradient
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
  };

  // Tính phần trăm giảm giá
  const calculateDiscount = () => {
    const originalPrice = product.originalPrice || product.original_price;
    if (originalPrice && product.price) {
      const discount = ((originalPrice - product.price) / originalPrice) * 100;
      return Math.round(discount);
    }
    return 0;
  };

  const discount = calculateDiscount();
  const productImage = getProductImage();

  // Xử lý click vào sản phẩm - Lấy API và navigate
  const handleProductClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🎯 ChatProductCard clicked, product:', product);
    console.log('🎯 Product ID:', product.id, 'Type:', typeof product.id);
    
    if (!product.id) {
      console.error('❌ No product ID available');
      return;
    }
    
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Lấy thông tin chi tiết sản phẩm từ API
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const productUrl = `${baseUrl}/products/${product.id}`;
      console.log('📡 Fetching product from:', productUrl);
      
      const response = await fetch(productUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Product detail fetched:', data);
      
      // Dispatch custom event để App.jsx bắt được
      const event = new CustomEvent('navigateToProduct', {
        detail: {
          productId: product.id,
          productData: data.data || data,
          productSource: 'chatbot'
        }
      });
      console.log('📤 Dispatching navigateToProduct event:', event.detail);
      window.dispatchEvent(event);
      
    } catch (error) {
      console.error('❌ Error fetching product detail:', error);
      // Fallback: Navigate trực tiếp với ID
      const event = new CustomEvent('navigateToProduct', {
        detail: {
          productId: product.id,
          productSource: 'chatbot'
        }
      });
      console.log('📤 Dispatching navigateToProduct event (fallback):', event.detail);
      window.dispatchEvent(event);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-product-card" onClick={handleProductClick}>
      {/* Discount Badge */}
      {discount > 0 && (
        <div className="chat-product-discount-badge">
          -{discount}%
        </div>
      )}
      
      {/* Product Image */}
      <div className="chat-product-image-wrapper">
        <img 
          src={productImage} 
          alt={product.name}
          className="chat-product-image"
          onError={(e) => {
            e.target.src = '/images/placeholder-product.png';
          }}
        />
      </div>

      {/* Product Info */}
      <div className="chat-product-info">
        <h4 className="chat-product-name" title={product.name}>
          {product.name}
        </h4>
        
        {product.specification && (
          <p className="chat-product-spec">
            {product.specification}
          </p>
        )}

        <div className="chat-product-pricing">
          <span className="chat-product-price">
            {formatPrice(product.price)}
          </span>
          {(product.originalPrice || product.original_price) && 
           (product.originalPrice || product.original_price) > product.price && (
            <>
              <span className="chat-product-divider">/</span>
              <span className="chat-product-original-price">
                {formatPrice(product.originalPrice || product.original_price)}
              </span>
            </>
          )}
        </div>
        
        {discount > 0 && (
          <div className="chat-product-savings">
            Tiết kiệm: {discount}% ({formatPrice((product.originalPrice || product.original_price) - product.price)})
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="chat-product-actions">
        <button 
          className="chat-product-detail-btn" 
          disabled={isLoading}
          onClick={(e) => {
            e.stopPropagation();
            handleProductClick(e);
          }}
        >
          {isLoading ? (
            <span className="loading-spinner">⏳</span>
          ) : (
            'Xem chi tiết'
          )}
        </button>
      </div>
    </div>
  );
}
