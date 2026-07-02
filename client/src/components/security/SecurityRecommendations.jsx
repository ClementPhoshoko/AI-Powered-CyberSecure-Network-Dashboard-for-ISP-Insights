import React from 'react';
import { motion } from 'framer-motion';
import './SecurityRecommendations.css';

const SecurityRecommendations = ({ isLoading = false }) => {
  const Skeleton = () => (
    <div className="recommendations-skeleton">
      <div className="recommendations-skeleton-title"></div>
      <div className="recommendations-skeleton-item"></div>
      <div className="recommendations-skeleton-item"></div>
      <div className="recommendations-skeleton-item"></div>
    </div>
  );

  if (isLoading) {
    return <Skeleton />;
  }

  const checklistItems = [
    { id: 1, text: 'Firewall detected and active', checked: true },
    { id: 2, text: 'No critical exposed services', checked: true },
    { id: 3, text: 'Network exposure appears minimal', checked: true },
    { id: 4, text: 'Continue monitoring network traffic', checked: true },
    { id: 5, text: 'Review firewall rules regularly', checked: false },
    { id: 6, text: 'Disable unused services periodically', checked: false },
  ];

  return (
    <motion.div 
      className="recommendations-container"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <h3 className="recommendations-title">Security Checklist</h3>
      <div className="recommendations-list">
        {checklistItems.map((item, index) => (
          <motion.div 
            key={item.id}
            className={`recommendation-item ${item.checked ? 'checked' : ''}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
          >
            <div className="recommendation-check">
              {item.checked ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <div className="recommendation-check-empty"></div>
              )}
            </div>
            <span className="recommendation-text">{item.text}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default SecurityRecommendations;
