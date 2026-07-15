import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { login } from '../../../services/authService';
import { verifyCaptcha } from '../../../services/captchaService';
import Loading from '../../../components/loading/Loading';
import ErrorModal from '../../../components/error_modal/ErrorModal';
import TurnstileWidget from '../../../components/turnstile_widget/TurnstileWidget';
import { useTurnstile } from '../../../hooks/useTurnstile';
import Seo from '../../../components/seo/Seo';
import './Login.css';

function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (captchaEnabled && !captchaToken) {
      setErrorModal({ isOpen: true, message: t('errors:CAPTCHA_REQUIRED') });
      return;
    }

    setIsLoading(true);
    setProgress(0);

    try {
      if (captchaEnabled) {
        await verifyCaptcha(captchaToken);
      }
      await login(email, password);
      setProgress(100);
      navigate('/');
    } catch (err) {
      setErrorModal({ isOpen: true, message: err.message });
      resetCaptcha();
    } finally {
      setIsLoading(false);
    }
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
      <Seo title={t('seo.loginTitle')} description={t('seo.loginDesc')} path="/login" />
      <Loading 
        isLoading={isLoading} 
        progress={progress}
        message={t('auth.login.signingIn')}
        status={t('nav.authSystemStatus')}
        indeterminate={true}
      />
      <AnimatePresence mode="wait">
        <motion.form
          key="login-form"
          variants={formVariants}
          initial="hidden"
          animate="visible"
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <motion.h1 key="heading" className="auth-form-title" variants={fieldVariants}>{t('auth.login.heading')}</motion.h1>

          <motion.div key="email" className="auth-form-field" variants={fieldVariants}>
            <label className="auth-form-label" htmlFor="email-input">{t('auth.login.emailLabel')}</label>
            <div className="auth-form-input-wrapper">
              <svg className="auth-form-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <input 
                id="email-input"
                name="email"
                type="email" 
                className="auth-form-input" 
                placeholder={t('auth.login.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </motion.div>
          
          <motion.div key="password" className="auth-form-field" variants={fieldVariants}>
            <label className="auth-form-label" htmlFor="password-input">{t('auth.login.passwordLabel')}</label>
            <div className="auth-form-input-wrapper">
              <svg className="auth-form-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input 
                id="password-input"
                name="password"
                type="password" 
                className="auth-form-input" 
                placeholder={t('auth.login.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
          </motion.div>
          
          <motion.div key="options" className="auth-form-options" variants={fieldVariants}>
            <label className="auth-form-checkbox-label" htmlFor="remember-checkbox">
              <input 
                id="remember-checkbox"
                name="remember"
                type="checkbox" 
                className="auth-form-checkbox" 
              />
              {t('auth.login.rememberMe')}
            </label>
            <a href="#" className="auth-form-forgot" onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }}>{t('auth.login.forgotPassword')}</a>
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
            <button type="submit" className="auth-form-button" disabled={isLoading || (captchaEnabled && !captchaToken)}>
              <svg className="auth-form-button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              {isLoading ? t('auth.login.signingIn') : t('auth.login.signIn')}
            </button>
          </motion.div>
        </motion.form>
      </AnimatePresence>
      <ErrorModal
        isOpen={errorModal.isOpen}
        message={errorModal.message}
        onClose={() => setErrorModal({ isOpen: false, message: '' })}
      />
    </>
  );
}

export default Login;
