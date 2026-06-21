const TestResult = require('../models/TestResult');
const PingMeasurement = require('../models/PingMeasurement');
const {
  annotateTestResult,
  annotateTestResults,
  getMeasurementContext
} = require('../utils/testResultPresentation');
const { 
  calculatePingAverage, 
  calculatePingMin, 
  calculatePingMax, 
  calculatePingMedian,
  calculateJitter 
} = require('../utils/networkMetrics');

class PingService {
  static async runPingTest(userId, rawPings, optionalData = {}) {
    // 1. Calculate summary metrics from raw pings
    const successfulPings = rawPings.filter(
      (ping) => ping?.success !== false && Number.isFinite(Number(ping?.latency_ms)) && Number(ping.latency_ms) > 0
    );
    const failedPings = rawPings.length - successfulPings.length;
    const pingAvgMs = calculatePingAverage(rawPings);
    const pingMinMs = calculatePingMin(rawPings);
    const pingMaxMs = calculatePingMax(rawPings);
    const pingMedianMs = calculatePingMedian(rawPings);
    const jitterMs = calculateJitter(rawPings);
    const packetLossPercent = rawPings.length === 0
      ? 0
      : (failedPings / rawPings.length) * 100;
    const normalizedTestDurationSeconds = optionalData.test_duration_seconds == null
      ? undefined
      : optionalData.test_duration_seconds > 0
        ? Math.ceil(optionalData.test_duration_seconds)
        : 0;

    // 2. Create test result in DB
    const testResult = await TestResult.create({
      user_id: userId,
      ...optionalData,
      ping_avg_ms: Number(pingAvgMs.toFixed(2)),
      ping_min_ms: Number(pingMinMs.toFixed(2)),
      ping_max_ms: Number(pingMaxMs.toFixed(2)),
      ping_median_ms: Number(pingMedianMs.toFixed(2)),
      jitter_ms: Number(jitterMs.toFixed(2)),
      packet_loss_percent: Number(packetLossPercent.toFixed(2)),
      probe_method: optionalData.probe_method || 'http-health',
      probe_target: optionalData.probe_target || null,
      probe_sample_count: rawPings.length,
      successful_probe_count: successfulPings.length,
      failed_probe_count: failedPings,
      test_duration_seconds: normalizedTestDurationSeconds
    });

    // 3. Save raw ping measurements
    const pingMeasurements = rawPings.map(ping => ({
      test_result_id: testResult.id,
      sequence_number: ping.sequence_number,
      latency_ms: Number.isFinite(Number(ping.latency_ms)) ? Number(ping.latency_ms) : null,
      success: ping.success !== false,
      failure_reason: ping.failure_reason || null
    }));

    await PingMeasurement.bulkCreate(pingMeasurements);

    // 4. Return full test result with pings
    const fullResult = await TestResult.findById(testResult.id);
    return annotateTestResult(fullResult);
  }

  static async getPingTestById(testId) {
    const testResult = await TestResult.findById(testId);
    return annotateTestResult(testResult);
  }

  static async getPingHistory(userId, limit = 100, offset = 0, filters = {}) {
    const [history, total] = await Promise.all([
      TestResult.findByCurrentUser(userId, limit, offset, filters),
      TestResult.countByCurrentUser(userId, filters)
    ]);
    return { history: annotateTestResults(history), total };
  }

  static async getPingSummary(userId) {
    const history = await TestResult.findByCurrentUser(userId, 1000, 0); // Get last 1000 tests max
    const latestTest = history[0];
    const measurementContext = getMeasurementContext(
      latestTest?.probe_method,
      latestTest?.probe_target
    );

    if (history.length === 0) {
      return {
        averagePing: 0,
        averageJitter: 0,
        averagePacketLoss: 0,
        totalTests: 0,
        measurement_context: measurementContext
      };
    }

    const totalTests = history.length;
    const totalPing = history.reduce((sum, test) => sum + (test.ping_avg_ms || 0), 0);
    const totalJitter = history.reduce((sum, test) => sum + (test.jitter_ms || 0), 0);
    const totalPacketLoss = history.reduce((sum, test) => sum + (test.packet_loss_percent || 0), 0);

    return {
      averagePing: Number((totalPing / totalTests).toFixed(2)),
      averageJitter: Number((totalJitter / totalTests).toFixed(2)),
      averagePacketLoss: Number((totalPacketLoss / totalTests).toFixed(2)),
      totalTests,
      measurement_context: measurementContext
    };
  }
}

module.exports = PingService;
