import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import useSpeedTestHistory from '../../hooks/useSpeedTestHistory';
import Loading from '../../components/loading/Loading';
import './History.css';

function History() {
  const [tableLimit] = useState(10);
  const [tableOffset, setTableOffset] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expandedTestId, setExpandedTestId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');

  const dateFilters = useMemo(() => ({
    startDate: startDate || undefined,
    endDate: endDate || undefined
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
        <div className="history-container">
          <Loading />
        </div>
      </div>
    );
  }

  if (allError || tableError) {
    return (
      <div className="history-page">
        <div className="history-container">
          <h1 className="history-title">Test History</h1>
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
      <div className="history-container">
        <h1 className="history-title">Test History</h1>

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

            <div className="summary-mini-card summary-mini-card--best">
              <span className="summary-mini-value">{summary.bestTest.network_health_score?.toFixed(0) || 0}</span>
              <span className="summary-mini-label">Best Test Ever</span>
            </div>

            <div className="summary-mini-card summary-mini-card--worst">
              <span className="summary-mini-value">{summary.worstTest.network_health_score?.toFixed(0) || 0}</span>
              <span className="summary-mini-label">Worst Test Ever</span>
            </div>
          </div>
        )}

        {/* Section 2: Performance Trends */}
        {chartData.length > 0 && (
          <div className="trends-section">
            <div className="trends-header">
              <h2 className="section-title">Performance Trends</h2>
              <div className="date-filters">
                <label>
                  <span className="date-label">From</span>
                  <input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => { setStartDate(e.target.value); setTableOffset(0); }} 
                    className="date-input"
                  />
                </label>
                <label>
                  <span className="date-label">To</span>
                  <input 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => { setEndDate(e.target.value); setTableOffset(0); }} 
                    className="date-input"
                  />
                </label>
                <button 
                  className="clear-filters-btn"
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
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
            </div>
          </div>
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
      </div>
    </div>
  );
}

export default History;
