import React from 'react';
import './FooterSkeleton.css';

const FooterSkeleton = () => {
  return (
    <div className="footer-skeleton">
      <div className="footer-skeleton-form">
        <div className="footer-skeleton-line footer-skeleton-label"></div>
        <div className="footer-skeleton-line footer-skeleton-note"></div>
        <div className="footer-skeleton-line footer-skeleton-button"></div>
      </div>
      <div className="footer-skeleton-apps">
        <div className="footer-skeleton-line footer-skeleton-apps-text"></div>
        <div className="footer-skeleton-line footer-skeleton-apps-subtitle"></div>
        <div className="footer-skeleton-apps-links">
          <div className="footer-skeleton-line footer-skeleton-link"></div>
          <div className="footer-skeleton-line footer-skeleton-divider"></div>
          <div className="footer-skeleton-line footer-skeleton-link"></div>
        </div>
      </div>
    </div>
  );
};

export default FooterSkeleton;
