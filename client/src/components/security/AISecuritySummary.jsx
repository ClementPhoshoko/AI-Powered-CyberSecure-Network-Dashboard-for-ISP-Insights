import React from 'react';
import { motion } from 'framer-motion';
import aiIcon from '../../assets/avatars/ai.png';
import './AISecuritySummary.css';

const AISecuritySummary = ({ summary, isLoading = false }) => {
  const Skeleton = () => (
    <div className="ai-security-summary-skeleton">
      <div className="ai-security-summary-skeleton-header">
        <div className="security-skeleton ai-security-summary-skeleton-avatar"></div>
        <div className="ai-security-summary-skeleton-title-block">
          <div className="security-skeleton ai-security-summary-skeleton-title"></div>
          <div className="security-skeleton ai-security-summary-skeleton-subtitle"></div>
        </div>
      </div>
      <div className="security-skeleton ai-security-summary-skeleton-content"></div>
    </div>
  );

  if (isLoading) {
    return <Skeleton />;
  }

  return (
    <motion.div 
      className="ai-security-summary-container"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
    >
      <div className="ai-security-summary-header">
        <img src={aiIcon} alt="AI" className="ai-security-summary-avatar" />
        <div className="ai-security-summary-title-block">
          <h3 className="ai-security-summary-title">
            AI Security Summary
          </h3>
          <span className="ai-security-summary-subtitle">
            Powered by Gemini
          </span>
        </div>
      </div>

      <div className="ai-security-summary-content">
        <p className="ai-security-summary-text">
          {summary || "Run a port scan to get AI-powered security insights for your network."}
        </p>
      </div>
    </motion.div>
  );
};

export default AISecuritySummary;
