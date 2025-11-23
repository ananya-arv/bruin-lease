import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './index.css'; 

export default function AuthenticationUI() {
  const [searchParams] = useSearchParams();
  const successMessage = searchParams.get('message');
  const modeParam = searchParams.get('mode');
  const { showSuccess, showError } = useToast();
  
  const [isLogin, setIsLogin] = useState(modeParam !== 'register');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, register, continueAsGuest } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (modeParam === 'register') {
      setIsLogin(false);
    } else if (modeParam === 'login') {
      setIsLogin(true);
    }
  }, [modeParam]);

  useEffect(() => {
    if (successMessage) {
      showSuccess(successMessage);
    }
  }, [successMessage, showSuccess]);

  const validateEmail = (email) => {
    const uclaEmailRegex = /^[a-zA-Z0-9._%+-]+@ucla\.edu$/;
    return uclaEmailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please use a valid @ucla.edu email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = 'Name is required';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);

    try {
      let result;
      
      if (isLogin) {
        result = await login({
          email: formData.email,
          password: formData.password
        });
        
        if (result.success) {
          showSuccess('Successfully logged in! Welcome back.');
          navigate('/dashboard');
        } else {
          showError(result.error || 'Login failed');
        }
      } else {
        result = await register({
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
        
        if (result.success) {
          showSuccess('Account created successfully! Welcome to BruinLease.');
          navigate('/dashboard');
        } else {
          showError(result.error || 'Registration failed');
        }
      }
    } catch (error) {
      showError(error.response?.data?.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: '',
      password: '',
      name: '',
      phone: '',
      confirmPassword: ''
    });
    setErrors({});
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-header">
          <div className="logo-circle ucla-logo-circle">
            <img
              src="/BruinLease_logo.png"
              className="ucla-logo"
              alt="BruinLease Logo"
            />
          </div>
          <h1>BruinLease</h1>
          <p>UCLA Off-Campus Housing Finder</p>
        </div>

        <div className="auth-card">
          <div className="auth-card-header">
            <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <p>
              {isLogin ? 'Sign in to find your perfect home' : 'Join the Bruin housing community'}
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  placeholder="John Doe"
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="error-message">{errors.name}</p>
                )}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                UCLA Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="bruinbear@ucla.edu"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="error-message">{errors.email}</p>
              )}
            </div>

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  Phone Number <span className="optional">(optional)</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="(123) 456-7890"
                  disabled={isLoading}
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="password-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                  disabled={isLoading}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password && (
                <p className="error-message">{errors.password}</p>
              )}
            </div>

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                {errors.confirmPassword && (
                  <p className="error-message">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            {isLogin && (
              <div className="forgot-password-wrapper">
                <button
                  type="button"
                  className="forgot-password-btn"
                  disabled={isLoading}
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="submit-btn"
            >
              {isLoading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="switch-mode">
            <p>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={switchMode}
                className="switch-mode-btn"
                disabled={isLoading}
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
              {' or '}
              <button
                type="button"
                onClick={() => {
                  continueAsGuest();
                  showInfo('Browsing as guest. Sign in to access all features.');
                  navigate('/listings');
                }}
                className="switch-mode-btn"
                disabled={isLoading}
              >
                Continue as Guest
              </button>
            </p>
          </div>

          {!isLogin && (
            <p className="terms-text">
              By creating an account, you agree to our{' '}
              <a href="#">Terms of Service</a>
              {' '}and{' '}
              <a href="#">Privacy Policy</a>
            </p>
          )}
        </div>

        <p className="auth-footer">
          UCLA verified students only • Secure & trusted
        </p>
      </div>
    </div>
  );
}