const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams to access listingId
const {
  getReviews,
  createReview,
  getMyReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(getReviews)
  .post(protect, createReview);

router.get('/my-review', protect, getMyReview);

module.exports = router;