import './Login.css';

function Login() {
  return (
    <form className="auth-form">
      <h1 className="auth-form-title">Welcome back</h1>
      
      <div className="auth-form-field">
        <label className="auth-form-label">Email or Username</label>
        <div className="auth-form-input-wrapper">
          <svg className="auth-form-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          <input 
            type="text" 
            className="auth-form-input" 
            placeholder="Enter your email or username" 
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
          />
        </div>
      </div>
      
      <div className="auth-form-options">
        <label className="auth-form-checkbox-label">
          <input type="checkbox" className="auth-form-checkbox" />
          Save Details
        </label>
        <a href="#" className="auth-form-forgot">Forgot password?</a>
      </div>
      
      <button type="submit" className="auth-form-button">
        <svg className="auth-form-button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <polyline points="10 17 15 12 10 7" />
          <line x1="15" y1="12" x2="3" y2="12" />
        </svg>
        Sign in
      </button>
    </form>
  );
}

export default Login;
