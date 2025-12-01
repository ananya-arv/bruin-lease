import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateListing from './pages/CreateListing';
import ListingsPage from './pages/ListingsPage';
import MyListings from './pages/MyListings';
import ListingDetail from './pages/ListingDetail';
import Messages from './pages/Messages';
import ProtectedRoute from './components/ProtectedRoute';
import GuestProtectedRoute from './components/GuestProtectedRoute';
import BookmarksPage from './pages/BookmarksPage';
import { useAuth } from './context/AuthContext';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomeOrDashboard />} />
        <Route path="/auth" element={<Login />} />
        
        {/* Guest Accessible Routes */}
        <Route path="/listings" element={<ListingsPage />} />
        <Route path="/listings/:id" element={<ListingDetail />} />
        
        {/* Protected Routes - Require Full Account (Not Guest) */}
        <Route 
          path="/dashboard" 
          element={
            <GuestProtectedRoute>
              <Dashboard />
            </GuestProtectedRoute>
          } 
        />
        <Route 
          path="/create-listing" 
          element={
            <GuestProtectedRoute>
              <CreateListing />
            </GuestProtectedRoute>
          } 
        />
        <Route 
          path="/my-listings" 
          element={
            <GuestProtectedRoute>
              <MyListings />
            </GuestProtectedRoute>
          } 
        />
        <Route path="/bookmarks" 
        element={<BookmarksPage />} 
        />
        <Route 
          path="/messages" 
          element={
            <GuestProtectedRoute>
              <Messages />
            </GuestProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

// Component to decide between HomePage and Dashboard
function HomeOrDashboard() {
  const { isAuthenticated, isGuest, loading } = useAuth();
  
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
  
  // If user is authenticated (not guest), redirect to dashboard
  if (isAuthenticated && !isGuest) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // If guest or not authenticated, show homepage
  return <HomePage />;
}

export default App;