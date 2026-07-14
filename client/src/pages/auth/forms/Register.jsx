import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../../services/authService';
import Loading from '../../../components/loading/Loading';
import ErrorModal from '../../../components/error_modal/ErrorModal';
import successAvatar from '../../../assets/avatars/success_avatar_2.png';
import './Register.css';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [animationKey, setAnimationKey] = useState(Date.now());
  const [registeredEmail, setRegisteredEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setAnimationKey(Date.now());
  }, []);

  // Update progress bar
  useEffect(() => {
    let interval;
    if (isLoading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return prev;
          const increment = Math.random() * 15;
          return Math.min(prev + increment, 95);
        });
      }, 400);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const validatePassword = (pwd) => {
    if (pwd.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(pwd)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(pwd)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(pwd)) {
      return 'Password must contain at least one number';
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
      return 'Password must contain at least one special character (!@#$%^&*(),.?":{|}<>)';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!agreeToTerms) {
      setErrorModal({ isOpen: true, message: 'You must agree to the Terms & Conditions and Privacy Policy to create an account.' });
      return;
    }

    if (password !== confirmPassword) {
      setErrorModal({ isOpen: true, message: 'Passwords do not match' });
      return;
    }

    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      setErrorModal({ isOpen: true, message: passwordValidationError });
      return;
    }

    setIsLoading(true);
    setProgress(0);

    try {
      // Backend creates the user (no native Supabase email) and sends the
      // EmailJS verification link in one step.
      await register(email, password);
      setProgress(100);
      setRegisteredEmail(email);
    } catch (err) {
      setErrorModal({ isOpen: true, message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  if (registeredEmail) {
    return (
      <>
        <div className="auth-form" key={animationKey}>
          <div className="auth-success-icon-wrapper">
            <div className="auth-success-icon">
              <img src={successAvatar} alt="Success" />
            </div>
          </div>
          <h1 className="auth-form-title">Check your email</h1>
          <p className="auth-success-text">
            We sent a verification link to <strong>{registeredEmail}</strong>. Click the link to activate your account.
          </p>
          <p className="auth-success-hint">
            If you don't see the email, check your spam folder or try signing up again.
          </p>
          <button className="auth-form-button" onClick={() => navigate('/login')}>
            <svg className="auth-form-button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            Go to Login
          </button>
        </div>
        <ErrorModal
          isOpen={errorModal.isOpen}
          message={errorModal.message}
          onClose={() => setErrorModal({ isOpen: false, message: '' })}
        />
      </>
    );
  }

  return (
    <>
      <Loading 
        isLoading={isLoading} 
        progress={progress}
        message="Creating your account"
        status="AkovoLabs Auth System v1.0"
        indeterminate={true}
      />
      <form key={animationKey} className="auth-form" onSubmit={handleSubmit}>
        <h1 className="auth-form-title">Create account</h1>
        
        {passwordError && <div className="auth-form-error">{passwordError}</div>}

        <div className="auth-form-field">
          <label className="auth-form-label" htmlFor="register-email-input">Email</label>
          <div className="auth-form-input-wrapper">
            <svg className="auth-form-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <input 
              id="register-email-input"
              name="email"
              type="email" 
              className="auth-form-input" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
        </div>
        
        <div className="auth-form-field">
          <label className="auth-form-label" htmlFor="register-password-input">Password</label>
          <div className="auth-form-input-wrapper">
            <svg className="auth-form-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input 
              id="register-password-input"
              name="password"
              type="password" 
              className="auth-form-input" 
              placeholder="Enter your password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setShowPasswordRequirements(true)}
              onBlur={() => setTimeout(() => setShowPasswordRequirements(false), 200)}
              autoComplete="new-password"
              required
            />
          </div>
          {showPasswordRequirements && (
            <div className="password-requirements">
              <div className={`requirement ${password.length >= 8 ? 'valid' : ''}`}>
                {password.length >= 8 ? '✓' : '○'} At least 8 characters
              </div>
              <div className={`requirement ${/[A-Z]/.test(password) ? 'valid' : ''}`}>
                {/[A-Z]/.test(password) ? '✓' : '○'} One uppercase letter
              </div>
              <div className={`requirement ${/[a-z]/.test(password) ? 'valid' : ''}`}>
                {/[a-z]/.test(password) ? '✓' : '○'} One lowercase letter
              </div>
              <div className={`requirement ${/[0-9]/.test(password) ? 'valid' : ''}`}>
                {/[0-9]/.test(password) ? '✓' : '○'} One number
              </div>
              <div className={`requirement ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'valid' : ''}`}>
                {/[!@#$%^&*(),.?":{}|<>]/.test(password) ? '✓' : '○'} One special character
              </div>
            </div>
          )}
        </div>
        
        <div className="auth-form-field">
          <label className="auth-form-label" htmlFor="register-confirm-password-input">Confirm password</label>
          <div className="auth-form-input-wrapper">
            <svg className="auth-form-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input 
              id="register-confirm-password-input"
              name="confirm-password"
              type="password" 
              className="auth-form-input" 
              placeholder="Confirm your password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
        </div>
        
        <div className="auth-form-field">
          <label className="auth-form-checkbox-label" htmlFor="register-agree-checkbox">
            <input 
              id="register-agree-checkbox"
              type="checkbox" 
              className="auth-form-checkbox" 
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              required
            />
            <span className="desktop-agreement-text">I agree to the Terms & Conditions and Privacy Policy</span>
            <span className="mobile-agreement-text">I agree to the Ts & Cs and Privacy Policy</span>
          </label>
        </div>
        
        <button type="submit" className="auth-form-button" disabled={isLoading || !agreeToTerms}>
          <svg className="auth-form-button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          {isLoading ? 'Signing up...' : 'Sign up'}
        </button>
      </form>
      <ErrorModal
        isOpen={errorModal.isOpen}
        message={errorModal.message}
        onClose={() => setErrorModal({ isOpen: false, message: '' })}
      />
    </>
  );
}

export default Register;