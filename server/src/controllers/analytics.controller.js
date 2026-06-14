const AnalyticsService = require('../services/analytics.service');
const { z } = require('zod');

// Zod validation for history range
const historyQuerySchema = z.object({
  range: z.enum(['7d', '30d', '90d']).optional().default('30d')
});

// Zod validation for test ID
const testIdParamSchema = z.object({
  test_result_id: z.string().uuid()
});

// 1. Get Overview
const getOverview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const data = await AnalyticsService.getOverview(userId);
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

// 2. Get History
const getHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const validatedQuery = historyQuerySchema.parse(req.query);
    const data = await AnalyticsService.getHistory(userId, validatedQuery.range);
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

// 3. Get Test Details
const getTestDetails = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const validatedParams = testIdParamSchema.parse(req.params);
    const data = await AnalyticsService.getTestDetails(userId, validatedParams.test_result_id);
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

// 4. Get Anomalies
const getAnomalies = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const data = await AnalyticsService.getAnomalies(userId);
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverview,
  getHistory,
  getTestDetails,
  getAnomalies
};
