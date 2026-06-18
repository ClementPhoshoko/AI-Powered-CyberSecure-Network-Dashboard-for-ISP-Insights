const { supabaseAdmin } = require('../config/db');
const TestResult = require('../models/TestResult');
const {
  annotateTestResult,
  getMeasurementContext,
  getScoreContext
} = require('../utils/testResultPresentation');

class AnalyticsService {
  // Helper to parse range parameter
  static getRangeDates(range) {
    const now = new Date();
    let days;
    
    switch (range) {
      case '7d':
        days = 7;
        break;
      case '30d':
        days = 30;
        break;
      case '90d':
        days = 90;
        break;
      default:
        days = 30; // Default to 30 days
    }
    
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);
    return { startDate, endDate: now };
  }

  // 1. Get Overview Analytics
  static async getOverview(userId) {
    const { data, error } = await supabaseAdmin
      .from('test_results')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    const latestTest = data[0];
    const measurementContext = getMeasurementContext(
      latestTest?.probe_method,
      latestTest?.probe_target
    );
    const scoreContext = getScoreContext(latestTest || {});

    if (data.length === 0) {
      return {
        total_tests: 0,
        avg_download_mbps: 0,
        avg_upload_mbps: 0,
        avg_ping_ms: 0,
        avg_jitter_ms: 0,
        avg_packet_loss_percent: 0,
        best_network_health_score: 0,
        worst_network_health_score: 0,
        measurement_context: measurementContext,
        score_context: scoreContext
      };
    }

    // Calculate aggregations in JS (since Supabase query builder has limitations)
    const total_tests = data.length;
    const validTests = data.filter(test => 
      test.download_speed_mbps != null || 
      test.upload_speed_mbps != null || 
      test.ping_avg_ms != null
    );

    let avg_download_mbps = 0, avg_upload_mbps = 0, avg_ping_ms = 0;
    let avg_jitter_ms = 0, avg_packet_loss_percent = 0;
    let best_network_health_score = 0, worst_network_health_score = 100;

    const downloadSpeeds = validTests.filter(t => t.download_speed_mbps != null).map(t => t.download_speed_mbps);
    const uploadSpeeds = validTests.filter(t => t.upload_speed_mbps != null).map(t => t.upload_speed_mbps);
    const pings = validTests.filter(t => t.ping_avg_ms != null).map(t => t.ping_avg_ms);
    const jitters = validTests.filter(t => t.jitter_ms != null).map(t => t.jitter_ms);
    const packetLosses = validTests.filter(t => t.packet_loss_percent != null).map(t => t.packet_loss_percent);
    const healthScores = validTests.filter(t => t.network_health_score != null).map(t => t.network_health_score);

    if (downloadSpeeds.length > 0) {
      avg_download_mbps = downloadSpeeds.reduce((a, b) => a + b, 0) / downloadSpeeds.length;
    }
    if (uploadSpeeds.length > 0) {
      avg_upload_mbps = uploadSpeeds.reduce((a, b) => a + b, 0) / uploadSpeeds.length;
    }
    if (pings.length > 0) {
      avg_ping_ms = pings.reduce((a, b) => a + b, 0) / pings.length;
    }
    if (jitters.length > 0) {
      avg_jitter_ms = jitters.reduce((a, b) => a + b, 0) / jitters.length;
    }
    if (packetLosses.length > 0) {
      avg_packet_loss_percent = packetLosses.reduce((a, b) => a + b, 0) / packetLosses.length;
    }
    if (healthScores.length > 0) {
      best_network_health_score = Math.max(...healthScores);
      worst_network_health_score = Math.min(...healthScores);
    }

    return {
      total_tests,
      avg_download_mbps: Number(avg_download_mbps.toFixed(2)),
      avg_upload_mbps: Number(avg_upload_mbps.toFixed(2)),
      avg_ping_ms: Number(avg_ping_ms.toFixed(2)),
      avg_jitter_ms: Number(avg_jitter_ms.toFixed(2)),
      avg_packet_loss_percent: Number(avg_packet_loss_percent.toFixed(2)),
      best_network_health_score,
      worst_network_health_score,
      measurement_context: measurementContext,
      score_context: scoreContext
    };
  }

  // 2. Get History Analytics (time-series)
  static async getHistory(userId, range) {
    const { startDate, endDate } = this.getRangeDates(range);

    const { data, error } = await supabaseAdmin
      .from('test_results')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group by date
    const groupedByDate = {};
    data.forEach(test => {
      const date = new Date(test.created_at).toISOString().split('T')[0]; // YYYY-MM-DD
      if (!groupedByDate[date]) {
        groupedByDate[date] = [];
      }
      groupedByDate[date].push(test);
    });

    // Convert to array and calculate daily averages
    const history = Object.keys(groupedByDate).sort().map(date => {
      const tests = groupedByDate[date];
      const latestDailyTest = tests[tests.length - 1];
      
      const downloads = tests.filter(t => t.download_speed_mbps != null).map(t => t.download_speed_mbps);
      const uploads = tests.filter(t => t.upload_speed_mbps != null).map(t => t.upload_speed_mbps);
      const pings = tests.filter(t => t.ping_avg_ms != null).map(t => t.ping_avg_ms);
      const healthScores = tests.filter(t => t.network_health_score != null).map(t => t.network_health_score);

      return {
        date,
        avg_download: downloads.length > 0 ? Number((downloads.reduce((a, b) => a + b, 0) / downloads.length).toFixed(2)) : 0,
        avg_upload: uploads.length > 0 ? Number((uploads.reduce((a, b) => a + b, 0) / uploads.length).toFixed(2)) : 0,
        avg_ping: pings.length > 0 ? Number((pings.reduce((a, b) => a + b, 0) / pings.length).toFixed(2)) : 0,
        avg_health_score: healthScores.length > 0 ? Math.round(healthScores.reduce((a, b) => a + b, 0) / healthScores.length) : 0,
        measurement_context: getMeasurementContext(
          latestDailyTest?.probe_method,
          latestDailyTest?.probe_target
        ),
        score_context: getScoreContext(latestDailyTest || {})
      };
    });

    return history;
  }

  // 3. Get Single Test Details
  static async getTestDetails(userId, testResultId) {
    const testResult = await TestResult.findById(testResultId);
    
    if (!testResult) {
      throw new Error('Test result not found');
    }
    
    if (testResult.user_id !== userId) {
      throw new Error('Unauthorized: You do not own this test result');
    }
    
    return annotateTestResult(testResult);
  }

  // 4. Get Anomalies
  static async getAnomalies(userId) {
    const { data, error } = await supabaseAdmin
      .from('test_results')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const anomalies = [];

    data.forEach(test => {
      // Check for high latency
      if (test.ping_avg_ms > 100) {
        anomalies.push({
          test_result_id: test.id,
          type: 'high_latency',
          severity: test.ping_avg_ms > 200 ? 'high' : 'medium',
          description: 'HTTP probe latency above normal range detected',
          created_at: test.created_at,
          measurement_context: getMeasurementContext(test.probe_method, test.probe_target)
        });
      }
      
      // Check for jitter
      if (test.jitter_ms > 20) {
        anomalies.push({
          test_result_id: test.id,
          type: 'instability',
          severity: test.jitter_ms > 50 ? 'high' : 'medium',
          description: 'High HTTP probe jitter detected - connection may be unstable',
          created_at: test.created_at,
          measurement_context: getMeasurementContext(test.probe_method, test.probe_target)
        });
      }
      
      // Check for packet loss
      if (test.packet_loss_percent > 1) {
        anomalies.push({
          test_result_id: test.id,
          type: 'packet_loss',
          severity: test.packet_loss_percent > 5 ? 'high' : 'medium',
          description: 'HTTP probe failure rate estimate is elevated',
          created_at: test.created_at,
          measurement_context: getMeasurementContext(test.probe_method, test.probe_target)
        });
      }
      
      // Check for slow download
      if (test.download_speed_mbps != null && test.download_speed_mbps < 10) {
        anomalies.push({
          test_result_id: test.id,
          type: 'slow_connection',
          severity: test.download_speed_mbps < 5 ? 'high' : 'medium',
          description: 'Slow download speed detected',
          created_at: test.created_at,
          score_context: getScoreContext(test)
        });
      }
    });

    return anomalies;
  }
}

module.exports = AnalyticsService;
