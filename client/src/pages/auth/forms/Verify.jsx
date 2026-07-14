import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Loading from '../../../components/loading/Loading';
import ErrorModal from '../../../components/error_modal/ErrorModal';
import successAvatar from '../../../assets/avatars/success_avatar_2.png';
import './Verify.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const STEP_VARIANTS = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

function Verify() {
  const [step, setStep] = useState('verifying');
  const [email, setEmail] = useState('');
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const hasVerified = useRef(false);

  useEffect(() => {
    if (hasVerified.current) return;
    hasVerified.current = true;

    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const emailParam = params.get('email');

    if (token && emailParam) {
      setEmail(emailParam);
      verifyByLink(token, emailParam);
    } else {
      setErrorModal({ isOpen: true, message: 'Invalid verification link.' });
      setStep('error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let interval;
    if (isLoading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return prev;
          return Math.min(prev + Math.random() * 15, 95);
        });
      }, 400);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const verifyByLink = async (token, email) => {
    setIsLoading(true);
    try {
      let res;
      try {
        res = await fetch(`${API_URL}/api/otp/verify-link?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`);
      } catch {
        throw new Error('Unable to connect to the server. Please check your internet connection and try again.');
      }

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Something went wrong on our end. Please try again later.');
      }

      const data = await res.json();
      if (!res.ok) {
        // If the email is already verified, treat it as success — the link worked.
        if ((data.message || '').toLowerCase().includes('already verified')) {
          setProgress(100);
          setStep('success');
          return;
        }
        throw new Error(data.message || 'Verification failed');
      }
      setProgress(100);
      setStep('success');
    } catch (err) {
      setErrorModal({ isOpen: true, message: err.message });
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Loading
        isLoading={isLoading}
        progress={progress}
        message="Verifying your email"
        status="AkovoLabs Auth System v1.0"
        indeterminate={true}
      />
      <div className="verify-container">
        <AnimatePresence mode="wait">
          {step === 'success' && (
            <motion.div
              key="success"
              variants={STEP_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="auth-form verify-success"
            >
              <div className="verify-success-icon-wrapper">
                <div className="verify-success-icon">
                  <img src={successAvatar} alt="Success" />
                </div>
              </div>
              <h1 className="auth-form-title">Email verified</h1>
              <p className="verify-subtitle">Your email has been verified successfully. You can now sign in to your account.</p>
              <button className="auth-form-button" onClick={() => navigate('/login')}>
                <svg className="auth-form-button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                Go to Login
              </button>
            </motion.div>
          )}

          {step === 'error' && (
            <motion.div
              key="error"
              variants={STEP_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="auth-form"
            >
              <h1 className="auth-form-title">Verification failed</h1>
              <p className="verify-subtitle">The verification link is invalid or has expired. Please sign up again.</p>
              <button className="auth-form-button" onClick={() => navigate('/signup')}>
                Back to Sign Up
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <ErrorModal
        isOpen={errorModal.isOpen}
        message={errorModal.message}
        onClose={() => setErrorModal({ isOpen: false, message: '' })}
      />
    </>
  );
}

export default Verify;