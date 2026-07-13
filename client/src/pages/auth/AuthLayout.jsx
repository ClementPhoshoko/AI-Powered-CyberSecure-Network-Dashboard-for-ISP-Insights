import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import './AuthLayout.css';
import loginLogo from '../../assets/avatars/login_plain_ai_speedtest_cropped.png';
import NoticeModal from '../../components/notice_modal/NoticeModal';
import termsAndPolicy from './terms_and_policy.json';

function AuthLayout({ activeTab = 'login', children }) {
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState(null);
  
  const showTabs = activeTab === 'login' || activeTab === 'signup';
  const backTarget = activeTab === 'forgot' ? '/login' : '/signup';

  return (
    <div className="auth-container">
      <div className="auth-header-logo">
        <Link to="/" className="auth-top-logo">
          <img src={loginLogo} alt="AkovoLabs Logo" className="auth-top-logo-icon" />
          <span className="auth-top-logo-text">Home</span>
        </Link>
      </div>
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-mobile-logo">
            <img src={loginLogo} alt="AkovoLabs Logo" className="auth-mobile-logo-icon" />
            <span className="auth-mobile-logo-text">AkovoLabs</span>
          </div>
          {showTabs ? (
            <div className="auth-tabs">
              <button 
                className={`auth-tab ${activeTab === 'login' ? 'auth-tab--active' : ''}`}
                onClick={() => navigate('/login')}
              >
                Login
              </button>
              <span className="auth-tab-divider">|</span>
              <button 
                className={`auth-tab ${activeTab === 'signup' ? 'auth-tab--active' : ''}`}
                onClick={() => navigate('/signup')}
              >
                Sign up
              </button>
            </div>
          ) : (
            <button className="auth-back-button" onClick={() => navigate(backTarget)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back to {activeTab === 'forgot' ? 'Login' : 'Sign up'}
            </button>
          )}
        </div>
        
        <div className="auth-content">
          <div className="auth-form-column">
            {children}
            <p className="auth-advisory-text">
              By creating or using an AkovoLabs account, you agree to our <a href="#" className="auth-link" onClick={(e) => { e.preventDefault(); setActiveModal('terms'); }}>Terms & Conditions</a> and <a href="#" className="auth-link" onClick={(e) => { e.preventDefault(); setActiveModal('privacy'); }}>Privacy Policy</a>.
            </p>
          </div>
          
          <div className="auth-divider"></div>
          
          <div className="auth-info-column">
            <div className="auth-info-content">
              <div className="auth-logo">
                <img src={loginLogo} alt="AkovoLabs Logo" className="auth-logo-icon" />
                <span className="auth-logo-text">AkovoLabs</span>
              </div>
              <p className="auth-tagline">Real-time AI-Powered Speedtest Analytics & Network Security Insights for ISPs</p>
            </div>
          </div>
        </div>
      </div>
      <div className="auth-footer">
        <p className="auth-footer-text">System Version 1.0.0 © 2026 AkovoLabs. All rights reserved.</p>
      </div>
      <NoticeModal 
        isOpen={activeModal === 'terms'}
        title={termsAndPolicy.termsAndConditions.title}
        data={termsAndPolicy.termsAndConditions.content}
        onClose={() => setActiveModal(null)}
      />
      <NoticeModal 
        isOpen={activeModal === 'privacy'}
        title={termsAndPolicy.privacyPolicy.title}
        data={termsAndPolicy.privacyPolicy.content}
        onClose={() => setActiveModal(null)}
      />
    </div>
  );
}

export default AuthLayout;
