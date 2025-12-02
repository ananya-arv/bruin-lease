import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookmarks } from '../components/Bookmark';
import Navbar from '../components/Navbar';
import '../styles/BookmarksPage.css';

const BookmarksPage = () => {
  const navigate = useNavigate();
  const { bookmarks, loading, removeBookmark } = useBookmarks();

  const handleListingClick = (listingId) => {
    navigate(`/listings/${listingId}`);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="bookmarks-page">
          <div className="loading">Loading bookmarks...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bookmarks-page">
        <div className="bookmarks-header">
          <h1>My Bookmarks</h1>
          <p>{bookmarks.length} saved {bookmarks.length === 1 ? 'listing' : 'listings'}</p>
        </div>

        {bookmarks.length === 0 ? (
          <div className="no-bookmarks">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <h3>No Bookmarks Yet</h3>
            <p>Start bookmarking listings you love to see them here</p>
            <button onClick={() => navigate('/listings')}>Browse Listings</button>
          </div>
        ) : (
          <div className="bookmarks-grid">
            {bookmarks.map((listing) => (
              <div key={listing.id} className="bookmark-card">
                <div 
                  className="bookmark-image-container"
                  onClick={() => handleListingClick(listing.id)}
                >
                  <img
                    src={listing.images?.[0] || '/placeholder.jpg'}
                    alt={listing.title}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeBookmark(listing.id);
                    }}
                    className="remove-bookmark-btn"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>
                </div>

                <div className="bookmark-info" onClick={() => handleListingClick(listing.id)}>
                  <h3>{listing.title}</h3>
                  <p className="bookmark-address">{listing.address}</p>
                  
                  <div className="bookmark-details">
                    <div className="detail-item">
                      <span className="detail-icon"></span>
                      <span>{listing.bedrooms} {listing.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}</span>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-icon"></span>
                      <span>{listing.distanceFromUCLA} mi from UCLA</span>
                    </div>
                  </div>

                  <div className="bookmark-lease">
                    <span>{listing.leaseDuration || '1 year'}</span>
                  </div>

                  <p className="bookmark-description">
                    {listing.description && listing.description.length > 100 
                      ? `${listing.description.substring(0, 100)}...` 
                      : listing.description}
                  </p>

                  <div className="bookmark-footer">
                    <p className="bookmark-price">
                      ${listing.price}
                      <span className="price-period">/month</span>
                    </p>
                    <p className="bookmark-date">
                      Saved {new Date(listing.savedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default BookmarksPage;