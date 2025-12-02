import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listingAPI } from '../services/api';
import ListingCard from '../components/ListingCard';
import Navbar from '../components/Navbar';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user, isGuest, logout } = useAuth();
  const navigate = useNavigate();
  const [myListings, setMyListings] = useState([]);
  const [recentListings, setRecentListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [myListingsRes, allListingsRes] = await Promise.all([
        listingAPI.getMyListings(),
        listingAPI.getAllListings()
      ]);
      
      setMyListings(myListingsRes.data.data);
      setRecentListings(allListingsRes.data.data.slice(0, 3));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="dashboard-page">
          <div className="loading">Loading dashboard...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="dashboard-header">
          <div className="welcome-section">
            <h1>Welcome, {user?.name}!</h1>
            <p className="user-email">{user?.email}</p>
          </div>
        </div>

          <div className="dashboard-actions">
            <button 
              className="action-card create-listing-card"
              onClick={() => navigate('/create-listing')}
            >
              <div className="action-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19" stroke="#4485c9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5 12H19" stroke="#4485c9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Create New Listing</h3>
              <p>Post your sublease or available room</p>
            </button>

            <button 
              className="action-card browse-listings-card"
              onClick={() => navigate('/listings')}
            >
              <div className="action-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="11" r="8" stroke="#4485c9" strokeWidth="2"/>
                  <path d="M21 21L16.65 16.65" stroke="#4485c9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Browse All Listings</h3>
              <p>Find your perfect housing near UCLA</p>
            </button>

            <button 
              className="action-card my-listings-card"
              onClick={() => navigate('/my-listings')}
            >
              <div className="action-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 5H7C6.46957 5 5.96086 5.21071 5.58579 5.58579C5.21071 5.96086 5 6.46957 5 7V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V7C19 6.46957 18.7893 5.96086 18.4142 5.58579C18.0391 5.21071 17.5304 5 17 5H15" stroke="#4485c9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="9" y="3" width="6" height="4" rx="1" stroke="#4485c9" strokeWidth="2"/>
                  <path d="M9 12H15" stroke="#4485c9" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M9 16H15" stroke="#4485c9" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3>Manage My Listings</h3>
              <p>View and edit your posted listings</p>
            </button>
          </div>

          <div className="dashboard-sections">
            <div className="dashboard-section">
              <div className="section-header">
                <h2>Your Recent Listings</h2>
                <button 
                  className="view-all-link"
                  onClick={() => navigate('/my-listings')}
                >
                  View All →
                </button>
              </div>
              
              {myListings.length === 0 ? (
                <div className="empty-state-small">
                  <p>You haven't created any listings yet</p>
                  <button onClick={() => navigate('/create-listing')}>
                    Create Your First Listing
                  </button>
                </div>
              ) : (
                <div className="listings-preview">
                  {myListings.slice(0, 2).map((listing) => (
                    <div key={listing._id} className="mini-listing-card">
                      <div className="mini-listing-content">
                        <h4>{listing.title}</h4>
                        <p className="mini-address">📍 {listing.address}</p>
                        <div className="mini-details">
                          <span className="mini-price">${listing.price}/mo</span>
                          <span className={`mini-status ${listing.availability.toLowerCase()}`}>
                            {listing.availability}
                          </span>
                        </div>
                      </div>
                      <button 
                        className="mini-view-btn"
                        onClick={() => navigate(`/listings/${listing._id}`)}
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="dashboard-section">
              <div className="section-header">
                <h2>Recently Posted</h2>
                <button 
                  className="view-all-link"
                  onClick={() => navigate('/listings')}
                >
                  View All →
                </button>
              </div>
              
              {recentListings.length === 0 ? (
                <div className="empty-state-small">
                  <p>No listings available yet</p>
                </div>
              ) : (
                <div className="recent-listings-grid">
                  {recentListings.map((listing) => (
                    <ListingCard key={listing._id} listing={listing} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;