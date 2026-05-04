const express = require('express');
const { register, login, me } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Strict rate limit on auth endpoints
router.post('/register', authLimiter, validate(schemas.register), register);
router.post('/login', authLimiter, validate(schemas.login), login);
router.get('/me', protect, me);

module.exports = router;
