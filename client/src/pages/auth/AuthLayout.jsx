import { useNavigate } from 'react-router-dom';
import './AuthLayout.css';

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
          
          <div className="auth-info-column">
            <div className="auth-info-content">
              <div className="auth-logo">
                <div className="auth-logo-icon"></div>
                <span className="auth-logo-text">CyberSecure</span>
              </div>
              <p className="auth-info-text">
                Terms & Conditions and Privacy Policy will appear here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
