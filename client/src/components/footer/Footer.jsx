import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import loginLogo from '../../assets/avatars/login_plain_ai_speedtest_cropped.png';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../hooks/useProfile';
import { useSubscriber } from '../../hooks/useSubscriber';
import Loading from '../../components/loading/Loading';
import FooterSkeleton from './FooterSkeleton';
import './Footer.css';

function Footer() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const { profile } = useProfile(!authLoading && !!user);
  const { subscriber, loading: subLoading, subscribe, unsubscribe } = useSubscriber(!authLoading && !!user);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  

  useEffect(() => {
    let interval;
    if (isProcessing) {
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
  }, [isProcessing]);

  const handleSubscribe = async () => {
    if (!user?.email) return;
    
    try {
      setIsProcessing(true);
      setProgress(0);
      
      await subscribe({
        email: user.email,
        first_name: profile?.first_name,
        last_name: profile?.last_name
      });
      setProgress(100);
    } catch (err) {
      // Don't log "Already subscribed" error
      if (!err.message?.includes('Already subscribed')) {
        console.error('Subscription failed:', err);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnsubscribe = async () => {
    try {
      setIsProcessing(true);
      setProgress(0);
      await unsubscribe();
      setProgress(100);
    } catch (err) {
      console.error('Unsubscribe failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Loading 
        isLoading={isProcessing} 
        progress={progress}
        message={subscriber ? t('footer.updating') : t('footer.subscribing')}
        status={t('footer.newsletterStatus')}
      />
      <footer className="footer-container">
        <div className="footer-content">
          {/* Left Section */}
          <div className="footer-left">
            <div className="footer-logo">
              <img src={loginLogo} alt={t('imageAlt.akovolabsLogo')} className="footer-logo-icon" />
              <span className="footer-logo-text">{t('app.name')}</span>
            </div>
            <p className="footer-tagline">{t('footer.tagline')}</p>
            <p className="footer-description">
              {t('app.description')}
            </p>
          </div>

          {/* Right Section */}
          {authLoading ? (
            <FooterSkeleton />
          ) : (
            <div className="footer-subscribe">
              {user && (
                <div className="footer-form-field">
                  <label className="footer-form-label">
                    {t('footer.newsletter')}
                  </label>
                  <p className="footer-form-note">{t('footer.newsletterNote')}</p>
                  <div className="footer-form-wrapper">
                    <button 
                      type="button" 
                      className={`footer-form-button ${subscriber ? 'footer-form-button--unsubscribe' : 'footer-form-button--subscribe'}`}
                      onClick={subscriber ? handleUnsubscribe : handleSubscribe}
                      disabled={isProcessing || (!subscriber && !user?.email)}
                    >
                      {isProcessing ? (subscriber ? t('footer.unsubscribing') : t('footer.subscribing')) : (subscriber ? t('footer.unsubscribe') : t('footer.subscribe'))}
                    </button>
                  </div>
                </div>
              )}
              <div className="footer-apps-section">
                <p className="footer-apps-text">{t('footer.mobileApp')}</p>
                <p className="footer-apps-subtitle">{t('footer.mobileAppDesc')}</p>
                <div className="footer-apps-links">
                  <Link to="/download/android" className="footer-apps-link">{t('footer.android')}</Link>
                  <span className="footer-apps-divider">|</span>
                  <Link to="/download/ios" className="footer-apps-link">{t('footer.ios')}</Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            {t('app.copyright')}
          </p>
        </div>
      </footer>
    </>
  );
}

export default Footer;
