const Review = require('../models/Review');
const Listing = require('../models/Listing');

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

    if (rating < 1 || rating > 5) {
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
      comment
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

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        status: 'error',
        message: 'Rating must be between 1 and 5'
      });
    }

    review = await Review.findByIdAndUpdate(
      req.params.id,
      { rating, comment },
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