import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login:', { email, password, rememberMe });
    // Add login logic here
    // For demo, navigate to home on successful login
    navigate('/home');
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-box">
          {/* Header Section */}
          <div className="login-header">
            <div className="logo-circle">
              <span className="logo-icon">📚</span>
            </div>
            <h1>Library Management</h1>
            <p className="subtitle">Welcome Back</p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Email Input */}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Password Input */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="form-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <a href="#forgot" className="forgot-password">
                Forgot Password?
              </a>
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn btn-primary">
              Sign In
            </button>
          </form>

          {/* Divider */}
          <div className="divider">
            <span>Or continue with</span>
          </div>

          {/* Social Login */}
          <div className="social-login">
            <button type="button" className="btn-social google">
              <span>Google</span>
            </button>
            <button type="button" className="btn-social microsoft">
              <span>Microsoft</span>
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="signup-link">
            <p>
              Don't have an account? <a href="#signup" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>Sign up</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
