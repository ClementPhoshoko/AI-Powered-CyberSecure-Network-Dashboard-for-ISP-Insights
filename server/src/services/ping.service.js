const TestResult = require('../models/TestResult');
const PingMeasurement = require('../models/PingMeasurement');
const { 
  calculatePingAverage, 
  calculatePingMin, 
  calculatePingMax, 
  calculateJitter 
} = require('../utils/networkMetrics');

class PingService {
  static async runPingTest(userId, rawPings, optionalData = {}) {
    // 1. Calculate summary metrics from raw pings
    const pingAvgMs = calculatePingAverage(rawPings);
    const pingMinMs = calculatePingMin(rawPings);
    const pingMaxMs = calculatePingMax(rawPings);
    const jitterMs = calculateJitter(rawPings);
    const packetLossPercent = optionalData.packet_loss_percent || 0;
    const normalizedTestDurationSeconds = optionalData.test_duration_seconds == null
      ? undefined
      : optionalData.test_duration_seconds > 0
        ? Math.ceil(optionalData.test_duration_seconds)
        : 0;

    // 2. Create test result in DB
    const testResult = await TestResult.create({
      user_id: userId,
      ping_avg_ms: Number(pingAvgMs.toFixed(2)),
      ping_min_ms: Number(pingMinMs.toFixed(2)),
      ping_max_ms: Number(pingMaxMs.toFixed(2)),
      jitter_ms: Number(jitterMs.toFixed(2)),
      packet_loss_percent: Number(packetLossPercent.toFixed(2)),
      ...optionalData,
      test_duration_seconds: normalizedTestDurationSeconds
    });

    // 3. Save raw ping measurements
    const pingMeasurements = rawPings.map(ping => ({
      test_result_id: testResult.id,
      sequence_number: ping.sequence_number,
      latency_ms: Number(ping.latency_ms)
    }));

    await PingMeasurement.bulkCreate(pingMeasurements);

    // 4. Return full test result with pings
    return TestResult.findById(testResult.id);
  }

  static async getPingTestById(testId) {
    return TestResult.findById(testId);
  }

  static async getPingHistory(userId, limit = 100, offset = 0) {
    return TestResult.findByCurrentUser(userId, limit, offset);
  }

  static async getPingSummary(userId) {
    const history = await TestResult.findByCurrentUser(userId, 1000, 0); // Get last 1000 tests max
    if (history.length === 0) {
      return {
        averagePing: 0,
        averageJitter: 0,
        averagePacketLoss: 0,
        totalTests: 0
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
      totalTests
    };
  }
}

module.exports = PingService;
