import React from 'react';
import { motion } from 'framer-motion';
import './PortRiskScore.css';

const getStatusColor = (status) => {
  switch (status) {
    case 'excellent': return '#10B981';
    case 'good': return '#3B82F6';
    case 'moderate': return '#F59E0B';
    case 'high': return '#EF4444';
    case 'critical': return '#DC2626';
    default: return '#6B7280';
  }
};

const getStatusBg = (status) => {
  switch (status) {
    case 'excellent': return 'rgba(16, 185, 129, 0.1)';
    case 'good': return 'rgba(59, 130, 246, 0.1)';
    case 'moderate': return 'rgba(245, 158, 11, 0.1)';
    case 'high': return 'rgba(239, 68, 68, 0.1)';
    case 'critical': return 'rgba(220, 38, 38, 0.1)';
    default: return 'rgba(107, 114, 128, 0.1)';
  }
};

const PortRiskScore = ({ score, status, isLoading = false }) => {
  const statusColor = getStatusColor(status);
  const statusBg = getStatusBg(status);
  
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;

  const Skeleton = () => (
    <div className="port-risk-score-skeleton">
      <div className="port-risk-score-skeleton-circle"></div>
      <div className="port-risk-score-skeleton-status"></div>
      <div className="port-risk-score-skeleton-label"></div>
    </div>
  );

  if (isLoading) {
    return <Skeleton />;
  }

  return (
    <motion.div 
      className="port-risk-score-container"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="port-risk-score-circle">
        {/* Background Circle */}
        <svg width="120" height="120" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="var(--glass-border)"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={statusColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
          />
        </svg>
        
        {/* Score Text */}
        <div className="port-risk-score-value" style={{ color: statusColor }}>
          {score}
        </div>
      </div>

      <div className="port-risk-score-status" style={{ backgroundColor: statusBg, color: statusColor }}>
        {status}
      </div>

      <p className="port-risk-score-label">
        Security Status
      </p>
    </motion.div>
  );
};

export default PortRiskScore;
