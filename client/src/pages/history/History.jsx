import { Fragment, useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

function History() {
  const { loading: authLoading } = useAuth();
  const [tableLimit] = useState(10);
  const [tableOffset, setTableOffset] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);
  const [expandedTestId, setExpandedTestId] = useState(null);
  const [sortColumn, setSortColumn] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [activeTab, setActiveTab] = useState('trends');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [progress, setProgress] = useState(0);
  
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
  } = useSpeedTestHistory(1000, 0, dateFilters, !authLoading);

  // Fetch paginated history for the table (limit 10)
  const { 
    history: tableHistory, 
    loading: tableLoading, 
    error: tableError, 
    total: tableTotal,
    refetch: refetchTableHistory
  } = useSpeedTestHistory(tableLimit, tableOffset, dateFilters, !authLoading);
  
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

  const chartData = [...allHistory]
    .reverse()
    .map(test => ({
      date: formatDate(test.created_at),
      download: test.download_speed_mbps || 0,
      upload: test.upload_speed_mbps || 0,
      ping: test.ping_avg_ms || 0,
      jitter: test.jitter_ms || 0,
      healthScore: test.network_health_score || 0,
      gamingScore: test.gaming_score || 0,
      streamingScore: test.streaming_score || 0,
      videoCallScore: test.video_call_score || 0,
      browsingScore: test.browsing_score || 0
    }));

  // Get first and last dates in chartData
  const getDateRange = () => {
    if (chartData.length === 0) return null;
    const firstDate = chartData[0].date;
    const lastDate = chartData[chartData.length - 1].date;
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
  const shouldShowTableSkeleton = activeTab === 'history' && (tableLoading || (allLoading && allHistory.length === 0));
  const shouldShowInsightsSkeleton = activeTab === 'insights' && allLoading;
  const shouldShowTrendsSkeleton = activeTab === 'trends' && allLoading;

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

  return (
    <div className="history-page">
      <Loading isLoading={allLoading || tableLoading} progress={progress} message="Loading test history" status="AkovoLabs Test History System v1.0" />
      
      {/* Title Section */}
      {!allLoading && (
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
              onClick={() => setActiveTab('trends')}
            >
              Trends
            </button>
            <button 
              className={`history-tab ${activeTab === 'insights' ? 'history-tab--active' : ''}`}
              onClick={() => setActiveTab('insights')}
            >
              Insights
            </button>
            <button 
              className={`history-tab ${activeTab === 'history' ? 'history-tab--active' : ''}`}
              onClick={() => setActiveTab('history')}
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
                          <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
                              <XAxis 
                                dataKey="date" 
                                stroke="var(--text-muted)" 
                                tick={{ fontSize: 11 }} 
                                interval={Math.floor(chartData.length / 5)} 
                              />
                              <YAxis 
                                stroke="var(--text-muted)" 
                                tick={{ fontSize: 11 }} 
                              />
                              <Tooltip 
                                contentStyle={{
                                  backgroundColor: 'var(--glass-bg)',
                                  border: '1px solid var(--glass-border)',
                                  borderRadius: 'var(--radius-md)'
                                }}
                              />
                              <Legend wrapperStyle={{ fontSize: 12 }} />
                              <Line
                                type="monotone"
                                dataKey="download"
                                stroke="var(--download)"
                                strokeWidth={2}
                                dot={{ r: 3 }}
                                name="Download (Mbps)"
                              />
                              <Line
                                type="monotone"
                                dataKey="upload"
                                stroke="var(--upload)"
                                strokeWidth={2}
                                dot={{ r: 3 }}
                                strokeDasharray="5 5"
                                name="Upload (Mbps)"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                          {dateRange && (
                            <p className="graph-date-range">
                              Showing results from {dateRange.firstDate} to {dateRange.lastDate}
                            </p>
                          )}
                        </div>

                        {/* Graph 2: Latency Quality */}
                        <div className="graph-card">
                          <h3 className="graph-title">Latency Quality</h3>
                          <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
                              <XAxis 
                                dataKey="date" 
                                stroke="var(--text-muted)" 
                                tick={{ fontSize: 11 }} 
                                interval={Math.floor(chartData.length / 5)} 
                              />
                              <YAxis 
                                stroke="var(--text-muted)" 
                                tick={{ fontSize: 11 }} 
                              />
                              <Tooltip 
                                contentStyle={{
                                  backgroundColor: 'var(--glass-bg)',
                                  border: '1px solid var(--glass-border)',
                                  borderRadius: 'var(--radius-md)'
                                }}
                              />
                              <Legend wrapperStyle={{ fontSize: 12 }} />
                              <Line
                                type="monotone"
                                dataKey="ping"
                                stroke="var(--ping)"
                                strokeWidth={2}
                                dot={{ r: 3 }}
                                name="Ping (ms)"
                              />
                              <Line
                                type="monotone"
                                dataKey="jitter"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                dot={{ r: 3 }}
                                strokeDasharray="5 5"
                                name="Jitter (ms)"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                          {dateRange && (
                            <p className="graph-date-range">
                              Showing results from {dateRange.firstDate} to {dateRange.lastDate}
                            </p>
                          )}
                        </div>

                        {/* Graph 3: Network Health Score */}
                        <div className="graph-card">
                          <h3 className="graph-title">Network Health Score</h3>
                          <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={chartData}>
                              <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
                              <XAxis 
                                dataKey="date" 
                                stroke="var(--text-muted)" 
                                tick={{ fontSize: 11 }} 
                                interval={Math.floor(chartData.length / 5)} 
                              />
                              <YAxis 
                                stroke="var(--text-muted)" 
                                tick={{ fontSize: 11 }} 
                                domain={[0, 100]}
                              />
                              <Tooltip 
                                contentStyle={{
                                  backgroundColor: 'var(--glass-bg)',
                                  border: '1px solid var(--glass-border)',
                                  borderRadius: 'var(--radius-md)'
                                }}
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
                              <ResponsiveContainer width="100%" height={300}>
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                  <PolarGrid stroke="var(--glass-border)" />
                                  <PolarAngleAxis dataKey="subject" stroke="var(--text-primary)" tick={{ fontSize: 12 }} />
                                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="var(--text-muted)" />
                                  <Radar name="Best Test" dataKey="A" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.6} />
                                  <Legend wrapperStyle={{ fontSize: 12 }} />
                                  <Tooltip 
                                    contentStyle={{
                                      backgroundColor: 'var(--glass-bg)',
                                      border: '1px solid var(--glass-border)',
                                      borderRadius: 'var(--radius-md)'
                                    }}
                                  />
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
                              Port Risk Detection
                            </li>
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
                            Export CSV
                          </button>
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
