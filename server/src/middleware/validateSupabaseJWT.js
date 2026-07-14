const { supabaseAdmin } = require('../config/db');

/**
 * Middleware to validate Supabase JWT from the request
 * Expects the JWT to be in the 'Authorization' header as 'Bearer <token>'
 * Attaches the user to req.user if valid
 */
async function validateSupabaseJWT(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        code: 'AUTH_TOKEN_MISSING',
        message: 'Authorization header missing or invalid'
      });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({
        status: 'error',
        code: 'AUTH_TOKEN_INVALID',
        message: 'Invalid or expired token'
      });
    }

    // Attach user to request object for use in subsequent middleware/routes
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({
      status: 'error',
      code: 'AUTH_ERROR',
      message: 'Authentication error',
      error: error.message
    });
  }
}

module.exports = validateSupabaseJWT;

/*
 * validateSupabaseJWT Middleware Notes:
 * - Used to protect routes that require authentication
 * - Validates the JWT from the request's Authorization header
 * - Uses supabaseAdmin (bypasses RLS) to verify the token
 * - Attaches the authenticated user to req.user for downstream use
 */
