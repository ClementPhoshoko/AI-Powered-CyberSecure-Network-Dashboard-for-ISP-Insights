import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './NoticeModal.css';

const NoticeModal = ({ 
  isOpen, 
  title, 
  data, 
  onClose 
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

  const renderData = (data) => {
    if (typeof data === 'string') {
      return <p className="notice-modal-text">{data}</p>;
    }
    if (typeof data === 'object' && data !== null) {
      return (
        <pre className="notice-modal-json">{JSON.stringify(data, null, 2)}</pre>
      );
    }
    return null;
  };

  const content = (
    <div className="notice-modal-overlay" onClick={onClose}>
      <div className="notice-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="notice-modal-header">
          <h3 className="notice-modal-title">{title}</h3>
          <button className="notice-modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="notice-modal-body">
          {renderData(data)}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default NoticeModal;