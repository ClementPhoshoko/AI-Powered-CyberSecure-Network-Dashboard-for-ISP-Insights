import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { sendOtp, verifyOtp, resetPassword } from '../../../services/authService';
import Loading from '../../../components/loading/Loading';
import ErrorModal from '../../../components/error_modal/ErrorModal';
import TurnstileWidget from '../../../components/turnstile_widget/TurnstileWidget';
import { useTurnstile } from '../../../hooks/useTurnstile';
import successAvatar from '../../../assets/avatars/success_avatar_2.png';
import Seo from '../../../components/seo/Seo';
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
  const { t } = useTranslation();
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
  const {
    token: sendCaptchaToken,
    widgetRef: sendCaptchaRef,
    enabled: sendCaptchaEnabled,
    handleVerify: onSendCaptchaVerify,
    handleExpire: onSendCaptchaExpire,
    handleError: onSendCaptchaError,
    reset: resetSendCaptcha,
  } = useTurnstile();
  const {
    token: resendCaptchaToken,
    widgetRef: resendCaptchaRef,
    enabled: resendCaptchaEnabled,
    handleVerify: onResendCaptchaVerify,
    handleExpire: onResendCaptchaExpire,
    handleError: onResendCaptchaError,
    reset: resetResendCaptcha,
  } = useTurnstile();
  const navigate = useNavigate();

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
    if (sendCaptchaEnabled && !sendCaptchaToken) {
      setErrorModal({ isOpen: true, message: t('errors:CAPTCHA_REQUIRED') });
      return;
    }
    setIsLoading(true);
    setProgress(0);
    try {
      const result = await sendOtp(email, 'reset', sendCaptchaToken);
      setProgress(100);
      setResendTimer(60);
      setStep('otp');
    } catch (err) {
      setErrorModal({ isOpen: true, message: err.message });
      resetSendCaptcha();
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
      setErrorModal({ isOpen: true, message: t('auth.register.validation.passwordMismatch') });
      return;
    }
    if (newPassword.length < 8) {
      setErrorModal({ isOpen: true, message: t('auth.register.validation.minChars') });
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
    if (resendCaptchaEnabled && !resendCaptchaToken) {
      setErrorModal({ isOpen: true, message: t('errors:CAPTCHA_REQUIRED') });
      return;
    }
    setIsLoading(true);
    try {
      await sendOtp(email, 'reset', resendCaptchaToken);
      setResendTimer(60);
    } catch (err) {
      setErrorModal({ isOpen: true, message: err.message });
    } finally {
      resetResendCaptcha();
      setIsLoading(false);
    }
  };

  return (
    <>
      <Seo title={t('seo.forgotTitle')} description={t('seo.forgotDesc')} path="/forgot-password" />
      <Loading
        isLoading={isLoading}
        progress={progress}
        message={step === 'email' ? t('auth.forgot.sendingCode') : step === 'otp' ? t('auth.forgot.verifyingCode') : step === 'password' ? t('auth.forgot.resettingPassword') : ''}
        status={t('nav.authSystemStatus')}
        indeterminate={true}
      />
      <div className="forgot-container">
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
              <h1 className="auth-form-title">{t('auth.forgot.resetPassword')}</h1>
              <p className="forgot-subtitle">{t('auth.forgot.emailStepSubtitle')}</p>

              <div className="auth-form-field">
                <label className="auth-form-label" htmlFor="forgot-email">{t('auth.forgot.emailLabel')}</label>
                <div className="auth-form-input-wrapper">
                  <svg className="auth-form-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <input
                    id="forgot-email"
                    type="email"
                    className="auth-form-input"
                    placeholder={t('auth.forgot.emailPlaceholder')}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <TurnstileWidget
                ref={sendCaptchaRef}
                onVerify={onSendCaptchaVerify}
                onExpire={onSendCaptchaExpire}
                onError={onSendCaptchaError}
              />

              <button type="submit" className="auth-form-button" disabled={isLoading || (sendCaptchaEnabled && !sendCaptchaToken)}>
                <svg className="auth-form-button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                {isLoading ? t('auth.forgot.sending') : t('auth.forgot.sendOtp')}
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
              <h1 className="auth-form-title">{t('auth.forgot.enterCode')}</h1>
              <p className="forgot-subtitle">{t('auth.forgot.otpStepSubtitle', { email })}</p>

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
                {isLoading ? t('auth.forgot.verifying') : t('auth.forgot.verify')}
              </button>

              {resendTimer <= 0 && (
                <TurnstileWidget
                  ref={resendCaptchaRef}
                  onVerify={onResendCaptchaVerify}
                  onExpire={onResendCaptchaExpire}
                  onError={onResendCaptchaError}
                />
              )}

              <button
                type="button"
                className="forgot-resend"
                onClick={handleResend}
                disabled={resendTimer > 0 || isLoading || (resendCaptchaEnabled && !resendCaptchaToken)}
              >
                {resendTimer > 0 ? t('auth.forgot.resendIn', { seconds: resendTimer }) : t('auth.forgot.resendCode')}
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
              <h1 className="auth-form-title">{t('auth.forgot.createPassword')}</h1>
              <p className="forgot-subtitle">{t('auth.forgot.passwordStepSubtitle')}</p>

              <div className="auth-form-field">
                <label className="auth-form-label" htmlFor="new-password">{t('auth.forgot.newPasswordLabel')}</label>
                <div className="auth-form-input-wrapper">
                  <svg className="auth-form-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    id="new-password"
                    type="password"
                    className="auth-form-input"
                    placeholder={t('auth.forgot.newPasswordPlaceholder')}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>

              <div className="auth-form-field">
                <label className="auth-form-label" htmlFor="confirm-new-password">{t('auth.forgot.confirmPasswordLabel')}</label>
                <div className="auth-form-input-wrapper">
                  <svg className="auth-form-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    id="confirm-new-password"
                    type="password"
                    className="auth-form-input"
                    placeholder={t('auth.forgot.confirmPasswordPlaceholder')}
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
                {isLoading ? t('auth.forgot.resetting') : t('auth.forgot.resetPasswordBtn')}
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
                <img src={successAvatar} alt={t('imageAlt.success')} />
              </div>
              <h1 className="auth-form-title">{t('auth.forgot.passwordUpdated')}</h1>
              <p className="forgot-subtitle">{t('auth.forgot.successSubtitle')}</p>
              <button className="auth-form-button" onClick={() => navigate('/login')}>
                <svg className="auth-form-button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                {t('auth.forgot.goToLogin')}
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
