import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listingAPI } from '../services/api';
import '../styles/MyListings.css';

const MyListings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingListing, setEditingListing] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    fetchMyListings();
  }, []);

  const fetchMyListings = async () => {
    try {
      setLoading(true);
      const response = await listingAPI.getMyListings();
      setListings(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to load your listings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) {
      return;
    }

    try {
      await listingAPI.deleteListing(listingId);
      setListings(listings.filter(listing => listing._id !== listingId));
      alert('Listing deleted successfully');
    } catch (err) {
      alert('Failed to delete listing');
      console.error(err);
    }
  };

  const startEdit = (listing) => {
    setEditingListing(listing._id);
    setEditFormData({
      title: listing.title,
      price: listing.price,
      address: listing.address,
      bedrooms: listing.bedrooms,
      distanceFromUCLA: listing.distanceFromUCLA,
      leaseDuration: listing.leaseDuration,
      description: listing.description,
      availability: listing.availability
    });
  };

  const cancelEdit = () => {
    setEditingListing(null);
    setEditFormData({});
  };

  const handleEditChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdate = async (listingId) => {
    try {
      const response = await listingAPI.updateListing(listingId, editFormData);
      setListings(listings.map(listing => 
        listing._id === listingId ? response.data.data : listing
      ));
      setEditingListing(null);
      setEditFormData({});
      alert('Listing updated successfully');
    } catch (err) {
      alert('Failed to update listing');
      console.error(err);
    }
  };

  const filteredListings = listings.filter(listing => {
    if (filterStatus === 'all') return true;
    return listing.availability.toLowerCase() === filterStatus.toLowerCase();
  });

  if (loading) {
    return (
      <div className="my-listings-page">
        <div className="loading">Loading your listings...</div>
      </div>
    );
  }

  return (
    <div className="my-listings-page">
      <div className="my-listings-container">
        <div className="my-listings-header">
          <div>
            <h1>My Listings</h1>
            <p>Manage your posted apartments and subleases</p>
          </div>
          <button 
            className="create-new-btn"
            onClick={() => navigate('/create-listing')}
          >
            + Create New Listing
          </button>
        </div>

        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        {listings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h2>No listings yet</h2>
            <p>Start by creating your first listing to find tenants or roommates</p>
            <button 
              className="create-first-btn"
              onClick={() => navigate('/create-listing')}
            >
              Create Your First Listing
            </button>
          </div>
        ) : (
          <>
            <div className="filter-bar">
              <div className="filter-tabs">
                <button 
                  className={filterStatus === 'all' ? 'active' : ''}
                  onClick={() => setFilterStatus('all')}
                >
                  All ({listings.length})
                </button>
                <button 
                  className={filterStatus === 'available' ? 'active' : ''}
                  onClick={() => setFilterStatus('available')}
                >
                  Available ({listings.filter(l => l.availability === 'Available').length})
                </button>
                <button 
                  className={filterStatus === 'pending' ? 'active' : ''}
                  onClick={() => setFilterStatus('pending')}
                >
                  Pending ({listings.filter(l => l.availability === 'Pending').length})
                </button>
                <button 
                  className={filterStatus === 'rented' ? 'active' : ''}
                  onClick={() => setFilterStatus('rented')}
                >
                  Rented ({listings.filter(l => l.availability === 'Rented').length})
                </button>
              </div>
            </div>

            <div className="listings-list">
              {filteredListings.map((listing) => (
                <div key={listing._id} className="listing-item">
                  {editingListing === listing._id ? (
                    <div className="edit-form">
                      <div className="edit-form-grid">
                        <div className="form-group">
                          <label>Title</label>
                          <input
                            type="text"
                            name="title"
                            value={editFormData.title}
                            onChange={handleEditChange}
                          />
                        </div>

                        <div className="form-group">
                          <label>Price ($/month)</label>
                          <input
                            type="number"
                            name="price"
                            value={editFormData.price}
                            onChange={handleEditChange}
                          />
                        </div>

                        <div className="form-group">
                          <label>Address</label>
                          <input
                            type="text"
                            name="address"
                            value={editFormData.address}
                            onChange={handleEditChange}
                          />
                        </div>

                        <div className="form-group">
                          <label>Bedrooms</label>
                          <input
                            type="number"
                            name="bedrooms"
                            value={editFormData.bedrooms}
                            onChange={handleEditChange}
                          />
                        </div>

                        <div className="form-group">
                          <label>Distance from UCLA (miles)</label>
                          <input
                            type="number"
                            name="distanceFromUCLA"
                            step="0.1"
                            value={editFormData.distanceFromUCLA}
                            onChange={handleEditChange}
                          />
                        </div>

                        <div className="form-group">
                          <label>Lease Duration</label>
                          <input
                            type="text"
                            name="leaseDuration"
                            value={editFormData.leaseDuration}
                            onChange={handleEditChange}
                          />
                        </div>

                        <div className="form-group full-width">
                          <label>Status</label>
                          <select
                            name="availability"
                            value={editFormData.availability}
                            onChange={handleEditChange}
                          >
                            <option value="Available">Available</option>
                            <option value="Pending">Pending</option>
                            <option value="Rented">Rented</option>
                          </select>
                        </div>

                        <div className="form-group full-width">
                          <label>Description</label>
                          <textarea
                            name="description"
                            value={editFormData.description}
                            onChange={handleEditChange}
                            rows="4"
                          />
                        </div>
                      </div>

                      <div className="edit-actions">
                        <button 
                          className="save-btn"
                          onClick={() => handleUpdate(listing._id)}
                        >
                          Save Changes
                        </button>
                        <button 
                          className="cancel-btn"
                          onClick={cancelEdit}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="listing-main">
                        <div className="listing-image-placeholder">
                          🏠
                        </div>
                        <div className="listing-info">
                          <div className="listing-title-row">
                            <h3>{listing.title}</h3>
                            <span className={`status-badge ${listing.availability.toLowerCase()}`}>
                              {listing.availability}
                            </span>
                          </div>
                          <p className="listing-address">📍 {listing.address}</p>
                          <div className="listing-details">
                            <span className="detail-item">
                              💰 ${listing.price}/month
                            </span>
                            <span className="detail-item">
                              🛏️ {listing.bedrooms} {listing.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}
                            </span>
                            <span className="detail-item">
                              📏 {listing.distanceFromUCLA} mi from UCLA
                            </span>
                            <span className="detail-item">
                              📅 {listing.leaseDuration}
                            </span>
                          </div>
                          <p className="listing-description">{listing.description}</p>
                          <p className="listing-date">
                            Posted on {new Date(listing.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="listing-actions">
                        <button 
                          className="view-btn"
                          onClick={() => navigate(`/listings/${listing._id}`)}
                        >
                          View Details
                        </button>
                        <button 
                          className="edit-btn"
                          onClick={() => startEdit(listing)}
                        >
                          Edit
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDelete(listing._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyListings;