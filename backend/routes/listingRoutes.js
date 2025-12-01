const express = require('express');
const router = express.Router();
const {
  getAllListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
  getMyListings
} = require('../controllers/listingController');
const { protect } = require('../middleware/auth');
const { upload, handleMulterError, validateImageContent } = require('../middleware/fileUpload');

// PUBLIC routes - no authentication required
router.get('/', getAllListings);  // Browse all listings - public

// PROTECTED routes - require authentication (must come before /:id)
router.get('/my-listings', protect, getMyListings); // Get my listings
router.post(
  '/',
  protect,
  upload.array('images', 10), // Allow up to 10 images
  handleMulterError,
  validateImageContent,
  createListing
); // Create listing

// PUBLIC route for single listing (must come after /my-listings)
router.get('/:id', getListing);   // View single listing - public

// PROTECTED routes for specific listings
router.put(
  '/:id',
  protect,
  upload.array('images', 10), // Allow up to 10 images
  handleMulterError,
  validateImageContent,
  updateListing
); // Update listing
router.delete('/:id', protect, deleteListing);      // Delete listing

module.exports = router;