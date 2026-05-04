const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * JWT Authentication Middleware.
 * Reads the Bearer token from the Authorization header,
 * verifies it, and attaches the full user object to req.user.
 *
 * Usage: router.get('/protected', protect, handler)
 */
const protect = async (req, res, next) => {
  let token;

  // Accept "Authorization: Bearer <token>"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access denied. No token provided.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from DB to ensure they still exist and haven't been deactivated
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User associated with this token no longer exists.',
      });
    }

    if (user.isActive === false) {
      return res.status(401).json({
        success: false,
        error: 'Your account has been deactivated. Please contact an administrator.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token has expired. Please log in again.',
      });
    }
    return res.status(401).json({
      success: false,
      error: 'Invalid token.',
    });
  }
};

/**
 * Role-based authorisation middleware factory.
 * Accepts an array of allowed roles and blocks requests that don't match.
 *
 * Usage: router.delete('/users/:id', protect, requireRole(['admin']), handler)
 *        router.post('/agents',  protect, requireRole(['admin', 'operations_manager']), handler)
 *
 * @param {string[]} roles - Allowed roles
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. This action requires one of the following roles: ${roles.join(', ')}.`,
      });
    }
    next();
  };
};

/**
 * @deprecated Use requireRole([...roles]) instead.
 * Kept for backward compatibility with existing routes.
 */
const authorise = (...roles) => requireRole(roles);

module.exports = { protect, requireRole, authorise };
