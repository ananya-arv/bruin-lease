// frontend/src/services/api.js
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

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me')
};

// Listing API calls
export const listingAPI = {
  getAllListings: () => api.get('/listings'),
  getListing: (id) => api.get(`/listings/${id}`),
  createListing: (listingData) => api.post('/listings', listingData),
  updateListing: (id, listingData) => api.put(`/listings/${id}`, listingData),
  deleteListing: (id) => api.delete(`/listings/${id}`),
  getMyListings: () => api.get('/listings/my-listings')
};

// Message API calls
export const messageAPI = {
  sendMessage: (messageData) => api.post('/messages', messageData),
  getConversation: (userId) => api.get(`/messages/conversation/${userId}`),
  getAllConversations: () => api.get('/messages/conversations'),
  markAsRead: (userId) => api.put(`/messages/read/${userId}`),
  getUnreadCount: () => api.get('/messages/unread/count'),
  deleteMessage: (id) => api.delete(`/messages/${id}`)
};

export default api;