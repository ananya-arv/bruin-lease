// backend/middleware/validation.js
const validator = require('validator');
const xss = require('xss');

// Sanitize input to prevent XSS
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return xss(input.trim());
  }
  return input;
};

// Validate and sanitize listing data
const validateListingData = (req, res, next) => {
  try {
    const { title, description, address, zipCode, price, bedrooms, distanceFromUCLA, leaseDuration } = req.body;

    // Sanitize string inputs
    if (title) req.body.title = sanitizeInput(title);
    if (description) req.body.description = sanitizeInput(description);
    if (address) req.body.address = sanitizeInput(address);
    if (zipCode) req.body.zipCode = sanitizeInput(zipCode);
    if (leaseDuration) req.body.leaseDuration = sanitizeInput(leaseDuration);

    // Validate title
    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Title is required'
      });
    }
    if (title.length > 100) {
      return res.status(400).json({
        status: 'error',
        message: 'Title must be 100 characters or less'
      });
    }

    // Validate description
    if (!description || description.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Description is required'
      });
    }
    if (description.length > 1000) {
      return res.status(400).json({
        status: 'error',
        message: 'Description must be 1000 characters or less'
      });
    }

    // Validate address
    if (!address || address.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Address is required'
      });
    }

    // Validate zip code
    if (!zipCode || !validator.isPostalCode(zipCode, 'US')) {
      return res.status(400).json({
        status: 'error',
        message: 'Valid US zip code is required'
      });
    }

    // Validate price
    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum < 0 || priceNum > 50000) {
      return res.status(400).json({
        status: 'error',
        message: 'Price must be between 0 and 50000'
      });
    }

    // Validate bedrooms
    const bedroomsNum = Number(bedrooms);
    if (isNaN(bedroomsNum) || bedroomsNum < 0 || bedroomsNum > 10) {
      return res.status(400).json({
        status: 'error',
        message: 'Bedrooms must be between 0 and 10'
      });
    }

    // Validate distance
    const distanceNum = Number(distanceFromUCLA);
    if (isNaN(distanceNum) || distanceNum < 0 || distanceNum > 100) {
      return res.status(400).json({
        status: 'error',
        message: 'Distance from UCLA must be between 0 and 100 miles'
      });
    }

    next();
  } catch (error) {
    console.error('Validation error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error validating listing data'
    });
  }
};

// Validate review data
const validateReviewData = (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    // Sanitize comment
    if (comment) req.body.comment = sanitizeInput(comment);

    // Validate rating
    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({
        status: 'error',
        message: 'Rating must be between 1 and 5'
      });
    }

    // Validate comment
    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Comment is required'
      });
    }
    if (comment.length > 500) {
      return res.status(400).json({
        status: 'error',
        message: 'Comment must be 500 characters or less'
      });
    }

    next();
  } catch (error) {
    console.error('Validation error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error validating review data'
    });
  }
};

// Validate message data
const validateMessageData = (req, res, next) => {
  try {
    const { content, receiverId } = req.body;

    // Sanitize content
    if (content) req.body.content = sanitizeInput(content);

    // Validate content
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Message content is required'
      });
    }
    if (content.length > 1000) {
      return res.status(400).json({
        status: 'error',
        message: 'Message must be 1000 characters or less'
      });
    }

    // Validate receiverId format
    if (!receiverId || !validator.isMongoId(receiverId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Valid receiver ID is required'
      });
    }

    next();
  } catch (error) {
    console.error('Validation error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error validating message data'
    });
  }
};

// Validate user registration data
const validateRegistrationData = (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Sanitize name
    if (name) req.body.name = sanitizeInput(name);

    // Validate name
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Name is required'
      });
    }
    if (name.length > 100) {
      return res.status(400).json({
        status: 'error',
        message: 'Name must be 100 characters or less'
      });
    }

    // Validate email
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Valid email is required'
      });
    }
    if (!email.endsWith('@ucla.edu')) {
      return res.status(400).json({
        status: 'error',
        message: 'Please use a valid UCLA email address (@ucla.edu)'
      });
    }

    // Validate password
    if (!password || password.length < 8) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 8 characters long'
      });
    }
    if (password.length > 128) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be 128 characters or less'
      });
    }

    // Check password strength
    if (!validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 0,
      minNumbers: 1,
      minSymbols: 0
    })) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must contain at least 8 characters, including at least one letter and one number'
      });
    }

    next();
  } catch (error) {
    console.error('Validation error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error validating registration data'
    });
  }
};

// Validate login data
const validateLoginData = (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Valid email is required'
      });
    }

    // Validate password exists
    if (!password) {
      return res.status(400).json({
        status: 'error',
        message: 'Password is required'
      });
    }

    next();
  } catch (error) {
    console.error('Validation error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error validating login data'
    });
  }
};

module.exports = {
  sanitizeInput,
  validateListingData,
  validateReviewData,
  validateMessageData,
  validateRegistrationData,
  validateLoginData
};