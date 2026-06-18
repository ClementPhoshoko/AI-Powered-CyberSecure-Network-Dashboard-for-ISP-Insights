import { useNavigate } from 'react-router-dom';
import './AuthLayout.css';
import loginLogo from '../../assets/avatars/login_plain_ai_speedtest_cropped.png';

function AuthLayout({ activeTab = 'login', children }) {
  const navigate = useNavigate();
  
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
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
        </div>
        
        <div className="auth-content">
          <div className="auth-form-column">
            {children}
          </div>
          
          <div className="auth-divider"></div>
          
          <div className="auth-info-column">
            <div className="auth-info-content">
              <div className="auth-logo">
                <img src={loginLogo} alt="AkovoLabs Logo" className="auth-logo-icon" />
                <span className="auth-logo-text">AkovoLabs</span>
              </div>
              <p className="auth-tagline">Real-time AI-Powered Speedtest Analytics & Network Security Insights for ISPs</p>
              <p className="auth-info-text">
                View <a href="#" className="auth-link">Terms & Conditions</a> and <a href="#" className="auth-link">Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="auth-footer">
        <p className="auth-footer-text">System Version 1.0.0 © 2026 AkovoLabs. All rights reserved.</p>
      </div>
    </div>
  );
}

export default AuthLayout;
