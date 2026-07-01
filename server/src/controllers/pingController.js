const PingService = require('../services/ping.service');
const { z } = require('zod');

const pingMeasurementSchema = z.object({
  sequence_number: z.number().int().min(0),
  latency_ms: z.number().min(0).nullable().optional(),
  success: z.boolean().optional().default(true),
  failure_reason: z.string().max(100).nullable().optional()
}).superRefine((ping, ctx) => {
  if (ping.success !== false && typeof ping.latency_ms !== 'number') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['latency_ms'],
      message: 'latency_ms is required for successful ping measurements'
    });
  }
});

// Zod validation schemas
const createPingTestSchema = z.object({
  pings: z.array(pingMeasurementSchema).min(1),
  packet_loss_percent: z.number().min(0).max(100).optional().default(0),
  test_duration_seconds: z.number().min(0).optional(),
  probe_method: z.string().max(50).optional(),
  probe_target: z.string().max(255).optional(),
  isp_name: z.string().optional(),
  country: z.string().optional(),
  province: z.string().optional(),
  city: z.string().optional(),
  device_type: z.string().optional(),
  browser_name: z.string().optional()
});

// @desc    Simple health check for ping testing
// @route   GET /api/ping/health
// @access  Public
const pingHealthCheck = async (req, res, next) => {
  try {
    res.status(200).json({
      status: 'success',
      message: 'pong',
      timestamp: Date.now()
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Run a new ping test
// @route   POST /api/ping/tests
// @access  Private
const runPingTest = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const validatedData = createPingTestSchema.parse(req.body);
    
    const { pings, ...optionalData } = validatedData;
    
    // Get client's IP address from request
    const clientIp = req.ip || req.socket.remoteAddress || req.connection.remoteAddress;
    
    const testResult = await PingService.runPingTest(userId, pings, {
      ...optionalData,
      ip_address: clientIp
    });
    
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
    const startDate = req.query.start_date;
    const endDate = req.query.end_date;
    
    const { history, total } = await PingService.getPingHistory(userId, limit, offset, { startDate, endDate });
    
    res.status(200).json({
      status: 'success',
      data: history,
      pagination: {
        limit,
        offset,
        total
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
  pingHealthCheck,
  runPingTest,
  getPingTestById,
  getPingHistory,
  getPingSummary
};
