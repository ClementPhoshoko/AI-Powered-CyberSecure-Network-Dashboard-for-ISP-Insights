import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import loginLogo from '../../assets/avatars/login_plain_ai_speedtest_cropped.png';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../hooks/useProfile';
import { useSubscriber } from '../../hooks/useSubscriber';
import Loading from '../../components/loading/Loading';
import FooterSkeleton from './FooterSkeleton';
import './Footer.css';

function Footer() {
  const { user, loading: authLoading } = useAuth();
  const { profile } = useProfile(!authLoading && !!user);
  const { subscriber, loading: subLoading, subscribe, unsubscribe } = useSubscriber(!authLoading && !!user);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  
  console.log('Footer: user:', user);
  console.log('Footer: subscriber:', subscriber);
  console.log('Footer: subscriber?.status:', subscriber?.status);

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
        message={subscriber ? 'Updating subscription' : 'Subscribing to newsletter'}
        status="AkovoLabs Newsletter System v1.0"
      />
      <footer className="footer-container">
        <div className="footer-content">
          {/* Left Section */}
          <div className="footer-left">
            <div className="footer-logo">
              <img src={loginLogo} alt="AkovoLabs Logo" className="footer-logo-icon" />
              <span className="footer-logo-text">AkovoLabs</span>
            </div>
            <p className="footer-tagline">AI-Powered Network Analytics Dashboard</p>
            <p className="footer-description">
              Empowering ISPs with intelligent insights, real-time monitoring, and enterprise-grade security
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
                    Get the latest news and feature announcements
                  </label>
                  <p className="footer-form-note">We promise not to spam your inbox. Unsubscribe at any time.</p>
                  <div className="footer-form-wrapper">
                    <button 
                      type="button" 
                      className={`footer-form-button ${subscriber ? 'footer-form-button--unsubscribe' : 'footer-form-button--subscribe'}`}
                      onClick={subscriber ? handleUnsubscribe : handleSubscribe}
                      disabled={isProcessing || (!subscriber && !user?.email)}
                    >
                      {isProcessing ? (subscriber ? 'Unsubscribing...' : 'Subscribing...') : (subscriber ? 'Unsubscribe' : 'Subscribe')}
                    </button>
                  </div>
                </div>
              )}
              <div className="footer-apps-section">
                <p className="footer-apps-text">Also available on Mobile</p>
                <p className="footer-apps-subtitle">Download our app for Android and iOS</p>
                <div className="footer-apps-links">
                  <Link to="/download/android" className="footer-apps-link">Android</Link>
                  <span className="footer-apps-divider">|</span>
                  <Link to="/download/ios" className="footer-apps-link">iOS</Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © 2026 AkovoLabs. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}

export default Footer;
