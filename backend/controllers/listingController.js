const Listing = require('../models/Listing');
const validator = require('validator');
const xss = require('xss');

const sanitizeString = (str) => {
  if (!str) return str;
  return xss(validator.trim(str));
};

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

  // Images validation and sanitization
  if (data.images && Array.isArray(data.images)) {
    sanitized.images = data.images
      .filter(url => validator.isURL(url, { protocols: ['http', 'https'] }))
      .map(url => sanitizeString(url))
      .slice(0, 10); 
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
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching listings'
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
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching listing'
    });
  }
};

const createListing = async (req, res) => {
  try {
    const { errors, sanitized } = validateAndSanitizeListingInput(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors
      });
    }

    const listing = await Listing.create({
      owner: req.user._id,
      ...sanitized
    });

    const populatedListing = await Listing.findById(listing._id)
      .populate('owner', 'name email');

    res.status(201).json({
      status: 'success',
      data: populatedListing
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error creating listing'
    });
  }
};

const updateListing = async (req, res) => {
  try {
    if (!validator.isMongoId(req.params.id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid listing ID format'
      });
    }

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

    const { errors, sanitized } = validateAndSanitizeListingInput(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors
      });
    }

    listing = await Listing.findByIdAndUpdate(
      req.params.id,
      sanitized,
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
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating listing'
    });
  }
};

const deleteListing = async (req, res) => {
  try {
    if (!validator.isMongoId(req.params.id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid listing ID format'
      });
    }

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
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting listing'
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
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching your listings'
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