/**
 * Listing Controller
 * 
 * Handles all housing listing operations including creation, retrieval, updates, and deletion.
 * Implements comprehensive validation for listing data, image processing, and ownership verification.
 * Supports both public listings view and authenticated user's personal listings management.
 * 
 * @module controllers/listingController
 */

const Listing = require('../models/Listing');
const validator = require('validator');
const xss = require('xss');

const sanitizeString = (str) => {
  if (!str) return str;
  return xss(validator.trim(str));
};

/**
 * Validates and sanitizes all listing input data
 * Performs comprehensive validation on all required and optional fields
 * 
 * @function validateAndSanitizeListingInput
 * @param {Object} data - Raw listing data from request body
 * @returns {Object} Object containing errors array and sanitized data object
 * @returns {Array<string>} return.errors - Array of validation error messages
 * @returns {Object} return.sanitized - Object with validated and sanitized fields
 * @private
 * 
 * Validation Rules:
 * - title: 3-100 characters, required
 * - price: 0-50000, numeric, required
 * - address: 5-200 characters, required
 * - zipCode: Valid postal code format, required
 * - country: 2-50 characters, required
 * - bedrooms: 0-20, integer, required
 * - distanceFromUCLA: 0-100 miles, numeric, required
 * - leaseDuration: 1-50 characters, required
 * - description: 10-2000 characters, required
 * - images: Array of base64 data URLs, max 10 images, optional
 * - availability: One of [Available, Pending, Rented], optional
 */

const validateAndSanitizeListingInput = (data) => {
  const errors = [];
  const sanitized = {};

  // Title validation and sanitization
  if (!data.title || validator.isEmpty(data.title.trim())) {
    errors.push('Title is required');
  } else if (!validator.isLength(data.title, { min: 3, max: 100 })) {
    errors.push('Title must be between 3 and 100 characters');
  } else {
    sanitized.title = sanitizeString(data.title);
  }

  // Price validation
  if (data.price === undefined || data.price === null) {
    errors.push('Price is required');
  } else if (!validator.isFloat(String(data.price), { min: 0, max: 50000 })) {
    errors.push('Price must be a valid number between 0 and 50000');
  } else {
    sanitized.price = parseFloat(data.price);
  }

  // Address validation and sanitization
  if (!data.address || validator.isEmpty(data.address.trim())) {
    errors.push('Address is required');
  } else if (!validator.isLength(data.address, { min: 5, max: 200 })) {
    errors.push('Address must be between 5 and 200 characters');
  } else {
    sanitized.address = sanitizeString(data.address);
  }

  // Zip code validation and sanitization
  if (!data.zipCode || validator.isEmpty(data.zipCode.trim())) {
    errors.push('Zip code is required');
  } else if (!validator.isPostalCode(data.zipCode, 'any')) {
    errors.push('Invalid zip code format');
  } else {
    sanitized.zipCode = sanitizeString(data.zipCode);
  }

  // Country validation and sanitization
  if (!data.country || validator.isEmpty(data.country.trim())) {
    errors.push('Country is required');
  } else if (!validator.isLength(data.country, { min: 2, max: 50 })) {
    errors.push('Country must be between 2 and 50 characters');
  } else {
    sanitized.country = sanitizeString(data.country);
  }

  // Bedrooms validation
  if (data.bedrooms === undefined || data.bedrooms === null) {
    errors.push('Number of bedrooms is required');
  } else if (!validator.isInt(String(data.bedrooms), { min: 0, max: 20 })) {
    errors.push('Bedrooms must be a valid integer between 0 and 20');
  } else {
    sanitized.bedrooms = parseInt(data.bedrooms);
  }

  // Distance validation
  if (data.distanceFromUCLA === undefined || data.distanceFromUCLA === null) {
    errors.push('Distance from UCLA is required');
  } else if (!validator.isFloat(String(data.distanceFromUCLA), { min: 0, max: 100 })) {
    errors.push('Distance must be a valid number between 0 and 100 miles');
  } else {
    sanitized.distanceFromUCLA = parseFloat(data.distanceFromUCLA);
  }

  // Lease duration validation and sanitization
  if (!data.leaseDuration || validator.isEmpty(data.leaseDuration.trim())) {
    errors.push('Lease duration is required');
  } else if (!validator.isLength(data.leaseDuration, { min: 1, max: 50 })) {
    errors.push('Lease duration must be between 1 and 50 characters');
  } else {
    sanitized.leaseDuration = sanitizeString(data.leaseDuration);
  }

  // Description validation and sanitization
  if (!data.description || validator.isEmpty(data.description.trim())) {
    errors.push('Description is required');
  } else if (!validator.isLength(data.description, { min: 10, max: 2000 })) {
    errors.push('Description must be between 10 and 2000 characters');
  } else {
    sanitized.description = sanitizeString(data.description);
  }

  // Images validation - expecting base64 strings or data URLs
  if (data.images && Array.isArray(data.images)) {
    try {
      // Filter and validate images
      sanitized.images = data.images
        .filter(img => {
          if (typeof img !== 'string' || img.length === 0) return false;
          // Check if it's a valid base64 data URL
          return img.startsWith('data:image/');
        })
        .slice(0, 10); // Max 10 images
      
      console.log(`Processed ${sanitized.images.length} valid images`);
    } catch (imgError) {
      console.error('Error processing images:', imgError);
      sanitized.images = [];
    }
  } else {
    sanitized.images = [];
  }

  // Availability validation (if provided)
  if (data.availability) {
    const validStatuses = ['Available', 'Pending', 'Rented'];
    if (!validStatuses.includes(data.availability)) {
      errors.push('Invalid availability status');
    } else {
      sanitized.availability = data.availability;
    }
  }

  return { errors, sanitized };
};

const getAllListings = async (req, res) => {
  try {
    const listings = await Listing.find()
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: listings.length,
      data: listings
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching listings',
      error: error.message
    });
  }
};

const getListing = async (req, res) => {
  try {
    if (!validator.isMongoId(req.params.id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid listing ID format'
      });
    }

    const listing = await Listing.findById(req.params.id)
      .populate('owner', 'name email');

    if (!listing) {
      return res.status(404).json({
        status: 'error',
        message: 'Listing not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: listing
    });
  } catch (error) {
    console.error('Error fetching listing:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching listing',
      error: error.message
    });
  }
};

const createListing = async (req, res) => {
  try {
    console.log('=== CREATE LISTING REQUEST ===');
    console.log('User ID:', req.user?._id);
    console.log('Body keys:', Object.keys(req.body));
    console.log('Images count:', req.body.images?.length || 0);

    // Validate and sanitize the input
    const { errors, sanitized } = validateAndSanitizeListingInput(req.body);

    if (errors.length > 0) {
      console.error('Validation errors:', errors);
      return res.status(400).json({
        status: 'error',
        message: errors.join(', '),
        errors
      });
    }

    console.log('Validation passed. Creating listing...');
    console.log('Sanitized data:', {
      ...sanitized,
      images: `[${sanitized.images.length} images]`
    });

    // Create the listing with sanitized data
    const listing = await Listing.create({
      title: sanitized.title,
      description: sanitized.description,
      address: sanitized.address,
      zipCode: sanitized.zipCode,
      country: sanitized.country,
      price: sanitized.price,
      bedrooms: sanitized.bedrooms,
      distanceFromUCLA: sanitized.distanceFromUCLA,
      leaseDuration: sanitized.leaseDuration,
      images: sanitized.images,
      availability: sanitized.availability || 'Available',
      owner: req.user._id
    });

    console.log('Listing created successfully:', listing._id);

    // Populate owner information
    const populatedListing = await Listing.findById(listing._id)
      .populate('owner', 'name email');

    res.status(201).json({
      status: 'success',
      data: populatedListing
    });
  } catch (error) {
    console.error('=== ERROR CREATING LISTING ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Check for specific MongoDB errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    
    if (error.name === 'MongoError' && error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Duplicate listing detected'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Error creating listing',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

const updateListing = async (req, res) => {
  try {
    let listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        status: 'error',
        message: 'Listing not found'
      });
    }

    if (listing.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this listing'
      });
    }

    const { 
      title, 
      description, 
      price, 
      address,
      zipCode,
      country,
      bedrooms,
      distanceFromUCLA,
      leaseDuration,
      availability,
      images
    } = req.body;

    const updateData = {};

    if (title) {
      if (validator.isEmpty(title.trim())) {
        return res.status(400).json({
          status: 'error',
          message: 'Title cannot be empty'
        });
      }
      if (!validator.isLength(title, { min: 3, max: 100 })) {
        return res.status(400).json({
          status: 'error',
          message: 'Title must be between 3 and 100 characters'
        });
      }
      updateData.title = sanitizeString(title);
    }

    if (description) {
      if (validator.isEmpty(description.trim())) {
        return res.status(400).json({
          status: 'error',
          message: 'Description cannot be empty'
        });
      }
      if (!validator.isLength(description, { min: 10, max: 2000 })) {
        return res.status(400).json({
          status: 'error',
          message: 'Description must be between 10 and 2000 characters'
        });
      }
      updateData.description = sanitizeString(description);
    }

    if (price !== undefined) {
      if (!validator.isFloat(String(price), { min: 0, max: 50000 })) {
        return res.status(400).json({
          status: 'error',
          message: 'Valid price is required (0-50000)'
        });
      }
      updateData.price = parseFloat(price);
    }

    if (address) updateData.address = sanitizeString(address);
    if (zipCode) updateData.zipCode = sanitizeString(zipCode);
    if (country) updateData.country = sanitizeString(country);
    if (bedrooms !== undefined) updateData.bedrooms = parseInt(bedrooms);
    if (distanceFromUCLA !== undefined) updateData.distanceFromUCLA = parseFloat(distanceFromUCLA);
    if (leaseDuration) updateData.leaseDuration = sanitizeString(leaseDuration);
    if (availability) updateData.availability = availability;

    // Handle images update - base64 images from frontend
    if (images && Array.isArray(images)) {
      try {
        updateData.images = images
          .filter(img => {
            if (typeof img !== 'string' || img.length === 0) return false;
            return img.startsWith('data:image/');
          })
          .slice(0, 10); // Max 10 images
      } catch (imgError) {
        console.error('Error processing images during update:', imgError);
      }
    }

    listing = await Listing.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    ).populate('owner', 'name email');

    res.status(200).json({
      status: 'success',
      data: listing
    });
  } catch (error) {
    console.error('Error updating listing:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating listing',
      error: error.message
    });
  }
};

const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        status: 'error',
        message: 'Listing not found'
      });
    }

    if (listing.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this listing'
      });
    }

    await listing.deleteOne();

    res.status(200).json({
      status: 'success',
      message: 'Listing deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting listing:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting listing',
      error: error.message
    });
  }
};

const getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ owner: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: listings.length,
      data: listings
    });
  } catch (error) {
    console.error('Error fetching your listings:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching your listings',
      error: error.message
    });
  }
};

module.exports = {
  getAllListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
  getMyListings
};