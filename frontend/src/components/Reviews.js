import React, { useState, useEffect } from 'react';
import { reviewAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/Reviews.css';

const Reviews = ({ listingId, listingOwnerId }) => {
  const { user, isGuest } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [formData, setFormData] = useState({
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    fetchReviews();
    if (user && !isGuest) {
      fetchMyReview();
    }
  }, [listingId, user, isGuest]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewAPI.getReviews(listingId);
      setReviews(response.data.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyReview = async () => {
    try {
      const response = await reviewAPI.getMyReview(listingId);
      setMyReview(response.data.data);
    } catch (error) {
      setMyReview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.comment.trim()) {
      alert('Please write a comment');
      return;
    }

    try {
      if (editingReview) {
        await reviewAPI.updateReview(editingReview._id, formData);
        alert('Review updated successfully!');
      } else {
        await reviewAPI.createReview(listingId, formData);
        alert('Review submitted successfully!');
      }

      setFormData({ rating: 5, comment: '' });
      setShowReviewForm(false);
      setEditingReview(null);
      fetchReviews();
      fetchMyReview();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error.response?.data?.message || 'Failed to submit review');
    }
  };

  const handleEdit = () => {
    setFormData({
      rating: myReview.rating,
      comment: myReview.comment
    });
    setEditingReview(myReview);
    setShowReviewForm(true);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your review?')) {
      return;
    }

    try {
      await reviewAPI.deleteReview(myReview._id);
      alert('Review deleted successfully');
      setMyReview(null);
      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review');
    }
  };

  const handleCancel = () => {
    setFormData({ rating: 5, comment: '' });
    setShowReviewForm(false);
    setEditingReview(null);
  };

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    return (
      <div className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= rating ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isOwner = user && listingOwnerId && user.id === listingOwnerId;

  if (loading) {
    return <div className="reviews-loading">Loading reviews...</div>;
  }

  return (
    <div className="reviews-section">
      <div className="reviews-header">
        <h2>Reviews & Ratings</h2>
        {reviews.length > 0 && (
          <div className="reviews-summary">
            <div className="average-rating">
              {renderStars(Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length))}
              <span className="rating-text">
                {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)} out of 5
              </span>
            </div>
            <p className="review-count">{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</p>
          </div>
        )}
      </div>

      {/* Write Review Button */}
      {!isGuest && !isOwner && !myReview && !showReviewForm && (
        <button className="write-review-btn" onClick={() => setShowReviewForm(true)}>
          ✍️ Write a Review
        </button>
      )}

      {/* Guest Message */}
      {isGuest && (
        <div className="guest-message">
          <p>Please sign in to write a review</p>
        </div>
      )}

      {/* Owner Message */}
      {isOwner && (
        <div className="owner-message">
          <p>You cannot review your own listing</p>
        </div>
      )}

      {/* My Review Display */}
      {myReview && !showReviewForm && (
        <div className="my-review-card">
          <div className="review-header">
            <h3>Your Review</h3>
            <div className="review-actions">
              <button className="edit-btn" onClick={handleEdit}>Edit</button>
              <button className="delete-btn" onClick={handleDelete}>Delete</button>
            </div>
          </div>
          {renderStars(myReview.rating)}
          <p className="review-comment">{myReview.comment}</p>
          <p className="review-date">{formatDate(myReview.createdAt)}</p>
        </div>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <form className="review-form" onSubmit={handleSubmit}>
          <h3>{editingReview ? 'Edit Your Review' : 'Write a Review'}</h3>
          
          <div className="form-group">
            <label>Rating</label>
            {renderStars(formData.rating, true, (rating) => setFormData({ ...formData, rating }))}
          </div>

          <div className="form-group">
            <label>Your Review</label>
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              placeholder="Share your experience with this apartment..."
              rows="5"
              maxLength="500"
              required
            />
            <span className="char-count">{formData.comment.length}/500</span>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              {editingReview ? 'Update Review' : 'Submit Review'}
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="reviews-list">
        {reviews.length === 0 ? (
          <div className="no-reviews">
            <p>No reviews yet. Be the first to review this listing!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">
                    {review.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4>{review.user.name}</h4>
                    <p className="review-date">{formatDate(review.createdAt)}</p>
                  </div>
                </div>
                {renderStars(review.rating)}
              </div>
              <p className="review-comment">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Reviews;