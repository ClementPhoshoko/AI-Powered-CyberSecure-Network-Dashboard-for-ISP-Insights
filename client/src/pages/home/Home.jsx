import React, { useState } from 'react';
import './Home.css';
import SpeedMeter from '../../components/speedmeter/SpeedMeter';
import loginLogo from '../../assets/avatars/login_plain_ai_speedtest_cropped.png';
import aiIcon from '../../assets/avatars/ai.png';
import StatsCards from '../../components/stats_cards/StatsCards';
import TimeSeriesGraphs from '../../components/time_series/TimeSeriesGraphs';

function Home() {
  const [testStarted, setTestStarted] = useState(false);
  const [testResult, setTestResult] = useState({
    download_speed_mbps: 850,
    upload_speed_mbps: 420,
    ping_avg_ms: 15,
    jitter_ms: 2,
    packet_loss_percent: 0.1,
    network_health_score: 92,
    gaming_score: 18,
    streaming_score: 95,
    video_call_score: 90,
    browsing_score: 98,
    download_measurements: [
      { file_size_mb: 50, download_speed_mbps: 820 },
      { file_size_mb: 100, download_speed_mbps: 850 },
      { file_size_mb: 150, download_speed_mbps: 835 },
      { file_size_mb: 200, download_speed_mbps: 860 }
    ],
    upload_measurements: [
      { file_size_mb: 25, upload_speed_mbps: 400 },
      { file_size_mb: 50, upload_speed_mbps: 420 },
      { file_size_mb: 75, upload_speed_mbps: 415 }
    ],
    ping_measurements: [
      { sequence_number: 1, latency_ms: 14 },
      { sequence_number: 2, latency_ms: 15 },
      { sequence_number: 3, latency_ms: 16 },
      { sequence_number: 4, latency_ms: 15 },
      { sequence_number: 5, latency_ms: 14 }
    ]
  });

  return (
    <div className="home-page">
      <div className="home-container">
        <h1 className="home-title">AI-Powered Network Speed Testing</h1>
        <div className="home-col">
          <div className="speedmeter-wrapper">
            <div className={`speedmeter-container ${testStarted ? 'speedmeter-container--visible' : ''}`}>
              <SpeedMeter value={850} type="download" />
            </div>
            <div className={`logo-overlay ${testStarted ? 'logo-overlay--open' : ''}`}>
              <img src={loginLogo} alt="CyberSecure Logo" className="logo-overlay-icon" />
            </div>
          </div>
          <button 
            className="begin-test-btn"
            onClick={() => setTestStarted(true)}
          >
            <svg className="begin-test-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 5v14l11-7z" fill="currentColor"/>
            </svg>
            Begin Test
          </button>
          <div className="graph-advisory">
            <h3 className="graph-advisory-title">Understand Your Speedtest</h3>
            <p>• <strong>Download Speed Over Time:</strong> Shows consistency of connection</p>
            <p>• <strong>Upload Speed Over Time:</strong> Measures upload performance</p>
            <p>• <strong>Ping Latency:</strong> Tracks response time consistency</p>
          </div>
        </div>
        <div className="home-col">
          <StatsCards testResult={testResult} />
          <div className="ai-summary-section">
            <h3 className="ai-summary-title">
              <img src={aiIcon} alt="AI Icon" className="ai-summary-icon" />
              AI-Powered Summary
            </h3>
            <p className="ai-summary-text">
              Your connection is excellent overall. It performs well for gaming, streaming, and video calls, providing a smooth experience for all your online activities.
            </p>
          </div>
        </div>
      </div>
      <div className="graphs-section">
        <TimeSeriesGraphs testResult={testResult} />
      </div>
    </div>
  );
}

export default Home;
