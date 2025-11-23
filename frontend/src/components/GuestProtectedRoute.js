import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GuestProtectedRoute = ({ children }) => {
  const { user, isGuest, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: "'Lexend', sans-serif"
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  // If user is a guest, redirect to listings with a message
  if (isGuest) {
    alert('Please sign in with a UCLA account to access this feature');
    return <Navigate to="/?mode=login" replace />;
  }

  // If user is not authenticated at all, redirect to home
  if (!user) {
    return <Navigate to="/?mode=login" replace />;
  }

  // User is fully authenticated, allow access
  return children;
};

export default GuestProtectedRoute;