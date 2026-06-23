import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import useSpeedTestHistory from '../../hooks/useSpeedTestHistory';
import Loading from '../../components/loading/Loading';
import heroImage from '../../assets/hero/Modern_office_with_data_flow_dynamics.png';
import womanAvatar from '../../assets/avatars/woman_instructor_avatar.png';
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

function History() {
  const [tableLimit] = useState(10);
  const [tableOffset, setTableOffset] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);
  const [expandedTestId, setExpandedTestId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [activeTab, setActiveTab] = useState('trends');
  
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
    refetch: refetchAll 
  } = useSpeedTestHistory(1000, 0, dateFilters);

  // Fetch paginated history for the table (limit 10)
  const { 
    history: tableHistory, 
    loading: tableLoading, 
    error: tableError, 
    total: tableTotal, 
    refetch: refetchTable 
  } = useSpeedTestHistory(tableLimit, tableOffset, dateFilters);

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
    return 'var(--danger)';
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
      icon: '📊',
      title: 'Speed Overview',
      message: `Your average download speed is ${summary?.avgDownload} Mbps and upload is ${summary?.avgUpload} Mbps.`
    });

    if (parseInt(summary?.avgPing) < 50) {
      insights.push({
        type: 'success',
        icon: '⚡',
        title: 'Excellent Latency',
        message: 'Your ping is consistently low, great for gaming and video calls!'
      });
    } else if (parseInt(summary?.avgPing) < 100) {
      insights.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Moderate Latency',
        message: 'Your ping is acceptable, but could be better for real-time applications.'
      });
    } else {
      insights.push({
        type: 'danger',
        icon: '🚨',
        title: 'High Latency',
        message: 'Your ping is quite high, consider checking your network connection.'
      });
    }

    insights.push({
      type: 'success',
      icon: '🏆',
      title: 'Best Performance',
      message: `Your best test achieved a health score of ${summary?.bestTest?.network_health_score?.toFixed(0)}!`
    });

    return insights;
  };

  const aiInsights = generateAIInsights();

  const filteredTests = [...tableHistory].filter(test => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      test.isp_name?.toLowerCase().includes(query) ||
      formatDate(test.created_at).toLowerCase().includes(query)
    );
  }).sort((a, b) => {
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
    const rows = filteredTests.map(test => [
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

  if (allLoading || tableLoading) {
    return (
      <div className="history-page">
        {/* Title Section */}
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
          <Loading />
        </div>
      </div>
    );
  }

  if (allError || tableError) {
    return (
      <div className="history-page">
        {/* Title Section */}
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
          <div className="history-error">
            <p>{allError || tableError}</p>
            <button className="retry-btn" onClick={() => { refetchAll(); refetchTable(); }}>Try Again</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="history-page">
      {/* Title Section */}
      <div className="history-title-section">
        <h1 className="history-title-section-title">Test History</h1>
        <div className="history-subtitle-with-avatar">
          <img src={womanAvatar} alt="Instructor" className="subtitle-avatar" />
          <div className="subtitle-text">
            <p className="history-title-section-subtitle">Review your past speed tests, track performance trends, and gain insights into your network health.</p>
            <p className="pro-tip-text">
              <span className="pro-tip-label">Pro Tip!</span> For the most accurate results, close background apps and use a wired connection when testing. Run multiple tests at different times to get a better picture of your network's performance!
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
        {/* Empty State */}
        {allHistory.length === 0 && (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            <p>No tests yet. Run your first speed test!</p>
            <Link to="/" className="link-btn">Go to Speed Test</Link>
          </div>
        )}

        {allHistory.length > 0 && (
          <>
            {/* Trends Tab Content */}
            {activeTab === 'trends' && (
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
                {chartData.length > 0 && (
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

                    {/* Graph 4: Experience Scores (Radar Chart) */}
                    <div className="graph-card">
                      <h3 className="graph-title">Experience Scores</h3>
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
                      {dateRange && (
                        <p className="graph-date-range">
                          Showing results from {dateRange.firstDate} to {dateRange.lastDate}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Insights Tab Content */}
            {activeTab === 'insights' && (
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
                {aiInsights.length > 0 && (
                  <div className="ai-insights-section">
                    <h2 className="section-title">AI Insights</h2>
                    <div className="ai-insights-grid">
                      {aiInsights.map((insight, index) => (
                        <div key={index} className={`ai-insight-card ai-insight-card--${insight.type}`}>
                          <div className="ai-insight-icon">{insight.icon}</div>
                          <div className="ai-insight-content">
                            <h4 className="ai-insight-title">{insight.title}</h4>
                            <p className="ai-insight-message">{insight.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* History Tab Content */}
            {activeTab === 'history' && (
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
                {tableHistory.length > 0 && (
                  <div className="test-table-section">
                    <div className="test-table-header">
                      <h2 className="section-title">Test History</h2>
                      <div className="test-table-controls">
                        <input
                          type="text"
                          placeholder="Search tests..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="search-input"
                        />
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
                            <>
                              <tr 
                                key={test.id} 
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
                                <tr key={`${test.id}-expanded`} className="test-table-row--expanded">
                                  <td colSpan={8} className="test-table-cell--expanded">
                                    <div className="test-details-container">
                                      <div className="test-details-section">
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

                                      <div className="test-details-section">
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

                                      {test.ai_summary && (
                                        <div className="test-details-section">
                                          <h4 className="test-details-section-title">AI Analysis</h4>
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
                            </>
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
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default History;
