import { useState } from 'react';
import './ChatProductCard.css';

export default function ChatProductCard({ product, onNavigate }) {
  const [isLoading, setIsLoading] = useState(false);

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
    
    console.log('🎯 ChatProductCard clicked, product ID:', product.id);
    
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Lấy thông tin chi tiết sản phẩm từ API
      const baseUrl = import.meta.env.VITE_API_BASE_URL ;
      console.log('📡 Fetching product from:', `${baseUrl}/products/${product.id}`);
      
      const response = await fetch(`${baseUrl}/products/${product.id}`, {
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
    <div className="chat-product-card">
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
        {discount > 0 && (
          <div className="chat-product-discount-badge">
            -{discount}%
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="chat-product-info">
        <h4 className="chat-product-name" title={product.name}>
          {product.name}
        </h4>
        
        {product.brand && (
          <p className="chat-product-brand">{product.brand}</p>
        )}

        <div className="chat-product-pricing">
          <span className="chat-product-price">
            {formatPrice(product.price)}
          </span>
          {(product.originalPrice || product.original_price) && 
           (product.originalPrice || product.original_price) > product.price && (
            <span className="chat-product-original-price">
              {formatPrice(product.originalPrice || product.original_price)}
            </span>
          )}
        </div>

        {product.specification && (
          <div className="chat-product-spec">
            {product.specification}
          </div>
        )}
      </div>

      {/* Action Button */}
      <button 
        className="chat-product-view-btn" 
        disabled={isLoading}
        onClick={handleProductClick}
      >
        {isLoading ? (
          <>
            
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z" fill="currentColor"/>
            </svg>
            Xem
          </>
        )}
      </button>
    </div>
  );
}
