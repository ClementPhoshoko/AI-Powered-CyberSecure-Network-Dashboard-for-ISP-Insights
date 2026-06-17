import React from 'react';
import { useAuth } from '../../context/AuthContext';
import loginLogo from '../../assets/avatars/login_plain_ai_speedtest.png';
import './Nav.css';

function Nav() {
  const { user } = useAuth();

  return (
    <nav className="nav-container">
      <div className="nav-content">
        {/* Left Side: Logo & System Name */}
        <div className="nav-left">
          <div className="nav-logo">
            <img src={loginLogo} alt="CyberSecure Logo" className="nav-logo-icon" />
            <span className="nav-logo-text">CyberSecure</span>
          </div>
        </div>

        {/* Right Side: Navigation Items & Account */}
        <div className="nav-right">
          <div className="nav-items">
            <button className="nav-item">
              <svg className="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span className="nav-item-text">About</span>
            </button>

            <button className="nav-item">
              <svg className="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <span className="nav-item-text">Services</span>
            </button>

            <button className="nav-item">
              <svg className="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1m2 13a2 2 0 0 1-2-2V7m2 13a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              <span className="nav-item-text">News</span>
            </button>
          </div>

          <div className="nav-account">
            {user ? (
              <div className="nav-avatar">
                <div className="nav-avatar-initial">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="nav-avatar-status"></div>
              </div>
            ) : (
              <div className="nav-avatar">
                <svg className="nav-avatar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Nav;
