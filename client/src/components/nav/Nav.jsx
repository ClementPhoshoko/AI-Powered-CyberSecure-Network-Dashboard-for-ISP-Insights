import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Modal from '../modal/Modal';
import ErrorModal from '../error_modal/ErrorModal';
import loginLogo from '../../assets/avatars/login_plain_ai_speedtest_cropped.png';
import './Nav.css';

function Nav() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });

  const navItems = [
    {
      name: 'about',
      label: 'About',
      items: [
        { label: 'Company', href: '#' },
        { label: 'Team', href: '#' },
        { label: 'Careers', href: '#' }
      ]
    },
    {
      name: 'services',
      label: 'Services',
      items: [
        { label: 'Speed Testing', href: '#' },
        { label: 'Network Analytics', href: '#' },
        { label: 'Security', href: '#' },
        { label: 'AI Insights', href: '#' }
      ]
    },
    {
      name: 'news',
      label: 'News',
      items: [
        { label: 'Blog', href: '#' },
        { label: 'Updates', href: '#' },
        { label: 'Press', href: '#' }
      ]
    }
  ];

  const handleLogout = async () => {
    setShowLogoutModal(false);
    try {
      await logout();
      navigate("/");
    } catch (err) {
      setErrorModal({ isOpen: true, message: err.message });
    }
  };

  return (
    <nav className="nav-container">
      <div className="nav-content">
        {/* Left Side: Logo & System Name */}
        <div className="nav-left">
          <Link to="/" className="nav-logo">
            <img src={loginLogo} alt="AkovoLabs Logo" className="nav-logo-icon" />
            <span className="nav-logo-text">AkovoLabs</span>
          </Link>
        </div>

        {/* Right Side: Navigation Items & Account */}
        <div className="nav-right">
          <div className="nav-items">
            {navItems.map((item) => (
              <div
                key={item.name}
                className={`nav-item ${activeDropdown === item.name ? 'nav-item-active' : ''}`}
                onMouseEnter={() => {
                  setActiveDropdown(item.name);
                  setAccountDropdownOpen(false);
                }}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="nav-item-button">
                  {item.label}
                  <svg className="nav-item-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                
                {activeDropdown === item.name && (
                  <div className="nav-dropdown">
                    {item.items.map((dropdownItem, idx) => (
                      <Link key={idx} to={dropdownItem.href} className="nav-dropdown-item">
                        {dropdownItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div 
            className="nav-account"
            onMouseEnter={() => {
              setAccountDropdownOpen(true);
              setActiveDropdown(null);
            }}
            onMouseLeave={() => setAccountDropdownOpen(false)}
          >
            <div className="nav-avatar">
              {user ? (
                <div className="nav-avatar-initial">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              ) : (
                <svg className="nav-avatar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              )}
            </div>
            
            {accountDropdownOpen && (
              <div className="nav-account-chain">
                {user && (
                  <Link to="/account" className="nav-chain-item">
                    <div className="nav-chain-circle">
                      <svg className="nav-chain-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <span className="nav-chain-label">Manage Account</span>
                  </Link>
                )}
                
                {user && (
                  <Link to="/tests" className="nav-chain-item">
                    <div className="nav-chain-circle">
                      <svg className="nav-chain-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="20" x2="18" y2="10" />
                        <line x1="12" y1="20" x2="12" y2="4" />
                        <line x1="6" y1="20" x2="6" y2="14" />
                      </svg>
                    </div>
                    <span className="nav-chain-label">Test History</span>
                  </Link>
                )}
                
                <button className="nav-chain-item" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                    <div className="nav-chain-circle">
                      <svg className="nav-chain-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="5" />
                        <line x1="12" y1="1" x2="12" y2="3" />
                        <line x1="12" y1="21" x2="12" y2="23" />
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                        <line x1="1" y1="12" x2="3" y2="12" />
                        <line x1="21" y1="12" x2="23" y2="12" />
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                      </svg>
                    </div>
                    <div className="nav-theme-wrapper">
                      <span className="nav-chain-label">Change Theme</span>
                      <span className="nav-theme-label">Lighture - Bright Blue</span>
                    </div>
                  </button>
                
                {!user && (
                  <Link to="/login" className="nav-chain-item">
                    <div className="nav-chain-circle">
                      <svg className="nav-chain-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                        <polyline points="10 17 15 12 10 7" />
                        <line x1="15" y1="12" x2="3" y2="12" />
                      </svg>
                    </div>
                    <span className="nav-chain-label">Login</span>
                  </Link>
                )}
                
                {user && (
                  <button 
                    className="nav-chain-item" 
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, width: '100%', textAlign: 'left' }}
                    onClick={() => {
                      setShowLogoutModal(true);
                      setAccountDropdownOpen(false);
                    }}
                  >
                    <div className="nav-chain-circle">
                      <svg className="nav-chain-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                    </div>
                    <span className="nav-chain-label">Logout</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Modal
        isOpen={showLogoutModal}
        message="Are you sure you want to logout from your account?"
        leftOption={{
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ),
          label: "Cancel",
          onClick: () => setShowLogoutModal(false)
        }}
        rightOption={{
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ),
          label: "Proceed",
          onClick: handleLogout
        }}
      />
      <ErrorModal
        isOpen={errorModal.isOpen}
        message={errorModal.message}
        onClose={() => setErrorModal({ isOpen: false, message: '' })}
      />
    </nav>
  );
}

export default Nav;
