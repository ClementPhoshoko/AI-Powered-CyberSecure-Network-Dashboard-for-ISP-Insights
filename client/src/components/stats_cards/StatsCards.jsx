import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import './StatsCards.css';

function getLatencyStatus(ms) {
  if (ms == null || !Number.isFinite(ms)) return { label: '--', color: 'var(--text-muted)' };
  if (ms < 30) return { label: 'Excellent', color: '#10B981' };
  if (ms < 60) return { label: 'Good', color: '#3B82F6' };
  if (ms < 100) return { label: 'Fair', color: '#F59E0B' };
  return { label: 'Poor', color: '#EF4444' };
}

function getJitterStatus(ms) {
  if (ms == null || !Number.isFinite(ms)) return { label: '--', color: 'var(--text-muted)' };
  if (ms < 10) return { label: 'Excellent', color: '#10B981' };
  if (ms < 20) return { label: 'Good', color: '#3B82F6' };
  if (ms < 30) return { label: 'Fair', color: '#F59E0B' };
  return { label: 'Poor', color: '#EF4444' };
}

function getPacketLossStatus(pct) {
  if (pct == null || !Number.isFinite(pct)) return { label: '--', color: 'var(--text-muted)' };
  if (pct === 0) return { label: 'Excellent', color: '#10B981' };
  if (pct < 1) return { label: 'Good', color: '#3B82F6' };
  if (pct < 3) return { label: 'Fair', color: '#F59E0B' };
  return { label: 'Poor', color: '#EF4444' };
}

function getScoreStatus(score) {
  if (score == null || !Number.isFinite(score)) return { label: '--', color: 'var(--text-muted)' };
  if (score >= 90) return { label: 'Excellent', color: '#10B981' };
  if (score >= 70) return { label: 'Good', color: '#3B82F6' };
  if (score >= 50) return { label: 'Fair', color: '#F59E0B' };
  return { label: 'Poor', color: '#EF4444' };
}

function getSpeedStatus(mbps) {
  if (mbps == null || !Number.isFinite(mbps)) return { label: '--', color: 'var(--text-muted)' };
  if (mbps > 100) return { label: 'Excellent', color: '#10B981' };
  if (mbps > 50) return { label: 'Good', color: '#3B82F6' };
  if (mbps > 10) return { label: 'Fair', color: '#F59E0B' };
  return { label: 'Poor', color: '#EF4444' };
}

function formatMetricValue(value, unit) {
  if (value == null || !Number.isFinite(value)) return '--';
  if (unit === 'Mbps') return value.toFixed(2);
  if (unit === 'ms' || unit === '%') return value.toFixed(0);
  return String(value);
}

const StatsCards = ({ testResult, isLoading = false }) => {
  const { t } = useTranslation();

  const dlStatus = getSpeedStatus(testResult?.download_speed_mbps);
  const ulStatus = getSpeedStatus(testResult?.upload_speed_mbps);
  const pingStatus = getLatencyStatus(testResult?.ping_avg_ms);
  const jitterStatus = getJitterStatus(testResult?.jitter_ms);
  const plStatus = getPacketLossStatus(testResult?.packet_loss_percent);
  const healthStatus = getScoreStatus(testResult?.network_health_score);
  const gamingStatus = getScoreStatus(testResult?.gaming_score);
  const streamingStatus = getScoreStatus(testResult?.streaming_score);
  const videoCallStatus = getScoreStatus(testResult?.video_call_score);
  const browsingStatus = getScoreStatus(testResult?.browsing_score);
  const stabilityStatus = testResult?.was_unstable
    ? { label: 'Unstable', color: '#F59E0B' }
    : { label: 'Stable', color: '#10B981' };

  const speedCards = [
    {
      label: t('statsCards.download'),
      value: testResult?.download_speed_mbps,
      unit: 'Mbps',
      color: 'var(--download)',
      status: dlStatus,
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
      status: ulStatus,
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
      label: t('statsCards.appLatency'),
      value: testResult?.ping_avg_ms,
      unit: 'ms',
      color: 'var(--ping)',
      status: pingStatus,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="6"/>
          <circle cx="12" cy="12" r="2"/>
        </svg>
      )
    },
    {
      label: t('statsCards.latencyVariation'),
      value: testResult?.jitter_ms,
      unit: 'ms',
      color: 'var(--jitter)',
      status: jitterStatus,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3v18h18"/>
          <path d="M7 12l3-3 2 4 2-2 2 3"/>
        </svg>
      )
    },
    {
      label: t('statsCards.failedRequests'),
      value: testResult?.packet_loss_percent,
      unit: '%',
      color: 'var(--text-muted)',
      status: plStatus,
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
      unit: '',
      color: 'var(--primary)',
      status: healthStatus,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      )
    },
    {
      label: t('statsCards.gaming'),
      value: testResult?.gaming_score,
      unit: '',
      color: '#F59E0B',
      status: gamingStatus,
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
      unit: '',
      color: '#10B981',
      status: streamingStatus,
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
      unit: '',
      color: '#3B82F6',
      status: videoCallStatus,
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
      unit: '',
      color: '#8B5CF6',
      status: browsingStatus,
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
      value: null,
      unit: '',
      color: testResult?.was_unstable ? '#F59E0B' : '#10B981',
      status: stabilityStatus,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      )
    }
  ];

  const compactCards = [...latencyCards, ...qualityCards];

  // ----- Skeleton -----

  const SkeletonCompactCard = () => (
    <div className="compact-card">
      <div className="skeleton compact-card-icon-skeleton"></div>
      <div className="compact-card-body">
        <div className="skeleton compact-card-title-skeleton"></div>
        <div className="skeleton compact-card-subtitle-skeleton"></div>
      </div>
      <div className="skeleton compact-card-value-skeleton"></div>
    </div>
  );

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
          <span className="stats-note-text">{t('statsCards.latencyNoteText')}</span>
          <span className="stats-note-subtle">{t('statsCards.latencyNoteSubtle')}</span>
        </div>
        {/* Mobile skeleton */}
        <div className="compact-cards" aria-label="Network metrics">
          {[0,1,2,3,4,5,6,7,8].map((i) => (<SkeletonCompactCard key={i} />))}
        </div>
        {/* Desktop skeletons */}
        <div className="speed-cards">
          {[0, 1].map((i) => (<SkeletonSpeedCard key={i} />))}
        </div>
        <ul className="latency-cards" aria-label="Network metrics">
          {[0, 1, 2].map((i) => (<SkeletonLatencyCard key={`latency-${i}`} />))}
          {[0, 1, 2, 3, 4, 5].map((i) => (<SkeletonQualityCard key={`quality-${i}`} />))}
        </ul>
      </div>
    );
  }

  const renderCompactCard = (card, index) => (
    <motion.div
      key={card.label}
      className="compact-card"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 + index * 0.04, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="compact-card-icon" style={{ color: card.color }}>
        {card.icon}
      </div>
      <div className="compact-card-body">
        <div className="compact-card-title">{card.label}</div>
        {card.type !== 'stability' && (
          <div className="compact-card-status" style={{ color: card.status?.color }}>
            {card.status?.label || '--'}
          </div>
        )}
      </div>
      <div className="compact-card-metric">
        {card.type === 'stability' ? (
          <span className="compact-card-value" style={{ fontSize: 14, color: card.status?.color }}>
            {card.wasUnstable ? 'Unstable' : 'Stable'}
          </span>
        ) : (
          <>
            <span className="compact-card-value">
              {formatMetricValue(card.value, card.unit)}
            </span>
            {card.unit && <span className="compact-card-unit">{card.unit}</span>}
          </>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="stats-container">
      <div className="stats-note">
        <span className="stats-note-label">{t('statsCards.howLatencyMeasured')}</span>
        <span className="stats-note-text">{t('statsCards.latencyNoteText')}</span>
        <span className="stats-note-subtle">{t('statsCards.latencyNoteSubtle')}</span>
      </div>

      {/* Mobile compact list */}
      <div className="compact-cards" aria-label="Network metrics">
        {speedCards.map((card, i) => renderCompactCard(card, i))}
        {compactCards.map((card, i) => renderCompactCard(card, i + speedCards.length))}
      </div>

      {/* Desktop speed cards */}
      <div className="speed-cards">
        {speedCards.map((card, index) => (
          <motion.div key={card.label} className="speed-card" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: index * 0.1 }}>
            <div className="speed-card-icon" style={{ color: card.color }}>{card.icon}</div>
            <div className="speed-card-value">
              <span className="value-number">{card.value?.toFixed(2) || '0.00'}</span>
              <span className="value-unit">{card.unit}</span>
            </div>
            <div className="speed-card-label">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Desktop latency + quality cards */}
      <ul className="latency-cards" aria-label="Network metrics">
        {latencyCards.map((card, index) => (
          <motion.li key={card.label} className="latency-card" style={{ borderLeftColor: card.color }}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}>
            <div className="latency-card-icon" style={{ color: card.color }}>{card.icon}</div>
            <div className="latency-card-content">
              <div className="latency-card-label">{card.label}</div>
              <div className="latency-card-value" style={{ color: card.color }}>{card.value?.toFixed(2) || '0.00'} {card.unit}</div>
            </div>
          </motion.li>
        ))}
        {qualityCards.map((card, index) => (
          <motion.li key={card.label} className="quality-card" style={{ borderLeftColor: card.color }}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}>
            <div className="quality-card-icon" style={{ color: card.color }}>{card.icon}</div>
            <div className="quality-card-content">
              <div className="quality-card-label">{card.label}</div>
              {card.type === 'stability' ? (
                <div className="stability-indicator">
                  <span className="stability-badge" style={{ color: card.color, borderColor: card.color }}>
                    {card.wasUnstable ? t('statsCards.unstable') : t('statsCards.stable')}
                  </span>
                </div>
              ) : (
                <div className="quality-card-circles" aria-label={`${card.label}: ${card.value || 0}/100`}>
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="quality-card-circle" style={{ backgroundColor: i < Math.round((card.value || 0) / 25) ? card.color : 'var(--glass-bg-soft)' }} />
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
