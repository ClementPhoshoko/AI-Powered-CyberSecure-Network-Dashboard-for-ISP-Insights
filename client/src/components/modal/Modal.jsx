import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

const Modal = ({ 
  isOpen, 
  message, 
  leftOption, 
  rightOption 
}) => {
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
    <div className={`gl-modal-overlay ${!isOpen ? 'closing' : ''}`}>
      <div className={`gl-modal-card ${!isOpen ? 'closing' : ''}`}>
        <p className="gl-modal-message">{message}</p>
        <div className="gl-modal-buttons">
          {leftOption && (
            <button 
              className="gl-modal-btn gl-modal-btn-left"
              onClick={leftOption.onClick}
            >
              {leftOption.icon}
              <span>{leftOption.label}</span>
            </button>
          )}
          {rightOption && (
            <button 
              className="gl-modal-btn gl-modal-btn-right"
              onClick={rightOption.onClick}
            >
              {rightOption.icon}
              <span>{rightOption.label}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default Modal;
