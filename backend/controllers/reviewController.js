/**
 * Review Controller
 * 
 * Handles listing review and rating functionality.
 * Allows users to create, read, update, and delete reviews for housing listings.
 * Implements business rules: users cannot review their own listings,
 * each user can only review a listing once, and automatically calculates
 * average ratings for listings.
 * 
 * @module controllers/reviewController
 */

const Review = require('../models/Review');
const Listing = require('../models/Listing');
const validator = require('validator');
const xss = require('xss');

const sanitizeString = (str) => {
  if (!str) return str;
  return xss(validator.trim(str));
};

const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ listing: req.params.listingId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching reviews'
    });
  }
};


const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const listingId = req.params.listingId;

    if (!rating || !comment) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide rating and comment'
      });
    }

    if (validator.isEmpty(comment.trim())) {
      return res.status(400).json({
        status: 'error',
        message: 'Comment cannot be empty'
      });
    }

    if (!validator.isLength(comment, { min: 10, max: 500 })) {
      return res.status(400).json({
        status: 'error',
        message: 'Comment must be between 10 and 500 characters'
      });
    }

    const sanitizedComment = sanitizeString(comment);

    if (!validator.isInt(String(rating), { min: 1, max: 5 })) {
      return res.status(400).json({
        status: 'error',
        message: 'Rating must be between 1 and 5'
      });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({
        status: 'error',
        message: 'Listing not found'
      });
    }

    if (listing.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({
        status: 'error',
        message: 'You cannot review your own listing'
      });
    }

    const existingReview = await Review.findOne({
      listing: listingId,
      user: req.user._id
    });

    if (existingReview) {
      return res.status(400).json({
        status: 'error',
        message: 'You have already reviewed this listing'
      });
    }

    const review = await Review.create({
      listing: listingId,
      user: req.user._id,
      rating,
      comment: sanitizedComment
    });

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name email');

    res.status(201).json({
      status: 'success',
      data: populatedReview
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error creating review'
    });
  }
};

/**
 * Update existing review
 * Protected endpoint - only review author can update
 * Supports partial updates (can update rating, comment, or both)
 * Automatically recalculates listing's average rating after update
 * 
 * @async
 * @function updateReview
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Review ID to update
 * @param {Object} req.user - Authenticated user object
 * @param {Object} req.body - Updated review data
 * @param {number} [req.body.rating] - Updated rating (1-5)
 * @param {string} [req.body.comment] - Updated comment (10-500 characters)
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Sends JSON response with updated review
 * 
 * @throws {400} Invalid rating (not between 1-5)
 * @throws {400} Empty comment after trimming
 * @throws {400} Comment length not between 10-500 characters
 * @throws {403} Not authorized (user is not the review author)
 * @throws {404} Review not found
 * @throws {500} Error updating review
 * 
 * Success Response (200):
 * {
 *   status: 'success',
 *   data: Review (updated with populated user)
 * }
 */


const updateReview = async (req, res) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        status: 'error',
        message: 'Review not found'
      });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this review'
      });
    }

    const { rating, comment } = req.body;

    if (rating && !validator.isInt(String(rating), { min: 1, max: 5 })) {
      return res.status(400).json({
        status: 'error',
        message: 'Rating must be between 1 and 5'
      });
    }

    if (comment) {
      if (validator.isEmpty(comment.trim())) {
        return res.status(400).json({
          status: 'error',
          message: 'Comment cannot be empty'
        });
      }

      if (!validator.isLength(comment, { min: 10, max: 500 })) {
        return res.status(400).json({
          status: 'error',
          message: 'Comment must be between 10 and 500 characters'
        });
      }
    }

    const updateData = {};
    if (rating) updateData.rating = rating;
    if (comment) updateData.comment = sanitizeString(comment);

    review = await Review.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    ).populate('user', 'name email');

    await Review.calculateAverageRating(review.listing);

    res.status(200).json({
      status: 'success',
      data: review
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating review'
    });
  }
};


const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        status: 'error',
        message: 'Review not found'
      });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this review'
      });
    }

    const listingId = review.listing;
    await review.deleteOne();

    await Review.calculateAverageRating(listingId);

    res.status(200).json({
      status: 'success',
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting review'
    });
  }
};

const getMyReview = async (req, res) => {
  try {
    const review = await Review.findOne({
      listing: req.params.listingId,
      user: req.user._id
    }).populate('user', 'name email');

    if (!review) {
      return res.status(404).json({
        status: 'error',
        message: 'You have not reviewed this listing yet'
      });
    }

    res.status(200).json({
      status: 'success',
      data: review
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching review'
    });
  }
};

module.exports = {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  getMyReview
};