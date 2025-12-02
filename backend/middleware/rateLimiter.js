// backend/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');
const MongoStore = require('rate-limit-mongo');

// Login rate limiter - 5 attempts per 15 minutes
const loginLimiter = rateLimit({
  store: new MongoStore({
    uri: process.env.MONGODB_URI,
    collectionName: 'rateLimits',
    expireTimeMs: 15 * 60 * 1000, // 15 minutes
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: {
    status: 'error',
    message: 'Too many login attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  keyGenerator: (req) => {
    // Rate limit by IP and email combination
    return `${req.ip}-${req.body.email || 'unknown'}`;
  }
});

// Listing creation limiter - 10 listings per hour
const listingCreationLimiter = rateLimit({
  store: new MongoStore({
    uri: process.env.MONGODB_URI,
    collectionName: 'rateLimits',
    expireTimeMs: 60 * 60 * 1000, // 1 hour
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    status: 'error',
    message: 'You have reached the maximum number of listings per hour (10). Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user ? req.user._id.toString() : req.ip;
  }
});

// Messaging limiter - 50 messages per hour
const messagingLimiter = rateLimit({
  store: new MongoStore({
    uri: process.env.MONGODB_URI,
    collectionName: 'rateLimits',
    expireTimeMs: 60 * 60 * 1000, // 1 hour
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  message: {
    status: 'error',
    message: 'You have sent too many messages (50 per hour). Please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user ? req.user._id.toString() : req.ip;
  }
});

// Review posting limiter - 5 reviews per day
const reviewLimiter = rateLimit({
  store: new MongoStore({
    uri: process.env.MONGODB_URI,
    collectionName: 'rateLimits',
    expireTimeMs: 24 * 60 * 60 * 1000, // 24 hours
  }),
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 5,
  message: {
    status: 'error',
    message: 'You have reached the maximum number of reviews per day (5). Please try again tomorrow.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user ? req.user._id.toString() : req.ip;
  }
});

// General API limiter - 100 requests per 15 minutes
const generalLimiter = rateLimit({
  store: new MongoStore({
    uri: process.env.MONGODB_URI,
    collectionName: 'rateLimits',
    expireTimeMs: 15 * 60 * 1000, // 15 minutes
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    status: 'error',
    message: 'Too many requests from this IP. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  loginLimiter,
  listingCreationLimiter,
  messagingLimiter,
  reviewLimiter,
  generalLimiter
};