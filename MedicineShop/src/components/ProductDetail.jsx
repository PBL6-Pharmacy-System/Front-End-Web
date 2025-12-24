import React, { useState, useEffect } from 'react';
import { useToast } from './Toast';
import { useAddToCart } from '../hooks/useAddToCart';
import ReviewModal from './ReviewModal';
import { createReview, getProductReviews, getProductRatingStats } from '../services/reviewApi';
import './ProductDetail.css';

export default function ProductDetail({ product, onNavigate }) {
  const toast = useToast();
  const { handleAddToCart: addToCart } = useAddToCart();
  console.log('🎨 ProductDetail received product:', product);
  console.log('🎨 Product type:', typeof product);
  console.log('🎨 Product keys:', product ? Object.keys(product) : 'null');

  // KIỂM TRA: Nếu product có cấu trúc {success, data}, unwrap nó
  const actualProduct = product?.data || product;
  
  console.log('🎨 Actual product to render:', actualProduct);
  console.log('📂 Category data:', {
    categories: actualProduct?.categories,
    category: actualProduct?.category,
    category_id: actualProduct?.category_id
  });

  if (!actualProduct) {
    return <div>Không có thông tin sản phẩm</div>;
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [ratingStats, setRatingStats] = useState(null);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  // Fetch reviews when component mounts or product changes
  useEffect(() => {
    if (actualProduct?.id) {
      fetchReviews();
    }
  }, [actualProduct?.id]);

  const fetchReviews = async () => {
    try {
      setIsLoadingReviews(true);
      const productId = actualProduct.id;
      
      // Fetch reviews and rating stats in parallel
      const [reviewsResponse, statsResponse] = await Promise.all([
        getProductReviews(productId, { limit: 10 }),
        getProductRatingStats(productId)
      ]);

      console.log('📊 Reviews response:', reviewsResponse);
      console.log('📊 Stats response:', statsResponse);

      if (reviewsResponse.success && reviewsResponse.data) {
        setReviews(reviewsResponse.data.reviews || []);
      }

      if (statsResponse.success && statsResponse.data) {
        setRatingStats(statsResponse.data.stats);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  // Xử lý giá tiền - ưu tiên theo thứ tự: flashPrice (Flash Sale), support, price, originalPrice
  const getCurrentPrice = () => {
    // Ưu tiên flashPrice cho sản phẩm Flash Sale
    const flashPrice = actualProduct.flashPrice || actualProduct.flash_price;
    if (flashPrice) {
      console.log('🔥 getCurrentPrice: Using Flash Sale price:', flashPrice);
      return flashPrice;
    }
    const regularPrice = actualProduct.support || actualProduct.price || actualProduct.originalPrice || '0';
    console.log('💵 getCurrentPrice: Using regular price:', regularPrice);
    return regularPrice;
  };

  const getOriginalPrice = () => {
    const flashPrice = actualProduct.flashPrice || actualProduct.flash_price;
    // Nếu có flashPrice và price khác nhau
    if (flashPrice && actualProduct.price && flashPrice !== actualProduct.price) {
      return actualProduct.price;
    }
    // Nếu có support và price khác nhau
    if (actualProduct.support && actualProduct.price && actualProduct.support !== actualProduct.price) {
      return actualProduct.price;
    }
    // Nếu có price và originalPrice khác nhau  
    if (actualProduct.price && actualProduct.originalPrice && actualProduct.price !== actualProduct.originalPrice) {
      return actualProduct.originalPrice;
    }
    return null;
  };

  // Xử lý discount
  const getDiscount = () => {
    return actualProduct.discount || null;
  };

  // Xử lý tên sản phẩm
  const getProductName = () => {
    return actualProduct.name || 'Tên sản phẩm';
  };

  // Xử lý mô tả
  const getDescription = () => {
    return actualProduct.description || 'Không có mô tả chi tiết cho sản phẩm này.';
  };

  // Xử lý category - API trả về categories object với name property
  const getCategory = () => {
    // Ưu tiên categories.name từ API
    if (actualProduct.categories && actualProduct.categories.name) {
      return actualProduct.categories.name;
    }
    // Fallback: category_id hoặc category string
    if (actualProduct.category) {
      return actualProduct.category;
    }
    return 'Không phân loại';
  };

  // Xử lý đơn vị - ưu tiên specification, quantity, sau đó unit
  const getUnit = () => {
    // Từ specification: "Chai x 150ml" → "Chai"
    if (actualProduct.specification) {
      const match = actualProduct.specification.match(/^([^\dx]+)/);
      if (match) return match[1].trim();
    }
    // Từ unittype.name
    if (actualProduct.unittype && actualProduct.unittype.name) {
      return actualProduct.unittype.name;
    }
    return actualProduct.quantity || actualProduct.unit || 'Hộp';
  };

  // Xử lý stock
  const getStock = () => {
    // Check in_stock field first (from API)
    if (actualProduct.in_stock === false) return 0;
    if (actualProduct.inStock !== undefined) return actualProduct.inStock ? 100 : 0;
    if (actualProduct.stock !== undefined) return actualProduct.stock;
    return 100; // default
  };
  
  // Check if product is out of stock
  const isOutOfStock = actualProduct.in_stock === false || getStock() === 0;

  // Tạo mảng hình ảnh từ sản phẩm hoặc sử dụng placeholder
  const placeholderImage = "https://via.placeholder.com/500x500/f5f5f5/ccc?text=No+Image";

  // Normalize possible shapes: actualProduct.images may be array of strings or array of objects
  const productImages = (() => {
    console.log('🖼️ ProductDetail - Processing images from product:', {
      hasImagesArray: Array.isArray(actualProduct.images),
      imagesLength: actualProduct.images?.length,
      hasImage: !!actualProduct.image,
      hasImageUrl: !!actualProduct.image_url
    });
    
    // Priority 1: images array
    if (Array.isArray(actualProduct.images) && actualProduct.images.length > 0) {
      const mapped = actualProduct.images
        .map(img => {
          if (!img) return null;
          if (typeof img === 'string') return img.trim();
          if (typeof img === 'object') return img.url || img.path || img.src || null;
          return null;
        })
        .filter(Boolean);
      
      if (mapped.length > 0) {
        console.log('✅ ProductDetail - Using images array:', mapped.length, 'images');
        return mapped;
      }
    }
    
    // Priority 2: image_url field
    if (actualProduct.image_url && typeof actualProduct.image_url === 'string') {
      console.log('✅ ProductDetail - Using image_url field');
      return [actualProduct.image_url.trim()];
    }
    
    // Priority 3: image field
    if (actualProduct.image && typeof actualProduct.image === 'string') {
      console.log('✅ ProductDetail - Using image field');
      return [actualProduct.image.trim()];
    }
    
    // Priority 4: imageUrl field
    if (actualProduct.imageUrl && typeof actualProduct.imageUrl === 'string') {
      console.log('✅ ProductDetail - Using imageUrl field');
      return [actualProduct.imageUrl.trim()];
    }
    
    console.log('⚠️ ProductDetail - No images found, using placeholder');
    return [placeholderImage];
  })();
  
  // Breadcrumbs động dựa trên thông tin sản phẩm
  const breadcrumbs = [
    { name: 'Trang chủ', href: '#' },
    { name: getCategory(), href: '#' },
    { name: getProductName(), href: '#' }
  ];

  // Thông số kỹ thuật động từ dữ liệu sản phẩm
  const productSpecs = [
    { label: 'Mã sản phẩm', value: actualProduct.id || 'N/A' },
    { label: 'Tên sản phẩm', value: getProductName() },
    { label: 'Đơn vị tính', value: getUnit() },
    { label: 'Danh mục', value: getCategory() },
    { label: 'Tình trạng', value: getStock() > 0 ? 'Còn hàng' : 'Hết hàng' }
  ];

  const handleQuantityChange = (change) => {
    setQuantity(Math.max(1, quantity + change));
  };

  const handleAddToCart = async () => {
    const result = await addToCart(actualProduct, 'product-detail', quantity);
    
    if (result.success) {
      toast.success(result.message);
      setQuantity(1);
    } else {
      toast.error(result.message);
    }
  };

  const handleOpenReviewModal = () => {
    setReviewModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setReviewModalOpen(false);
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      setIsSubmittingReview(true);
      const response = await createReview(reviewData);
      
      if (response.success) {
        toast.success('Đánh giá sản phẩm thành công!');
        handleCloseReviewModal();
        // Reload reviews after successful submission
        await fetchReviews();
      } else {
        toast.error(response.error || 'Không thể gửi đánh giá');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Đã xảy ra lỗi khi gửi đánh giá');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const currentPrice = getCurrentPrice();
  const originalPrice = getOriginalPrice();
  const discount = getDiscount();

  return (
    <div className="product-detail-page">
      {/* Breadcrumb */}
      <div className="product-container">
        <nav className="product-breadcrumb">
          {breadcrumbs.map((item, index) => (
            <span key={index}>
              <a 
                href={item.href} 
                className="product-breadcrumb-link"
                onClick={(e) => {
                  e.preventDefault();
                  if (index === 0) onNavigate('home');
                }}
              >
                {item.name}
              </a>
              {index < breadcrumbs.length - 1 && <span className="product-breadcrumb-separator"> / </span>}
            </span>
          ))}
        </nav>
      </div>

      <div className="product-container">
        <div className="product-content-wrapper">
          {/* Left Column: Images */}
          <div className="product-left-col">
            <div className="product-images-section">
              <div className="product-main-image">
                <img 
                  src={productImages[selectedImage] || placeholderImage} 
                  alt={getProductName()}
                  className="main-product-image"
                />
              </div>
              
              <div className="product-image-thumbnails">
                {productImages.map((img, index) => (
                  <button 
                    key={index}
                    className={`product-thumbnail ${selectedImage === index ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img 
                      src={img || placeholderImage}
                      alt={`Thumbnail ${index + 1}`}
                      onError={(e) => { e.currentTarget.src = placeholderImage; }}
                    />
                  </button>
                ))}
              </div>
              
              <p className="product-image-note">Màu sắc sản phẩm có thể thay đổi theo lô hàng</p>
            </div>
          </div>

          {/* Right Column: Product Info */}
          <div className="product-right-col">
            {/* Brand Badge */}
            {actualProduct.brand && (
              <div className="brand-badge">
                <div className="brand-info">
                  <span className="brand-label">Thương hiệu:</span>
                  <span className="brand-name">{actualProduct.brand}</span>
                </div>
              </div>
            )}
            
            {/* Product Title */}
            <h1 className="product-title">{getProductName()}</h1>
            
            {/* Product Meta */}
            <div className="product-meta-row">
              <span className="product-id-label">
                {actualProduct.id} 
                <span className="rating-stars">★</span> 
                {actualProduct.rating || 5}
              </span>
              <span className="rating-reviews">
                <a href="#reviews" className="review-link">
                  25 đánh giá
                </a>
              </span>
              <span className="sold-count">229 bình luận</span>
            </div>

            {/* Price Section */}
            <div className="price-box">
              <div className="price-amount">{formatPrice(currentPrice)}đ / {getUnit()}</div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons-row">
              <div className="unit-selector">
                <button className="unit-btn active">{getUnit()}</button>
              </div>
            </div>

            {/* Product Info Table */}
            <div className="product-info-table">
              <div className="info-row">
                <span className="info-label">Danh mục</span>
                <span className="info-value category-link">{getCategory()}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Số đăng ký</span>
                <span className="info-value">{actualProduct.registNum || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Dạng bào chế</span>
                <span className="info-value">{actualProduct.specification || 'Viên nén'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Quy cách</span>
                <span className="info-value">{actualProduct.specification || getUnit()}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Nhà sản xuất</span>
                <span className="info-value">{actualProduct.manufacturer || actualProduct.producer || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Nước sản xuất</span>
                <span className="info-value">{actualProduct.manufactor || 'Đức'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Thành phần</span>
                <span className="info-value ingredients-text">
                  {actualProduct.description?.substring(0, 100) || 'Xem chi tiết bên dưới'}
                  {actualProduct.description?.length > 100 && '...'}
                </span>
              </div>
            </div>

            {/* Quantity and Purchase */}
            <div className="quantity-purchase-box">
              <div className="quantity-selector">
                <label className="quantity-label">Chọn số lượng</label>
                <div className="quantity-controls">
                  <button 
                    className="qty-btn"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={isOutOfStock}
                  >
                    −
                  </button>
                  <input 
                    type="number" 
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="qty-input"
                    disabled={isOutOfStock}
                  />
                  <button 
                    className="qty-btn"
                    onClick={() => handleQuantityChange(1)}
                    disabled={isOutOfStock}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="purchase-buttons">
                <button 
                  className="btn-add-cart"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  style={isOutOfStock ? {
                    backgroundColor: '#ccc',
                    color: '#666',
                    cursor: 'not-allowed',
                    opacity: 0.6
                  } : {}}
                >
                  {isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
                </button>
              </div>
            </div>

            {/* Service Features */}
            <div className="service-features">
              <div className="feature-item">
                <span className="feature-icon"></span>
                <div className="feature-text">
                  <strong>Đổi trả trong 30 ngày</strong>
                  <span>kể từ ngày mua hàng</span>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon"></span>
                <div className="feature-text">
                  <strong>Miễn phí 100%</strong>
                  <span>đổi thuốc</span>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon"></span>
                <div className="feature-text">
                  <strong>Miễn phí vận chuyển</strong>
                  <span>theo chính sách giao hàng</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="product-details-tabs">
          <div className="product-tabs-nav">
            <button 
              className={`product-tab-btn ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Mô tả sản phẩm
            </button>
            <button 
              className={`product-tab-btn ${activeTab === 'specifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('specifications')}
            >
              Thông số kỹ thuật
            </button>
            <button 
              className={`product-tab-btn ${activeTab === 'usage' ? 'active' : ''}`}
              onClick={() => setActiveTab('usage')}
            >
              Hướng dẫn sử dụng
            </button>
            <button 
              className={`product-tab-btn ${activeTab === 'faq' ? 'active' : ''}`}
              onClick={() => setActiveTab('faq')}
            >
              Câu hỏi thường gặp
            </button>
            <button 
              className={`product-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Đánh giá
            </button>
          </div>

          <div className="product-tabs-content">
            {activeTab === 'description' && (
              <div className="product-tab-panel">
                <h3 className="tab-title">Mô tả chi tiết sản phẩm</h3>
                <div className="tab-content-wrapper">
                  <div 
                    className="description-content"
                    dangerouslySetInnerHTML={{ __html: getDescription() }}
                  />
                </div>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="product-tab-panel">
                <h3 className="tab-title">Thông số kỹ thuật</h3>
                <div className="tab-content-wrapper">
                  <table className="product-specs-table">
                    <tbody>
                      {productSpecs.map((spec, index) => (
                        <tr key={index}>
                          <td className="spec-label">{spec.label}</td>
                          <td className="spec-value">{spec.value}</td>
                        </tr>
                      ))}
                      {actualProduct.specification && (
                        <tr>
                          <td className="spec-label">Quy cách đóng gói</td>
                          <td className="spec-value">{actualProduct.specification}</td>
                        </tr>
                      )}
                      {actualProduct.manufacturer && (
                        <tr>
                          <td className="spec-label">Nhà sản xuất</td>
                          <td className="spec-value">{actualProduct.manufacturer}</td>
                        </tr>
                      )}
                      {actualProduct.producer && (
                        <tr>
                          <td className="spec-label">Nhà cung cấp</td>
                          <td className="spec-value">{actualProduct.producer}</td>
                        </tr>
                      )}
                      {actualProduct.manufactor && (
                        <tr>
                          <td className="spec-label">Nước sản xuất</td>
                          <td className="spec-value">{actualProduct.manufactor}</td>
                        </tr>
                      )}
                      {actualProduct.registNum && (
                        <tr>
                          <td className="spec-label">Số đăng ký</td>
                          <td className="spec-value">{actualProduct.registNum}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'usage' && (
              <div className="product-tab-panel">
                <h3 className="tab-title">Hướng dẫn sử dụng</h3>
                <div className="tab-content-wrapper">
                  {actualProduct.usage && (
                    <div className="usage-section">
                      <h4>Công dụng</h4>
                      <div 
                        className="usage-content"
                        dangerouslySetInnerHTML={{ __html: actualProduct.usage }}
                      />
                    </div>
                  )}
                  {actualProduct.dosage && (
                    <div className="dosage-section">
                      <h4>Liều lượng và cách dùng</h4>
                      <div 
                        className="dosage-content"
                        dangerouslySetInnerHTML={{ __html: actualProduct.dosage }}
                      />
                    </div>
                  )}
                  {actualProduct.adverseEffect && (
                    <div className="adverse-section">
                      <h4>Tác dụng phụ</h4>
                      <div 
                        className="adverse-content"
                        dangerouslySetInnerHTML={{ __html: actualProduct.adverseEffect }}
                      />
                    </div>
                  )}
                  {actualProduct.legalDeclaration && (
                    <div className="legal-section">
                      <h4>Giấy phép</h4>
                      <a 
                        href={actualProduct.legalDeclaration} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="legal-link"
                      >
                        Xem giấy công bố sản phẩm
                      </a>
                    </div>
                  )}
                  {!actualProduct.usage && !actualProduct.dosage && (
                    <p className="no-data">Chưa có thông tin hướng dẫn sử dụng cho sản phẩm này.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="product-tab-panel">
                <h3 className="tab-title">Câu hỏi thường gặp</h3>
                <div className="tab-content-wrapper">
                  {Array.isArray(actualProduct.faq) && actualProduct.faq.length > 0 ? (
                    <div className="faq-list">
                      {actualProduct.faq.map((item, index) => (
                        <div key={index} className="faq-item">
                          <div className="faq-question">
                            <strong>{item.question}</strong>
                          </div>
                          <div className="faq-answer">
                            <div dangerouslySetInnerHTML={{ __html: item.answer }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-faq">
                      <p className="no-data">Chưa có câu hỏi thường gặp cho sản phẩm này.</p>
                      <div className="contact-support">
                        <p>Bạn có thắc mắc về sản phẩm?</p>
                        <button className="btn-contact">Liên hệ hỗ trợ</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="product-tab-panel">
                <h3 className="tab-title">⭐ Đánh giá sản phẩm</h3>
                <div className="tab-content-wrapper">
                  {isLoadingReviews ? (
                    <div className="loading-reviews">
                      <p>Đang tải đánh giá...</p>
                    </div>
                  ) : (
                    <div className="reviews-section">
                      <div className="reviews-summary">
                        <div className="rating-overview">
                          <div className="rating-score">
                            <span className="score-number">
                              {ratingStats?.averageRating?.toFixed(1) || '0.0'}
                            </span>
                            <div className="stars-large">
                              {'★'.repeat(Math.round(ratingStats?.averageRating || 0))}
                              {'☆'.repeat(5 - Math.round(ratingStats?.averageRating || 0))}
                            </div>
                            <p className="rating-text">
                              {ratingStats?.totalReviews > 0 
                                ? `${ratingStats.totalReviews} đánh giá`
                                : 'Chưa có đánh giá'}
                            </p>
                          </div>
                        </div>
                        <div className="rating-breakdown">
                          {[5, 4, 3, 2, 1].map(star => {
                            const count = ratingStats?.ratingDistribution?.[star] || 0;
                            const percentage = ratingStats?.totalReviews > 0 
                              ? (count / ratingStats.totalReviews * 100).toFixed(0)
                              : 0;
                            return (
                              <div key={star} className="rating-bar-item">
                                <span>{star} ⭐</span>
                                <div className="rating-bar">
                                  <div className="bar-fill" style={{width: `${percentage}%`}}></div>
                                </div>
                                <span>{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {reviews.length === 0 ? (
                        <div className="no-reviews">
                          <p className="no-data">Chưa có đánh giá nào cho sản phẩm này.</p>
                          <p className="be-first">Hãy là người đầu tiên đánh giá sản phẩm!</p>
                          <button className="btn-write-review" onClick={handleOpenReviewModal}>
                            Viết đánh giá
                          </button>
                        </div>
                      ) : (
                        <div className="reviews-list">
                          <div className="reviews-list-header">
                            <h4>Tất cả đánh giá ({reviews.length})</h4>
                            <button className="btn-write-review" onClick={handleOpenReviewModal}>
                              Viết đánh giá
                            </button>
                          </div>
                          {reviews.map(review => (
                            <div key={review.id} className="review-item">
                              <div className="review-header">
                                <div className="reviewer-info">
                                  <span className="reviewer-name">
                                    {review.customers?.users?.full_name || 'Người dùng'}
                                  </span>
                                  <div className="review-stars">
                                    {'★'.repeat(review.rating)}
                                    {'☆'.repeat(5 - review.rating)}
                                  </div>
                                </div>
                                <span className="review-date">
                                  {new Date(review.created_at).toLocaleDateString('vi-VN')}
                                </span>
                              </div>
                              <div className="review-content">
                                <p>{review.comment}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {reviewModalOpen && (
        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={handleCloseReviewModal}
          onSubmit={handleSubmitReview}
          product={{
            id: actualProduct.id,
            name: getProductName(),
            image_url: productImages[0]
          }}
          isLoading={isSubmittingReview}
        />
      )}
    </div>
  );
}