const { supabaseAdmin } = require('../config/db');

// DEV-ONLY: Login endpoint (for testing purposes only!)
// This should NEVER be used in production!
async function devLogin(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        code: 'VALIDATION_REQUIRED',
        message: 'Email and password are required'
      });
    }

    // Use Supabase Admin client to sign in (dev only)
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({
        status: 'error',
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'Invalid credentials'
      });
    }

    res.status(200).json({
      status: 'success',
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
      user: {
        id: data.user.id,
        email: data.user.email
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { devLogin };