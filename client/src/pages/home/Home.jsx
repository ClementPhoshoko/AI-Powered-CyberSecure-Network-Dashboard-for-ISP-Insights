import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import './Home.css';
import SpeedMeter from '../../components/speedmeter/SpeedMeter';
import loginLogo from '../../assets/avatars/login_plain_ai_speedtest_cropped.png';
import aiIcon from '../../assets/avatars/ai.png';
import speakerAvatar from '../../assets/avatars/woman_instructor_avatar.png';
import StatsCards from '../../components/stats_cards/StatsCards';
import TimeSeriesGraphs from '../../components/time_series/TimeSeriesGraphs';
import ErrorModal from '../../components/error_modal/ErrorModal';
import { useSpeedTest } from '../../hooks/useSpeedTest';
import { useAuth } from '../../context/AuthContext';
import Seo from '../../components/seo/Seo';

function useTypewriter(text, speed = 30) {
  const [displayed, setDisplayed] = useState('');
  const indexRef = useRef(0);

  useEffect(() => {
    indexRef.current = 0;
    setDisplayed('');
    if (!text) return;
    const timer = setInterval(() => {
      indexRef.current++;
      setDisplayed(text.slice(0, indexRef.current));
      if (indexRef.current >= text.length) {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return displayed;
}

const fadeVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 }
}

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
}

const fadeTransition = {
  duration: 0.25,
  ease: [0.25, 0.1, 0.25, 1]
}

function AnimatedSummaryText({ text, animate }) {
  const displayed = useTypewriter(text, animate ? 25 : 0);
  return <>{displayed}</>;
}

function Home() {
  const { t } = useTranslation();
  const [showErrorModal, setShowErrorModal] = useState(false);
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
            <AnimatePresence mode="wait">
              {!isRunning && !isComplete ? (
                <motion.div
                  key="logo"
                  className="logo-overlay"
                  exit={{ opacity: 0, scale: 1.5, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } }}
                >
                  <img src={loginLogo} alt={t('imageAlt.akovolabsLogo')} className="logo-overlay-icon" width="721" height="605" />
                </motion.div>
              ) : (
                <motion.div
                  key="speedmeter"
                  className="speedmeter-container"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <SpeedMeter
                    value={isComplete ? (testResult?.download_speed_mbps || 0) : currentSpeed}
                    type={phase === 'upload' ? 'upload' : 'download'}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                key={phase || 'idle'}
                className="phase-logger"
                variants={fadeVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={fadeTransition}
              >
                {getPhaseLabel()}
              </motion.div>
            )}
          </AnimatePresence>
          <button
            className="begin-test-btn"
            onClick={() => {
              if (isRunning) {
                stopTest();
              } else if (isComplete) {
                resetTest();
              } else {
                startTest();
              }
            }}
          >
            <AnimatePresence mode="wait">
              {isRunning ? (
                <motion.span
                  key="stop"
                  variants={fadeVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={fadeTransition}
                >
                  {t('speedtest:buttons.stopTest')}
                </motion.span>
              ) : isComplete ? (
                <motion.span
                  key="run-again"
                  variants={fadeVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={fadeTransition}
                >
                  {t('speedtest:buttons.runAgain')}
                </motion.span>
              ) : (
                <motion.span
                  key="begin"
                  variants={fadeVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={fadeTransition}
                >
                  <svg className="begin-test-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5v14l11-7z" fill="currentColor"/>
                  </svg>
                  {t('speedtest:buttons.beginTest')}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {!user && !isRunning && !isComplete && (
            <p className="guest-badge">{t('home.guestMode')}</p>
          )}
          <AnimatePresence mode="wait">
            {!isRunning && !isComplete ? (
              <motion.div
                key="advisory"
                className="graph-advisory"
                variants={fadeVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={fadeTransition}
              >
                <h3 className="graph-advisory-title">{t('speedtest:advisory.heading')}</h3>
                <p>{t('speedtest:advisory.downloadOverTime')}</p>
                <p>{t('speedtest:advisory.uploadOverTime')}</p>
                <p>{t('speedtest:advisory.appLatency')}</p>
              </motion.div>
            ) : isRunning || (testResult && !testResult.ai_summary) ? (
              <motion.div
                key="skeleton"
                className="ai-summary-section is-loading"
                variants={fadeVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={fadeTransition}
              >
                <h3 className="ai-summary-title">
                  <img src={aiIcon} alt={t('imageAlt.aiIcon')} className="ai-summary-icon" />
                  {t('speedtest:aiSummary.heading')}
                </h3>
              </motion.div>
            ) : testResult && (
              <motion.div
                key="summary"
                className="ai-summary-section"
                variants={fadeVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={fadeTransition}
              >
                <h3 className="ai-summary-title">
                  <img src={aiIcon} alt={t('imageAlt.aiIcon')} className="ai-summary-icon" />
                  {t('speedtest:aiSummary.heading')}
                </h3>
                <p className="ai-summary-text">
                  <AnimatedSummaryText text={aiSummaryText} animate={!!testResult?.ai_summary} />
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className={`home-col ${!isRunning && !isComplete ? 'home-col--center' : ''}`}>
          <AnimatePresence mode="wait">
            {!isRunning && !isComplete ? (
              <motion.section
                key="speaker"
                className="speaker-section"
                aria-label={t('speedtest:howToUse.heading')}
                variants={fadeVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={fadeTransition}
              >
                <img
                  src={speakerAvatar}
                  alt={t('imageAlt.instructorAvatar')}
                  className="speaker-avatar"
                />
                <motion.div
                  className="speaker-card"
                  variants={cardVariants}
                  initial="initial"
                  animate="animate"
                  transition={{ ...fadeTransition, delay: 0.1 }}
                >
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
                      <>{t('speedtest:howToUse.signedOut').split(/\*\*(.*?)\*\*/g).map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}</>
                    )}
                  </p>
                  <p className="speaker-text speaker-text--note">
                    {t('speedtest:howToUse.alsoNote')}
                  </p>
                </motion.div>
              </motion.section>
            ) : (
              <motion.div
                key="stats"
                className="stats-wrapper"
                variants={fadeVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={fadeTransition}
              >
                <StatsCards testResult={testResult} isLoading={isRunning} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <AnimatePresence>
        {testResult && (
          <motion.div
            key="graphs"
            className="graphs-section"
            variants={fadeVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={fadeTransition}
          >
            <TimeSeriesGraphs testResult={testResult} />
          </motion.div>
        )}
      </AnimatePresence>
      <ErrorModal
        isOpen={showErrorModal}
        message={error}
        onClose={handleCloseErrorModal}
      />
    </div>
  );
}

export default Home;
