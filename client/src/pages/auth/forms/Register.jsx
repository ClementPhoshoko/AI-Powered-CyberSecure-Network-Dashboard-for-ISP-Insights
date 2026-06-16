import './Register.css';

function Register() {
  return (
    <form className="auth-form">
      <h1 className="auth-form-title">Create account</h1>
      
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
          />
        </div>
      </div>
      
      <button type="submit" className="auth-form-button">
        <svg className="auth-form-button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Sign up
      </button>
    </form>
  );
}

export default Register;
