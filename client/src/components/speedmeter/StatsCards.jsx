import React from 'react';
import { motion } from 'framer-motion';
import './StatsCards.css';

const StatsCards = ({ testResult }) => {
  const speedCards = [
    {
      label: 'Download',
      value: testResult?.download_speed_mbps,
      unit: 'Mbps',
      color: 'var(--download)',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      )
    },
    {
      label: 'Upload',
      value: testResult?.upload_speed_mbps,
      unit: 'Mbps',
      color: 'var(--upload)',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" />
          <polyline points="17 10 12 5 7 10" />
          <line x1="12" y1="5" x2="12" y2="15" />
        </svg>
      )
    }
  ];

  const latencyCards = [
    { label: 'Ping', value: testResult?.ping_avg_ms, unit: 'ms', color: 'var(--ping)' },
    { label: 'Jitter', value: testResult?.jitter_ms, unit: 'ms', color: 'var(--jitter)' },
    { label: 'Packet Loss', value: testResult?.packet_loss_percent, unit: '%', color: 'var(--text-muted)' }
  ];

  const qualityCards = [
    { label: 'Network Health', value: testResult?.network_health_score, color: 'var(--primary)' },
    { label: 'Gaming', value: testResult?.gaming_score, color: '#F59E0B' },
    { label: 'Streaming', value: testResult?.streaming_score, color: '#10B981' },
    { label: 'Video Calls', value: testResult?.video_call_score, color: '#3B82F6' },
    { label: 'Browsing', value: testResult?.browsing_score, color: '#8B5CF6' }
  ];

  return (
    <div className="stats-container">
      {/* Speed Cards */}
      <div className="speed-cards">
        {speedCards.map((card, index) => (
          <motion.div
            key={card.label}
            className="speed-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <div className="speed-card-icon" style={{ color: card.color }}>
              {card.icon}
            </div>
            <div className="speed-card-value">
              <span className="value-number">{card.value?.toFixed(2) || '0.00'}</span>
              <span className="value-unit">{card.unit}</span>
            </div>
            <div className="speed-card-label">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Latency Cards */}
      <div className="latency-cards">
        {latencyCards.map((card, index) => (
          <motion.div
            key={card.label}
            className="latency-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
          >
            <div className="latency-card-label">{card.label}</div>
            <div className="latency-card-value" style={{ color: card.color }}>
              {card.value?.toFixed(2) || '0.00'} {card.unit}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quality Score Cards */}
      <div className="quality-cards">
        {qualityCards.map((card, index) => (
          <motion.div
            key={card.label}
            className="quality-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
          >
            <div className="quality-card-header">
              <span className="quality-card-label">{card.label}</span>
              <span className="quality-card-value" style={{ color: card.color }}>
                {card.value || 0}/100
              </span>
            </div>
            <div className="quality-card-bar">
              <div
                className="quality-card-fill"
                style={{
                  width: `${Math.min(card.value || 0, 100)}%`,
                  backgroundColor: card.color
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default StatsCards;
