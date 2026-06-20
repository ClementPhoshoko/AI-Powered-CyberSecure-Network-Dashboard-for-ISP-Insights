import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import './ErrorModal.css';

const ErrorModal = ({ isOpen, message, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen && !isVisible) return null;

  const content = (
    <div className={`er-modal-overlay ${!isOpen ? 'closing' : ''}`}>
      <div className={`er-modal-card ${!isOpen ? 'closing' : ''}`}>
        <button className="er-modal-close-btn" onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
        <div className="er-modal-content">
          <div className="er-modal-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <p className="er-modal-message">{message}</p>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default ErrorModal;
