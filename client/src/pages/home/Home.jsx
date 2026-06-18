import './Home.css';
import SpeedMeter from '../../components/speedmeter/SpeedMeter';
import loginLogo from '../../assets/avatars/login_plain_ai_speedtest_cropped.png';
import aiIcon from '../../assets/avatars/ai.png';
import speakerAvatar from '../../assets/avatars/woman_instructor_avatar.png';
import StatsCards from '../../components/stats_cards/StatsCards';
import TimeSeriesGraphs from '../../components/time_series/TimeSeriesGraphs';
import { useSpeedTest } from '../../hooks/useSpeedTest';

function Home() {
  const {
    startTest,
    resetTest,
    phase,
    loading,
    error,
    currentSpeed,
    testResult,
    isRunning,
    isComplete
  } = useSpeedTest();
  const aiSummaryText =
    testResult?.ai_summary ||
    'Your speed test summary will appear here after the system interprets the results.';

  const getPhaseLabel = () => {
    switch (phase) {
      case 'initializing': return 'Initializing...';
      case 'ping': return 'Testing App Latency...';
      case 'download': return 'Testing Download...';
      case 'upload': return 'Testing Upload...';
      case 'calculating': return 'Calculating Derived Scores...';
      default: return '';
    }
  };

  return (
    <div className="home-page">
      <div className="home-container">
        <h1 className="home-title">AI-Powered Network Speed Testing</h1>
        <div className="home-col">
          <div className="speedmeter-wrapper">
            <div className={`speedmeter-container ${isRunning || isComplete ? 'speedmeter-container--visible' : ''}`}>
              <SpeedMeter 
                value={isComplete ? (testResult?.download_speed_mbps || 0) : currentSpeed} 
                type={phase === 'upload' ? 'upload' : 'download'} 
              />
            </div>
            <div className={`logo-overlay ${isRunning || isComplete ? 'logo-overlay--open' : ''}`}>
              <img src={loginLogo} alt="CyberSecure Logo" className="logo-overlay-icon" />
            </div>
          </div>
          <button 
            className="begin-test-btn"
            onClick={isComplete ? resetTest : startTest}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                {getPhaseLabel()}
              </>
            ) : isComplete ? (
              'Run Again'
            ) : (
              <>
                <svg className="begin-test-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 5v14l11-7z" fill="currentColor"/>
                </svg>
                Begin Test
              </>
            )}
          </button>

          {error && (
            <div className="error-message">
              Error: {error}
            </div>
          )}

          <div className="graph-advisory">
            <h3 className="graph-advisory-title">Understand Your Speedtest</h3>
            <p>• <strong>Download Speed Over Time:</strong> Shows consistency of connection</p>
            <p>• <strong>Upload Speed Over Time:</strong> Measures upload performance</p>
            <p>• <strong>App Latency:</strong> Tracks how quickly your device reaches this service during the test</p>
          </div>

          <section className="speaker-section" aria-label="How to read this test">
            <img
              src={speakerAvatar}
              alt="Instructor avatar"
              className="speaker-avatar"
            />
            <div className="speaker-card">
              <span className="speaker-tag">How To Read This Test</span>
              <h3 className="speaker-title">Visitors can test the network they are using right now</h3>
              <p className="speaker-text">
                Anyone opening your website can run a speed test from their current device and connection. If they are on home Wi-Fi, the results reflect that real-world experience to your service.
              </p>
              <p className="speaker-text">
                It measures device-to-server performance, not a deep inspection of the router, signal strength, or every internal Wi-Fi detail.
              </p>
            </div>
          </section>
        </div>
        <div className="home-col">
          {testResult && (
            <>
              <StatsCards testResult={testResult} />
              <div className="ai-summary-section">
                <h3 className="ai-summary-title">
                  <img src={aiIcon} alt="AI Icon" className="ai-summary-icon" />
                  AI-Powered Summary
                </h3>
                <p className="ai-summary-text">
                  {aiSummaryText}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      {testResult && (
        <div className="graphs-section">
          <TimeSeriesGraphs testResult={testResult} />
        </div>
      )}
    </div>
  );
}

export default Home;
