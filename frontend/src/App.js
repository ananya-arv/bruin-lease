import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ListingsPage from './pages/ListingsPage';
import MyListings from './pages/MyListings';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/my-listings" element={<MyListings />} />
        <Route path="/listings" element={<ListingsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;