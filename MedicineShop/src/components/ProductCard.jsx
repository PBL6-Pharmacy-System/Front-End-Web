import React from 'react';
import { useAddToCart } from '../hooks/useAddToCart';
import { useToast } from './Toast';
import './ProductCard.css';

const ProductCard = ({ 
  product, 
  onClick, 
  variant = 'default',
  source = 'catalog',
  isFlashSale = false,
  showCountdown = false,
  showAddToCart = true,
  isLoading = false,
  isOutOfStock = false
}) => {
  const { handleAddToCart: addToCart } = useAddToCart();
  const toast = useToast();
  const handleClick = () => {
    if (isLoading || isOutOfStock) return;
    console.log('🎯 ProductCard clicked:', product.id, 'variant:', variant);
    if (onClick) {
      onClick(product);
    }
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (isLoading || isOutOfStock) return;
    
    console.log(`🛒 [ProductCard-${source}] Adding to cart:`, product.id, product.name);
    
    const result = await addToCart(product, source, 1);
    
    if (result.success) {
      // Có thể thêm toast notification ở đây thay vì alert
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const cardClasses = [
    'product-card',
    variant,
    isFlashSale ? 'flash-sale' : '',
    isLoading ? 'loading' : '',
    isOutOfStock ? 'out-of-stock' : ''
  ].filter(Boolean).join(' ');

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  // Normalize image source: prefer first image from `images` (array of strings or objects),
  // then `image`, `imageUrl`, or fallback placeholder
  const placeholder = '/api/placeholder/280/240';
  const firstImage = (() => {
    try {
      if (product) {
        // Priority 1: images array (from API)
        if (Array.isArray(product.images) && product.images.length > 0) {
          const mapped = product.images
            .map(img => {
              if (!img) return null;
              if (typeof img === 'string') return img.trim();
              if (typeof img === 'object') return img.url || img.path || img.src || null;
              return null;
            })
            .filter(Boolean);
          if (mapped.length > 0) {
            console.log('🖼️ ProductCard image from images array:', mapped[0]);
            return mapped[0];
          }
        }
        // Priority 2: image_url field
        if (product.image_url && typeof product.image_url === 'string') {
          console.log('🖼️ ProductCard image from image_url:', product.image_url);
          return product.image_url.trim();
        }
        // Priority 3: Other fields
        if (product.image && typeof product.image === 'string') return product.image.trim();
        if (product.imageUrl && typeof product.imageUrl === 'string') return product.imageUrl.trim();
        if (product.thumbnail && typeof product.thumbnail === 'string') return product.thumbnail.trim();
      }
    } catch (e) {
      console.error('❌ Error getting product image:', e);
    }
    console.warn('⚠️ No image found, using placeholder for product:', product?.name);
    return placeholder;
  })();

  const safeSrc = (() => {
    try {
      if (!firstImage) return placeholder;
      // Don't encode already valid URLs - it causes double encoding
      if (firstImage.startsWith('http://') || firstImage.startsWith('https://')) {
        console.log('✅ Using full URL:', firstImage);
        return firstImage; // Return as-is, browser will handle it
      }
      if (firstImage.startsWith('/')) {
        console.log('✅ Using relative URL:', firstImage);
        return firstImage;
      }
      return firstImage;
    } catch (e) {
      console.error('❌ Error processing image URL:', e);
      return placeholder;
    }
  })();

  return (
    <div 
      className={cardClasses}
      onClick={handleClick}
      tabIndex={0}
      role="button"
      aria-label={`Xem chi tiết sản phẩm ${product.name}`}
    >
      {/* Flash Sale Badge */}
      {isFlashSale && (
        <div className="flash-sale-badge">
          ⚡ FLASH SALE
        </div>
      )}

      {/* Product Image */}
      <div className="product-image">
        <img 
          src={safeSrc}
          alt={product.name}
          loading="lazy"
          onError={(e) => { e.currentTarget.src = placeholder; }}
        />
        {product.discount && product.discount > 0 && (
          <div className="discount-badge">
            -{product.discount}%
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        
        {product.brand && (
          <p className="product-brand">{product.brand}</p>
        )}

        <div className="product-price">
          {product.discountPrice ? (
            <>
              <span className="old-price">{formatPrice(product.price)}₫</span>
              <span className="new-price">{formatPrice(product.discountPrice)}₫</span>
            </>
          ) : (
            <span className="current-price">{formatPrice(product.price)}₫</span>
          )}
        </div>

        {product.rating && (
          <div className="product-rating">
            <span className="stars">
              {Array.from({length: 5}, (_, i) => (
                <span key={i}>
                  {i < Math.floor(product.rating) ? '★' : '☆'}
                </span>
              ))}
            </span>
            <span className="rating-text">({product.rating}/5)</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="product-actions">
        <button 
          className="view-detail-btn"
          onClick={handleClick}
          disabled={isLoading || isOutOfStock}
        >
          {isLoading ? (
            <>
            </>
          ) : (
            <>
              <span>Xem chi tiết</span>
            </>
          )}
        </button>
        
        {showAddToCart && (
          <button 
            className="add-to-cart-btn"
            onClick={handleAddToCart}
            disabled={isLoading || isOutOfStock}
          >
            {isOutOfStock ? (
              <>
                <span>Hết hàng</span>
              </>
            ) : (
              <>
                <span>Thêm vào giỏ</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;