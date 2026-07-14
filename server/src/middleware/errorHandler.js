/**
 * Centralized error handling middleware
 * Should be added as the last middleware in server.js
 */
function errorHandler(err, req, res, next) {
  console.error('Full Error Details:', err);

  // Default error status and message
  let statusCode = err.statusCode || 500;
  let message = 'Internal Server Error';

  // Handle Zod validation errors — safe to show details
  if (err.name === 'ZodError') {
    statusCode = 400;
    message = 'Validation error: ' + err.issues.map(issue => `${issue.path.join('.')} - ${issue.message}`).join(', ');
  }
  // Handle body-parser / syntax errors
  else if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Invalid request format. Please check your input.';
  }
  // Handle rate limit errors
  else if (err.status === 429 || err.statusCode === 429) {
    statusCode = 429;
    message = 'Too many requests. Please try again later.';
  }
  // Handle specific known errors
  else if (err.message) {
    const msg = err.message.toLowerCase();

    if (msg.includes('econnrefused') || msg.includes('network') || msg.includes('fetch')) {
      message = 'Unable to connect to the server. Please try again later.';
    } else if (msg.includes('timeout')) {
      message = 'Request timed out. Please try again.';
    } else if (err.statusCode && err.statusCode >= 400 && err.statusCode < 500) {
      message = err.message;
    } else {
      message = 'Internal Server Error';
    }
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
