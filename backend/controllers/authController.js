const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Generate a signed JWT for a user.
 * @param {string} userId
 * @returns {string} token
 */
const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

// ─── POST /api/auth/register ─────────────────────────────────────────────────
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Check for existing email (Mongoose unique index will also catch this,
  // but checking here gives a cleaner error message before the DB round-trip)
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({
      success: false,
      error: 'An account with this email already exists.',
    });
  }

  // passwordHash field is hashed in the User model's pre-save hook
  const user = await User.create({ name, email, passwordHash: password, role });
  const token = signToken(user._id);

  res.status(201).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// ─── POST /api/auth/login ────────────────────────────────────────────────────
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Explicitly select passwordHash (excluded by default via `select: false`)
  const user = await User.findOne({ email }).select('+passwordHash');

  // Generic error — don't reveal whether email or password was wrong
  const invalidMsg = 'Invalid email or password.';

  if (!user) {
    return res.status(401).json({ success: false, error: invalidMsg });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, error: invalidMsg });
  }

  if (user.isActive === false) {
    return res.status(401).json({
      success: false,
      error: 'Your account has been deactivated. Please contact an administrator.',
    });
  }

  const token = signToken(user._id);

  res.status(200).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// ─── GET /api/auth/me ────────────────────────────────────────────────────────
const me = asyncHandler(async (req, res) => {
  // req.user is set by the protect middleware
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

module.exports = { register, login, me };
