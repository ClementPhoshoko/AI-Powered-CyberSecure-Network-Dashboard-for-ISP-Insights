const PingService = require('../services/ping.service');
const { z } = require('zod');

// Zod validation schemas
const createPingTestSchema = z.object({
  pings: z.array(
    z.object({
      sequence_number: z.number().int().min(0),
      latency_ms: z.number().min(0)
    })
  ).min(1),
  packet_loss_percent: z.number().min(0).max(100).optional().default(0),
  test_duration_seconds: z.number().int().min(0).optional(),
  isp_name: z.string().optional(),
  country: z.string().optional(),
  province: z.string().optional(),
  city: z.string().optional(),
  device_type: z.string().optional(),
  browser_name: z.string().optional()
});

// @desc    Run a new ping test
// @route   POST /api/ping/tests
// @access  Private
const runPingTest = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const validatedData = createPingTestSchema.parse(req.body);
    
    const { pings, ...optionalData } = validatedData;
    
    const testResult = await PingService.runPingTest(userId, pings, optionalData);
    
    res.status(201).json({
      status: 'success',
      data: testResult
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a specific ping test by ID
// @route   GET /api/ping/tests/:id
// @access  Private
const getPingTestById = async (req, res, next) => {
  try {
    const testId = req.params.id;
    const testResult = await PingService.getPingTestById(testId);
    
    if (!testResult) {
      return res.status(404).json({
        status: 'error',
        message: 'Test result not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: testResult
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get ping test history for current user
// @route   GET /api/ping/history
// @access  Private
const getPingHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const limit = Number(req.query.limit) || 100;
    const offset = Number(req.query.offset) || 0;
    
    const history = await PingService.getPingHistory(userId, limit, offset);
    
    res.status(200).json({
      status: 'success',
      data: history,
      pagination: {
        limit,
        offset,
        total: history.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get ping summary for current user
// @route   GET /api/ping/summary
// @access  Private
const getPingSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const summary = await PingService.getPingSummary(userId);
    
    res.status(200).json({
      status: 'success',
      data: summary
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  runPingTest,
  getPingTestById,
  getPingHistory,
  getPingSummary
};
