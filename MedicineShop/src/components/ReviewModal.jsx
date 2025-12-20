import React, { useState } from 'react';
import './ReviewModal.css';

export default function ReviewModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  product,
  existingReview = null,
  isLoading = false 
}) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    
    if (rating === 0) {
      newErrors.rating = 'Vui lòng chọn số sao đánh giá';
    }
    
    if (comment.trim() === '') {
      newErrors.comment = 'Vui lòng nhập nội dung đánh giá';
    } else if (comment.length > 1000) {
      newErrors.comment = 'Nội dung đánh giá không được vượt quá 1000 ký tự';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    const reviewData = {
      product_id: product.id,
      rating,
      comment: comment.trim()
    };
    
    await onSubmit(reviewData);
  };

  const handleClose = () => {
    if (!isLoading) {
      setRating(existingReview?.rating || 0);
      setComment(existingReview?.comment || '');
      setErrors({});
      onClose();
    }
  };

  return (
    <div className="review-modal-overlay" onClick={handleClose}>
      <div className="review-modal" onClick={(e) => e.stopPropagation()}>
        <div className="review-modal-header">
          <h3>{existingReview ? 'Sửa đánh giá' : 'Viết đánh giá'}</h3>
          <button 
            className="review-modal-close" 
            onClick={handleClose}
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        <div className="review-modal-body">
          {/* Product Info */}
          <div className="review-product-info">
            <img 
              src={product.image_url || product.products?.image_url || '/api/placeholder/60/60'} 
              alt={product.name || product.products?.name}
              className="review-product-image"
            />
            <div className="review-product-details">
              <h4>{product.name || product.products?.name}</h4>
            </div>
          </div>

          {/* Rating */}
          <div className="review-rating-section">
            <label>Đánh giá của bạn <span className="required">*</span></label>
            <div className="review-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star-btn ${star <= (hoveredRating || rating) ? 'active' : ''}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  disabled={isLoading}
                >
                  ★
                </button>
              ))}
            </div>
            {rating > 0 && (
              <span className="rating-text">
                {rating === 1 && 'Rất tệ'}
                {rating === 2 && 'Tệ'}
                {rating === 3 && 'Bình thường'}
                {rating === 4 && 'Tốt'}
                {rating === 5 && 'Rất tốt'}
              </span>
            )}
            {errors.rating && <span className="error-text">{errors.rating}</span>}
          </div>

          {/* Comment */}
          <div className="review-comment-section">
            <label htmlFor="comment">
              Nhận xét của bạn <span className="required">*</span>
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
              rows={5}
              maxLength={1000}
              disabled={isLoading}
              className={errors.comment ? 'error' : ''}
            />
            <div className="comment-footer">
              <span className="char-count">{comment.length}/1000</span>
            </div>
            {errors.comment && <span className="error-text">{errors.comment}</span>}
          </div>
        </div>

        <div className="review-modal-footer">
          <button 
            type="button" 
            className="btn-cancel" 
            onClick={handleClose}
            disabled={isLoading}
          >
            Hủy
          </button>
          <button 
            type="submit" 
            className="btn-submit" 
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Đang xử lý...' : (existingReview ? 'Cập nhật' : 'Gửi đánh giá')}
          </button>
        </div>
      </div>
    </div>
  );
}
