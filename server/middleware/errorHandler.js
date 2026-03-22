/**
 * Global error-handling middleware.
 * Must be registered LAST in app.js (after all routes).
 * Any controller can call next(err) to land here.
 */

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.originalUrl} →`, err.message);

  // Distinguish operational errors (expected) from programming errors (unexpected)
  const statusCode = err.statusCode || 500;
  const message =
    statusCode === 500 ? 'An unexpected error occurred. Please try again later.' : err.message;

  res.status(statusCode).json({ error: message });
}

/** Wrap async route handlers so unhandled rejections flow to errorHandler. */
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = { errorHandler, asyncHandler };
