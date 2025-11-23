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
import { useAuth } from './context/AuthContext';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomeOrAuth />} />
        
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

// Component to decide between HomePage and Login
function HomeOrAuth() {
  const { isAuthenticated } = useAuth();
  const searchParams = new URLSearchParams(window.location.search);
  const hasAuthParams = searchParams.has('mode');
  
  // If user is authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // If there are auth parameters (login/register), show auth page
  if (hasAuthParams) {
    return <Login />;
  }
  
  // Otherwise show homepage
  return <HomePage />;
}

export default App;