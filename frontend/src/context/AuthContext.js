import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const guestMode = localStorage.getItem('guestMode');
    
    if (token) {
      checkAuth();
    } else if (guestMode === 'true') {
      setIsGuest(true);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authAPI.getMe();
      setUser(response.data.data);
      setIsGuest(false);
    } catch (err) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const continueAsGuest = () => {
    localStorage.setItem('guestMode', 'true');
    setIsGuest(true);
    setUser(null);
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await authAPI.register(userData);
      const { token, ...userInfo } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.removeItem('guestMode');
      setUser(userInfo);
      setIsGuest(false);
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      const response = await authAPI.login(credentials);
      const { token, ...userInfo } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.removeItem('guestMode');
      setUser(userInfo);
      setIsGuest(false);
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('guestMode');
    setUser(null);
    setIsGuest(false);
  };

  const value = {
    user,
    isGuest,
    loading,
    error,
    register,
    login,
    logout,
    continueAsGuest,
    isAuthenticated: !!user || isGuest
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};