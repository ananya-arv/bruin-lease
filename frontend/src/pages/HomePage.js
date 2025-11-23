import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="homepage">
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
            <button className="cta-button primary" onClick={() => navigate('/?mode=register')}>
              Get Started
            </button>
            <button className="cta-button secondary" onClick={() => navigate('/?mode=login')}>
              Sign In
            </button>
            <button className="cta-button guest" onClick={() => navigate('/listings')}>
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
        <button className="cta-button primary large" onClick={() => navigate('/?mode=register')}>
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
            <a href="/listings">Browse Listings</a>
            <a href="/?mode=login">Sign In</a>
            <a href="/?mode=register">Sign Up</a>
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