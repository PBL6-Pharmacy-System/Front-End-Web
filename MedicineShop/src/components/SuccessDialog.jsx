import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './SuccessDialog.css';

export default function SuccessDialog({ isOpen, onClose, message, title = 'Thành công!' }) {
  useEffect(() => {
    if (isOpen) {
      // Auto close after 2 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="success-dialog-overlay">
      <div className="success-dialog-container">
        <div className="success-dialog-icon">
          <svg className="success-checkmark" viewBox="0 0 52 52">
            <circle className="success-checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
            <path className="success-checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
          </svg>
        </div>
        <h3 className="success-dialog-title">{title}</h3>
        <p className="success-dialog-message">{message}</p>
      </div>
    </div>,
    document.body
  );
}
