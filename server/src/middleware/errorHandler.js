/**
 * Centralized error handling middleware
 * Should be added as the last middleware in server.js
 */
function errorHandler(err, req, res, next) {
  console.error('Full Error Details:', err);

  // Default error status and message
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Zod validation errors
  if (err.name === 'ZodError') {
    statusCode = 400;
    message = 'Validation error: ' + err.issues.map(issue => `${issue.path.join('.')} - ${issue.message}`).join(', ');
  }
  // Handle Supabase errors
  else if (err.code && err.message) {
    statusCode = 400;
    message = err.message;
  }

  res.status(statusCode).json({
    status: 'error',
    message: message
  });
}

module.exports = errorHandler;

/*
 * errorHandler Middleware Notes:
 * - Centralized error handling for all routes
 * - Should be registered as the last middleware in server.js
 * - Catches errors passed via next(err) from other middleware/routes
 * - Formats consistent error responses for the client
 */
