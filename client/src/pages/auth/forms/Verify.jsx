import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { sendOtp, verifyOtp } from '../../../services/authService';
import Loading from '../../../components/loading/Loading';
import ErrorModal from '../../../components/error_modal/ErrorModal';
import './Verify.css';

const STEP_VARIANTS = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

function OtpInput({ length = 6, onComplete, disabled }) {
  const [digits, setDigits] = useState(Array(length).fill(''));
  const inputRefs = useRef([]);

  const handleChange = useCallback((index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    if (newDigits.every(d => d !== '') && newDigits.join('').length === length) {
      onComplete(newDigits.join(''));
    }
  }, [digits, length, onComplete]);

  const handleKeyDown = useCallback((index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }, [digits]);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (pasted.length === length) {
      const newDigits = pasted.split('');
      setDigits(newDigits);
      inputRefs.current[length - 1]?.focus();
      onComplete(pasted);
    }
  }, [length, onComplete]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  return (
    <div className="otp-inputs" onPaste={handlePaste}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={el => inputRefs.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          className="otp-digit"
          value={digit}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          disabled={disabled}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
}

function Verify() {
  const [step, setStep] = useState('otp');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resendTimer, setResendTimer] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [location]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [resendTimer]);

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

  const handleSendOtp = async () => {
    if (!email) return;
    setIsLoading(true);
    setProgress(0);
    try {
      await sendOtp(email, 'verify');
      setProgress(100);
      setResendTimer(60);
      setStep('otp');
    } catch (err) {
      setErrorModal({ isOpen: true, message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (code) => {
    setIsLoading(true);
    setProgress(0);
    try {
      await verifyOtp(email, code, 'verify');
      setProgress(100);
      setStep('success');
    } catch (err) {
      setErrorModal({ isOpen: true, message: err.message });
      setOtpCode('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setIsLoading(true);
    try {
      await sendOtp(email, 'verify');
      setResendTimer(60);
    } catch (err) {
      setErrorModal({ isOpen: true, message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Loading
        isLoading={isLoading}
        progress={progress}
        message={step === 'email' ? 'Sending verification code' : 'Verifying email'}
        status="AkovoLabs Auth System v1.0"
        indeterminate={true}
      />
      <div className="verify-container">
        <AnimatePresence mode="wait">
          {step === 'email' && (
            <motion.div
              key="email"
              variants={STEP_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="auth-form"
            >
              <h1 className="auth-form-title">Verify your email</h1>
              <p className="verify-subtitle">Enter your email address and we'll send you a verification code.</p>

              <div className="auth-form-field">
                <label className="auth-form-label" htmlFor="verify-email">Email</label>
                <div className="auth-form-input-wrapper">
                  <svg className="auth-form-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <input
                    id="verify-email"
                    type="email"
                    className="auth-form-input"
                    placeholder="Enter your email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <button type="button" className="auth-form-button" onClick={handleSendOtp} disabled={isLoading || !email}>
                <svg className="auth-form-button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                {isLoading ? 'Sending...' : 'Send verification code'}
              </button>
            </motion.div>
          )}

          {step === 'otp' && (
            <motion.div
              key="otp"
              variants={STEP_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="auth-form"
            >
              <h1 className="auth-form-title">Check your email</h1>
              <p className="verify-subtitle">We sent a 6-digit code to <strong>{email}</strong></p>

              <OtpInput length={6} onComplete={setOtpCode} disabled={isLoading} />

              <button
                type="button"
                className="auth-form-button"
                onClick={() => handleVerifyOtp(otpCode)}
                disabled={isLoading || otpCode.length !== 6}
              >
                <svg className="auth-form-button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {isLoading ? 'Verifying...' : 'Verify'}
              </button>

              <button
                type="button"
                className="verify-resend"
                onClick={handleResend}
                disabled={resendTimer > 0 || isLoading}
              >
                {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend code'}
              </button>
            </motion.div>
          )}

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
              <div className="verify-success-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h1 className="auth-form-title">Email verified</h1>
              <p className="verify-subtitle">Your email has been verified successfully. You can now access all features.</p>
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
