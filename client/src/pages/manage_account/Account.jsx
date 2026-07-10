import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useProfile from '../../hooks/useProfile';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/loading/Loading';
import ErrorModal from '../../components/error_modal/ErrorModal';
import Modal from '../../components/modal/Modal';
import { updateEmail } from '../../services/authService';
import notFoundAvatar from '../../assets/avatars/not_found_avatar.png';
import successAvatar2 from '../../assets/avatars/success_avatar_2.png';
import './Account.css';

function Account() {
  const { user, logout, loading: authLoading, setIsLoggingOut } = useAuth();
  const { profile, loading: profileLoading, error: profileError, updateProfile, refetch } = useProfile(!authLoading && !!user);
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [editingPersonalInfo, setEditingPersonalInfo] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPersonalInfoSuccess, setShowPersonalInfoSuccess] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [progress, setProgress] = useState(0);
  const [animationKey, setAnimationKey] = useState(Date.now());
  const [showSavePersonalInfoConfirm, setShowSavePersonalInfoConfirm] = useState(false);
  const [showSaveEmailConfirm, setShowSaveEmailConfirm] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  useEffect(() => {
    setAnimationKey(Date.now());
  }, [editingPersonalInfo, editingEmail]);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
    }
    if (user?.email) {
      setEmail(user.email);
    }
  }, [profile, user]);

  useEffect(() => {
    let interval;
    if (isUpdating || authLoading || profileLoading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return prev;
          const increment = Math.random() * 15;
          return Math.min(prev + increment, 95);
        });
      }, 400);
    } else {
      setProgress(100);
    }
    return () => clearInterval(interval);
  }, [isUpdating, authLoading, profileLoading]);

  const handleSavePersonalInfoConfirm = async () => {
    setShowSavePersonalInfoConfirm(false);
    setIsUpdating(true);
    setProgress(0);

    try {
      await updateProfile({
        username,
        first_name: firstName,
        last_name: lastName
      });
      setProgress(100);
      setShowPersonalInfoSuccess(true);
      setEditingPersonalInfo(false);
    } catch (err) {
      setErrorModal({ isOpen: true, message: err.message });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveEmailConfirm = async () => {
    setShowSaveEmailConfirm(false);
    setIsUpdating(true);
    setProgress(0);

    try {
      await updateEmail(email);
      setProgress(100);
      setShowEmailVerification(true);
      setEditingEmail(false);
    } catch (err) {
      setErrorModal({ isOpen: true, message: err.message });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSignOutConfirm = async () => {
    setShowSignOutConfirm(false);
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

  const handleCancelPersonalInfo = () => {
    if (profile) {
      setUsername(profile.username || '');
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
    }
    setEditingPersonalInfo(false);
  };

  const handleCancelEmail = () => {
    if (user?.email) {
      setEmail(user.email);
    }
    setEditingEmail(false);
  };

  if (authLoading || profileLoading) {
    return (
      <div className="account-page">
        <Loading 
          isLoading={true}
          message="Loading profile"
          status="AkovoLabs Profile System v1.0"
          indeterminate={true}
        />
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="account-page">
        <div className="account-error-view">
          <img src={notFoundAvatar} alt="Error" className="account-error-avatar" />
          <h1 className="account-error-title">Oops!</h1>
          <p className="account-error-text">We couldn't load your profile</p>
          <p className="account-error-subtext">{profileError}</p>
          <button 
            className="account-error-link"
            onClick={() => refetch()}
          >
            <svg className="account-error-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
            </svg>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (showPersonalInfoSuccess) {
    return (
      <div className="account-page">
        <div className="account-success-view">
          <img src={successAvatar2} alt="Success" className="account-success-avatar" />
          <h1 className="account-success-title">Profile Updated!</h1>
          <p className="account-success-text">Your personal information has been updated successfully.</p>
          <div className="account-success-links">
            <Link to="/" className="account-success-link">
              <svg className="account-success-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Run Speedtest
            </Link>
            <Link to="/tests" className="account-success-link">
              <svg className="account-success-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
              View Previous Tests
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (showEmailVerification) {
    return (
      <div className="account-page">
        <div className="account-success-view">
          <img src={successAvatar2} alt="Success" className="account-success-avatar" />
          <h1 className="account-success-title">Check your inbox!</h1>
          <p className="account-success-text">We've sent a verification email to your new address. Please click the link to confirm your email change.</p>
          <div className="account-success-links">
            <Link to="/" className="account-success-link">
              <svg className="account-success-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Run Speedtest
            </Link>
            <Link to="/tests" className="account-success-link">
              <svg className="account-success-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
              View Previous Tests
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="account-page">
      <Loading 
        isLoading={isUpdating} 
        progress={progress}
        message="Updating profile"
        status="AkovoLabs Profile System v1.0"
        indeterminate={true}
      />
      <div key={animationKey} className="account-form-container">
        <div className="account-header">
          <h1 className="account-title">Manage your profile</h1>
          <button 
            type="button" 
            className="account-sign-out-btn"
            onClick={() => setShowSignOutConfirm(true)}
          >
            <svg className="account-sign-out-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
        </div>
        
        {/* Personal Info */}
        <div className="account-section">
          <div className="account-section-header">
            <h2 className="account-section-title">Personal Information</h2>
            {!editingPersonalInfo ? (
              <button 
                type="button" 
                className="account-field-btn account-field-btn-edit"
                onClick={() => setEditingPersonalInfo(true)}
              >
                <svg className="account-field-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit
              </button>
            ) : null}
          </div>

          <div className="account-field-group">
            <div className="account-form-field">
              <label className="account-form-label">Username</label>
              <div className="account-form-input-wrapper">
                <svg className="account-form-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                {editingPersonalInfo ? (
                  <input 
                    type="text" 
                    className="account-form-input" 
                    placeholder="Enter your username" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoFocus
                  />
                ) : (
                  <div className="account-readonly-value">
                    {username || <span className="account-readonly-placeholder">Not set</span>}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="account-field-row">
            <div className="account-field-group">
              <div className="account-form-field">
                <label className="account-form-label">First Name</label>
                <div className="account-form-input-wrapper">
                  <svg className="account-form-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  {editingPersonalInfo ? (
                    <input 
                      type="text" 
                      className="account-form-input" 
                      placeholder="First name" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  ) : (
                    <div className="account-readonly-value">
                      {firstName || <span className="account-readonly-placeholder">Not set</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="account-field-group">
              <div className="account-form-field">
                <label className="account-form-label">Last Name</label>
                <div className="account-form-input-wrapper">
                  <svg className="account-form-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  {editingPersonalInfo ? (
                    <input 
                      type="text" 
                      className="account-form-input" 
                      placeholder="Last name" 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  ) : (
                    <div className="account-readonly-value">
                      {lastName || <span className="account-readonly-placeholder">Not set</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {editingPersonalInfo ? (
            <div className="account-field-actions">
              <button 
                type="button" 
                className="account-field-btn account-field-btn-cancel"
                onClick={handleCancelPersonalInfo}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="account-field-btn account-field-btn-save"
                onClick={() => setShowSavePersonalInfoConfirm(true)}
                disabled={isUpdating}
              >
                Save
              </button>
            </div>
          ) : null}
        </div>

        {/* Divider */}
        <div className="account-divider"></div>

        {/* Email */}
        <div className="account-section">
          <div className="account-section-header">
            <h2 className="account-section-title">Email</h2>
            {!editingEmail ? (
              <button 
                type="button" 
                className="account-field-btn account-field-btn-edit"
                onClick={() => setEditingEmail(true)}
              >
                <svg className="account-field-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit
              </button>
            ) : null}
          </div>

          <div className="account-field-group">
            <div className="account-form-field">
              <label className="account-form-label">Email Address</label>
              <div className="account-form-input-wrapper">
                <svg className="account-form-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                {editingEmail ? (
                  <input 
                    type="email" 
                    className="account-form-input" 
                    placeholder="Enter your email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                  />
                ) : (
                  <div className="account-readonly-value">
                    {email}
                  </div>
                )}
              </div>
            </div>

            {editingEmail ? (
              <div className="account-field-actions">
                <button 
                  type="button" 
                  className="account-field-btn account-field-btn-cancel"
                  onClick={handleCancelEmail}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="account-field-btn account-field-btn-save"
                  onClick={() => setShowSaveEmailConfirm(true)}
                  disabled={isUpdating}
                >
                  Save
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Bottom Links */}
        <div className="account-success-links">
          <Link to="/" className="account-success-link">
            <svg className="account-success-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Run Speedtest
          </Link>
          <Link to="/tests" className="account-success-link">
            <svg className="account-success-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            View Previous Tests
          </Link>
        </div>
      </div>
      <ErrorModal
        isOpen={errorModal.isOpen}
        message={errorModal.message}
        onClose={() => setErrorModal({ isOpen: false, message: '' })}
      />
      
      {/* Save Personal Info Confirmation Modal */}
      <Modal
        isOpen={showSavePersonalInfoConfirm}
        message="Are you sure you want to save your personal information changes?"
        leftOption={{
          label: "Cancel",
          onClick: () => setShowSavePersonalInfoConfirm(false)
        }}
        rightOption={{
          label: "Save",
          onClick: handleSavePersonalInfoConfirm
        }}
      />
      
      {/* Save Email Confirmation Modal */}
      <Modal
        isOpen={showSaveEmailConfirm}
        message="Are you sure you want to update your email address? You'll need to verify your new email."
        leftOption={{
          label: "Cancel",
          onClick: () => setShowSaveEmailConfirm(false)
        }}
        rightOption={{
          label: "Save",
          onClick: handleSaveEmailConfirm
        }}
      />
      
      {/* Sign Out Confirmation Modal */}
      <Modal
        isOpen={showSignOutConfirm}
        message="Are you sure you want to sign out of your account?"
        leftOption={{
          label: "Cancel",
          onClick: () => setShowSignOutConfirm(false)
        }}
        rightOption={{
          label: "Sign Out",
          onClick: handleSignOutConfirm
        }}
      />
    </div>
  );
}

export default Account;
