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
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>

                <div className="bookmark-info" onClick={() => handleListingClick(listing.id)}>
                  <h3>{listing.title}</h3>
                  <p className="bookmark-price">${listing.price}/month</p>
                  <p className="bookmark-address">{listing.address}</p>
                  <div className="bookmark-details">
                    <span>{listing.bedrooms} bed</span>
                    <span>•</span>
                    <span>{listing.bathrooms} bath</span>
                    <span>•</span>
                    <span>{listing.distanceFromUCLA} mi</span>
                  </div>
                  <p className="bookmark-date">
                    Saved {new Date(listing.savedAt).toLocaleDateString()}
                  </p>
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