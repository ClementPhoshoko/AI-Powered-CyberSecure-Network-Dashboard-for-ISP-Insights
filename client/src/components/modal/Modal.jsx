import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

const Modal = ({ 
  isOpen, 
  message, 
  leftOption, 
  rightOption 
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const content = (
    <div className="gl-modal-overlay">
      <div className="gl-modal-card">
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
