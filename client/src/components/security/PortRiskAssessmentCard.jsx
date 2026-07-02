import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PortRiskScore from './PortRiskScore';
import PortScanResults from './PortScanResults';
import SecurityRecommendations from './SecurityRecommendations';
import AISecuritySummary from './AISecuritySummary';
import './PortRiskAssessmentCard.css';

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

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const PortRiskAssessmentCard = ({ assessment, isExpanded: initialExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  return (
    <motion.div 
      className="glass-card"
      style={{ overflow: 'hidden' }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div 
        style={{ 
          padding: 'var(--space-5)', 
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-4)'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flex: 1 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '1.5rem', 
              fontWeight: 700, 
              color: getStatusColor(assessment.security_status) 
            }}>
              {assessment.overall_risk_score}
            </div>
            <div style={{ 
              fontSize: '0.75rem', 
              textTransform: 'uppercase', 
              fontWeight: 600,
              color: getStatusColor(assessment.security_status)
            }}>
              {assessment.security_status}
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              {formatDate(assessment.created_at)}
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)', fontSize: '0.875rem' }}>
              <span style={{ color: '#EF4444' }}>
                {assessment.open_ports_count} Open
              </span>
              <span style={{ color: '#10B981' }}>
                {assessment.closed_ports_count} Closed
              </span>
              <span style={{ color: '#F59E0B' }}>
                {assessment.filtered_ports_count} Filtered
              </span>
            </div>
          </div>
        </div>

        <div style={{ 
          transition: 'transform 0.3s ease',
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {isExpanded && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{ borderTop: '1px solid var(--glass-border)' }}
        >
          <div style={{ padding: 'var(--space-5)', display: 'grid', gap: 'var(--space-5)' }}>
            <PortRiskScore 
              score={assessment.overall_risk_score} 
              status={assessment.security_status} 
            />
            <PortScanResults scanResults={assessment.port_scan_results} />
            <SecurityRecommendations recommendations={assessment.security_recommendations} />
            <AISecuritySummary summary={assessment.ai_security_summary} />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default PortRiskAssessmentCard;
