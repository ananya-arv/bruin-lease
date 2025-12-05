import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

/**
 * Navbar Component
 * 
 * Main navigation bar displayed across all pages.
 * Handles:
 * - Navigation to different sections of the app
 * - User authentication display (logged in, guest, or signed out)
 * - Access control for protected routes
 * - Responsive display based on user authentication status
 */


const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isGuest, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNavClick = (path) => {
    // If guest tries to access protected routes, redirect to sign in
    if (isGuest && (path === '/dashboard' || path === '/my-listings' || path === '/create-listing' || path === '/messages')) {
      alert('Please sign in with a UCLA account to access this feature');
      navigate('/auth?mode=login');
      return;
    }
    navigate(path);
  };

  const handleBrandClick = () => {
    // Logo always goes to home
    if (user && !isGuest) {
      // Authenticated users can go to dashboard from navbar links
      navigate('/');
    } else {
      // Guests and non-authenticated go to home
      navigate('/');
    }
  };

  // Define nav items - only show certain items for guests
  const getNavItems = () => {
    if (isGuest) {
      return [
        { path: '/listings', label: 'Browse Listings' },
      ];
    }
    
    return [
      { path: '/dashboard', label: 'Dashboard' },
      { path: '/listings', label: 'Browse Listings'},
      { path: '/my-listings', label: 'My Listings' },
      { path: '/create-listing', label: 'Create Listing'},
      { path: '/messages', label: 'Messages' },
      { path: '/bookmarks', label: 'My Bookmarks' },
    ];
  };

  const navItems = getNavItems();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div 
          className="navbar-brand" 
          onClick={handleBrandClick}
        >
          <img src="/BruinLease_logo.png" alt="BruinLease" className="navbar-logo" />
          <span className="navbar-title">BruinLease</span>
        </div>

        <div className="navbar-links">
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => handleNavClick(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </div>

        <img src="/Bruinslogo.png" alt="UCLA Bruins" className="navbar-crest-top" />

        <div className="navbar-user">
          {user && !isGuest && (
            <>
              <div className="user-info">
                <div className="user-avatar">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="user-name">{user.name}</span>
              </div>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
          {isGuest && (
            <>
              <span className="guest-badge">Guest Mode</span>
              <button className="login-btn" onClick={() => navigate('/auth?mode=login')}>
                Sign In
              </button>
            </>
          )}
          {!user && !isGuest && (
            <button className="login-btn" onClick={() => navigate('/auth?mode=login')}>
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;