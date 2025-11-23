import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listingAPI } from '../services/api';
import MessageSellerButton from '../components/MessageSellerButton';
import Reviews from '../components/Reviews';
import { useAuth } from '../context/AuthContext';
import '../styles/ListingDetail.css';

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      setLoading(true);
      const response = await listingAPI.getListing(id);
      setListing(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to load listing');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="listing-detail-page">
        <div className="loading">Loading listing...</div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="listing-detail-page">
        <div className="error-container">
          <h2>Listing Not Found</h2>
          <p>{error || 'This listing may have been removed'}</p>
          <button onClick={() => navigate('/listings')} className="back-btn">
            Back to Listings
          </button>
        </div>
      </div>
    );
  }

  const isOwner = user && listing.owner && 
    (listing.owner._id === user.id || listing.owner === user.id);

  return (
    <div className="listing-detail-page">
      <div className="listing-detail-container">
        <button onClick={() => navigate('/listings')} className="back-btn">
          ← Back to Listings
        </button>

        <div className="listing-detail-card">
          {/* Image Gallery */}
          <div className="listing-gallery">
            {listing.images && listing.images.length > 0 ? (
              <img src={listing.images[0]} alt={listing.title} />
            ) : (
              <div className="placeholder-image">
                <span>🏠</span>
              </div>
            )}
          </div>

          {/* Listing Header */}
          <div className="listing-header">
            <div className="listing-title-section">
              <h1>{listing.title}</h1>
              <span className={`status-badge ${listing.availability.toLowerCase()}`}>
                {listing.availability}
              </span>
            </div>
            <div className="listing-price-large">
              {formatPrice(listing.price)}
              <span className="price-period">/month</span>
            </div>
          </div>

          {/* Key Details */}
          <div className="listing-key-details">
            <div className="detail-box">
              <div className="detail-icon">🛏️</div>
              <div className="detail-text">
                <span className="detail-label">Bedrooms</span>
                <span className="detail-value">{listing.bedrooms}</span>
              </div>
            </div>
            <div className="detail-box">
              <div className="detail-icon">📏</div>
              <div className="detail-text">
                <span className="detail-label">Distance</span>
                <span className="detail-value">{listing.distanceFromUCLA} mi</span>
              </div>
            </div>
            <div className="detail-box">
              <div className="detail-icon">📅</div>
              <div className="detail-text">
                <span className="detail-label">Lease</span>
                <span className="detail-value">{listing.leaseDuration}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="listing-section">
            <h2>Description</h2>
            <p className="listing-description-full">{listing.description}</p>
          </div>

          {/* Location */}
          <div className="listing-section">
            <h2>Location</h2>
            <div className="location-info">
              <div className="location-icon">📍</div>
              <p>{listing.address}</p>
            </div>
          </div>

          {/* Owner Info */}
          <div className="listing-section">
            <h2>Posted By</h2>
            <div className="owner-info">
              <div className="owner-avatar">
                {listing.owner?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="owner-details">
                <p className="owner-name">{listing.owner?.name || 'Unknown'}</p>
                <p className="owner-email">{listing.owner?.email || ''}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="listing-actions">
            {!isOwner && !isGuest && (
              <MessageSellerButton listing={listing} />
            )}
            {isGuest && (
              <button 
                className="sign-in-prompt-btn"
                onClick={() => navigate('/')}
              >
                Sign in to contact owner
              </button>
            )}
            {isOwner && (
              <div className="owner-notice">
                This is your listing
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <Reviews 
          listingId={listing._id} 
          listingOwnerId={listing.owner?._id || listing.owner}
        />
      </div>
    </div>
  );
};

export default ListingDetail;