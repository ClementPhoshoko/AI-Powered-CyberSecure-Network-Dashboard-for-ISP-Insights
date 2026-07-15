import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { register } from '../../../services/authService';
import Loading from '../../../components/loading/Loading';
import ErrorModal from '../../../components/error_modal/ErrorModal';
import TurnstileWidget from '../../../components/turnstile_widget/TurnstileWidget';
import { useTurnstile } from '../../../hooks/useTurnstile';
import successAvatar from '../../../assets/avatars/success_avatar_2.png';
import './Register.css';

function Register() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const {
    token: captchaToken,
    widgetRef: captchaRef,
    enabled: captchaEnabled,
    handleVerify: onCaptchaVerify,
    handleExpire: onCaptchaExpire,
    handleError: onCaptchaError,
    reset: resetCaptcha,
  } = useTurnstile();
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
      return t('auth.register.validation.minChars');
    }
    if (!/[A-Z]/.test(pwd)) {
      return t('auth.register.validation.uppercase');
    }
    if (!/[a-z]/.test(pwd)) {
      return t('auth.register.validation.lowercase');
    }
    if (!/[0-9]/.test(pwd)) {
      return t('auth.register.validation.number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
      return t('auth.register.validation.special');
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!agreeToTerms) {
      setErrorModal({ isOpen: true, message: t('auth.register.validation.agreeTerms') });
      return;
    }

    if (password !== confirmPassword) {
      setErrorModal({ isOpen: true, message: t('auth.register.validation.passwordMismatch') });
      return;
    }

    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      setErrorModal({ isOpen: true, message: passwordValidationError });
      return;
    }

    if (captchaEnabled && !captchaToken) {
      setErrorModal({ isOpen: true, message: t('errors:CAPTCHA_REQUIRED') });
      return;
    }

    setIsLoading(true);
    setProgress(0);

    try {
      // Backend creates the user (no native Supabase email) and sends the
      // EmailJS verification link in one step.
      await register(email, password, captchaToken);
      setProgress(100);
      setRegisteredEmail(email);
    } catch (err) {
      setErrorModal({ isOpen: true, message: err.message });
      resetCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  const viewVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1, y: 0,
      transition: { staggerChildren: 0.07, delayChildren: 0.1 }
    }
  };

  const fieldVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <>
      <Loading 
        isLoading={isLoading} 
        progress={progress}
        message={t('auth.register.signingUp')}
        status={t('nav.authSystemStatus')}
        indeterminate={true}
      />
      <AnimatePresence mode="wait">
        {registeredEmail ? (
          <motion.div key="register-success" className="auth-form" variants={viewVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
            <div className="auth-success-icon-wrapper">
              <div className="auth-success-icon">
                <img src={successAvatar} alt={t('imageAlt.success')} />
              </div>
            </div>
            <h1 className="auth-form-title">{t('auth.register.checkEmail')}</h1>
            <p className="auth-success-text">
              {t('auth.register.successMessage', { email: registeredEmail })}
            </p>
            <p className="auth-success-hint">
              {t('auth.register.spamNote')}
            </p>
            <button className="auth-form-button" onClick={() => navigate('/login')}>
              <svg className="auth-form-button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              {t('auth.register.goToLogin')}
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="register-form"
            variants={formVariants}
            initial="hidden"
            animate="visible"
            className="auth-form"
            onSubmit={handleSubmit}
          >
            <motion.h1 key="heading" className="auth-form-title" variants={fieldVariants}>{t('auth.register.heading')}</motion.h1>
            
            {passwordError && <motion.div key="error" className="auth-form-error" variants={fieldVariants}>{passwordError}</motion.div>}

            <motion.div key="email" className="auth-form-field" variants={fieldVariants}>
              <label className="auth-form-label" htmlFor="register-email-input">{t('auth.register.emailLabel')}</label>
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
                  placeholder={t('auth.register.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </motion.div>
            
            <motion.div key="password" className="auth-form-field" variants={fieldVariants}>
              <label className="auth-form-label" htmlFor="register-password-input">{t('auth.register.passwordLabel')}</label>
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
                  placeholder={t('auth.register.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setShowPasswordRequirements(true)}
                  onBlur={() => setTimeout(() => setShowPasswordRequirements(false), 200)}
                  autoComplete="new-password"
                  required
                />
              </div>
              <AnimatePresence>
                {showPasswordRequirements && (
                  <motion.div
                    className="password-requirements"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className={`requirement ${password.length >= 8 ? 'valid' : ''}`}>
                      {password.length >= 8 ? '✓' : '○'} {t('auth.register.passwordRequirements.minChars')}
                    </div>
                    <div className={`requirement ${/[A-Z]/.test(password) ? 'valid' : ''}`}>
                      {/[A-Z]/.test(password) ? '✓' : '○'} {t('auth.register.passwordRequirements.uppercase')}
                    </div>
                    <div className={`requirement ${/[a-z]/.test(password) ? 'valid' : ''}`}>
                      {/[a-z]/.test(password) ? '✓' : '○'} {t('auth.register.passwordRequirements.lowercase')}
                    </div>
                    <div className={`requirement ${/[0-9]/.test(password) ? 'valid' : ''}`}>
                      {/[0-9]/.test(password) ? '✓' : '○'} {t('auth.register.passwordRequirements.number')}
                    </div>
                    <div className={`requirement ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'valid' : ''}`}>
                      {/[!@#$%^&*(),.?":{}|<>]/.test(password) ? '✓' : '○'} {t('auth.register.passwordRequirements.special')}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            
            <motion.div key="confirm-password" className="auth-form-field" variants={fieldVariants}>
              <label className="auth-form-label" htmlFor="register-confirm-password-input">{t('auth.register.confirmPasswordLabel')}</label>
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
                  placeholder={t('auth.register.confirmPasswordPlaceholder')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
            </motion.div>
            
            <motion.div key="agree" className="auth-form-field" variants={fieldVariants}>
              <label className="auth-form-checkbox-label" htmlFor="register-agree-checkbox">
                <input 
                  id="register-agree-checkbox"
                  type="checkbox" 
                  className="auth-form-checkbox" 
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  required
                />
                <span className="desktop-agreement-text">{t('auth.register.agreeDesktop')}</span>
                <span className="mobile-agreement-text">{t('auth.register.agreeMobile')}</span>
              </label>
            </motion.div>
            
            <motion.div key="captcha" variants={fieldVariants}>
              <TurnstileWidget
                ref={captchaRef}
                onVerify={onCaptchaVerify}
                onExpire={onCaptchaExpire}
                onError={onCaptchaError}
              />
            </motion.div>

            <motion.div key="submit" variants={fieldVariants}>
              <button type="submit" className="auth-form-button" disabled={isLoading || !agreeToTerms || (captchaEnabled && !captchaToken)}>
                <svg className="auth-form-button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                {isLoading ? t('auth.register.signingUp') : t('auth.register.signUp')}
              </button>
            </motion.div>
          </motion.form>
        )}
      </AnimatePresence>
      <ErrorModal
        isOpen={errorModal.isOpen}
        message={errorModal.message}
        onClose={() => setErrorModal({ isOpen: false, message: '' })}
      />
    </>
  );
}

export default Register;