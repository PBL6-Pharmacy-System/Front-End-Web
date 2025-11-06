import React, { useState } from 'react';
import './LoginForm.css';

export default function LoginForm() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const handleContinue = () => {
    console.log('Continue with phone:', phoneNumber);
  };

  const handleRegister = () => {
    console.log('Register with electronic ID');
  };

  return (
    <div className="login-container">
      {!isModalOpen && (
        <button 
          onClick={() => setIsModalOpen(true)}
          className="open-btn"
        >
          Mở Form Đăng Nhập
        </button>
      )}

      {isModalOpen && (
        <>
          {/* Modal Overlay */}
          <div 
            className="modal-overlay" 
            onClick={handleClose}
          />
          
          {/* Login Modal */}
          <div className="login-modal">
            {/* Close Button */}
            <button 
              onClick={handleClose}
              className="close-btn"
            >
              ×
            </button>
            
            {/* Content */}
            <div className="modal-content">
              {/* Title */}
              <h2 className="modal-title">Đăng nhập</h2>
              <p className="modal-subtitle">
                Vui lòng đăng nhập để hưởng những đặc quyền dành cho thành viên.
              </p>
              
              {/* Features */}
              <div className="features-grid">
                <div className="feature-item">
                  <div className="feature-icon blue">🚚</div>
                  <div className="feature-text">
                    Miễn phí<br />vận chuyển
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon green">🏥</div>
                  <div className="feature-text">
                    Số 1 thuốc<br />kê đơn
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon orange">⏰</div>
                  <div className="feature-text">
                    Giao nhanh<br />trong 1 giờ
                  </div>
                </div>
              </div>
              
              {/* Phone Input */}
              <div className="input-group">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Nhập số điện thoại"
                  className="phone-input"
                />
              </div>
              
              {/* Continue Button */}
              <button
                onClick={handleContinue}
                className="continue-btn"
              >
                Tiếp tục
              </button>
              
              {/* Register Button */}
              <button
                onClick={handleRegister}
                className="register-btn"
              >
                <span>Đăng nhập bằng tài khoản</span>
                <br />
                <span>Định danh điện tử</span>
                <span className="star-icon">⭐</span>
              </button>
              
              {/* Divider */}
              <div className="divider">
                <span>hoặc đăng nhập bằng</span>
              </div>
              
              {/* Social Login */}
              <div className="social-buttons">
                <button className="social-btn">
                  <div className="social-icon facebook">f</div>
                </button>
                <button className="social-btn">
                  <div className="social-icon google">G</div>
                </button>
                <button className="social-btn">
                  <div className="social-icon apple">🍎</div>
                </button>
                <button className="social-btn">
                  <div className="social-icon other">✓</div>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}