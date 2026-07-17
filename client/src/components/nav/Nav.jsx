import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Modal from '../modal/Modal';
import ErrorModal from '../error_modal/ErrorModal';
import Loading from '../loading/Loading';
import LanguageSwitcher from '../LanguageSwitcher';
import loginLogo from '../../assets/avatars/login_plain_ai_speedtest_cropped.png';
import {
  DevicePhoneMobileIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  SparklesIcon,
  NewspaperIcon,
  ArrowDownTrayIcon,
  RocketLaunchIcon,
  Bars3Icon,
  XMarkIcon,
  HomeIcon
} from '@heroicons/react/24/solid';
import './Nav.css';

function Nav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { user, logout, isLoggingOut, setIsLoggingOut } = useAuth();
  const { getCurrentThemeData, cycleTheme } = useTheme();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const drawerRef = useRef(null);
  const drawerContentRef = useRef(null);
  const drawerScrollbarTrackRef = useRef(null);
  const [isFloating, setIsFloating] = useState(false);
  const [langCloseToken, setLangCloseToken] = useState(0);
  const [langAnimKey, setLangAnimKey] = useState(0);
  const closeLanguage = useCallback(() => setLangCloseToken(t => t + 1), []);
  const handleLangOpenChange = useCallback((isOpen) => {
    if (isOpen) {
      setActiveDropdown(null);
      setAccountDropdownOpen(false);
    }
  }, []);
  const [drawerScrollbar, setDrawerScrollbar] = useState({
    thumbHeight: 0,
    thumbTop: 0,
    scrollable: false,
  });

  const updateDrawerScrollbar = useCallback(() => {
    const scrollEl = drawerContentRef.current;
    const trackEl = drawerScrollbarTrackRef.current;
    if (!scrollEl || !trackEl) return;

    const { scrollHeight, clientHeight, scrollTop } = scrollEl;
    const trackHeight = trackEl.clientHeight;
    const scrollable = scrollHeight > clientHeight + 1;

    if (!scrollable) {
      setDrawerScrollbar({
        thumbHeight: trackHeight,
        thumbTop: 0,
        scrollable: false,
      });
      return;
    }

    const minThumbHeight = 48;
    const thumbHeight = Math.max(minThumbHeight, (clientHeight / scrollHeight) * trackHeight);
    const maxThumbTop = trackHeight - thumbHeight;
    const scrollRatio = scrollTop / (scrollHeight - clientHeight);
    const thumbTop = scrollRatio * maxThumbTop;

    setDrawerScrollbar({
      thumbHeight,
      thumbTop,
      scrollable: true,
    });
  }, []);

  const handleDrawerScrollbarThumbPointerDown = (event) => {
    event.preventDefault();

    const scrollEl = drawerContentRef.current;
    const trackEl = drawerScrollbarTrackRef.current;
    if (!scrollEl || !trackEl) return;

    const trackHeight = trackEl.clientHeight;
    const { scrollHeight, clientHeight, scrollTop } = scrollEl;
    if (scrollHeight <= clientHeight + 1) return;

    const minThumbHeight = 48;
    const thumbHeight = Math.max(minThumbHeight, (clientHeight / scrollHeight) * trackHeight);
    const maxThumbTop = trackHeight - thumbHeight;
    const maxScrollTop = scrollHeight - clientHeight;
    const startY = event.clientY;
    const startScrollTop = scrollTop;

    const handlePointerMove = (moveEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const scrollDelta = maxThumbTop > 0 ? (deltaY / maxThumbTop) * maxScrollTop : 0;
      scrollEl.scrollTop = startScrollTop + scrollDelta;
    };

    const handlePointerUp = () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };

  const closeMobileMenu = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setMobileMenuOpen(false);
    }, 300);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target)) {
        closeMobileMenu();
      }
    };
    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close menu when route changes
  useEffect(() => {
    if (mobileMenuOpen) {
      closeMobileMenu();
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen && !isClosing) return undefined;

    const scrollEl = drawerContentRef.current;
    if (!scrollEl) return undefined;

    const frameId = requestAnimationFrame(updateDrawerScrollbar);

    scrollEl.addEventListener('scroll', updateDrawerScrollbar, { passive: true });
    const resizeObserver = new ResizeObserver(updateDrawerScrollbar);
    resizeObserver.observe(scrollEl);

    return () => {
      cancelAnimationFrame(frameId);
      scrollEl.removeEventListener('scroll', updateDrawerScrollbar);
      resizeObserver.disconnect();
    };
  }, [mobileMenuOpen, isClosing, user, location.pathname, updateDrawerScrollbar]);

  // Floating navbar on scroll (desktop only)
  useEffect(() => {
    if (window.innerWidth <= 1024) return;
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsFloating(window.scrollY > 100);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    {
      name: 'about',
      label: t('nav.about'),
      href: '/about',
      icon: <ShieldCheckIcon />,
      description: t('nav.aboutDesc'),
      items: [
        { 
          label: t('nav.aboutDropdown.ourCompany'), 
          href: '/about#our-story',
          description: t('nav.aboutDropdown.ourCompanyDesc'),
          icon: <ShieldCheckIcon />
        },
        { 
          label: t('nav.aboutDropdown.team'), 
          href: '/about#the-team',
          description: t('nav.aboutDropdown.teamDesc'),
          icon: <DevicePhoneMobileIcon />
        },
        { 
          label: t('nav.aboutDropdown.contactUs'), 
          href: '/about#contact-us',
          description: t('nav.aboutDropdown.contactUsDesc'),
          icon: <ArrowDownTrayIcon />
        }
      ]
    },
    {
      name: 'services',
      label: t('nav.services'),
      href: '/services',
      icon: <RocketLaunchIcon />,
      description: t('nav.servicesDesc'),
      items: [
        { 
          label: t('nav.servicesDropdown.speedTesting'), 
          href: '/services#speedtest',
          description: t('nav.servicesDropdown.speedTestingDesc'),
          icon: <RocketLaunchIcon />
        },
        { 
          label: t('nav.servicesDropdown.networkAnalytics'), 
          href: '/services#network-analysis',
          description: t('nav.servicesDropdown.networkAnalyticsDesc'),
          icon: <CpuChipIcon />
        },
        { 
          label: t('nav.servicesDropdown.security'), 
          href: '/services#security',
          description: t('nav.servicesDropdown.securityDesc'),
          icon: <ShieldCheckIcon />
        },
        { 
          label: t('nav.servicesDropdown.aiInsights'), 
          href: '/services#ai-insights',
          description: t('nav.servicesDropdown.aiInsightsDesc'),
          icon: <SparklesIcon />
        }
      ]
    },
    {
      name: 'download',
      label: t('nav.download'),
      href: '/download',
      icon: <ArrowDownTrayIcon />,
      description: t('nav.downloadDesc'),
      items: [
        { 
          label: t('nav.downloadDropdown.iosApp'), 
          href: '/download#ios',
          description: t('nav.downloadDropdown.iosDesc'),
          icon: <DevicePhoneMobileIcon />
        },
        { 
          label: t('nav.downloadDropdown.androidApp'), 
          href: '/download#android',
          description: t('nav.downloadDropdown.androidDesc'),
          icon: <DevicePhoneMobileIcon />
        }
      ]
    },
    {
      name: 'news',
      label: t('nav.news'),
      href: '/news',
      icon: <NewspaperIcon />,
      description: t('nav.newsDesc'),
      items: [
        { 
          label: t('nav.newsDropdown.updatesPress'), 
          href: '/news#latest-updates',
          description: t('nav.newsDropdown.desc'),
          icon: <NewspaperIcon />
        }
      ]
    }
  ];

  const handleLogout = async () => {
    setShowLogoutModal(false);
    closeMobileMenu();
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

  const isActiveRoute = (href) => {
    return location.pathname === href || (href !== '/' && location.pathname.startsWith(href));
  };

  const mobileAccountLinks = user ? [
    location.pathname !== '/account' && {
      to: '/account',
      label: t('nav.accountDropdown.manageAccount'),
      description: t('nav.mobileDrawer.manageAccountDesc'),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    location.pathname !== '/tests' && {
      to: '/tests',
      label: t('nav.accountDropdown.testHistory'),
      description: t('nav.mobileDrawer.testHistoryDesc'),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
    location.pathname !== '/security' && {
      to: '/security',
      label: t('nav.accountDropdown.security'),
      description: t('nav.mobileDrawer.securityDesc'),
      icon: <ShieldCheckIcon />,
    },
  ].filter(Boolean) : [];

  return (
    <nav className={`nav-container${isFloating ? ' nav-floating' : ''}`}>
      <div className="nav-inner">
        <div className="nav-content">
        {/* Left Side: Logo & System Name */}
        <div className="nav-left">
          <Link to="/" className="nav-logo">
            <img src={loginLogo} alt={t('imageAlt.akovolabsLogo')} className="nav-logo-icon" />
            <span className="nav-logo-text">{t('app.name')}</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="nav-right nav-desktop">
          <div className="nav-items">
            {navItems.map((item) => (
              <div
                key={item.name}
                className={`nav-item ${activeDropdown === item.name ? 'nav-item-active' : ''}`}
                onMouseEnter={() => {
                  setActiveDropdown(item.name);
                  setAccountDropdownOpen(false);
                  closeLanguage();
                }}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link to={item.href} className="nav-item-button">
                  {item.label}
                  {item.items && (
                    <svg className="nav-item-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  )}
                </Link>
                
                {item.items && activeDropdown === item.name && (
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

          <LanguageSwitcher variant="desktop" onOpenChange={handleLangOpenChange} closeToken={langCloseToken} />

          <div 
            className="nav-account"
            onMouseEnter={() => {
              setAccountDropdownOpen(true);
              setActiveDropdown(null);
              closeLanguage();
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
                    <span className="nav-chain-label">{t('nav.accountDropdown.manageAccount')}</span>
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
                    <span className="nav-chain-label">{t('nav.accountDropdown.testHistory')}</span>
                  </Link>
                )}

                {user && location.pathname !== '/security' && (
                  <Link to="/security" className="nav-chain-item">
                    <div className="nav-chain-circle">
                      <ShieldCheckIcon className="nav-chain-icon" />
                    </div>
                    <span className="nav-chain-label">{t('nav.accountDropdown.security')}</span>
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
                    <span className="nav-chain-label">{t('nav.accountDropdown.changeTheme')}</span>
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
                    <span className="nav-chain-label">{t('nav.accountDropdown.login')}</span>
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
                    <span className="nav-chain-label">{t('nav.accountDropdown.logout')}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="nav-mobile-toggle"
          onClick={() => mobileMenuOpen ? closeMobileMenu() : setMobileMenuOpen(true)}
          aria-label={t('nav.toggleNavigation')}
        >
          {mobileMenuOpen ? (
            <XMarkIcon className="nav-toggle-icon" />
          ) : (
            <Bars3Icon className="nav-toggle-icon" />
          )}
        </button>
      </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {(mobileMenuOpen || isClosing) && (
        <div className={`nav-drawer-overlay ${isClosing ? 'nav-drawer-overlay-closing' : ''}`} onClick={() => closeMobileMenu()} />
      )}

      {/* Mobile Drawer */}
      {(mobileMenuOpen || isClosing) && (
        <div className={`nav-drawer ${isClosing ? 'nav-drawer-closing' : ''}`} ref={drawerRef}>
          <div className="nav-drawer-header">
            <Link to="/" className="nav-logo" onClick={() => closeMobileMenu()}>
              <img src={loginLogo} alt={t('imageAlt.akovolabsLogo')} className="nav-logo-icon" />
              <span className="nav-logo-text">{t('app.name')}</span>
            </Link>

            <div className="nav-account nav-account--drawer">
              <div className="nav-avatar" aria-hidden="true">
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
            </div>
          </div>
          
          <div className="nav-drawer-content">
            <div
              className="nav-drawer-content-scroll"
              ref={drawerContentRef}
              onScroll={updateDrawerScrollbar}
            >
              {mobileAccountLinks.length > 0 && (
                <div className="nav-drawer-account-links">
                  {mobileAccountLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`nav-drawer-item ${isActiveRoute(link.to) ? 'nav-drawer-item-active' : ''}`}
                      onClick={() => closeMobileMenu()}
                    >
                      <div className="nav-drawer-item-icon">{link.icon}</div>
                      <div className="nav-drawer-item-text">
                        <span className="nav-drawer-item-label">{link.label}</span>
                        <span className="nav-drawer-item-desc">{link.description}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {mobileAccountLinks.length > 0 && (
                <div className="nav-drawer-divider" aria-hidden="true" />
              )}

              <div className="nav-drawer-nav-links">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`nav-drawer-item ${isActiveRoute(item.href) ? 'nav-drawer-item-active' : ''}`}
                    onClick={() => closeMobileMenu()}
                  >
                    <div className="nav-drawer-item-icon">{item.icon}</div>
                    <div className="nav-drawer-item-text">
                      <span className="nav-drawer-item-label">{item.label}</span>
                      <span className="nav-drawer-item-desc">{item.description}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {user && (
              <div
                className="nav-drawer-scrollbar"
                ref={drawerScrollbarTrackRef}
                aria-hidden="true"
              >
                <div
                  className={`nav-drawer-scrollbar-thumb ${drawerScrollbar.scrollable ? '' : 'nav-drawer-scrollbar-thumb-idle'}`}
                  style={{
                    height: `${drawerScrollbar.thumbHeight}px`,
                    transform: `translateY(${drawerScrollbar.thumbTop}px)`,
                  }}
                  onPointerDown={handleDrawerScrollbarThumbPointerDown}
                />
              </div>
            )}
          </div>
          
          <div className="nav-drawer-footer">
            <button
              className="nav-drawer-footer-btn"
              onClick={cycleTheme}
            >
              <div className="nav-drawer-footer-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
              <div className="nav-drawer-footer-text">
                <span className="nav-drawer-footer-label">{t('nav.mobileDrawer.theme')}</span>
                <span className="nav-drawer-footer-desc">{getCurrentThemeData().name}</span>
              </div>
            </button>

            <button
              className="nav-drawer-footer-btn"
              onClick={() => {
                const langs = ['en', 'fr', 'pt', 'af', 'zu'];
                const currentIndex = langs.indexOf(i18n.language);
                const nextLang = langs[(currentIndex + 1) % langs.length];
                i18n.changeLanguage(nextLang);
                setLangAnimKey(k => k + 1);
              }}
            >
              <div className="nav-drawer-footer-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              <div className="nav-drawer-footer-text">
                <span key={`lang-label-${langAnimKey}`} className="nav-drawer-footer-label nav-drawer-footer-lang-label">{t('nav.mobileDrawer.language')}</span>
                <span key={`lang-desc-${langAnimKey}`} className="nav-drawer-footer-desc nav-drawer-footer-lang-desc">{i18n.language.toUpperCase()}</span>
              </div>
            </button>
            
            {!user && (
              <Link
                to="/login"
                className="nav-drawer-footer-btn"
                onClick={() => closeMobileMenu()}
              >
                <div className="nav-drawer-footer-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                </div>
                <div className="nav-drawer-footer-text">
                  <span className="nav-drawer-footer-label">{t('nav.mobileDrawer.login')}</span>
                </div>
              </Link>
            )}
            
            {user && (
              <button
                className="nav-drawer-footer-btn nav-drawer-footer-btn-danger"
                onClick={() => setShowLogoutModal(true)}
              >
                <div className="nav-drawer-footer-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </div>
                <div className="nav-drawer-footer-text">
                  <span className="nav-drawer-footer-label">{t('nav.mobileDrawer.logout')}</span>
                </div>
              </button>
            )}
          </div>
        </div>
      )}

      <Loading 
        isLoading={isLoggingOut} 
        message={t('nav.signingOut')}
        status={t('nav.authSystemStatus')}
        indeterminate={true}
      />
      <Modal
        isOpen={showLogoutModal}
        message={t('nav.logoutModalMessage')}
        leftOption={{
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ),
          label: t('modal.cancel'),
          onClick: () => setShowLogoutModal(false)
        }}
        rightOption={{
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ),
          label: t('modal.proceed'),
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
