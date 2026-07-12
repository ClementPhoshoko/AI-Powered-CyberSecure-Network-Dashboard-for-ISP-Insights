import { Fragment, useState, useMemo, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import useSpeedTestHistory from '../../hooks/useSpeedTestHistory';
import { useAuth } from '../../context/AuthContext';
import heroImage from '../../assets/hero/Modern_office_with_data_flow_dynamics.png';
import womanAvatar from '../../assets/avatars/woman_instructor_avatar.png';
import aiIcon from '../../assets/avatars/ai.png';
import notFoundAvatar from '../../assets/avatars/not_found_avatar.png';
import ErrorModal from '../../components/error_modal/ErrorModal';
import Loading from '../../components/loading/Loading';
import './History.css';

function useIsMobile(breakpoint = 768) {
  const mqlRef = useRef(null);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < breakpoint
  );

  useEffect(() => {
    mqlRef.current = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e) => setIsMobile(e.matches);

    mqlRef.current.addEventListener('change', handler);
    return () => mqlRef.current?.removeEventListener('change', handler);
  }, [breakpoint]);

  return isMobile;
}

function useIsTablet(breakpoint = 1024) {
  const mqlRef = useRef(null);
  const [isTablet, setIsTablet] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < breakpoint
  );

  useEffect(() => {
    mqlRef.current = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e) => setIsTablet(e.matches);

    mqlRef.current.addEventListener('change', handler);
    return () => mqlRef.current?.removeEventListener('change', handler);
  }, [breakpoint]);

  return isTablet;
}

function useIsLargeScreen(breakpoint = 1280) {
  const mqlRef = useRef(null);
  const [isLarge, setIsLarge] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= breakpoint
  );

  useEffect(() => {
    mqlRef.current = window.matchMedia(`(min-width: ${breakpoint}px)`);
    const handler = (e) => setIsLarge(e.matches);

    mqlRef.current.addEventListener('change', handler);
    return () => mqlRef.current?.removeEventListener('change', handler);
  }, [breakpoint]);

  return isLarge;
}

const proTips = [
  "For the most accurate results, close background apps and use a wired connection when testing. This helps reduce interference from other applications and provides a more reliable measurement of your network performance.",

  "Run tests at different times of the day to discover how peak usage hours affect your connection. Comparing results across morning, afternoon, and evening periods can reveal congestion patterns.",

  "Compare your latest results with historical trends to identify recurring network issues. Consistent monitoring makes it easier to detect performance changes before they become major problems.",

  "A high download speed doesn't always mean a healthy network—keep an eye on latency, jitter, and packet loss. These metrics often have a greater impact on gaming, streaming, and real-time communication.",

  "Consistent packet loss can impact gaming, video calls, and streaming even when speeds appear fast. Monitoring packet loss trends can help uncover network instability that speed measurements alone may not reveal.",

  "Use your Network Health Score to monitor overall connection quality over time. Tracking score changes can help you quickly identify periods of degraded network performance.",

  "Run a speed test before and after restarting your router to measure any improvements. This simple troubleshooting step can often resolve temporary performance issues and connectivity problems.",

  "Video calls rely heavily on stable latency and low jitter, not just fast internet speeds. Even a high-speed connection can experience poor call quality if latency fluctuates significantly.",

  "Gaming performance is influenced more by ping and packet loss than raw download speed. Monitoring these metrics regularly can help ensure a smoother and more responsive gaming experience.",

  "Compare results across devices to determine whether issues are network-wide or device-specific. Differences between devices can often reveal hardware, software, or Wi-Fi-related problems.",

  "Regular testing helps identify ISP congestion patterns during busy periods. Understanding these trends can help you determine when network performance is typically at its best.",

  "Keep your router firmware updated to improve performance, reliability, and security. Manufacturers frequently release updates that address bugs and optimize network stability.",

  "Position your router centrally and away from interference for better Wi-Fi coverage. Proper placement can significantly improve signal strength and overall network consistency throughout your space.",

  "Monitor upload speeds regularly—cloud backups, video conferencing, and content creation depend on them. Strong upload performance is essential for a smooth and responsive online experience.",

  "Use AkovoLabs AI insights to understand performance trends and detect unusual network behavior. The more historical data you collect, the more valuable and accurate these insights become.",

  "A sudden drop in Network Health Score may indicate congestion, interference, or service issues. Investigating these changes early can help prevent longer-term connectivity problems.",

  "Track gaming, streaming, and video call scores separately to optimize your connection for what matters most. Different online activities rely on different aspects of network performance.",

  "Run tests after changing your ISP plan, router, or network settings to verify improvements. Comparing before-and-after results provides clear evidence of any performance gains.",

  "Frequent testing creates a richer history, allowing AI analysis to provide more accurate recommendations. A larger dataset helps identify trends and anomalies with greater confidence.",

  "Review your historical performance data regularly to spot gradual network degradation before it becomes noticeable. Early detection makes it easier to troubleshoot issues and maintain optimal performance."
];

function SkeletonBlock({ className = '' }) {
  return <div className={`history-skeleton ${className}`.trim()} aria-hidden="true" />;
}

function SummarySkeleton() {
  return (
    <div className="summary-grid" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="summary-mini-card summary-mini-card--skeleton">
          <SkeletonBlock className="history-skeleton--metric-value" />
          <SkeletonBlock className="history-skeleton--metric-label" />
        </div>
      ))}
    </div>
  );
}

function FiltersSkeleton() {
  return (
    <div className="date-filters date-filters--skeleton" aria-hidden="true">
      <div className="date-label-field">
        <SkeletonBlock className="history-skeleton--filter-label" />
        <SkeletonBlock className="history-skeleton--filter-input" />
      </div>
      <div className="date-label-field">
        <SkeletonBlock className="history-skeleton--filter-label" />
        <SkeletonBlock className="history-skeleton--filter-input" />
      </div>
      <SkeletonBlock className="history-skeleton--icon-btn" />
      <SkeletonBlock className="history-skeleton--button" />
    </div>
  );
}

function GraphSkeleton({ showFilters = false, count = 1 }) {
  return (
    <div className="trends-section" aria-hidden="true">
      {showFilters && (
        <div className="trends-header">
          <SkeletonBlock className="history-skeleton--section-title" />
          <FiltersSkeleton />
        </div>
      )}
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="graph-card">
          <SkeletonBlock className="history-skeleton--graph-title" />
          <SkeletonBlock className="history-skeleton--chart" />
          <SkeletonBlock className="history-skeleton--graph-footer" />
        </div>
      ))}
    </div>
  );
}

function InsightsSkeleton() {
  return (
    <div className="ai-insights-section" aria-hidden="true">
      <SkeletonBlock className="history-skeleton--section-title" />
      <div className="ai-insights-grid">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="ai-insight-card">
            <SkeletonBlock className="history-skeleton--avatar" />
            <div className="ai-insight-content">
              <SkeletonBlock className="history-skeleton--insight-title" />
              <SkeletonBlock className="history-skeleton--text-line" />
              <SkeletonBlock className="history-skeleton--text-line history-skeleton--text-line-short" />
            </div>
          </div>
        ))}
      </div>
      <div className="coming-soon-section">
        <SkeletonBlock className="history-skeleton--avatar history-skeleton--avatar-large" />
        <div className="coming-soon-content">
          <SkeletonBlock className="history-skeleton--section-title" />
          <SkeletonBlock className="history-skeleton--text-line" />
          <SkeletonBlock className="history-skeleton--text-line history-skeleton--text-line-short" />
          <SkeletonBlock className="history-skeleton--text-line history-skeleton--text-line-shorter" />
        </div>
      </div>
    </div>
  );
}

function TableSkeleton({ showSummary = false }) {
  return (
    <>
      {showSummary && <SummarySkeleton />}
      <div className="test-table-section" aria-hidden="true">
        <div className="test-table-header">
          <SkeletonBlock className="history-skeleton--section-title" />
          <div className="test-table-right-section">
            <FiltersSkeleton />
            <SkeletonBlock className="history-skeleton--button history-skeleton--export-btn" />
          </div>
        </div>

        <div className="test-table-container glass-card">
          <table className="test-table">
            <thead>
              <tr>
                {Array.from({ length: 8 }).map((_, index) => (
                  <th key={index}>
                    <SkeletonBlock className="history-skeleton--table-head" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, rowIndex) => (
                <tr key={rowIndex} className="test-table-row">
                  {Array.from({ length: 8 }).map((_, cellIndex) => (
                    <td key={cellIndex}>
                      <SkeletonBlock className={cellIndex === 0 ? 'history-skeleton--toggle-cell' : 'history-skeleton--table-cell'} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination-controls glass-card">
          <SkeletonBlock className="history-skeleton--pagination-btn" />
          <SkeletonBlock className="history-skeleton--pagination-info" />
          <SkeletonBlock className="history-skeleton--pagination-btn" />
        </div>
      </div>
    </>
  );
}

function HistoryEmptyState({ hasActiveFilters }) {
  return (
    <div className="empty-state">
      <img src={notFoundAvatar} alt="No results found" className="empty-state-avatar" />
      <div className="empty-state-copy">
        <p className="empty-state-title">
          {hasActiveFilters ? 'No speed tests matched the filters you applied.' : 'No speed test history is available yet.'}
        </p>
        <p className="empty-state-description">
          {hasActiveFilters
            ? 'Try widening the date range or clearing filters to see more results.'
            : 'Run a speed test to start building your history and unlock trend insights.'}
        </p>
      </div>
      <Link to="/" className="link-btn">Go to Speed Test</Link>
    </div>
  );
}

function HistoryErrorState({ error, onRetry }) {
  return (
    <div className="error-state">
      <img src={notFoundAvatar} alt="Error occurred" className="error-state-avatar" />
      <div className="error-state-copy">
        <p className="error-state-title">Something went wrong</p>
        <p className="error-state-description">
          {error}
        </p>
      </div>
      <button onClick={onRetry} className="link-btn">Try Again</button>
    </div>
  );
}

function formatAxisTick(value) {
  if (!Number.isFinite(value)) return '';

  if (Math.abs(value) >= 100 || Number.isInteger(value)) {
    return `${value}`;
  }

  if (Math.abs(value) >= 10) {
    return value.toFixed(1).replace(/\.0$/, '');
  }

  if (Math.abs(value) >= 1) {
    return value.toFixed(2).replace(/\.?0+$/, '');
  }

  return value.toFixed(3).replace(/\.?0+$/, '');
}

function getNiceStep(step) {
  const safeStep = step > 0 ? step : 1;
  const magnitude = 10 ** Math.floor(Math.log10(safeStep));
  const normalized = safeStep / magnitude;

  if (normalized <= 1) return magnitude;
  if (normalized <= 2) return 2 * magnitude;
  if (normalized <= 5) return 5 * magnitude;
  return 10 * magnitude;
}

function getSmartAxis(values, { targetTickCount = 5, fallbackMax = 10 } = {}) {
  const cleanedValues = values.filter((value) => Number.isFinite(value));

  if (cleanedValues.length === 0) {
    return {
      domain: [0, fallbackMax],
      ticks: Array.from({ length: targetTickCount }, (_, index) =>
        Number(((fallbackMax / Math.max(targetTickCount - 1, 1)) * index).toFixed(3))
      )
    };
  }

  let minValue = Math.min(...cleanedValues);
  let maxValue = Math.max(...cleanedValues);

  if (minValue === maxValue) {
    const singleValuePadding = Math.max(Math.abs(maxValue) * 0.25, maxValue < 10 ? 1 : 5);
    minValue = Math.max(0, minValue - singleValuePadding);
    maxValue += singleValuePadding;
  } else {
    const padding = (maxValue - minValue) * 0.12;
    minValue = Math.max(0, minValue - padding);
    maxValue += padding;
  }

  const roughStep = (maxValue - minValue) / Math.max(targetTickCount - 1, 1);
  const niceStep = getNiceStep(roughStep);
  const domainMin = Math.max(0, Math.floor(minValue / niceStep) * niceStep);
  let domainMax = Math.ceil(maxValue / niceStep) * niceStep;

  if (domainMax <= domainMin) {
    domainMax = domainMin + niceStep * Math.max(targetTickCount - 1, 1);
  }

  const ticks = [];
  for (let tick = domainMin; tick <= domainMax + niceStep / 2; tick += niceStep) {
    ticks.push(Number(tick.toFixed(3)));
  }

  return {
    domain: [domainMin, domainMax],
    ticks
  };
}

function getChartDateFormatter(dates) {
  const validDates = dates
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()));

  if (validDates.length === 0) {
    return (value) => value;
  }

  const firstDate = validDates[0];
  const lastDate = validDates[validDates.length - 1];
  const sameYear = firstDate.getFullYear() === lastDate.getFullYear();
  const sameMonth =
    sameYear && firstDate.getMonth() === lastDate.getMonth();
  const sameDay =
    sameMonth && firstDate.getDate() === lastDate.getDate();

  const formatter = sameDay
    ? new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit'
      })
    : sameYear
      ? new Intl.DateTimeFormat('en-US', {
          month: 'short',
          day: 'numeric'
        })
      : new Intl.DateTimeFormat('en-US', {
          month: 'short',
          day: 'numeric',
          year: '2-digit'
        });

  return (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return formatter.format(date);
  };
}

function getChartTicks(data, maxTicks = 6) {
  if (data.length === 0) return [];
  if (data.length <= maxTicks) {
    return data.map((point) => point.createdAt);
  }

  const step = Math.ceil((data.length - 1) / (maxTicks - 1));
  const ticks = [];

  for (let index = 0; index < data.length; index += step) {
    ticks.push(data[index].createdAt);
  }

  const lastTick = data[data.length - 1].createdAt;
  if (ticks[ticks.length - 1] !== lastTick) {
    ticks.push(lastTick);
  }

  return ticks;
}

function formatTooltipDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

function formatTooltipMetricValue(value, unit, digits = 1) {
  if (!Number.isFinite(value)) {
    return `0 ${unit}`.trim();
  }

  const formatted = digits === 0
    ? Math.round(value).toString()
    : value.toFixed(digits).replace(/\.?0+$/, '');

  return unit ? `${formatted} ${unit}` : formatted;
}

const tooltipIcons = {
  download: (
    <svg className="tooltip-icon" style={{ width: 14, height: 14, fill: 'none', stroke: 'var(--download)', strokeWidth: 2, marginRight: 6 }} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  ),
  upload: (
    <svg className="tooltip-icon" style={{ width: 14, height: 14, fill: 'none', stroke: 'var(--upload)', strokeWidth: 2, marginRight: 6 }} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  ),
  ping: (
    <svg className="tooltip-icon" style={{ width: 14, height: 14, fill: 'none', stroke: 'var(--ping)', strokeWidth: 2, marginRight: 6 }} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  jitter: (
    <svg className="tooltip-icon" style={{ width: 14, height: 14, fill: 'none', stroke: '#f59e0b', strokeWidth: 2, marginRight: 6 }} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  healthScore: (
    <svg className="tooltip-icon" style={{ width: 14, height: 14, fill: 'none', stroke: 'var(--primary)', strokeWidth: 2, marginRight: 6 }} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
    </svg>
  )
};

function HistoryChartTooltip({ active, payload, label, config = {} }) {
  if (!active || !payload?.length) {
    return null;
  }

  const visibleRows = payload.filter((entry) => Number.isFinite(Number(entry?.value)));
  if (visibleRows.length === 0) {
    return null;
  }

  return (
    <div className="history-chart-tooltip">
      <div className="history-chart-tooltip__label">{formatTooltipDate(label)}</div>
      <div className="history-chart-tooltip__rows">
        {visibleRows.map((entry) => {
          const settings = config[entry.dataKey] || {};
          const value = Number(entry.value);
          const displayValue = formatTooltipMetricValue(value, settings.unit || '', settings.digits ?? 1);

          return (
            <div key={entry.dataKey} className="history-chart-tooltip__row">
              <div className="history-chart-tooltip__series">
                {tooltipIcons[entry.dataKey] || (
                  <span
                    className="history-chart-tooltip__swatch"
                    style={{ backgroundColor: entry.color || settings.color || 'var(--primary)' }}
                  />
                )}
                <span className="history-chart-tooltip__name">
                  {settings.label || entry.name || entry.dataKey}
                </span>
              </div>
              <span className="history-chart-tooltip__value">{displayValue}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const radarIcons = {
  Gaming: (
    <svg className="tooltip-icon" style={{ width: 14, height: 14, fill: 'none', stroke: 'var(--primary)', strokeWidth: 2, marginRight: 6 }} viewBox="0 0 24 24">
      <rect x="2" y="6" width="20" height="12" rx="3" strokeWidth="2" />
      <path d="M6 12h4M8 10v4M15 11h.01M18 13h.01" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
  Streaming: (
    <svg className="tooltip-icon" style={{ width: 14, height: 14, fill: 'none', stroke: 'var(--primary)', strokeWidth: 2, marginRight: 6 }} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
    </svg>
  ),
  'Video Call': (
    <svg className="tooltip-icon" style={{ width: 14, height: 14, fill: 'none', stroke: 'var(--primary)', strokeWidth: 2, marginRight: 6 }} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
    </svg>
  ),
  Browsing: (
    <svg className="tooltip-icon" style={{ width: 14, height: 14, fill: 'none', stroke: 'var(--primary)', strokeWidth: 2, marginRight: 6 }} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253" />
    </svg>
  )
};

const ExperienceScoresTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;

  const entry = payload[0];
  const subjectName = entry?.payload?.subject || '';
  const scoreValue = entry?.value;
  const icon = radarIcons[subjectName] || null;

  return (
    <div className="history-chart-tooltip" style={{ minWidth: '160px' }}>
      <div className="history-chart-tooltip__label" style={{ marginBottom: '6px', paddingBottom: '4px' }}>
        Experience Score
      </div>
      <div className="history-chart-tooltip__row">
        <div className="history-chart-tooltip__series">
          {icon}
          <span className="history-chart-tooltip__name" style={{ fontWeight: 500 }}>
            {subjectName}
          </span>
        </div>
        <span className="history-chart-tooltip__value" style={{ color: 'var(--primary)' }}>
          {Math.round(scoreValue)}/100
        </span>
      </div>
    </div>
  );
};

function History() {
  const { loading: authLoading, user } = useAuth();
  const isMobile = useIsMobile(768);
  const isTablet = useIsTablet(1024);
  const isLargeScreen = useIsLargeScreen(1280);
  const [tableLimit] = useState(10);
  const [tableOffset, setTableOffset] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);
  const [expandedTestId, setExpandedTestId] = useState(null);
  const [sortColumn, setSortColumn] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [searchParams, setSearchParams] = useSearchParams();
  
  const tabParam = searchParams.get('tab');
  const activeTab = ['trends', 'insights', 'history'].includes(tabParam) ? tabParam : 'trends';

  const handleTabChange = (newTab) => {
    setSearchParams({ tab: newTab });
  };

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [progress, setProgress] = useState(0);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const isInitialLoad = useRef(true);
  
  // Sync temp date state when real date state changes
  useEffect(() => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
  }, [startDate, endDate]);

  // Pick random tip immediately without waiting
  const randomTip = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * proTips.length);
    return proTips[randomIndex];
  }, []);

  const dateFilters = useMemo(() => ({
    startDate: startDate ? startDate.toISOString().split('T')[0] : undefined,
    endDate: endDate ? endDate.toISOString().split('T')[0] : undefined
  }), [startDate, endDate]);

  // Fetch all history for graphs/summary/insights (limit 1000)
  const { 
    history: allHistory, 
    loading: allLoading, 
    error: allError,
    refetch: refetchAllHistory
  } = useSpeedTestHistory(1000, 0, dateFilters, !authLoading && !!user);

  // Fetch paginated history for the table (limit 10)
  const { 
    history: tableHistory, 
    loading: tableLoading, 
    error: tableError, 
    total: tableTotal,
    refetch: refetchTableHistory
  } = useSpeedTestHistory(tableLimit, tableOffset, dateFilters, !authLoading && !!user);
  
  // Update progress when loading starts
  useEffect(() => {
    let interval;
    if (allLoading || tableLoading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return prev;
          const increment = Math.random() * 15;
          return Math.min(prev + increment, 95);
        });
      }, 400);
    } else {
      setProgress(100);
    }
    return () => clearInterval(interval);
  }, [allLoading, tableLoading]);

  // Track initial load completion
  useEffect(() => {
    if (!allLoading && !tableLoading && !authLoading && isInitialLoad.current) {
      setInitialLoadComplete(true);
      isInitialLoad.current = false;
    }
  }, [allLoading, tableLoading, authLoading]);

  // Watch for error states and open error modal
  useEffect(() => {
    if (allError || tableError) {
      setShowErrorModal(true);
    }
  }, [allError, tableError]);

  // Reset error state when closing modal
  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
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

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--warning)';
    return 'var(--error)';
  };

  const calculateSummary = () => {
    if (allHistory.length === 0) return null;

    const totalTests = allHistory.length;
    const avgDownload = (allHistory.reduce((sum, test) => sum + (test.download_speed_mbps || 0), 0) / totalTests).toFixed(1);
    const avgUpload = (allHistory.reduce((sum, test) => sum + (test.upload_speed_mbps || 0), 0) / totalTests).toFixed(1);
    const avgPing = (allHistory.reduce((sum, test) => sum + (test.ping_avg_ms || 0), 0) / totalTests).toFixed(1);
    const avgHealthScore = (allHistory.reduce((sum, test) => sum + (test.network_health_score || 0), 0) / totalTests).toFixed(0);
    
    const sortedByHealth = [...allHistory].sort((a, b) => (b.network_health_score || 0) - (a.network_health_score || 0));
    const bestTest = sortedByHealth[0];
    const worstTest = sortedByHealth[sortedByHealth.length - 1];

    return {
      totalTests,
      avgDownload,
      avgUpload,
      avgPing,
      avgHealthScore,
      bestTest,
      worstTest
    };
  };

  const summary = calculateSummary();

  const chartData = useMemo(() => (
    [...allHistory]
      .reverse()
      .map(test => ({
        createdAt: test.created_at,
        download: test.download_speed_mbps || 0,
        upload: test.upload_speed_mbps || 0,
        ping: test.ping_avg_ms || 0,
        jitter: test.jitter_ms || 0,
        healthScore: test.network_health_score || 0,
        gamingScore: test.gaming_score || 0,
        streamingScore: test.streaming_score || 0,
        videoCallScore: test.video_call_score || 0,
        browsingScore: test.browsing_score || 0
      }))
  ), [allHistory]);

  const visibleChartData = useMemo(() => {
    if (isMobile) return chartData.slice(-20);
    if (isTablet) return chartData.slice(-40);
    if (isLargeScreen) return chartData.slice(-100);
    return chartData.slice(-50);
  }, [chartData, isMobile, isTablet, isLargeScreen]);

  const speedDownloadAxis = useMemo(
    () => getSmartAxis(visibleChartData.map((point) => point.download), { fallbackMax: 20 }),
    [visibleChartData]
  );

  const speedUploadAxis = useMemo(
    () => getSmartAxis(visibleChartData.map((point) => point.upload), { fallbackMax: 10 }),
    [visibleChartData]
  );

  const latencyAxis = useMemo(
    () => getSmartAxis(visibleChartData.flatMap((point) => [point.ping, point.jitter]), { fallbackMax: 50 }),
    [visibleChartData]
  );

  const chartDateTickFormatter = useMemo(
    () => getChartDateFormatter(visibleChartData.map((point) => point.createdAt)),
    [visibleChartData]
  );

  const chartXTicks = useMemo(
    () => getChartTicks(visibleChartData, isMobile ? 5 : 6),
    [visibleChartData, isMobile]
  );

  const speedTooltipConfig = useMemo(() => ({
    download: { label: 'Download', unit: 'Mbps', digits: 1, color: 'var(--download)' },
    upload: { label: 'Upload', unit: 'Mbps', digits: 1, color: 'var(--upload)' }
  }), []);

  const latencyTooltipConfig = useMemo(() => ({
    ping: { label: 'Ping', unit: 'ms', digits: 1, color: 'var(--ping)' },
    jitter: { label: 'Jitter', unit: 'ms', digits: 1, color: '#f59e0b' }
  }), []);

  const healthTooltipConfig = useMemo(() => ({
    healthScore: { label: 'Health Score', unit: '', digits: 0, color: 'var(--primary)' }
  }), []);

  // Get first and last dates in chartData
  const getDateRange = () => {
    if (visibleChartData.length === 0) return null;
    const firstDate = formatDate(visibleChartData[0].createdAt);
    const lastDate = formatDate(visibleChartData[visibleChartData.length - 1].createdAt);
    return { firstDate, lastDate };
  };

  const dateRange = getDateRange();

  const radarData = [
    { subject: 'Gaming', A: summary?.bestTest?.gaming_score || 0, fullMark: 100 },
    { subject: 'Streaming', A: summary?.bestTest?.streaming_score || 0, fullMark: 100 },
    { subject: 'Video Call', A: summary?.bestTest?.video_call_score || 0, fullMark: 100 },
    { subject: 'Browsing', A: summary?.bestTest?.browsing_score || 0, fullMark: 100 }
  ];

  const generateAIInsights = () => {
    if (allHistory.length === 0) return [];

    const insights = [];

    insights.push({
      type: 'info',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
      ),
      title: 'Speed Overview',
      message: `Your average download speed is ${summary?.avgDownload} Mbps and upload is ${summary?.avgUpload} Mbps.`
    });

    if (parseInt(summary?.avgPing) < 50) {
      insights.push({
        type: 'success',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        ),
        title: 'Excellent Latency',
        message: 'Your ping is consistently low, great for gaming and video calls!'
      });
    } else if (parseInt(summary?.avgPing) < 100) {
      insights.push({
        type: 'warning',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        ),
        title: 'Moderate Latency',
        message: 'Your ping is acceptable, but could be better for real-time applications.'
      });
    } else {
      insights.push({
        type: 'danger',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        ),
        title: 'High Latency',
        message: 'Your ping is quite high, consider checking your network connection.'
      });
    }

    insights.push({
      type: 'success',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
          <circle cx="12" cy="8" r="7" />
          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
        </svg>
      ),
      title: 'Best Performance',
      message: `Your best test achieved a health score of ${summary?.bestTest?.network_health_score?.toFixed(0)}!`
    });

    return insights;
  };

  const aiInsights = generateAIInsights();
  const hasActiveFilters = Boolean(startDate || endDate);
  const hasAnyError = Boolean(allError || tableError);
  const shouldShowEmptyState = !allLoading && !hasAnyError && allHistory.length === 0;
  const shouldShowTableSkeleton = activeTab === 'history' && tableLoading && (tableHistory || []).length === 0;
  const shouldShowInsightsSkeleton = activeTab === 'insights' && allLoading && (allHistory || []).length === 0;
  const shouldShowTrendsSkeleton = activeTab === 'trends' && allLoading && (allHistory || []).length === 0;

  const filteredTests = [...tableHistory].sort((a, b) => {
    let aVal = a[sortColumn];
    let bVal = b[sortColumn];
    
    if (sortColumn === 'created_at') {
      aVal = new Date(a.created_at).getTime();
      bVal = new Date(b.created_at).getTime();
    }

    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1;
    }
    return aVal < bVal ? 1 : -1;
  });

  const exportToCSV = () => {
    const headers = ['Date', 'Download (Mbps)', 'Upload (Mbps)', 'Ping (ms)', 'Jitter (ms)', 'Health Score', 'ISP'];
    const rows = allHistory.map(test => [
      formatDate(test.created_at),
      test.download_speed_mbps?.toFixed(1) || 0,
      test.upload_speed_mbps?.toFixed(1) || 0,
      test.ping_avg_ms?.toFixed(1) || 0,
      test.jitter_ms?.toFixed(1) || 0,
      test.network_health_score?.toFixed(0) || 0,
      test.isp_name || 'N/A'
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'test-history.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const isInitialLoading = authLoading || ((allLoading || tableLoading) && (allHistory || []).length === 0);

  const chartHeight = isMobile ? 200 : 280;
  const radarHeight = isMobile ? 220 : 300;

  if (isInitialLoading) {
    return (
      <div className="history-page">
        <Loading
          isLoading={true}
          progress={progress}
          message="Loading test history"
          status="AkovoLabs Test History System v1.0"
          indeterminate={true}
        />
      </div>
    );
  }

  return (
    <div className="history-page">
      
      {/* Title Section */}
      {((allHistory || []).length > 0 || !allLoading) && (
        <>
          <div className="history-title-section">
            <h1 className="history-title-section-title">Test History</h1>
            <div className="history-subtitle-with-avatar">
              <img src={womanAvatar} alt="Instructor" className="subtitle-avatar" />
              <div className="subtitle-text">
                <p className="history-title-section-subtitle">Review your past speed tests, track performance trends, and gain insights into your network health.</p>
                <p className="pro-tip-text">
                  <span className="pro-tip-label">Pro Tip!</span> {randomTip}
                </p>
              </div>
            </div>
          </div>

          {/* Hero Section */}
          <section className="history-hero">
            <img src={heroImage} alt="Test History Hero" className="history-hero-image" />
          </section>

          {/* Tab Navigation */}
          <div className="history-tabs">
            <button 
              className={`history-tab ${activeTab === 'trends' ? 'history-tab--active' : ''}`}
              onClick={() => handleTabChange('trends')}
            >
              Trends
            </button>
            <button 
              className={`history-tab ${activeTab === 'insights' ? 'history-tab--active' : ''}`}
              onClick={() => handleTabChange('insights')}
            >
              Insights
            </button>
            <button 
              className={`history-tab ${activeTab === 'history' ? 'history-tab--active' : ''}`}
              onClick={() => handleTabChange('history')}
            >
              History
            </button>
          </div>
          
          <div className="history-container">
            <>
              {/* Trends Tab Content */}
          {activeTab === 'trends' && (
            <>
              {shouldShowTrendsSkeleton ? (
                <>
                  <SummarySkeleton />
                  <GraphSkeleton showFilters count={4} />
                </>
              ) : (
                <>
                  {/* Section 1: Summary Metrics */}
                  {summary && (
                    <div className="summary-grid">
                      <div className="summary-mini-card">
                        <span className="summary-mini-value">{summary.totalTests}</span>
                        <span className="summary-mini-label">Total Tests</span>
                      </div>

                      <div className="summary-mini-card">
                        <span className="summary-mini-value">{summary.avgDownload}<span className="summary-mini-unit"> Mbps</span></span>
                        <span className="summary-mini-label">Avg Download</span>
                      </div>

                      <div className="summary-mini-card">
                        <span className="summary-mini-value">{summary.avgUpload}<span className="summary-mini-unit"> Mbps</span></span>
                        <span className="summary-mini-label">Avg Upload</span>
                      </div>

                      <div className="summary-mini-card">
                        <span className="summary-mini-value">{summary.avgPing}<span className="summary-mini-unit"> ms</span></span>
                        <span className="summary-mini-label">Avg Ping</span>
                      </div>

                      <div className="summary-mini-card">
                        <span className="summary-mini-value" style={{ color: getScoreColor(summary.avgHealthScore) }}>{summary.avgHealthScore}</span>
                        <span className="summary-mini-label">Avg Health Score</span>
                      </div>
                    </div>
                  )}

                  {/* Section 2: Performance Trends */}
                  <div className="trends-section">
                    <div className="trends-header">
                      <h2 className="section-title">Performance Trends</h2>
                      <div className="date-filters">
                        <div className="date-filters-fields">
                          <label className="date-label-field">
                            <span className="date-label">From</span>
                            <DatePicker
                              selected={tempStartDate}
                              onChange={(date) => setTempStartDate(date)}
                              className="date-input"
                              placeholderText="Select start date"
                              isClearable
                              dateFormat="yyyy-MM-dd"
                            />
                          </label>
                          <label className="date-label-field">
                            <span className="date-label">To</span>
                            <DatePicker
                              selected={tempEndDate}
                              onChange={(date) => setTempEndDate(date)}
                              className="date-input"
                              placeholderText="Select end date"
                              isClearable
                              dateFormat="yyyy-MM-dd"
                            />
                          </label>
                        </div>
                        <div className="date-filters-actions">
                          <button 
                            className="apply-filters-btn"
                            onClick={() => {
                              setStartDate(tempStartDate);
                              setEndDate(tempEndDate);
                              setTableOffset(0);
                            }}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="11" cy="11" r="8" />
                              <path d="M21 21l-4.35-4.35" />
                            </svg>
                          </button>
                          <button 
                            className="clear-filters-btn"
                            onClick={() => {
                              setTempStartDate(null);
                              setTempEndDate(null);
                              setStartDate(null);
                              setEndDate(null);
                              setTableOffset(0);
                            }}
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    </div>

                    {hasAnyError ? (
                      <HistoryErrorState 
                        error={allError || tableError} 
                        onRetry={refetchAllHistory} 
                      />
                    ) : chartData.length > 0 ? (
                      <>
                        {/* Graph 1: Speed Trends */}
                        <div className="graph-card">
                          <h3 className="graph-title">Speed Trends</h3>
                          <ResponsiveContainer width="100%" height={chartHeight}>
                            <LineChart data={visibleChartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
                              <XAxis 
                                dataKey="createdAt" 
                                stroke="var(--text-muted)" 
                                tick={{ fontSize: isMobile ? 9 : 11 }} 
                                ticks={chartXTicks}
                                tickFormatter={chartDateTickFormatter}
                                minTickGap={24}
                                interval={0}
                              />
                              <YAxis 
                                yAxisId="download"
                                stroke="var(--text-muted)" 
                                tick={{ fontSize: isMobile ? 9 : 11 }} 
                                width={isMobile ? 40 : 52}
                                domain={speedDownloadAxis.domain}
                                ticks={speedDownloadAxis.ticks}
                                tickFormatter={formatAxisTick}
                              />
                              <YAxis
                                yAxisId="upload"
                                orientation="right"
                                stroke="var(--text-muted)"
                                tick={{ fontSize: isMobile ? 9 : 11 }}
                                width={isMobile ? 40 : 52}
                                domain={speedUploadAxis.domain}
                                ticks={speedUploadAxis.ticks}
                                tickFormatter={formatAxisTick}
                              />
                              <Tooltip 
                                content={<HistoryChartTooltip config={speedTooltipConfig} />}
                              />
                              <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
                              <Line
                                yAxisId="download"
                                type="monotone"
                                dataKey="download"
                                stroke="var(--download)"
                                strokeWidth={2}
                                dot={{ r: isMobile ? 2 : 3 }}
                                activeDot={{ r: isMobile ? 5 : 6, fill: 'var(--download)', stroke: '#fff', strokeWidth: 2 }}
                                name="Download (Mbps)"
                              />
                              <Line
                                yAxisId="upload"
                                type="monotone"
                                dataKey="upload"
                                stroke="var(--upload)"
                                strokeWidth={2}
                                dot={{ r: isMobile ? 2 : 3 }}
                                activeDot={{ r: isMobile ? 5 : 6, fill: 'var(--upload)', stroke: '#fff', strokeWidth: 2 }}
                                strokeDasharray="5 5"
                                name="Upload (Mbps)"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                          <p className="graph-date-range">
                            Speed axes auto-scale independently for download and upload so smaller trends remain readable.
                          </p>
                          {dateRange && (
                            <p className="graph-date-range">
                              Showing results from {dateRange.firstDate} to {dateRange.lastDate}
                            </p>
                          )}
                        </div>

                        {/* Graph 2: Latency Quality */}
                        <div className="graph-card">
                          <h3 className="graph-title">Latency Quality</h3>
                          <ResponsiveContainer width="100%" height={chartHeight}>
                            <LineChart data={visibleChartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
                              <XAxis 
                                dataKey="createdAt" 
                                stroke="var(--text-muted)" 
                                tick={{ fontSize: isMobile ? 9 : 11 }} 
                                ticks={chartXTicks}
                                tickFormatter={chartDateTickFormatter}
                                minTickGap={24}
                                interval={0}
                              />
                              <YAxis 
                                stroke="var(--text-muted)" 
                                tick={{ fontSize: isMobile ? 9 : 11 }} 
                                width={isMobile ? 40 : 52}
                                domain={latencyAxis.domain}
                                ticks={latencyAxis.ticks}
                                tickFormatter={formatAxisTick}
                              />
                              <Tooltip 
                                content={<HistoryChartTooltip config={latencyTooltipConfig} />}
                              />
                              <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
                              <Line
                                type="monotone"
                                dataKey="ping"
                                stroke="var(--ping)"
                                strokeWidth={2}
                                dot={{ r: isMobile ? 2 : 3 }}
                                activeDot={{ r: isMobile ? 5 : 6, fill: 'var(--ping)', stroke: '#fff', strokeWidth: 2 }}
                                name="Ping (ms)"
                              />
                              <Line
                                type="monotone"
                                dataKey="jitter"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                dot={{ r: isMobile ? 2 : 3 }}
                                activeDot={{ r: isMobile ? 5 : 6, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }}
                                strokeDasharray="5 5"
                                name="Jitter (ms)"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                          <p className="graph-date-range">
                            Latency values auto-scale to the visible ping and jitter range.
                          </p>
                          {dateRange && (
                            <p className="graph-date-range">
                              Showing results from {dateRange.firstDate} to {dateRange.lastDate}
                            </p>
                          )}
                        </div>

                        {/* Graph 3: Network Health Score */}
                        <div className="graph-card">
                          <h3 className="graph-title">Network Health Score</h3>
                          <ResponsiveContainer width="100%" height={chartHeight}>
                            <AreaChart data={visibleChartData}>
                              <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
                              <XAxis 
                                dataKey="createdAt" 
                                stroke="var(--text-muted)" 
                                tick={{ fontSize: isMobile ? 9 : 11 }} 
                                ticks={chartXTicks}
                                tickFormatter={chartDateTickFormatter}
                                minTickGap={24}
                                interval={0}
                              />
                              <YAxis 
                                stroke="var(--text-muted)" 
                                tick={{ fontSize: isMobile ? 9 : 11 }} 
                                width={isMobile ? 40 : 52}
                                domain={[0, 100]}
                              />
                              <Tooltip 
                                content={<HistoryChartTooltip config={healthTooltipConfig} />}
                              />
                              <Area 
                                type="monotone" 
                                dataKey="healthScore" 
                                stroke="var(--primary)" 
                                fillOpacity={1} 
                                fill="url(#colorScore)" 
                                name="Health Score"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                          {dateRange && (
                            <p className="graph-date-range">
                              Showing results from {dateRange.firstDate} to {dateRange.lastDate}
                            </p>
                          )}
                        </div>

                        {/* Graph 4: Experience Scores (Radar Chart + Horizontal Bars) */}
                        <div className="graph-card">
                          <h3 className="graph-title">Experience Scores</h3>
                          <div className="experience-scores-container">
                            <div className="radar-chart-wrapper">
                              <ResponsiveContainer width="100%" height={radarHeight}>
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                  <PolarGrid stroke="var(--glass-border)" />
                                  <PolarAngleAxis dataKey="subject" stroke="var(--text-primary)" tick={{ fontSize: isMobile ? 10 : 12 }} />
                                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="var(--text-muted)" />
                                  <Radar name="Best Test" dataKey="A" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.6} />
                                  <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
                                  <Tooltip content={<ExperienceScoresTooltip />} />
                                </RadarChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="score-bars-wrapper">
                              {radarData.map((item, index) => (
                                <div key={index} className="score-bar-item">
                                  <div className="score-bar-label">{item.subject}</div>
                                  <div className="score-bar-container">
                                    <div 
                                      className="score-bar-fill"
                                      style={{ 
                                        width: `${item.A}%`,
                                        backgroundColor: getScoreColor(item.A)
                                      }}
                                    ></div>
                                  </div>
                                  <div className="score-bar-value">{item.A}</div>
                                </div>
                              ))}
                              <div className="score-bar-legend">
                                <div className="legend-item">
                                  <div className="legend-color" style={{ backgroundColor: 'var(--success)' }}></div>
                                  <div className="legend-text">Excellent (80-100)</div>
                                </div>
                                <div className="legend-item">
                                  <div className="legend-color" style={{ backgroundColor: 'var(--warning)' }}></div>
                                  <div className="legend-text">Good (60-79)</div>
                                </div>
                                <div className="legend-item">
                                  <div className="legend-color" style={{ backgroundColor: 'var(--error)' }}></div>
                                  <div className="legend-text">Poor (0-59)</div>
                                </div>
                              </div>
                            </div>
                          </div>
                          {dateRange && (
                            <p className="graph-date-range">
                              Showing results from {dateRange.firstDate} to {dateRange.lastDate}
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      <HistoryEmptyState hasActiveFilters={hasActiveFilters} />
                    )}
                  </div>
                </>
              )}
            </>
          )}

          {/* Insights Tab Content */}
          {activeTab === 'insights' && (
            <>
              {shouldShowInsightsSkeleton ? (
                <>
                  <SummarySkeleton />
                  <InsightsSkeleton />
                </>
              ) : (
                <>
                  {/* Section 1: Summary Metrics */}
                  {summary && (
                    <>
                      <div className="summary-grid">
                        <div className="summary-mini-card">
                          <span className="summary-mini-value">{summary.totalTests}</span>
                          <span className="summary-mini-label">Total Tests</span>
                        </div>

                        <div className="summary-mini-card">
                          <span className="summary-mini-value">{summary.avgDownload}<span className="summary-mini-unit"> Mbps</span></span>
                          <span className="summary-mini-label">Avg Download</span>
                        </div>

                        <div className="summary-mini-card">
                          <span className="summary-mini-value">{summary.avgUpload}<span className="summary-mini-unit"> Mbps</span></span>
                          <span className="summary-mini-label">Avg Upload</span>
                        </div>

                        <div className="summary-mini-card">
                          <span className="summary-mini-value">{summary.avgPing}<span className="summary-mini-unit"> ms</span></span>
                          <span className="summary-mini-label">Avg Ping</span>
                        </div>

                        <div className="summary-mini-card">
                          <span className="summary-mini-value" style={{ color: getScoreColor(summary.avgHealthScore) }}>{summary.avgHealthScore}</span>
                          <span className="summary-mini-label">Avg Health Score</span>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Section 3: AI Insights Panel */}
                  {hasAnyError ? (
                    <HistoryErrorState 
                      error={allError || tableError} 
                      onRetry={refetchAllHistory} 
                    />
                  ) : aiInsights.length > 0 ? (
                    <div className="ai-insights-section">
                      <h2 className="section-title">AI Insights</h2>
                      <div className="ai-insights-grid">
                        {aiInsights.map((insight, index) => (
                          <div key={index} className="ai-insight-card">
                            <div className="ai-insight-icon">{insight.icon}</div>
                            <div className="ai-insight-content">
                              <h4 className="ai-insight-title">{insight.title}</h4>
                              <p className="ai-insight-message">{insight.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* Coming Soon Section */}
                      <div className="coming-soon-section">
                        <img 
                          src={womanAvatar} 
                          alt="Coming Soon" 
                          className="coming-soon-avatar"
                        />
                        <div className="coming-soon-content">
                          <h3 className="coming-soon-title">Coming Soon - Advanced Network Analysis</h3>
                          <ul className="coming-soon-list">
                            <li className="coming-soon-item">
                              <span className="coming-soon-bullet"></span>
                              Public Wi-Fi Security Analysis
                            </li>
                            <li className="coming-soon-item">
                              <span className="coming-soon-bullet"></span>
                              Network Traffic Anomaly Detection
                            </li>
                            <li className="coming-soon-item">
                              <span className="coming-soon-bullet"></span>
                              ISP Performance Benchmarking
                            </li>
                            <li className="coming-soon-item">
                              <span className="coming-soon-bullet"></span>
                              Device-Level Network Health Checks
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <HistoryEmptyState hasActiveFilters={hasActiveFilters} />
                  )}
                </>
              )}
            </>
          )}

          {/* History Tab Content */}
          {activeTab === 'history' && (
            <>
              {shouldShowTableSkeleton ? (
                <TableSkeleton showSummary={allLoading} />
              ) : (
                <>
                  {/* Section 1: Summary Metrics */}
                  {summary && (
                    <div className="summary-grid">
                      <div className="summary-mini-card">
                        <span className="summary-mini-value">{summary.totalTests}</span>
                        <span className="summary-mini-label">Total Tests</span>
                      </div>

                      <div className="summary-mini-card">
                        <span className="summary-mini-value">{summary.avgDownload}<span className="summary-mini-unit"> Mbps</span></span>
                        <span className="summary-mini-label">Avg Download</span>
                      </div>

                      <div className="summary-mini-card">
                        <span className="summary-mini-value">{summary.avgUpload}<span className="summary-mini-unit"> Mbps</span></span>
                        <span className="summary-mini-label">Avg Upload</span>
                      </div>

                      <div className="summary-mini-card">
                        <span className="summary-mini-value">{summary.avgPing}<span className="summary-mini-unit"> ms</span></span>
                        <span className="summary-mini-label">Avg Ping</span>
                      </div>

                      <div className="summary-mini-card">
                        <span className="summary-mini-value" style={{ color: getScoreColor(summary.avgHealthScore) }}>{summary.avgHealthScore}</span>
                        <span className="summary-mini-label">Avg Health Score</span>
                      </div>
                    </div>
                  )}

                  {/* Section 4: Historical Test Table */}
                  <div className="test-table-section">
                    <div className="test-table-header">
                      <h2 className="section-title">Test History</h2>
                      <div className="test-table-right-section">
                        <div className="date-filters">
                          <div className="date-filters-fields">
                            <label className="date-label-field">
                              <span className="date-label">From</span>
                              <DatePicker
                                selected={tempStartDate}
                                onChange={(date) => setTempStartDate(date)}
                                className="date-input"
                                placeholderText="Select start date"
                                isClearable
                                dateFormat="yyyy-MM-dd"
                              />
                            </label>
                            <label className="date-label-field">
                              <span className="date-label">To</span>
                              <DatePicker
                                selected={tempEndDate}
                                onChange={(date) => setTempEndDate(date)}
                                className="date-input"
                                placeholderText="Select end date"
                                isClearable
                                dateFormat="yyyy-MM-dd"
                              />
                            </label>
                          </div>
                          <div className="date-filters-actions">
                            <button 
                              className="apply-filters-btn"
                              onClick={() => {
                                setStartDate(tempStartDate);
                                setEndDate(tempEndDate);
                                setTableOffset(0);
                              }}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" />
                                <path d="M21 21l-4.35-4.35" />
                              </svg>
                            </button>
                            <button 
                              className="clear-filters-btn"
                              onClick={() => {
                                setTempStartDate(null);
                                setTempEndDate(null);
                                setStartDate(null);
                                setEndDate(null);
                                setTableOffset(0);
                              }}
                            >
                              Clear
                            </button>
                            <button onClick={exportToCSV} className="export-btn">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {hasAnyError ? (
                      <HistoryErrorState 
                        error={tableError || allError} 
                        onRetry={refetchTableHistory} 
                      />
                    ) : tableHistory.length > 0 ? (
                      <>
                        {isMobile ? (
                          <div className="test-cards-mobile">
                            {filteredTests.map((test) => (
                              <div
                                key={test.id}
                                className={`test-card-mobile glass-card ${expandedTestId === test.id ? 'test-card-mobile--expanded' : ''}`}
                                onClick={() => setExpandedTestId(expandedTestId === test.id ? null : test.id)}
                              >
                                <div className="test-card-mobile__header">
                                  <span className="test-card-mobile__date">{formatDate(test.created_at)}</span>
                                  <span className="test-card-mobile__health" style={{ color: getScoreColor(test.network_health_score) }}>
                                    {test.network_health_score?.toFixed(0) || 0}
                                  </span>
                                </div>
                                <div className="test-card-mobile__metrics">
                                  <div className="test-card-mobile__metric">
                                    <span className="test-card-mobile__metric-label">↓</span>
                                    <span className="test-card-mobile__metric-value">{test.download_speed_mbps?.toFixed(1) || 0} <small>Mbps</small></span>
                                  </div>
                                  <div className="test-card-mobile__metric">
                                    <span className="test-card-mobile__metric-label">↑</span>
                                    <span className="test-card-mobile__metric-value">{test.upload_speed_mbps?.toFixed(1) || 0} <small>Mbps</small></span>
                                  </div>
                                  <div className="test-card-mobile__metric">
                                    <span className="test-card-mobile__metric-label">Ping</span>
                                    <span className="test-card-mobile__metric-value">{test.ping_avg_ms?.toFixed(1) || 0} <small>ms</small></span>
                                  </div>
                                  <div className="test-card-mobile__metric">
                                    <span className="test-card-mobile__metric-label">ISP</span>
                                    <span className="test-card-mobile__metric-value test-card-mobile__metric-value--isp">{test.isp_name || 'N/A'}</span>
                                  </div>
                                </div>
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  className={`test-card-mobile__chevron ${expandedTestId === test.id ? 'test-card-mobile__chevron--expanded' : ''}`}
                                >
                                  <polyline points="9 18 15 12 9 6" />
                                </svg>
                                {expandedTestId === test.id && (
                                  <div className="test-card-mobile__details">
                                    <div className="test-card-mobile__detail-grid">
                                      <div className="test-card-mobile__detail-item">
                                        <span className="test-card-mobile__detail-label">Ping (Min)</span>
                                        <span className="test-card-mobile__detail-value">{test.ping_min_ms?.toFixed(1) || 0} ms</span>
                                      </div>
                                      <div className="test-card-mobile__detail-item">
                                        <span className="test-card-mobile__detail-label">Ping (Max)</span>
                                        <span className="test-card-mobile__detail-value">{test.ping_max_ms?.toFixed(1) || 0} ms</span>
                                      </div>
                                      <div className="test-card-mobile__detail-item">
                                        <span className="test-card-mobile__detail-label">Jitter</span>
                                        <span className="test-card-mobile__detail-value">{test.jitter_ms?.toFixed(1) || 0} ms</span>
                                      </div>
                                      <div className="test-card-mobile__detail-item">
                                        <span className="test-card-mobile__detail-label">Packet Loss</span>
                                        <span className="test-card-mobile__detail-value">{test.packet_loss_percent?.toFixed(1) || 0}%</span>
                                      </div>
                                      <div className="test-card-mobile__detail-item">
                                        <span className="test-card-mobile__detail-label">Gaming</span>
                                        <span className="test-card-mobile__detail-value" style={{ color: getScoreColor(test.gaming_score) }}>{test.gaming_score?.toFixed(0) || 0}</span>
                                      </div>
                                      <div className="test-card-mobile__detail-item">
                                        <span className="test-card-mobile__detail-label">Streaming</span>
                                        <span className="test-card-mobile__detail-value" style={{ color: getScoreColor(test.streaming_score) }}>{test.streaming_score?.toFixed(0) || 0}</span>
                                      </div>
                                      <div className="test-card-mobile__detail-item">
                                        <span className="test-card-mobile__detail-label">Video Call</span>
                                        <span className="test-card-mobile__detail-value" style={{ color: getScoreColor(test.video_call_score) }}>{test.video_call_score?.toFixed(0) || 0}</span>
                                      </div>
                                      <div className="test-card-mobile__detail-item">
                                        <span className="test-card-mobile__detail-label">Browsing</span>
                                        <span className="test-card-mobile__detail-value" style={{ color: getScoreColor(test.browsing_score) }}>{test.browsing_score?.toFixed(0) || 0}</span>
                                      </div>
                                    </div>
                                    {test.ai_summary && (
                                      <div className="test-card-mobile__ai">
                                        <h5 className="test-card-mobile__ai-title">
                                          <img src={aiIcon} alt="AI" className="test-card-mobile__ai-icon" />
                                          AI Analysis
                                        </h5>
                                        <p className="test-card-mobile__ai-text">{test.ai_summary}</p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="test-table-container glass-card">
                            <table className="test-table">
                              <thead>
                                <tr>
                                  <th></th>
                                  <th onClick={() => {
                                    setSortColumn('created_at');
                                    setSortDirection(sortColumn === 'created_at' && sortDirection === 'desc' ? 'asc' : 'desc');
                                  }}>
                                    Date {sortColumn === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
                                  </th>
                                  <th onClick={() => {
                                    setSortColumn('download_speed_mbps');
                                    setSortDirection(sortColumn === 'download_speed_mbps' && sortDirection === 'desc' ? 'asc' : 'desc');
                                  }}>
                                    Download {sortColumn === 'download_speed_mbps' && (sortDirection === 'asc' ? '↑' : '↓')}
                                  </th>
                                  <th onClick={() => {
                                    setSortColumn('upload_speed_mbps');
                                    setSortDirection(sortColumn === 'upload_speed_mbps' && sortDirection === 'desc' ? 'asc' : 'desc');
                                  }}>
                                    Upload {sortColumn === 'upload_speed_mbps' && (sortDirection === 'asc' ? '↑' : '↓')}
                                  </th>
                                  <th onClick={() => {
                                    setSortColumn('ping_avg_ms');
                                    setSortDirection(sortColumn === 'ping_avg_ms' && sortDirection === 'desc' ? 'asc' : 'desc');
                                  }}>
                                    Ping {sortColumn === 'ping_avg_ms' && (sortDirection === 'asc' ? '↑' : '↓')}
                                  </th>
                                  <th onClick={() => {
                                    setSortColumn('jitter_ms');
                                    setSortDirection(sortColumn === 'jitter_ms' && sortDirection === 'desc' ? 'asc' : 'desc');
                                  }}>
                                    Jitter {sortColumn === 'jitter_ms' && (sortDirection === 'asc' ? '↑' : '↓')}
                                  </th>
                                  <th onClick={() => {
                                    setSortColumn('network_health_score');
                                    setSortDirection(sortColumn === 'network_health_score' && sortDirection === 'desc' ? 'asc' : 'desc');
                                  }}>
                                    Health {sortColumn === 'network_health_score' && (sortDirection === 'asc' ? '↑' : '↓')}
                                  </th>
                                  <th>ISP</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredTests.map((test) => (
                                  <Fragment key={test.id}>
                                    <tr 
                                      onClick={() => setExpandedTestId(expandedTestId === test.id ? null : test.id)} 
                                      className="test-table-row"
                                    >
                                      <td className="test-table-cell--toggle">
                                        <svg 
                                          viewBox="0 0 24 24" 
                                          fill="none" 
                                          stroke="currentColor" 
                                          strokeWidth="2"
                                          className={`test-table-toggle-icon ${expandedTestId === test.id ? 'test-table-toggle-icon--expanded' : ''}`}
                                        >
                                          <polyline points="9 18 15 12 9 6" />
                                        </svg>
                                      </td>
                                      <td>{formatDate(test.created_at)}</td>
                                      <td>{test.download_speed_mbps?.toFixed(1) || 0} Mbps</td>
                                      <td>{test.upload_speed_mbps?.toFixed(1) || 0} Mbps</td>
                                      <td>{test.ping_avg_ms?.toFixed(1) || 0} ms</td>
                                      <td>{test.jitter_ms?.toFixed(1) || 0} ms</td>
                                      <td>
                                        <span style={{ color: getScoreColor(test.network_health_score) }}>
                                          {test.network_health_score?.toFixed(0) || 0}
                                        </span>
                                      </td>
                                      <td>{test.isp_name || 'N/A'}</td>
                                    </tr>
                                    {expandedTestId === test.id && (
                                      <tr className="test-table-row--expanded">
                                        <td colSpan={8} className="test-table-cell--expanded">
                                          <div className="test-details-container">
                                            <div className="test-details-wrapper">
                                              <div className="test-details-section test-details-section--two-col">
                                                <h4 className="test-details-section-title">Performance</h4>
                                                <div className="test-details-grid">
                                                  <div className="test-details-item">
                                                    <span className="test-details-label">Download Speed</span>
                                                    <span className="test-details-value">{test.download_speed_mbps?.toFixed(1) || 0} Mbps</span>
                                                  </div>
                                                  <div className="test-details-item">
                                                    <span className="test-details-label">Upload Speed</span>
                                                    <span className="test-details-value">{test.upload_speed_mbps?.toFixed(1) || 0} Mbps</span>
                                                  </div>
                                                  <div className="test-details-item">
                                                    <span className="test-details-label">Ping (Avg)</span>
                                                    <span className="test-details-value">{test.ping_avg_ms?.toFixed(1) || 0} ms</span>
                                                  </div>
                                                  <div className="test-details-item">
                                                    <span className="test-details-label">Ping (Min)</span>
                                                    <span className="test-details-value">{test.ping_min_ms?.toFixed(1) || 0} ms</span>
                                                  </div>
                                                  <div className="test-details-item">
                                                    <span className="test-details-label">Ping (Max)</span>
                                                    <span className="test-details-value">{test.ping_max_ms?.toFixed(1) || 0} ms</span>
                                                  </div>
                                                  <div className="test-details-item">
                                                    <span className="test-details-label">Jitter</span>
                                                    <span className="test-details-value">{test.jitter_ms?.toFixed(1) || 0} ms</span>
                                                  </div>
                                                  <div className="test-details-item">
                                                    <span className="test-details-label">Packet Loss</span>
                                                    <span className="test-details-value">{test.packet_loss_percent?.toFixed(1) || 0}%</span>
                                                  </div>
                                                </div>
                                              </div>

                                              <div className="test-details-section test-details-section--two-col">
                                                <h4 className="test-details-section-title">Experience Scores</h4>
                                                <div className="test-details-grid">
                                                  <div className="test-details-item">
                                                    <span className="test-details-label">Network Health</span>
                                                    <span className="test-details-value" style={{ color: getScoreColor(test.network_health_score) }}>
                                                      {test.network_health_score?.toFixed(0) || 0}
                                                    </span>
                                                  </div>
                                                  <div className="test-details-item">
                                                    <span className="test-details-label">Gaming</span>
                                                    <span className="test-details-value" style={{ color: getScoreColor(test.gaming_score) }}>
                                                      {test.gaming_score?.toFixed(0) || 0}
                                                    </span>
                                                  </div>
                                                  <div className="test-details-item">
                                                    <span className="test-details-label">Streaming</span>
                                                    <span className="test-details-value" style={{ color: getScoreColor(test.streaming_score) }}>
                                                      {test.streaming_score?.toFixed(0) || 0}
                                                    </span>
                                                  </div>
                                                  <div className="test-details-item">
                                                    <span className="test-details-label">Video Call</span>
                                                    <span className="test-details-value" style={{ color: getScoreColor(test.video_call_score) }}>
                                                      {test.video_call_score?.toFixed(0) || 0}
                                                    </span>
                                                  </div>
                                                  <div className="test-details-item">
                                                    <span className="test-details-label">Browsing</span>
                                                    <span className="test-details-value" style={{ color: getScoreColor(test.browsing_score) }}>
                                                      {test.browsing_score?.toFixed(0) || 0}
                                                    </span>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>

                                            {test.ai_summary && (
                                              <div className="test-details-section">
                                                <h4 className="test-details-section-title">
                                                  <img 
                                                    src={aiIcon} 
                                                    alt="AI" 
                                                    className="test-details-section-icon"
                                                  />
                                                  AI Analysis
                                                </h4>
                                                <div className="test-details-ai-summary">
                                                  <p>{test.ai_summary}</p>
                                                </div>
                                              </div>
                                            )}

                                            <div className="test-details-section">
                                              <h4 className="test-details-section-title">Environment</h4>
                                              <div className="test-details-grid">
                                                <div className="test-details-item">
                                                  <span className="test-details-label">Date & Time</span>
                                                  <span className="test-details-value">{formatDate(test.created_at)}</span>
                                                </div>
                                                <div className="test-details-item">
                                                  <span className="test-details-label">ISP</span>
                                                  <span className="test-details-value">{test.isp_name || 'N/A'}</span>
                                                </div>
                                                {test.country && (
                                                  <div className="test-details-item">
                                                    <span className="test-details-label">Country</span>
                                                    <span className="test-details-value">{test.country}</span>
                                                  </div>
                                                )}
                                                {test.probe_method && (
                                                  <div className="test-details-item">
                                                    <span className="test-details-label">Probe Method</span>
                                                    <span className="test-details-value">{test.probe_method}</span>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </td>
                                      </tr>
                                    )}
                                  </Fragment>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* Pagination Controls */}
                        <div className="pagination-controls glass-card">
                          <button
                            className="pagination-btn"
                            onClick={() => setTableOffset(Math.max(0, tableOffset - tableLimit))}
                            disabled={tableOffset === 0 || tableLoading}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="15 18 9 12 15 6" />
                            </svg>
                            Previous
                          </button>
                          <span className="pagination-info">
                            Showing {tableOffset + 1}-{Math.min(tableOffset + tableLimit, tableTotal || tableOffset + tableHistory.length)}
                            {tableTotal > 0 && ` of ${tableTotal}`}
                          </span>
                          <button
                            className="pagination-btn"
                            onClick={() => setTableOffset(tableOffset + tableLimit)}
                            disabled={!tableTotal || (tableOffset + tableLimit >= tableTotal) || tableLoading}
                          >
                            Next
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </button>
                        </div>
                      </>
                    ) : (
                      <HistoryEmptyState hasActiveFilters={hasActiveFilters} />
                    )}
                  </div>
                </>
              )}
            </>
          )}

            </>
          </div>
        </>
      )}
      <ErrorModal
        isOpen={showErrorModal}
        message={allError || tableError}
        onClose={handleCloseErrorModal}
      />
    </div>
  );
}

export default History;
