import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './LoginModal.css';

export default function LoginModal({ isOpen, onClose }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Validate Vietnamese phone number
  const validatePhoneNumber = (phone) => {
    // Remove all spaces and special characters
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // Vietnamese phone number patterns:
    // - Start with 0: 10 digits (03, 05, 07, 08, 09)
    // - Start with +84: 11 digits
    // - Start with 84: 11 digits
    const patterns = [
      /^0[3|5|7|8|9][0-9]{8}$/, // 0x xxxxxxxx (10 digits)
      /^\+84[3|5|7|8|9][0-9]{8}$/, // +84x xxxxxxxx (12 chars)
      /^84[3|5|7|8|9][0-9]{8}$/ // 84x xxxxxxxx (11 digits)
    ];
    
    return patterns.some(pattern => pattern.test(cleanPhone));
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhoneNumber(value);
    
    // Clear error when user types
    if (error) setError('');
  };

  const handleContinue = () => {
    if (!phoneNumber.trim()) {
      setError('Vui lòng nhập số điện thoại');
      return;
    }
    
    if (!validatePhoneNumber(phoneNumber)) {
      setError('Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng (VD: 0912345678)');
      return;
    }
    
    console.log('Continue with phone:', phoneNumber);
    // Implement login logic here
    // TODO: Call API to send OTP
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Render modal using Portal to attach it to document.body
  return createPortal(
    <div 
      className="login-modal-overlay" 
      onClick={handleOverlayClick}
    >
      {/* Login Modal */}
      <div className="login-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="login-modal-close"
        >
          ×
        </button>
        
        {/* Content */}
        <div className="login-modal-content">
          {/* Title */}
          <h2 className="login-modal-title">Đăng nhập tài khoản</h2>
          <p className="login-modal-subtitle">
            Nhập số điện thoại để tiếp tục
          </p>
          
          {/* Phone Icon */}
          <div className="login-phone-icon-wrapper">
            <div className="login-phone-icon">📱</div>
          </div>
          
          {/* Phone Input */}
          <div className="login-input-group">
            <div className="login-input-wrapper">
              <span className="login-input-prefix">🇻🇳 +84</span>
              <input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="Nhập số điện thoại"
                className={`login-phone-input ${error ? 'error' : ''}`}
                maxLength="15"
              />
            </div>
            {error && <div className="login-error-message">{error}</div>}
          </div>
          
          {/* Helper Text */}
          <p className="login-helper-text">
            Mã OTP sẽ được gửi đến số điện thoại của bạn
          </p>
          
          {/* Continue Button */}
          <button
            onClick={handleContinue}
            className="login-continue-btn"
            disabled={!phoneNumber.trim()}
          >
            <span>Tiếp tục</span>
            <span className="login-btn-arrow">→</span>
          </button>
          
          {/* Terms */}
          <p className="login-terms">
            Bằng việc tiếp tục, bạn đã đồng ý với{' '}
            <a href="#" className="login-terms-link">Điều khoản sử dụng</a>
            {' '}và{' '}
            <a href="#" className="login-terms-link">Chính sách bảo mật</a>
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
