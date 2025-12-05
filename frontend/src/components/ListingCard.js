/** ListingCard 
 * 
 * Displays a housing listing in a card format with key information,
 * image, availability status, and bookmark functionality.
 * 
 * @component
 * @param {Object} props
 * @param {Object} props.listing - The listing object to display
 * @param {string} props.listing._id - Unique listing identifier
 * @param {string} props.listing.title - Listing title
 * @param {number} props.listing.price - Monthly rent price
 * @param {string} props.listing.address - Property address
 * @param {number} props.listing.bedrooms - Number of bedrooms
 * @param {number} props.listing.distanceFromUCLA - Distance from UCLA in miles
 * @param {string} props.listing.availability - Current availability status
 * @param {Array<string>} props.listing.images - Array of image URLs
 * @param {string} props.listing.description - Listing description
 * @param {number} props.listing.averageRating - Average user rating
 * @param {number} props.listing.reviewCount - Number of reviews 
 */


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookmarks } from '../components/Bookmark';
import '../styles/ListingCard.css';

const ListingCard = ({ listing }) => {
  const navigate = useNavigate();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const [isAnimating, setIsAnimating] = useState(false);

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

  const handleBookmarkClick = async (e) => {
  e.stopPropagation();
  console.log('=== BOOKMARK CLICK ===');
  console.log('Listing object:', listing);
  console.log('Listing ID:', listingId);
  console.log('Currently bookmarked:', bookmarked);
  
  setIsAnimating(true);
  const result = await toggleBookmark(listing);
  console.log('Toggle result:', result);
  
  setTimeout(() => setIsAnimating(false), 300);
};

const listingId = listing._id || listing.id;
const bookmarked = isBookmarked(listingId);

console.log('ListingCard render - ID:', listingId, 'Bookmarked:', bookmarked);

  return (
    <div className="listing-card" onClick={() => navigate(`/listings/${listingId}`)}>
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
        
        {/* Bookmark Button */}
        <button
          onClick={handleBookmarkClick}
          className={`bookmark-button ${bookmarked ? 'bookmarked' : ''} ${isAnimating ? 'animating' : ''}`}
          aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={bookmarked ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
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
           {listing.address}
        </p>

        <div className="listing-details">
          <div className="detail-item">
            <span className="detail-icon"></span>
            <span>{listing.bedrooms} {listing.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}</span>
          </div>
          
          <div className="detail-item">
            <span className="detail-icon"></span>
            <span>{listing.distanceFromUCLA} mi from UCLA</span>
          </div>
        </div>

        <div className="listing-lease">
          <span className="detail-icon"></span>
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