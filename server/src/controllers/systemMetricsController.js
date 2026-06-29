const SystemMetric = require('../models/SystemMetric');

// @desc    Get public system metrics
// @route   GET /api/system/metrics
// @access  Public
const getMetrics = async (req, res, next) => {
  try {
    // ALWAYS refresh metrics to get the latest counts!
    console.log('Refreshing metrics for page load...');
    const metrics = await SystemMetric.refreshAll();
    
    console.log('Returning metrics:', metrics);
    
    res.status(200).json({
      status: 'success',
      data: metrics
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    // Return default metrics even if there's an error
    const defaultMetrics = {
      total_users: 0,
      countries_count: 0,
      uptime_percentage: 99.9,
      founded_year: 2026
    };
    
    res.status(200).json({
      status: 'success',
      data: defaultMetrics
    });
  }
};

// @desc    Refresh and get metrics
// @route   POST /api/system/metrics/refresh
// @access  Public (could be admin-only later)
const refreshAndGetMetrics = async (req, res, next) => {
  try {
    console.log('Refreshing metrics...');
    const metrics = await SystemMetric.refreshAll();
    console.log('Refreshed metrics:', metrics);
    
    res.status(200).json({
      status: 'success',
      data: metrics
    });
  } catch (error) {
    console.error('Error refreshing metrics:', error);
    next(error);
  }
};

module.exports = {
  getMetrics,
  refreshAndGetMetrics
};
