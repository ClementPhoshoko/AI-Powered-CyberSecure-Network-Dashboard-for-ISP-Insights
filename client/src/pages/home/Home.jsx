import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
import Seo from '../../components/seo/Seo';

function Home() {
  const { t } = useTranslation();
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
    t('speedtest:aiSummary.placeholder');

  const getPhaseLabel = () => {
    switch (phase) {
      case 'initializing': return t('speedtest:phases.initializing');
      case 'ping': return t('speedtest:phases.appLatency');
      case 'download': return t('speedtest:phases.download');
      case 'upload': return t('speedtest:phases.upload');
      case 'calculating': return t('speedtest:phases.derivedScores');
      default: return '';
    }
  };

  return (
    <div className="home-page">
      <Seo title={t('seo.homeTitle')} description={t('seo.homeDesc')} path="/" />
        <div className="home-container">
        <h1 className="home-title">{t('speedtest:hero.heading')}</h1>
        <div className="home-col">
          <div className="speedmeter-wrapper">
            <div className={`speedmeter-container ${isRunning || isComplete ? 'speedmeter-container--visible' : ''}`}>
              <SpeedMeter 
                value={isComplete ? (testResult?.download_speed_mbps || 0) : currentSpeed} 
                type={phase === 'upload' ? 'upload' : 'download'} 
              />
            </div>
            <div className={`logo-overlay ${isRunning || isComplete ? 'logo-overlay--open' : ''}`}>
              <img src={loginLogo} alt={t('imageAlt.akovolabsLogo')} className="logo-overlay-icon" />
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
              t('speedtest:buttons.stopTest')
            ) : isComplete ? (
              t('speedtest:buttons.runAgain')
            ) : (
              <>
                <svg className="begin-test-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 5v14l11-7z" fill="currentColor"/>
                </svg>
                {t('speedtest:buttons.beginTest')}
              </>
            )}
          </button>

          {!isRunning && !isComplete ? (
            <div className="graph-advisory">
              <h3 className="graph-advisory-title">{t('speedtest:advisory.heading')}</h3>
              <p>{t('speedtest:advisory.downloadOverTime')}</p>
              <p>{t('speedtest:advisory.uploadOverTime')}</p>
              <p>{t('speedtest:advisory.appLatency')}</p>
            </div>
          ) : isRunning || (testResult && !testResult.ai_summary) ? (
            <div className="ai-summary-section is-loading" />
          ) : testResult && (
            <div className="ai-summary-section">
              <h3 className="ai-summary-title">
                <img src={aiIcon} alt={t('imageAlt.aiIcon')} className="ai-summary-icon" />
                {t('speedtest:aiSummary.heading')}
              </h3>
              <p className="ai-summary-text">
                {aiSummaryText}
              </p>
            </div>
          )}
        </div>
        <div className={`home-col ${!isRunning && !isComplete ? 'home-col--center' : ''}`}>
          {!isRunning && !isComplete ? (
            <section className="speaker-section" aria-label={t('speedtest:howToUse.heading')}>
              <img
                src={speakerAvatar}
                alt={t('imageAlt.instructorAvatar')}
                className="speaker-avatar"
              />
              <div className="speaker-card">
                <span className="speaker-tag">{t('speedtest:howToUse.tag')}</span>     
                <h3 className="speaker-title">{t('speedtest:howToUse.heading')}</h3>
                <p className="speaker-text">
                  {t('speedtest:howToUse.currentDevice')}
                </p>
                <p className="speaker-text">
                  {t('speedtest:howToUse.deviceToServer')}
                </p>
                <p className="speaker-text">
                  {user ? (
                    t('speedtest:howToUse.signedIn')
                  ) : (
                    <>{t('speedtest:howToUse.signedOut')}</>
                  )}
                </p>
              </div>
            </section>
          ) : (
            <StatsCards testResult={testResult} isLoading={isRunning} />
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
        message={t('home.signInModal.message')}
        leftOption={{
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ),
          label: t('home.signInModal.cancel'),
          onClick: () => setIsModalOpen(false)
        }}
        rightOption={{
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ),
          label: t('home.signInModal.proceed'),
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
