const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter — 100 requests per 15 minutes per IP.
 * Applied globally in server.js.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  standardHeaders: true,  // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP. Please try again in 15 minutes.',
  },
});

/**
 * Stricter limiter for auth endpoints — prevents brute force on login.
 * 10 attempts per 15 minutes per IP.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error:
      'Too many authentication attempts from this IP. Please try again in 15 minutes.',
  },
});

module.exports = { apiLimiter, authLimiter };
