import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegisterPage.css';

function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'student',
    termsAccepted: false,
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    // update form data
    setFormData({
      ...formData,
      [name]: fieldValue,
    });

    // clear error for this field as user modifies it
    if (errors[name]) {
      setErrors((prev) => {
        const { [name]: removed, ...rest } = prev;
        return rest;
      });
    }

    // clear generic errors when the user interacts again
    if (errors.general) {
      setErrors((prev) => {
        const { general, ...rest } = prev;
        return rest;
      });
    }
  };

  // helper for client-side email format validation
  const validateEmail = (email) => {
    // simple regex; avoids sending nonsense to the server
    const re = /^\S+@\S+\.\S+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // perform client-side validation before attempting network request
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the terms';

    if (Object.keys(newErrors).length > 0) {
      // set errors and abort submission
      setErrors(newErrors);
      return;
    }

    try {
      // call the backend API; assuming server is running on same host under /api
      const resp = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await resp.json();
      if (!resp.ok) {
        // server returned validation or other error
        // we display server message as a general error; refine as needed
        setErrors({ general: data.message || 'Registration failed' });
      } else {
        // successful registration - server already sent verification email
        // redirect user to login / verification page
        navigate('/login');
      }
    } catch (err) {
      // network or unexpected error
      setErrors({ general: 'Unable to connect to server. Please try again.' });
      console.error('Registration error', err);
    }
  };

  return (
    <div className="register-container">
      <div className="register-wrapper">
        <div className="register-box">
          {/* Header Section */}
          <div className="register-header">
            <div className="logo-circle">
              <span className="logo-icon">📚</span>
            </div>
            <h1>Create Account</h1>
            <p className="subtitle">Join our Library Management System</p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="register-form">
            {/* general/server error */}
            {errors.general && (
              <div className="error-text error-general">{errors.general}</div>
            )}
            {/* Name Fields */}
            <div className="form-row">
              <div className="form-group half">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First name"
                  required
                />
                {errors.firstName && <span className="error-text">{errors.firstName}</span>}
              </div>
              <div className="form-group half">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last name"
                  required
                />
                {errors.lastName && <span className="error-text">{errors.lastName}</span>}
              </div>
            </div>

            {/* Email Input */}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            {/* User Type Select */}
            <div className="form-group">
              <label htmlFor="userType">I am a</label>
              <select
                id="userType"
                name="userType"
                value={formData.userType}
                onChange={handleChange}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="librarian">Librarian</option>
              </select>
            </div>

            {/* Password Input */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                required
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            {/* Confirm Password Input */}
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
              />
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>

            {/* Terms Checkbox */}
            <label className="terms-checkbox">
              <input
                type="checkbox"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
              />
              <span>
                I agree to the <a href="#terms">Terms of Service</a> and{' '}
                <a href="#privacy">Privacy Policy</a>
              </span>
            </label>
            {errors.termsAccepted && <span className="error-text">{errors.termsAccepted}</span>}

            {/* Submit Button */}
            <button type="submit" className="btn btn-primary">
              Create Account
            </button>
          </form>

          {/* Divider */}
          <div className="divider">
            <span>Or sign up with</span>
          </div>

          {/* Social Sign Up */}
          <div className="social-login">
            <button type="button" className="btn-social google">
              <span>Google</span>
            </button>
            <button type="button" className="btn-social microsoft">
              <span>Microsoft</span>
            </button>
          </div>

          {/* Login Link */}
          <div className="login-link">
            <p>
              Already have an account? <a href="#signin" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Sign in</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
