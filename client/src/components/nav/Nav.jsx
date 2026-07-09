import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Modal from '../modal/Modal';
import ErrorModal from '../error_modal/ErrorModal';
import Loading from '../loading/Loading';
import loginLogo from '../../assets/avatars/login_plain_ai_speedtest_cropped.png';
import {
  DevicePhoneMobileIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  SparklesIcon,
  NewspaperIcon,
  ArrowDownTrayIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/solid';
import './Nav.css';

function Nav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { getCurrentThemeData, cycleTheme } = useTheme();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
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
          icon: <ShieldCheckIcon />
        },
        { 
          label: 'Team', 
          href: '/about#the-team',
          description: 'Meet our experts',
          icon: <DevicePhoneMobileIcon />
        },
        { 
          label: 'Contact Us', 
          href: '/about#contact-us',
          description: 'Get in touch with us',
          icon: <ArrowDownTrayIcon />
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
          icon: <RocketLaunchIcon />
        },
        { 
          label: 'Network Analytics', 
          href: '/services#network-analysis',
          description: 'Deep network insights',
          icon: <CpuChipIcon />
        },
        { 
          label: 'Security', 
          href: '/services#security',
          description: 'Protect your network',
          icon: <ShieldCheckIcon />
        },
        { 
          label: 'AI Insights', 
          href: '/services#ai-insights',
          description: 'Intelligent recommendations',
          icon: <SparklesIcon />
        }
      ]
    },
    {
      name: 'download',
      label: 'Download',
      items: [
        { 
          label: 'iOS App', 
          href: '/download#ios',
          description: 'Download for iPhone and iPad',
          icon: <DevicePhoneMobileIcon />
        },
        { 
          label: 'Android App', 
          href: '/download#android',
          description: 'Download for Android devices',
          icon: <DevicePhoneMobileIcon />
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
          icon: <NewspaperIcon />
        }
      ]
    }
  ];

  const handleLogout = async () => {
    setShowLogoutModal(false);
    setIsLoggingOut(true);
    // Navigate to home first (non-protected, non-auth) so Nav stays mounted
    // and ProtectedRoute doesn't intercept with /auth-required
    navigate("/");
    try {
      // Run logout concurrently with a minimum delay so user sees the loading animation
      await Promise.all([
        logout(),
        new Promise(resolve => setTimeout(resolve, 1500))
      ]);
    } catch (err) {
      setErrorModal({ isOpen: true, message: err.message });
    } finally {
      setIsLoggingOut(false);
      navigate("/login");
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
                ) : item.name === 'download' ? (
                  <Link to="/download" className="nav-item-button">
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
                {user && location.pathname !== '/account' && (
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
                
                {user && location.pathname !== '/tests' && (
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

                {user && location.pathname !== '/security' && (
                  <Link to="/security" className="nav-chain-item">
                    <div className="nav-chain-circle">
                      <ShieldCheckIcon className="nav-chain-icon" />
                    </div>
                    <span className="nav-chain-label">Security</span>
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
      <Loading 
        isLoading={isLoggingOut} 
        message="Signing you out"
        status="AkovoLabs Auth System v1.0"
        indeterminate={true}
      />
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
