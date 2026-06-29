import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import SpeedMeter from '../../components/speedmeter/SpeedMeter';
import loginLogo from '../../assets/avatars/login_plain_ai_speedtest_cropped.png';
import aiIcon from '../../assets/avatars/ai.png';
import speakerAvatar from '../../assets/avatars/woman_instructor_avatar.png';
import StatsCards from '../../components/stats_cards/StatsCards';
import TimeSeriesGraphs from '../../components/time_series/TimeSeriesGraphs';
import Modal from '../../components/modal/Modal';
import ErrorModal from '../../components/error_modal/ErrorModal';
import { useSpeedTest } from '../../hooks/useSpeedTest';
import { useAuth } from '../../context/AuthContext';

function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const {
    startTest,
    stopTest,
    resetTest,
    phase,
    loading,
    error,
    currentSpeed,
    testResult,
    isRunning,
    isComplete
  } = useSpeedTest();

  // Watch for error state and open error modal
  useEffect(() => {
    if (error) {
      setShowErrorModal(true);
    }
  }, [error]);

  // Reset error state when closing modal
  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
    resetTest();
  };
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
              <img src={loginLogo} alt="AkovoLabs Logo" className="logo-overlay-icon" />
            </div>
          </div>
          {loading && (
            <div className="phase-logger">
              {getPhaseLabel()}
            </div>
          )}
          <button 
            className="begin-test-btn"
            onClick={() => {
              if (isRunning) {
                stopTest();
              } else if (isComplete) {
                resetTest();
              } else {
                if (!user) {
                  setIsModalOpen(true);
                } else {
                  startTest();
                }
              }
            }}
          >
            {isRunning ? (
              'Stop Test'
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

          <div className="graph-advisory">
            <h3 className="graph-advisory-title">Understand Your Speedtest</h3>
            <p>• <strong>Download Speed Over Time:</strong> Shows consistency of connection</p>
            <p>• <strong>Upload Speed Over Time:</strong> Measures upload performance</p>
            <p>• <strong>App Latency:</strong> Tracks how quickly your device reaches this service during the test</p>
          </div>
        </div>
        <div className={`home-col ${!isRunning && !isComplete ? 'home-col--center' : ''}`}>
          {!isRunning && !isComplete ? (
            <section className="speaker-section" aria-label="How to read this test">
              <img
                src={speakerAvatar}
                alt="Instructor avatar"
                className="speaker-avatar"
              />
              <div className="speaker-card">
                <span className="speaker-tag">How To Use This Test</span>     
                <h3 className="speaker-title">Test your current network speed</h3>
                <p className="speaker-text">
                  You can run a speed test from your current device and connection. If you're on home Wi-Fi, the results reflect your real-world experience right now.
                </p>
                <p className="speaker-text">
                  It measures device-to-server performance, not a deep inspection of your router, signal strength, or every internal Wi-Fi detail.
                </p>
                <p className="speaker-text">
                  {user ? (
                    "Now that you are signed in, don't forget to check your test graphs and history below!"
                  ) : (
                    <>
                      <strong>Sign in</strong> or <strong>Sign up</strong> to get more detailed insights about your network performance!
                    </>
                  )}
                </p>
              </div>
            </section>
          ) : (
            <>
              <StatsCards testResult={testResult} isLoading={isRunning} />     
              {(isRunning || isComplete) && (
                <div className="ai-summary-section">
                  <h3 className="ai-summary-title">
                    <img src={aiIcon} alt="AI Icon" className="ai-summary-icon" />
                    AI-Powered Summary
                  </h3>
                  {isRunning || (testResult && !testResult.ai_summary) ? (
                    <p className="skeleton ai-summary-text"></p>
                  ) : testResult && (
                    <p className="ai-summary-text">
                      {aiSummaryText}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {testResult && (
        <div className="graphs-section">
          <TimeSeriesGraphs testResult={testResult} />
        </div>
      )}
      <Modal
        isOpen={isModalOpen}
        message="Sign in to get detailed insights from your speed test results. Would you like to proceed to the sign-in page?"
        leftOption={{
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ),
          label: "Cancel",
          onClick: () => setIsModalOpen(false)
        }}
        rightOption={{
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ),
          label: "Proceed",
          onClick: () => {
            setIsModalOpen(false);
            navigate('/login');
          }
        }}
      />
      <ErrorModal
        isOpen={showErrorModal}
        message={error}
        onClose={handleCloseErrorModal}
      />
    </div>
  );
}

export default Home;
