const { z } = require('zod');
const Profile = require('../models/Profile');

const profileUpdateSchema = z.object({
  username: z.string().max(100).optional(),
  first_name: z.string().max(100).optional(),
  last_name: z.string().max(100).optional(),
  full_name: z.string().max(120).optional(),
  phone: z.string().max(30).optional(),
  isp_name: z.string().max(120).optional(),
  location: z.string().max(200).optional(),
  avatar_url: z.string().url().max(500).optional(),
}).strict();

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
    const updates = profileUpdateSchema.parse(req.body);

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
  getProfile,
  updateProfile
};

/*
 * profileController Notes:
 * - All routes are protected by validateSupabaseJWT middleware
 * - Uses req.user.id from the JWT to identify the current user
 * - Interacts with Profile model for database operations
 */