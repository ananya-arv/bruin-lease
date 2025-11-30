import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const { continueAsGuest, isGuest, logout } = useAuth();

  const handleGetStarted = () => {
    navigate('/auth?mode=register');
  };

  const handleSignIn = () => {
    navigate('/auth?mode=login');
  };

  const handleBrowseAsGuest = () => {
    if (isGuest) {
      // Already a guest, just navigate to listings
      navigate('/listings');
    } else {
      // Set guest mode and navigate
      continueAsGuest();
      navigate('/listings');
    }
  };

  const handleExitGuestMode = () => {
    logout();
    // Page will refresh and show homepage
  };

  return (
    <div className="homepage">
      <img src="/Bruinslogo.png" alt="UCLA Bruins" className="homepage-crest-left" />
      <img src="/Bruinslogo.png" alt="UCLA Bruins" className="homepage-crest" />
      {/* Guest Mode Banner */}
      {isGuest && (
        <div style={{
          backgroundColor: '#fef3c7',
          color: '#92400e',
          padding: '1rem 2rem',
          textAlign: 'center',
          fontWeight: 500,
          borderBottom: '1px solid #fde68a',
          fontFamily: "'Lexend', sans-serif",
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <span>👀 You're browsing as a guest</span>
          <button
            onClick={handleExitGuestMode}
            style={{
              backgroundColor: '#92400e',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.875rem',
              fontFamily: "'Lexend', sans-serif"
            }}
          >
            Exit Guest Mode
          </button>
        </div>
      )}
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="logo-section">
            <img src="/BruinLease_logo.png" alt="BruinLease" className="hero-logo" />
            <h1 className="hero-title">BruinLease</h1>
          </div>
          <p className="hero-subtitle">UCLA Off-Campus Housing Made Easy</p>
          <p className="hero-description">
            Find your perfect home near campus. Connect with verified UCLA students and discover trusted housing options.
          </p>
          <div className="hero-buttons">
            <button className="cta-button primary" onClick={handleGetStarted}>
              Get Started
            </button>
            <button className="cta-button secondary" onClick={handleSignIn}>
              Sign In
            </button>
            <button className="cta-button guest" onClick={handleBrowseAsGuest}>
              Browse as Guest
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <h2 className="section-title">Why Choose BruinLease?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🏠</div>
            <h3>Verified Listings</h3>
            <p>All listings from verified UCLA students. Safe and trustworthy housing options near campus.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📍</div>
            <h3>Near Campus</h3>
            <p>Find housing within walking distance or a short commute to UCLA. Filter by distance and preferences.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>Direct Messaging</h3>
            <p>Connect directly with property owners. Ask questions and schedule viewings seamlessly.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Easy & Fast</h3>
            <p>Simple search and filtering. Create listings in minutes. Find your next home quickly.</p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="how-it-works-section">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Create Account</h3>
            <p>Sign up with your UCLA email to get verified access</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Browse Listings</h3>
            <p>Search through available housing options near UCLA</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Connect</h3>
            <p>Message property owners directly through our platform</p>
          </div>
          <div className="step-card">
            <div className="step-number">4</div>
            <h3>Move In</h3>
            <p>Find your perfect home and start your UCLA journey</p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>500+</h3>
            <p>Active Listings</p>
          </div>
          <div className="stat-card">
            <h3>1000+</h3>
            <p>Verified Students</p>
          </div>
          <div className="stat-card">
            <h3>50+</h3>
            <p>Properties Near Campus</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <h2>Ready to Find Your Home?</h2>
        <p>Join thousands of UCLA students who found housing through BruinLease</p>
        <button className="cta-button primary large" onClick={handleGetStarted}>
          Sign Up Now
        </button>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>BruinLease</h4>
            <p>Making UCLA off-campus housing simple and secure</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <a href="#" onClick={(e) => { e.preventDefault(); handleBrowseAsGuest(); }}>Browse Listings</a>
            <a href="#" onClick={(e) => { e.preventDefault(); handleSignIn(); }}>Sign In</a>
            <a href="#" onClick={(e) => { e.preventDefault(); handleGetStarted(); }}>Sign Up</a>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p>support@bruinlease.com</p>
            <p>UCLA Community</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 BruinLease. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;