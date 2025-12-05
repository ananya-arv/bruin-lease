/**
 * Authentication Controller
 * Handles user registration, login, and profile retrieval with UCLA email verification.
 * 
 * @module controllers/authController
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const validator = require('validator');
const xss = require('xss');

const sanitizeString = (str) => {
  if (!str) return str;
  return xss(validator.trim(str));
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

/**
 * Register new user account
 * Creates user with UCLA email verification and secure password hashing
 * 
 * Validation Rules:
 * - Name: 2-50 characters, required
 * - Email: Must be valid @ucla.edu address
 * - Password: Minimum 6 characters with at least one lowercase letter
 * 
 * @async
 * @function register
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing user data
 * @param {string} req.body.name - User's full name
 * @param {string} req.body.email - User's UCLA email address
 * @param {string} req.body.password - User's password
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Sends JSON response with user data and token
 * 
 * @throws {400} Name validation errors (missing, too short/long)
 * @throws {400} Email validation errors (missing, invalid format, not @ucla.edu)
 * @throws {400} Password validation errors (missing, too short, weak)
 * @throws {400} User already exists with this email
 * @throws {500} Server error during registration
 * 
 * Success Response (201):
 * {
 *   status: 'success',
 *   data: {
 *     id: string,
 *     name: string,
 *     email: string,
 *     token: string
 *   }
 * }
 */


const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || validator.isEmpty(name.trim())) {
      return res.status(400).json({
        status: 'error',
        message: 'Name is required'
      });
    }

    if (!validator.isLength(name, { min: 2, max: 50 })) {
      return res.status(400).json({
        status: 'error',
        message: 'Name must be between 2 and 50 characters'
      });
    }

    const sanitizedName = sanitizeString(name);

    if (!email || validator.isEmpty(email.trim())) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is required'
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a valid email address'
      });
    }

    const normalizedEmail = validator.normalizeEmail(email.toLowerCase());

    if (!normalizedEmail.endsWith('@ucla.edu')) {
      return res.status(400).json({
        status: 'error',
        message: 'Please use a valid UCLA email address (@ucla.edu)'
      });
    }

    if (!password) {
      return res.status(400).json({
        status: 'error',
        message: 'Password is required'
      });
    }

    if (!validator.isLength(password, { min: 6, max: 100 })) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 6 characters long'
      });
    }

    if (!validator.isStrongPassword(password, {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 0,
      minNumbers: 0,
      minSymbols: 0
    })) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must contain at least one lowercase letter'
      });
    }

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({
        status: 'error',
        message: 'User already exists with this email'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: sanitizedName,
      email: normalizedEmail,
      password: hashedPassword
    });

    res.status(201).json({
      status: 'success',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Server error during registration'
    });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || validator.isEmpty(email.trim())) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is required'
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a valid email address'
      });
    }

    const normalizedEmail = validator.normalizeEmail(email.toLowerCase());

    if (!password) {
      return res.status(400).json({
        status: 'error',
        message: 'Password is required'
      });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Server error during login'
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = req.user;

    res.status(200).json({
      status: 'success',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

module.exports = {
  register,
  login,
  getMe
};