import React from 'react';
import loginLogo from '../../assets/avatars/login_plain_ai_speedtest.png';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-left">
          <div className="footer-logo">
            <img src={loginLogo} alt="CyberSecure Logo" className="footer-logo-icon" />
            <span className="footer-logo-text">CyberSecure</span>
          </div>
          <p className="footer-tagline">AI-Powered Network Analytics</p>
        </div>

        <div className="footer-links">
          <div className="footer-link-group">
            <span className="footer-link-title">Product</span>
            <a href="#" className="footer-link">Features</a>
            <a href="#" className="footer-link">Pricing</a>
            <a href="#" className="footer-link">Documentation</a>
          </div>

          <div className="footer-link-group">
            <span className="footer-link-title">Company</span>
            <a href="#" className="footer-link">About</a>
            <a href="#" className="footer-link">Blog</a>
            <a href="#" className="footer-link">Careers</a>
          </div>

          <div className="footer-link-group">
            <span className="footer-link-title">Legal</span>
            <a href="#" className="footer-link">Privacy</a>
            <a href="#" className="footer-link">Terms</a>
            <a href="#" className="footer-link">Security</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="footer-copyright">
          © {new Date().getFullYear()} AkovoLabs. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
