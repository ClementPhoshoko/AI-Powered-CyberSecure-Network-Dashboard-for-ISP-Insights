import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './AuthRequired.css';
import notFoundAvatar from '../../assets/avatars/not_found_avatar.png';

function AuthRequired() {
  const { t } = useTranslation();
  return (
    <div className="auth-required-page">
      <div className="auth-required-card">
        <h1 className="auth-required-title">{t('authRequired.title')}</h1>
        <img src={notFoundAvatar} alt={t('imageAlt.authRequired')} className="auth-required-avatar" />
        <p className="auth-required-text">
          {t('authRequired.message')}
        </p>
        <p className="auth-required-subtext">
          {t('authRequired.subtitle')}
        </p>
        <Link to="/login" className="auth-required-link">
          <svg className="auth-required-link-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 16l-4-4m0 0l4-4m-4 4h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {t('authRequired.goToLogin')}
        </Link>
      </div>
    </div>
  );
}

export default AuthRequired;
