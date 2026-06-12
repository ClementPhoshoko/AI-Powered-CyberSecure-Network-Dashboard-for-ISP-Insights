const Profile = require('../models/Profile');

// @desc    Create user profile (should run after Supabase Auth signup)
// @route   POST /api/profile
// @access  Private
const createProfile = async (req, res, next) => {
  try {
    const { username, first_name, last_name } = req.body;
    const userId = req.user.id; // From validateSupabaseJWT middleware

    const profile = await Profile.create({
      id: userId,
      username,
      first_name,
      last_name
    });

    res.status(201).json({
      status: 'success',
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's profile
// @route   GET /api/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id; // From validateSupabaseJWT middleware
    const profile = await Profile.findById(userId);

    res.status(200).json({
      status: 'success',
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user's profile
// @route   PUT /api/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id; // From validateSupabaseJWT middleware
    const updates = req.body;
    
    // Don't let user update their ID
    delete updates.id;

    const updatedProfile = await Profile.update(userId, updates);

    res.status(200).json({
      status: 'success',
      data: updatedProfile
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProfile,
  getProfile,
  updateProfile
};

/*
 * profileController Notes:
 * - All routes are protected by validateSupabaseJWT middleware
 * - Uses req.user.id from the JWT to identify the current user
 * - Interacts with Profile model for database operations
 */