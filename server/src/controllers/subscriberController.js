const Subscriber = require('../models/Subscriber');
const { z } = require('zod');

// Zod validation schema for subscriber
const subscriberSchema = z.object({
  email: z.string().email('Invalid email address'),
  first_name: z.string().optional().nullable(),
  last_name: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive', 'unsubscribed']).optional().default('active')
});

// @desc    Get current user's subscriber info
// @route   GET /api/subscriber
// @access  Private
const getSubscriber = async (req, res, next) => {
  try {
    const userId = req.user.id; // From validateSupabaseJWT middleware
    console.log('subscriberController: getSubscriber called for userId:', userId);
    const subscriber = await Subscriber.findByUserId(userId);
    console.log('subscriberController: found subscriber:', subscriber);

    res.status(200).json({
      status: 'success',
      data: subscriber
    });
  } catch (error) {
    console.error('subscriberController: getSubscriber error:', error);
    next(error);
  }
};

// @desc    Subscribe current user
// @route   POST /api/subscriber
// @access  Private
const subscribe = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const validatedData = subscriberSchema.parse(req.body);

    // Check if already subscribed
    const existingSubscriber = await Subscriber.findByUserId(userId);
    if (existingSubscriber) {
      return res.status(400).json({
        status: 'error',
        code: 'SUBSCRIBER_ALREADY_EXISTS',
        message: 'Already subscribed'
      });
    }

    const newSubscriber = await Subscriber.create({
      user_id: userId,
      email: validatedData.email,
      first_name: validatedData.first_name,
      last_name: validatedData.last_name,
      status: validatedData.status
    });

    res.status(201).json({
      status: 'success',
      data: newSubscriber
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user's subscription
// @route   PUT /api/subscriber
// @access  Private
const updateSubscription = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    const subscriber = await Subscriber.findByUserId(userId);
    if (!subscriber) {
      return res.status(404).json({
        status: 'error',
        code: 'SUBSCRIBER_NOT_FOUND',
        message: 'Subscriber not found'
      });
    }

    const updatedSubscriber = await Subscriber.update(subscriber.id, updates);

    res.status(200).json({
      status: 'success',
      data: updatedSubscriber
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unsubscribe current user
// @route   DELETE /api/subscriber
// @access  Private
const unsubscribe = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const subscriber = await Subscriber.findByUserId(userId);
    if (!subscriber) {
      return res.status(404).json({
        status: 'error',
        code: 'SUBSCRIBER_NOT_FOUND',
        message: 'Subscriber not found'
      });
    }

    await Subscriber.delete(subscriber.id);

    res.status(200).json({
      status: 'success',
      message: 'Successfully unsubscribed'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSubscriber,
  subscribe,
  updateSubscription,
  unsubscribe
};
