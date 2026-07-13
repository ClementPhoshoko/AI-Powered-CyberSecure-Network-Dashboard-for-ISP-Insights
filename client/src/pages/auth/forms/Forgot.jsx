import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { sendOtp, verifyOtp, resetPassword } from '../../../services/authService';
import Loading from '../../../components/loading/Loading';
import ErrorModal from '../../../components/error_modal/ErrorModal';
import './Forgot.css';

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

function Forgot() {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resendTimer, setResendTimer] = useState(0);
  const [animationKey, setAnimationKey] = useState(Date.now());
  const navigate = useNavigate();

  useEffect(() => {
    setAnimationKey(Date.now());
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [resendTimer]);

  // Progress bar
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

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setProgress(0);
    try {
      const result = await sendOtp(email, 'reset');
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
      const result = await verifyOtp(email, code, 'reset');
      setResetToken(result.resetToken);
      setProgress(100);
      setStep('password');
    } catch (err) {
      setErrorModal({ isOpen: true, message: err.message });
      setOtpCode('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorModal({ isOpen: true, message: 'Passwords do not match' });
      return;
    }
    if (newPassword.length < 8) {
      setErrorModal({ isOpen: true, message: 'Password must be at least 8 characters' });
      return;
    }
    setIsLoading(true);
    setProgress(0);
    try {
      await resetPassword(email, resetToken, newPassword);
      setProgress(100);
      setStep('success');
    } catch (err) {
      setErrorModal({ isOpen: true, message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setIsLoading(true);
    try {
      await sendOtp(email, 'reset');
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
        message={step === 'email' ? 'Sending verification code' : step === 'otp' ? 'Verifying code' : step === 'password' ? 'Resetting password' : ''}
        status="AkovoLabs Auth System v1.0"
        indeterminate={true}
      />
      <div className="forgot-container" key={animationKey}>
        <AnimatePresence mode="wait">
          {step === 'email' && (
            <motion.form
              key="email"
              variants={STEP_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="auth-form"
              onSubmit={handleSendOtp}
            >
              <h1 className="auth-form-title">Reset your password</h1>
              <p className="forgot-subtitle">Enter the email you signed up with and we'll send you a verification code.</p>

              <div className="auth-form-field">
                <label className="auth-form-label" htmlFor="forgot-email">Email</label>
                <div className="auth-form-input-wrapper">
                  <svg className="auth-form-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <input
                    id="forgot-email"
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

              <button type="submit" className="auth-form-button" disabled={isLoading}>
                <svg className="auth-form-button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                {isLoading ? 'Sending...' : 'Send OTP'}
              </button>
            </motion.form>
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
              <h1 className="auth-form-title">Enter verification code</h1>
              <p className="forgot-subtitle">We sent a 6-digit code to <strong>{email}</strong></p>

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
                className="forgot-resend"
                onClick={handleResend}
                disabled={resendTimer > 0 || isLoading}
              >
                {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend code'}
              </button>
            </motion.div>
          )}

          {step === 'password' && (
            <motion.form
              key="password"
              variants={STEP_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="auth-form"
              onSubmit={handleResetPassword}
            >
              <h1 className="auth-form-title">Create new password</h1>
              <p className="forgot-subtitle">Your new password must be at least 8 characters long.</p>

              <div className="auth-form-field">
                <label className="auth-form-label" htmlFor="new-password">New password</label>
                <div className="auth-form-input-wrapper">
                  <svg className="auth-form-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    id="new-password"
                    type="password"
                    className="auth-form-input"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>

              <div className="auth-form-field">
                <label className="auth-form-label" htmlFor="confirm-new-password">Confirm password</label>
                <div className="auth-form-input-wrapper">
                  <svg className="auth-form-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    id="confirm-new-password"
                    type="password"
                    className="auth-form-input"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="auth-form-button" disabled={isLoading}>
                <svg className="auth-form-button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {isLoading ? 'Resetting...' : 'Reset password'}
              </button>
            </motion.form>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              variants={STEP_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="auth-form forgot-success"
            >
              <div className="forgot-success-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h1 className="auth-form-title">Password updated</h1>
              <p className="forgot-subtitle">Your password has been reset successfully. You can now sign in with your new password.</p>
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

export default Forgot;
