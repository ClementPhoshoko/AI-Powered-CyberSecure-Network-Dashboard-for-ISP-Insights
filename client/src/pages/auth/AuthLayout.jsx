import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './AuthLayout.css';
import loginLogo from '../../assets/avatars/login_plain_ai_speedtest_cropped.png';
import NoticeModal from '../../components/notice_modal/NoticeModal';
import termsAndPolicy from './terms_and_policy.json';

function AuthLayout({ activeTab = 'login', children }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState(null);
  
  const showTabs = activeTab === 'login' || activeTab === 'signup';
  const backTarget = activeTab === 'forgot' ? '/login' : '/signup';

  return (
    <div className="auth-container">
      <div className="auth-header-logo">
        <Link to="/" className="auth-top-logo">
          <img src={loginLogo} alt={t('imageAlt.akovolabsLogo')} className="auth-top-logo-icon" width="721" height="605" />
          <span className="auth-top-logo-text">{t('nav.home')}</span>
        </Link>
      </div>
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-mobile-logo">
            <img src={loginLogo} alt={t('imageAlt.akovolabsLogo')} className="auth-mobile-logo-icon" width="721" height="605" />
            <span className="auth-mobile-logo-text">{t('app.name')}</span>
          </div>
          {showTabs ? (
            <div className="auth-tabs">
              <button 
                className={`auth-tab ${activeTab === 'login' ? 'auth-tab--active' : ''}`}
                onClick={() => navigate('/login')}
              >
                {t('auth.layout.login')}
              </button>
              <span className="auth-tab-divider">|</span>
              <button 
                className={`auth-tab ${activeTab === 'signup' ? 'auth-tab--active' : ''}`}
                onClick={() => navigate('/signup')}
              >
                {t('auth.layout.signUp')}
              </button>
            </div>
          ) : (
            <button className="auth-back-button" onClick={() => navigate(backTarget)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              {activeTab === 'forgot' ? t('auth.layout.backToLogin') : t('auth.layout.backToSignUp')}
            </button>
          )}
        </div>
        
        <div className="auth-content">
          <div className="auth-form-column">
            {children}
            <p className="auth-advisory-text">
              {t('auth.layout.agreement').split(/\*\*(.*?)\*\*/g).map((part, i) => {
                if (i % 2 === 1) {
                  const modal = i === 1 ? 'terms' : 'privacy';
                  return <button key={i} className="auth-advisory-link" onClick={() => setActiveModal(modal)}>{part}</button>;
                }
                return part;
              })}
            </p>
          </div>
          
          <div className="auth-divider"></div>
          
          <div className="auth-info-column">
            <div className="auth-info-content">
              <div className="auth-logo">
                <img src={loginLogo} alt={t('imageAlt.akovolabsLogo')} className="auth-logo-icon" width="721" height="605" />
                <span className="auth-logo-text">{t('app.name')}</span>
              </div>
              <p className="auth-tagline">{t('auth.layout.tagline')}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="auth-footer">
        <p className="auth-footer-text">{t('app.version')}</p>
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
