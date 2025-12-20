import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './LoginModal.css';
import { requestOTP, loginWithEmailOTP} from '../services/authApi';
import SuccessDialog from './SuccessDialog';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [step, setStep] = useState('input'); // 'input' or 'otp'
  const [otpSentTo, setOtpSentTo] = useState(''); // Store where OTP was sent
  const [isLoading, setIsLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const otpInputRefs = [0, 1, 2, 3, 4, 5].map(() => React.useRef(null));

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

  // OTP Timer
  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Reset form when login method changes
  useEffect(() => {
    setError('');
    setStep('input');
    setOtp(['', '', '', '', '', '']);
    setOtpTimer(0);
  }, [loginMethod]);

  if (!isOpen) return null;

  // Validate email
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // // Validate phone number
  // const validatePhone = (phone) => {
  //   // Vietnamese phone number format: 10 digits starting with 0
  //   return /^0\d{9}$/.test(phone.replace(/\s/g, ''));
  // };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (error) setError('');
  };

  // const handlePhoneChange = (e) => {
  //   const value = e.target.value;
  //   // Allow only numbers
  //   const numericValue = value.replace(/\D/g, '');
  //   setPhone(numericValue);
  //   if (error) setError('');
  // };

  const handleOtpChange = (index, value) => {
    // Allow only numbers
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take last character
    setOtp(newOtp);
    if (error) setError('');
    
    // Auto focus next input
    if (value && index < 5) {
      otpInputRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    pastedData.split('').forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);
    // Focus last filled input or last input
    const lastIndex = Math.min(pastedData.length, 5);
    otpInputRefs[lastIndex].current?.focus();
  };

  const handleContinueEmail = () => {
    if (!email.trim()) {
      setError('Vui lòng nhập email');
      return;
    }
    if (!validateEmail(email)) {
      setError('Email không hợp lệ. Vui lòng nhập đúng định dạng (VD: example@gmail.com)');
      return;
    }
    handleSendOtp('email');
  };

  // const handleContinuePhone = () => {
  //   if (!phone.trim()) {
  //     setError('Vui lòng nhập số điện thoại');
  //     return;
  //   }
  //   if (!validatePhone(phone)) {
  //     setError('Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng (VD: 0912345678)');
  //     return;
  //   }
  //   handleSendOtp('phone');
  // };

  const handleSendOtp = async (method) => {
    setIsLoading(true);
    setError('');
    
    try {
      let result;
      
      if (method === 'email') {
        result = await requestOTP(email, null);
        if (result.success) {
          setOtpSentTo(email);
          setStep('otp');
          setOtpTimer(180); // 3 minutes
          console.log('OTP sent to email:', email);
        } else {
          setError(result.error || 'Không thể gửi OTP. Vui lòng thử lại.');
        }
      } else {
        result = await requestOTP(null, phone);
        if (result.success) {
          setOtpSentTo(phone);
          setStep('otp');
          setOtpTimer(180); // 3 minutes
          console.log('OTP sent to phone:', phone);
        } else {
          setError(result.error || 'Không thể gửi OTP. Vui lòng thử lại.');
        }
      }
    } catch (err) {
      console.error('Send OTP error:', err);
      setError('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length === 0) {
      setError('Vui lòng nhập mã OTP');
      return;
    }
    if (otpString.length !== 6) {
      setError('Mã OTP phải gồm 6 chữ số');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      let result;
      
      if (loginMethod === 'email') {
        // Login with email OTP
        console.log('📧 Logging in with email:', email);
        result = await loginWithEmailOTP(email, otpString);
        console.log('📧 Login result:', result);
      }
      
      if (result.success) {
        console.log('✅ Login successful:', result.data);
        // Show success dialog
        setShowSuccessDialog(true);
        // Call onLoginSuccess callback if provided
        if (onLoginSuccess) {
          setTimeout(() => {
            onLoginSuccess();
          }, 100);
        }
        // Close modal after success dialog
        setTimeout(() => {
          onClose();
          // Reload page to refresh all states
          setTimeout(() => {
            window.location.reload();
          }, 300);
        }, 2200);
      } else {
        console.error('❌ Login failed:', result.error);
        // Provide more specific error messages
        let errorMsg = result.error || 'Mã OTP không đúng hoặc đã hết hạn. Vui lòng thử lại.';
        
        // Check for specific error types
        if (errorMsg.includes('500') || errorMsg.includes('server')) {
          errorMsg = 'Lỗi hệ thống. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.';
        } else if (errorMsg.includes('expired') || errorMsg.includes('hết hạn')) {
          errorMsg = 'Mã OTP đã hết hạn. Vui lòng gửi lại OTP mới.';
        } else if (errorMsg.includes('invalid') || errorMsg.includes('không đúng')) {
          errorMsg = 'Mã OTP không chính xác. Vui lòng kiểm tra lại.';
        }
        
        setError(errorMsg);
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = () => {
    if (loginMethod === 'email') {
      handleSendOtp('email');
    } else {
      handleSendOtp('phone');
    }
  };

  const handleBackToInput = () => {
    setStep('input');
    setOtp(['', '', '', '', '', '']);
    setOtpTimer(0);
    setError('');
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatPhoneForDisplay = (phone) => {
    if (!phone) return '';
    return phone.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
  };

  const formatEmailForDisplay = (email) => {
    if (!email) return '';
    if (email.length <= 10) return email;
    return email.substring(0, 6) + '***' + email.substring(email.lastIndexOf('@'));
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
          {step === 'input' ? (
            <>
              {/* Title */}
              <h2 className="login-modal-title">Đăng nhập tài khoản</h2>
              <p className="login-modal-subtitle">
                Vui lòng chọn phương thức đăng nhập
              </p>
              
              {/* Login Method Tabs */}
              <div className="login-method-tabs">
                <button
                  className={`login-method-tab ${loginMethod === 'email' ? 'active' : ''}`}
                  onClick={() => setLoginMethod('email')}
                >
                  <span className="login-method-icon">📧</span>
                  <span className="login-method-text">Email</span>
                </button>
              </div>

              {/* Icon */}
              <div className="login-phone-icon-wrapper">
                <div className="login-phone-icon">
                  {loginMethod === 'email' ? '📧' : '📱'}
                </div>
              </div>
              
              {/* Email Method */}
              {loginMethod === 'email' && (
                <>
                  <p className="login-method-description">
                    Mã OTP sẽ được gửi đến email của bạn
                  </p>
                  
                  <div className="login-input-group">
                    <div className="login-input-wrapper">
                      <input
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        placeholder="Nhập email"
                        className={`login-phone-input ${error ? 'error' : ''}`}
                        maxLength="50"
                      />
                    </div>
                    {error && <div className="login-error-message">{error}</div>}
                  </div>
                  
                  <button
                    onClick={handleContinueEmail}
                    className="login-continue-btn"
                    disabled={!email.trim() || isLoading}
                  >
                    {isLoading ? 'Đang xử lý...' : 'Tiếp tục'}
                  </button>
                </>
              )}
                
              {/* Terms */}
              <p className="login-terms">
                Bằng việc tiếp tục, bạn đã đồng ý với{' '}
                <a href="#" className="login-terms-link">Điều khoản sử dụng</a>
                {' '}và{' '}
                <a href="#" className="login-terms-link">Chính sách bảo mật</a>
              </p>
            </>
          ) : (
            <>
              {/* OTP Verification Step */}
              <button 
                onClick={handleBackToInput}
                className="login-back-btn"
              >
                Quay lại
              </button>

              <h2 className="login-modal-title">Xác minh OTP</h2>
              <p className="login-modal-subtitle">
                Nhập mã OTP gửi đến
              </p>

              {/* Sent To Display */}
              <div className="login-otp-sent-info">
                {loginMethod === 'email' ? (
                  <p>📧 <strong>{formatEmailForDisplay(otpSentTo)}</strong></p>
                ) : (
                  <p>📱 <strong>{formatPhoneForDisplay(otpSentTo)}</strong></p>
                )}
              </div>

              {/* Icon */}
              <div className="login-phone-icon-wrapper">
                <div className="login-phone-icon">🔐</div>
              </div>

              {/* OTP Input - 6 boxes */}
              <div className="login-input-group">
                <div className="login-otp-boxes">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={otpInputRefs[index]}
                      type="text"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={index === 0 ? handleOtpPaste : undefined}
                      className={`login-otp-box ${error ? 'error' : ''}`}
                      maxLength="1"
                      inputMode="numeric"
                      autoComplete="off"
                    />
                  ))}
                </div>
                {error && <div className="login-error-message">{error}</div>}
              </div>

              {/* OTP Helper Text */}
              <p className="login-helper-text">
                Mã OTP sẽ hết hạn trong <strong>{Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}</strong>
              </p>

              {/* Verify Button */}
              <button
                onClick={handleVerifyOtp}
                className="login-continue-btn"
                disabled={otp.join('').length !== 6 || isLoading || otpTimer === 0}
              >
                {isLoading ? 'Đang xác minh...' : 'Xác minh'}
              </button>

              {/* Resend OTP */}
              <p className="login-resend-text">
                {otpTimer > 0 ? (
                  <>
                    Không nhận được mã? 
                    <span className="login-resend-timer"> ({otpTimer}s)</span>
                  </>
                ) : (
                  <>
                    Không nhận được mã?{' '}
                    <button
                      onClick={handleResendOtp}
                      className="login-resend-btn"
                    >
                      Gửi lại
                    </button>
                  </>
                )}
              </p>

              {/* Back Link */}
              <p className="login-terms">
                Muốn thay đổi phương thức?{' '}
                <button
                  onClick={handleBackToInput}
                  className="login-terms-link"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  Chọn lại
                </button>
              </p>
            </>
          )}
        </div>
      </div>

      {/* Success Dialog */}
      <SuccessDialog 
        isOpen={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        title="Đăng nhập thành công!"
        message="Chào mừng bạn quay trở lại 🎉"
      />
    </div>,
    document.body
  );
}
