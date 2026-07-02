import React from 'react';
import { motion } from 'framer-motion';
import './PortScanResults.css';

const getStateColor = (state) => {
  switch (state) {
    case 'open': return '#EF4444';
    case 'closed': return '#10B981';
    case 'filtered': return '#F59E0B';
    default: return '#6B7280';
  }
};

const getRiskColor = (riskLevel) => {
  switch (riskLevel) {
    case 'critical': return '#DC2626';
    case 'high': return '#EF4444';
    case 'medium': return '#F59E0B';
    case 'low': return '#10B981';
    default: return '#6B7280';
  }
};

const PortScanResults = ({ scanResults, isLoading = false }) => {
  const Skeleton = () => (
    <div className="port-scan-results-skeleton">
      <div className="port-scan-results-skeleton-title"></div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="port-scan-results-skeleton-item">
          <div className="port-scan-results-skeleton-badge"></div>
          <div className="port-scan-results-skeleton-info">
            <div className="port-scan-results-skeleton-service"></div>
            <div className="port-scan-results-skeleton-status"></div>
          </div>
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return <Skeleton />;
  }

  const openPorts = scanResults?.filter(r => r.port_state === 'open') || [];
  const closedPorts = scanResults?.filter(r => r.port_state === 'closed') || [];
  const filteredPorts = scanResults?.filter(r => r.port_state === 'filtered') || [];

  return (
    <motion.div 
      className="port-scan-results-container"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <h3 className="port-scan-results-title">
        Port Scan Results
      </h3>
      
      <div className="port-scan-summary">
        <div className="port-scan-summary-item">
          <span className="port-scan-summary-value" style={{ color: '#EF4444' }}>{openPorts.length}</span>
          <span className="port-scan-summary-label">Open</span>
        </div>
        <div className="port-scan-summary-item">
          <span className="port-scan-summary-value" style={{ color: '#10B981' }}>{closedPorts.length}</span>
          <span className="port-scan-summary-label">Closed</span>
        </div>
        <div className="port-scan-summary-item">
          <span className="port-scan-summary-value" style={{ color: '#F59E0B' }}>{filteredPorts.length}</span>
          <span className="port-scan-summary-label">Filtered</span>
        </div>
      </div>

      <div className="port-scan-list">
        {scanResults?.sort((a, b) => a.port_number - b.port_number).map((port, index) => (
          <motion.div 
            key={port.port_number}
            className="port-scan-item"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
          >
            <div 
              className="port-scan-port-badge"
              style={{
                backgroundColor: `${getStateColor(port.port_state)}15`,
                color: getStateColor(port.port_state)
              }}
            >
              {port.port_number}
            </div>

            <div className="port-scan-info">
              <div className="port-scan-header">
                <span className="port-scan-service">
                  {port.service_name || 'Unknown Service'}
                </span>
                {port.risk_level && (
                  <span 
                    className="port-scan-risk-badge"
                    style={{
                      backgroundColor: `${getRiskColor(port.risk_level)}15`,
                      color: getRiskColor(port.risk_level)
                    }}
                  >
                    {port.risk_level}
                  </span>
                )}
              </div>
              <div className="port-scan-status">
                {port.port_state === 'open' && '⚠️ This port is open and exposed'}
                {port.port_state === 'closed' && '✓ This port is closed and secure'}
                {port.port_state === 'filtered' && '◐ This port is filtered by a firewall'}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default PortScanResults;
