import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../../services/authService';
import Loading from '../../../components/loading/Loading';
import './Register.css';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

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
      return 'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPasswordError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }

    setIsLoading(true);
    setProgress(0);

    register(email, password)
      .then(() => {
        setProgress(100);
        setSuccess(true);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  if (success) {
    return (
      <div className="auth-form">
        <h1 className="auth-form-title">Check your email</h1>
        <p style={{ color: '#a0a0a0', textAlign: 'center', marginBottom: '2rem' }}>
          We've sent you a confirmation email. Please click the link to verify your account.
        </p>
        <button 
          className="auth-form-button" 
          onClick={() => navigate('/login')}
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <>
      <Loading 
        isLoading={isLoading} 
        progress={progress}
        message="Creating your account"
        status="CyberSecure Auth System v1.0"
      />
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1 className="auth-form-title">Create account</h1>
        
        {error && <div className="auth-form-error">{error}</div>}
        {passwordError && <div className="auth-form-error">{passwordError}</div>}

        <div className="auth-form-field">
          <label className="auth-form-label">Email</label>
          <div className="auth-form-input-wrapper">
            <svg className="auth-form-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <input 
              type="email" 
              className="auth-form-input" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
        
        <div className="auth-form-field">
          <label className="auth-form-label">Password</label>
          <div className="auth-form-input-wrapper">
            <svg className="auth-form-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input 
              type="password" 
              className="auth-form-input" 
              placeholder="Enter your password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
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
        </div>
        
        <div className="auth-form-field">
          <label className="auth-form-label">Confirm password</label>
          <div className="auth-form-input-wrapper">
            <svg className="auth-form-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input 
              type="password" 
              className="auth-form-input" 
              placeholder="Confirm your password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>
        
        <button type="submit" className="auth-form-button" disabled={isLoading}>
          <svg className="auth-form-button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          {isLoading ? 'Signing up...' : 'Sign up'}
        </button>
      </form>
    </>
  );
}

export default Register;
