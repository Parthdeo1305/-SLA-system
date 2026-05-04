/**
 * Global Error Handler Middleware.
 *
 * Must be registered LAST in Express (after all routes).
 * Controllers throw errors; this handler catches them and
 * formats a consistent JSON response — never a stack trace leak.
 */
const errorHandler = (err, req, res, next) => {
  // Log full error server-side for debugging
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[Error] ${req.method} ${req.originalUrl}`, {
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // ── Mongoose: duplicate key (e.g. unique email) ──────────────────────────
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already registered.`;
  }

  // ── Mongoose: validation error ───────────────────────────────────────────
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors).map((e) => e.message);
    message = messages.join('. ');
  }

  // ── Mongoose: invalid ObjectId ───────────────────────────────────────────
  if (err.name === 'CastError') {
    statusCode = 404;
    message = `Resource not found. Invalid ${err.path}: ${err.value}`;
  }

  // ── JWT errors (belt-and-suspenders; middleware catches these first) ──────
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token.';
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Convenience: wrap async route handlers to avoid try/catch boilerplate.
 * Usage: router.get('/route', asyncHandler(async (req, res) => { ... }))
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { errorHandler, asyncHandler };
