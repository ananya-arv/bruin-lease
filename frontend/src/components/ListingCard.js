import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ListingCard.css';

const ListingCard = ({ listing }) => {
  const navigate = useNavigate();

  const getStatusClass = (status) => {
    return status.toLowerCase();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const renderStars = (rating) => {
    return (
      <div className="card-rating-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={`star ${star <= Math.round(rating) ? 'filled' : ''}`}>
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="listing-card" onClick={() => navigate(`/listings/${listing._id}`)}>
      <div className="listing-image">
        {listing.images && listing.images.length > 0 ? (
          <img src={listing.images[0]} alt={listing.title} />
        ) : (
          <div className="placeholder-image">
            <span>🏠</span>
          </div>
        )}
        <div className={`availability-badge ${getStatusClass(listing.availability)}`}>
          {listing.availability}
        </div>
      </div>

      <div className="listing-content">
        <h3 className="listing-title">{listing.title}</h3>

        {listing.reviewCount > 0 && (
          <div className="card-rating">
            {renderStars(listing.averageRating)}
            <span className="card-rating-text">
              {listing.averageRating.toFixed(1)} ({listing.reviewCount})
            </span>
          </div>
        )}
        
        <p className="listing-address">
          📍 {listing.address}
        </p>

        <div className="listing-details">
          <div className="detail-item">
            <span className="detail-icon">🛏️</span>
            <span>{listing.bedrooms} {listing.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}</span>
          </div>
          
          <div className="detail-item">
            <span className="detail-icon">📏</span>
            <span>{listing.distanceFromUCLA} mi from UCLA</span>
          </div>
        </div>

        <div className="listing-lease">
          <span className="detail-icon">📅</span>
          <span>{listing.leaseDuration}</span>
        </div>

        <p className="listing-description">
          {listing.description.length > 100 
            ? `${listing.description.substring(0, 100)}...` 
            : listing.description}
        </p>

        <div className="listing-footer">
          <div className="listing-price">
            {formatPrice(listing.price)}
            <span className="price-period">/month</span>
          </div>
          
          {listing.owner && (
            <div className="listing-owner">
              Posted by {listing.owner.name}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingCard;