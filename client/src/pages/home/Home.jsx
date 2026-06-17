import React, { useState } from 'react';
import './Home.css';
import SpeedMeter from '../../components/speedmeter/SpeedMeter';
import loginLogo from '../../assets/avatars/login_plain_ai_speedtest_cropped.png';
import aiIcon from '../../assets/avatars/ai.png';
import StatsCards from '../../components/stats_cards/StatsCards';

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
    browsing_score: 98
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
    </div>
  );
}

export default Home;
