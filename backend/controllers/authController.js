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