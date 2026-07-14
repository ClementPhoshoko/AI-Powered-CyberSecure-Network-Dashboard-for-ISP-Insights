import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import './StatsCards.css';

const StatsCards = ({ testResult, isLoading = false }) => {
  const { t } = useTranslation();
  const measurementContext = testResult?.measurement_context || {};
  const latencyLabel = t('statsCards.appLatency');
  const jitterLabel = t('statsCards.latencyVariation');
  const packetLossLabel = t('statsCards.failedRequests');

  const speedCards = [
    {
      label: t('statsCards.download'),
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
      label: t('statsCards.upload'),
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
    { 
      label: latencyLabel, 
      value: testResult?.ping_avg_ms, 
      unit: 'ms', 
      color: 'var(--ping)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="6"/>
          <circle cx="12" cy="12" r="2"/>
        </svg>
      )
    },
    { 
      label: jitterLabel, 
      value: testResult?.jitter_ms, 
      unit: 'ms', 
      color: 'var(--jitter)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3v18h18"/>
          <path d="M7 12l3-3 2 4 2-2 2 3"/>
        </svg>
      )
    },
    { 
      label: packetLossLabel, 
      value: testResult?.packet_loss_percent, 
      unit: '%', 
      color: 'var(--text-muted)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
      )
    }
  ];

  const qualityCards = [
    { 
      label: t('statsCards.networkHealth'), 
      value: testResult?.network_health_score, 
      color: 'var(--primary)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      )
    },
    { 
      label: t('statsCards.gaming'), 
      value: testResult?.gaming_score, 
      color: '#F59E0B',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="6" width="20" height="12" rx="2"/>
          <path d="M6 12h.01M10 12h4"/>
          <circle cx="18" cy="12" r="1"/>
        </svg>
      )
    },
    { 
      label: t('statsCards.streaming'), 
      value: testResult?.streaming_score, 
      color: '#10B981',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="23 7 16 12 23 17 23 7"/>
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
        </svg>
      )
    },
    { 
      label: t('statsCards.videoCalls'), 
      value: testResult?.video_call_score, 
      color: '#3B82F6',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M23 7l-7 5 7 5V7z"/>
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
        </svg>
      )
    },
    { 
      label: t('statsCards.browsing'), 
      value: testResult?.browsing_score, 
      color: '#8B5CF6',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      )
    },
    {
      type: 'stability',
      label: t('statsCards.connectionStability'),
      wasUnstable: testResult?.was_unstable,
      color: testResult?.was_unstable ? '#F59E0B' : '#10B981',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      )
    }
  ];

  const SkeletonSpeedCard = () => (
    <div className="speed-card">
      <div className="skeleton speed-card-icon"></div>
      <div className="skeleton value-number"></div>
      <div className="skeleton speed-card-label"></div>
    </div>
  );

  const SkeletonLatencyCard = () => (
    <li className="latency-card">
      <div className="skeleton latency-card-icon"></div>
      <div className="latency-card-content">
        <div className="skeleton latency-card-label"></div>
        <div className="skeleton latency-card-value"></div>
      </div>
    </li>
  );

  const SkeletonQualityCard = () => (
    <li className="quality-card">
      <div className="skeleton quality-card-icon"></div>
      <div className="quality-card-content">
        <div className="skeleton quality-card-label"></div>
        <div className="quality-card-circles">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton quality-card-circle"></div>
          ))}
        </div>
      </div>
    </li>
  );

  if (isLoading) {
    return (
      <div className="stats-container">
        <div className="stats-note">
          <span className="stats-note-label">{t('statsCards.howLatencyMeasured')}</span>
          <span className="stats-note-text">
            {t('statsCards.latencyNoteText')}
          </span>
          <span className="stats-note-subtle">
            {t('statsCards.latencyNoteSubtle')}
          </span>
        </div>

        {/* Speed Cards Skeletons */}
        <div className="speed-cards">
          {[0, 1].map((i) => (
            <SkeletonSpeedCard key={i} />
          ))}
        </div>

        {/* Latency & Quality Cards Skeletons */}
        <ul className="latency-cards" aria-label="Network metrics">
          {[0, 1, 2].map((i) => (
            <SkeletonLatencyCard key={`latency-${i}`} />
          ))}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <SkeletonQualityCard key={`quality-${i}`} />
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="stats-container">
      <div className="stats-note">
        <span className="stats-note-label">{t('statsCards.howLatencyMeasured')}</span>
        <span className="stats-note-text">
          {t('statsCards.latencyNoteText')}
        </span>
        <span className="stats-note-subtle">
          {t('statsCards.latencyNoteSubtle')}
        </span>
      </div>

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

      {/* Combined Latency & Quality Cards */}
      <ul className="latency-cards" aria-label="Network metrics">
        {/* Latency Cards */}
        {latencyCards.map((card, index) => (
          <motion.li
            key={card.label}
            className="latency-card"
            style={{ borderLeftColor: card.color }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
          >
            <div className="latency-card-icon" style={{ color: card.color }}>
              {card.icon}
            </div>
            <div className="latency-card-content">
              <div className="latency-card-label">{card.label}</div>
              <div className="latency-card-value" style={{ color: card.color }}>
                {card.value?.toFixed(2) || '0.00'} {card.unit}
              </div>
            </div>
          </motion.li>
        ))}

        {/* Quality Cards */}
        {qualityCards.map((card, index) => (
          <motion.li
            key={card.label}
            className="quality-card"
            style={{ borderLeftColor: card.color }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
          >
            <div className="quality-card-icon" style={{ color: card.color }}>
              {card.icon}
            </div>
            <div className="quality-card-content">
              <div className="quality-card-label">{card.label}</div>
              {card.type === 'stability' ? (
                <div className="stability-indicator">
                  <span
                    className="stability-badge"
                    style={{ color: card.color, borderColor: card.color }}
                  >
                    {card.wasUnstable ? t('statsCards.unstable') : t('statsCards.stable')}
                  </span>
                </div>
              ) : (
                <div className="quality-card-circles" aria-label={`${card.label}: ${card.value || 0}/100`}>
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="quality-card-circle"
                      style={{
                        backgroundColor: i < Math.round((card.value || 0) / 25) ? card.color : 'var(--glass-bg-soft)',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.li>
        ))}
      </ul>


    </div>
  );
};

export default StatsCards;
