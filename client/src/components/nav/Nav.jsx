import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Modal from '../modal/Modal';
import ErrorModal from '../error_modal/ErrorModal';
import loginLogo from '../../assets/avatars/login_plain_ai_speedtest_cropped.png';
import './Nav.css';

function Nav() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { getCurrentThemeData, cycleTheme } = useTheme();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });

  const navItems = [
    {
      name: 'about',
      label: 'About',
      items: [
        { 
          label: 'Our Company', 
          href: '/about#our-story',
          description: 'Learn about our mission',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 21h18" />
              <rect x="5" y="11" width="14" height="10" />
              <path d="M9 21V11" />
              <rect x="9" y="3" width="6" height="8" />
            </svg>
          )
        },
        { 
          label: 'Team', 
          href: '/about#the-team',
          description: 'Meet our experts',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          )
        },
        { 
          label: 'Contact Us', 
          href: '/about#contact-us',
          description: 'Get in touch with us',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          )
        }
      ]
    },
    {
      name: 'services',
      label: 'Services',
      items: [
        { 
          label: 'Speed Testing', 
          href: '/services#speedtest',
          description: 'Measure your connection',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 2v4M7 2v10M12 2v12M17 2v8M21 2v6" />
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          )
        },
        { 
          label: 'Network Analytics', 
          href: '/services#network-analysis',
          description: 'Deep network insights',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3v18h18" />
              <path d="M18 17l-5-5-3 3-4-4" />
            </svg>
          )
        },
        { 
          label: 'Security', 
          href: '/services#security',
          description: 'Protect your network',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          )
        },
        { 
          label: 'AI Insights', 
          href: '/services#ai-insights',
          description: 'Intelligent recommendations',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          )
        }
      ]
    },
    {
      name: 'news',
      label: 'News',
      items: [
        { 
          label: 'Updates & Press', 
          href: '/news#latest-updates',
          description: 'Latest news, updates, and press',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          )
        }
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

  const handleDropdownItemClick = (e, href) => {
    if (href.includes("#")) {
      const [path, hash] = href.split("#");
      
      if (window.location.pathname === path) {
        e.preventDefault();
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
        setActiveDropdown(null);
      }
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
                {item.name === 'about' ? (
                  <Link to="/about" className="nav-item-button">
                    {item.label}
                    <svg className="nav-item-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </Link>
                ) : item.name === 'services' ? (
                  <Link to="/services" className="nav-item-button">
                    {item.label}
                    <svg className="nav-item-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </Link>
                ) : item.name === 'news' ? (
                  <Link to="/news" className="nav-item-button">
                    {item.label}
                    <svg className="nav-item-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </Link>
                ) : (
                  <button className="nav-item-button">
                    {item.label}
                    <svg className="nav-item-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                )}
                
                {activeDropdown === item.name && (
                  <div className="nav-dropdown">
                    {item.items.map((dropdownItem, idx) => (
                      <React.Fragment key={idx}>
                        <Link 
                          to={dropdownItem.href} 
                          className="nav-dropdown-item"
                          onClick={(e) => handleDropdownItemClick(e, dropdownItem.href)}
                        >
                          <div className="nav-dropdown-item-icon">
                            {dropdownItem.icon}
                          </div>
                          <div className="nav-dropdown-item-content">
                            <span className="nav-dropdown-item-title">{dropdownItem.label}</span>
                            <span className="nav-dropdown-item-desc">{dropdownItem.description}</span>
                          </div>
                        </Link>
                        {idx < item.items.length - 1 && <div className="nav-dropdown-divider" />}
                      </React.Fragment>
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
                
                <button 
                  className="nav-chain-item" 
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                  onClick={cycleTheme}
                >
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
                      <span className="nav-theme-label">{getCurrentThemeData().name}</span>
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
