import { Link } from 'react-router-dom';
import './NotFound.css';
import notFoundAvatar from '../../assets/avatars/not_found_avatar.png';

function NotFound() {
  return (
    <div className="not-found-page">
      <div className="not-found-card">
        <h1 className="not-found-title">404 - Page Not Found</h1>
        <img src={notFoundAvatar} alt="Page not found" className="not-found-avatar" />
        <p className="not-found-text">
          Oops! The page you're looking for doesn't exist.
        </p>
        <p className="not-found-subtext">
          Maybe it's been moved, deleted, or you mistyped the URL.
        </p>
        <Link to="/" className="not-found-link">
          <svg className="not-found-link-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Go to Homepage & Run a Speed Test
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
