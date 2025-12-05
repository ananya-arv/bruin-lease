/**
 * API Service Module
 * 
 * Central configuration and service methods for all HTTP requests to the backend API.
 * Handles authentication, request/response interceptors, and provides organized
 * API endpoints for different features (auth, listings, messages, reviews).
 * 
 * All requests automatically include JWT authentication tokens when available.
 * Base URL configured for local development - update for production deployment.
 * 
 * @module services/api
 */

import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API calls - Handles user registration, login, and profile retrieval
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me')
};

// Listing API calls - Handles all housing listing CRUD operations
export const listingAPI = {
  getAllListings: () => api.get('/listings'),
  getListing: (id) => api.get(`/listings/${id}`),
  createListing: (listingData) => api.post('/listings', listingData),
  updateListing: (id, listingData) => api.put(`/listings/${id}`, listingData),
  deleteListing: (id) => api.delete(`/listings/${id}`),
  getMyListings: () => api.get('/listings/my-listings')
};

// Message API calls - Handles direct messaging between users
export const messageAPI = {
  sendMessage: (messageData) => api.post('/messages', messageData),
  getConversation: (userId) => api.get(`/messages/conversation/${userId}`),
  getAllConversations: () => api.get('/messages/conversations'),
  markAsRead: (userId) => api.put(`/messages/read/${userId}`),
  getUnreadCount: () => api.get('/messages/unread/count'),
  deleteMessage: (id) => api.delete(`/messages/${id}`)
};

// Review API calls - Handles listing reviews and ratings
export const reviewAPI = {
  getReviews: (listingId) => api.get(`/listings/${listingId}/reviews`),
  createReview: (listingId, reviewData) => api.post(`/listings/${listingId}/reviews`, reviewData),
  getMyReview: (listingId) => api.get(`/listings/${listingId}/reviews/my-review`),
  updateReview: (reviewId, reviewData) => api.put(`/reviews/${reviewId}`, reviewData),
  deleteReview: (reviewId) => api.delete(`/reviews/${reviewId}`)
};

export default api;