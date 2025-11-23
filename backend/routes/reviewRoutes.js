const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams to access listingId
const {
  getReviews,
  createReview,
  getMyReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

// PUBLIC route - anyone can view reviews
router.get('/', getReviews);

// PROTECTED routes - require authentication
router.post('/', protect, createReview);
router.get('/my-review', protect, getMyReview);

module.exports = router;