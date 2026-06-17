import React from 'react';
import loginLogo from '../../assets/avatars/login_plain_ai_speedtest.png';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        {/* Left Section */}
        <div className="footer-left">
          <div className="footer-logo">
            <img src={loginLogo} alt="CyberSecure Logo" className="footer-logo-icon" />
            <span className="footer-logo-text">CyberSecure</span>
          </div>
          <p className="footer-tagline">AI-Powered Network Analytics Dashboard</p>
          <p className="footer-description">
            Empowering ISPs with intelligent insights, real-time monitoring, and enterprise-grade security
          </p>
        </div>

        {/* Right Section */}
        <div className="footer-subscribe">
          <div className="footer-form-field">
            <label className="footer-form-label">Get the latest news and feature announcements</label>
            <p className="footer-form-note">We promise not to spam your inbox. Unsubscribe at any time.</p>
            <div className="footer-form-wrapper">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="footer-form-input"
              />
              <button className="footer-form-button">Subscribe</button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="footer-bottom">
        <p className="footer-copyright">
          © 2026 AkovoLabs. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
