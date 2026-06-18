import './Home.css';
import SpeedMeter from '../../components/speedmeter/SpeedMeter';
import loginLogo from '../../assets/avatars/login_plain_ai_speedtest_cropped.png';
import aiIcon from '../../assets/avatars/ai.png';
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

  const getPhaseLabel = () => {
    switch (phase) {
      case 'initializing': return 'Initializing...';
      case 'ping': return 'Testing Ping...';
      case 'download': return 'Testing Download...';
      case 'upload': return 'Testing Upload...';
      case 'calculating': return 'Calculating Scores...';
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
            <p>• <strong>Ping Latency:</strong> Tracks response time consistency</p>
          </div>
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
                  Your connection is excellent overall. It performs well for gaming, streaming, and video calls, providing a smooth experience for all your online activities.
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
