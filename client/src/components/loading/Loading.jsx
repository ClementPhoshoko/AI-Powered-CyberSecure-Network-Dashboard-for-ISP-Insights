import React from 'react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import './Loading.css';

const Loading = ({ 
  isLoading,
  progress = 0, 
  message, 
  status,
  indeterminate = false 
}) => {
  const { t } = useTranslation();
  const totalSquares = 12;
  const filledSquares = Math.floor((progress / 100) * totalSquares);
  const displayMessage = message || t('loading.initializing');
  const displayStatus = status || t('loading.systemStatus');

  if (!isLoading) return null;

  const content = (
    <div className="gl-loading-overlay">
      <div className="gl-loading-card">
        <div className="gl-loading-header">
          <div className="gl-loading-title-group">
            <span className="gl-loading-message">{displayMessage}</span>
            <div className="gl-loading-dots">
              <span>.</span><span>.</span><span>.</span>
            </div>
          </div>
          {!indeterminate && (
            <span className="gl-loading-percent">{Math.round(progress)}%</span>
          )}
        </div>
        
        <div className={`gl-loading-bar-container ${indeterminate ? 'is-indeterminate' : ''}`}>
          <div className="gl-loading-track">
            {[...Array(totalSquares)].map((_, i) => (
              <div 
                key={i} 
                className={`gl-loading-square ${!indeterminate && i < filledSquares ? 'is-filled' : ''}`}
                style={{ '--index': i }}
              />
            ))}
          </div>
          
          {/* Scanning light effect */}
          <div className="gl-loading-scan-line" />
        </div>
        
        <div className="gl-loading-footer">
          <span className="gl-loading-status">{displayStatus}</span>
          <div className="gl-loading-pulse-dot" />
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default Loading;
