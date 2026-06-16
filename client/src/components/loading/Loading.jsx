import React from 'react';
import { createPortal } from 'react-dom';
import './Loading.css';

/**
 * Loading Component
 * A reusable glassmorphism loading bar with dynamic segmented squares.
 * Renders via Portal to ensure full-screen coverage.
 * 
 * @param {boolean} isLoading - Controls visibility of the loading modal.
 * @param {number} progress - 0 to 100 value for determinate progress.
 * @param {string} message - Optional message to display above the bar.
 * @param {string} status - Optional status text for the footer.
 * @param {boolean} indeterminate - If true, ignores progress and shows a continuous loop.
 */
const Loading = ({ 
  isLoading,
  progress = 0, 
  message = 'Initializing System', 
  status = 'GL Web System v1.0',
  indeterminate = false 
}) => {
  const totalSquares = 12;
  const filledSquares = Math.floor((progress / 100) * totalSquares);

  if (!isLoading) return null;

  const content = (
    <div className="gl-loading-overlay">
      <div className="gl-loading-card">
        <div className="gl-loading-header">
          <div className="gl-loading-title-group">
            <span className="gl-loading-message">{message}</span>
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
          <span className="gl-loading-status">{status}</span>
          <div className="gl-loading-pulse-dot" />
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default Loading;
