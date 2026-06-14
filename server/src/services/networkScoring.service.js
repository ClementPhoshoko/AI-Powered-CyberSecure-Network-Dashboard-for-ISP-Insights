const TestResult = require('../models/TestResult');

class NetworkScoringService {
  // Normalization functions for each metric
  static normalizeDownloadScore(downloadSpeedMbps) {
    if (downloadSpeedMbps >= 100) return 100;
    if (downloadSpeedMbps >= 50) return 80 + ((downloadSpeedMbps - 50) * (20 / 50));
    if (downloadSpeedMbps >= 25) return 60 + ((downloadSpeedMbps - 25) * (20 / 25));
    if (downloadSpeedMbps >= 10) return 40 + ((downloadSpeedMbps - 10) * (20 / 15));
    if (downloadSpeedMbps >= 5) return 20 + ((downloadSpeedMbps - 5) * (20 / 5));
    return 20;
  }

  static normalizeUploadScore(uploadSpeedMbps) {
    if (uploadSpeedMbps >= 50) return 100;
    if (uploadSpeedMbps >= 20) return 80 + ((uploadSpeedMbps - 20) * (20 / 30));
    if (uploadSpeedMbps >= 10) return 60 + ((uploadSpeedMbps - 10) * (20 / 10));
    if (uploadSpeedMbps >= 5) return 40 + ((uploadSpeedMbps - 5) * (20 / 5));
    if (uploadSpeedMbps >= 2) return 20 + ((uploadSpeedMbps - 2) * (20 / 3));
    return 20;
  }

  static normalizePingScore(pingAvgMs) {
    if (pingAvgMs <= 20) return 100;
    if (pingAvgMs <= 50) return 80 + ((50 - pingAvgMs) * (20 / 30));
    if (pingAvgMs <= 100) return 60 + ((100 - pingAvgMs) * (20 / 50));
    if (pingAvgMs <= 150) return 40 + ((150 - pingAvgMs) * (20 / 50));
    if (pingAvgMs <= 200) return 20 + ((200 - pingAvgMs) * (20 / 50));
    return 20;
  }

  static normalizeJitterScore(jitterMs) {
    if (jitterMs <= 5) return 100;
    if (jitterMs <= 10) return 80 + ((10 - jitterMs) * (20 / 5));
    if (jitterMs <= 20) return 60 + ((20 - jitterMs) * (20 / 10));
    if (jitterMs <= 30) return 40 + ((30 - jitterMs) * (20 / 10));
    if (jitterMs <= 50) return 20 + ((50 - jitterMs) * (20 / 20));
    return 20;
  }

  static normalizePacketLossScore(packetLossPercent) {
    if (packetLossPercent <= 0) return 100;
    if (packetLossPercent <= 1) return 90 + ((1 - packetLossPercent) * (10 / 1));
    if (packetLossPercent <= 3) return 70 + ((3 - packetLossPercent) * (20 / 2));
    if (packetLossPercent <= 5) return 50 + ((5 - packetLossPercent) * (20 / 2));
    if (packetLossPercent <= 10) return 20 + ((10 - packetLossPercent) * (30 / 5));
    return 20;
  }

  // Calculate all scores from metrics
  static calculateScores(metrics) {
    const {
      download_speed_mbps,
      upload_speed_mbps,
      ping_avg_ms,
      jitter_ms,
      packet_loss_percent
    } = metrics;

    // Normalize each metric
    const downloadScore = this.normalizeDownloadScore(download_speed_mbps || 0);
    const uploadScore = this.normalizeUploadScore(upload_speed_mbps || 0);
    const pingScore = this.normalizePingScore(ping_avg_ms || 0);
    const jitterScore = this.normalizeJitterScore(jitter_ms || 0);
    const packetLossScore = this.normalizePacketLossScore(packet_loss_percent || 0);

    // Calculate each composite score with weights
    const networkHealthScore = Math.round(
      (downloadScore * 0.35) +
      (uploadScore * 0.20) +
      (pingScore * 0.20) +
      (jitterScore * 0.15) +
      (packetLossScore * 0.10)
    );

    const gamingScore = Math.round(
      (pingScore * 0.45) +
      (jitterScore * 0.30) +
      (packetLossScore * 0.20) +
      (downloadScore * 0.05)
    );

    const streamingScore = Math.round(
      (downloadScore * 0.60) +
      (uploadScore * 0.10) +
      (pingScore * 0.10) +
      (jitterScore * 0.10) +
      (packetLossScore * 0.10)
    );

    const videoCallScore = Math.round(
      (uploadScore * 0.30) +
      (pingScore * 0.25) +
      (jitterScore * 0.25) +
      (packetLossScore * 0.15) +
      (downloadScore * 0.05)
    );

    const browsingScore = Math.round(
      (downloadScore * 0.40) +
      (pingScore * 0.30) +
      (uploadScore * 0.10) +
      (jitterScore * 0.10) +
      (packetLossScore * 0.10)
    );

    // Clamp scores between 0 and 100
    const clamp = (score) => Math.max(0, Math.min(100, score));

    return {
      network_health_score: clamp(networkHealthScore),
      gaming_score: clamp(gamingScore),
      streaming_score: clamp(streamingScore),
      video_call_score: clamp(videoCallScore),
      browsing_score: clamp(browsingScore)
    };
  }

  // Process scoring for a test result
  static async calculateAndSaveScores(userId, testResultId) {
    // Verify ownership
    const testResult = await TestResult.findById(testResultId);
    if (!testResult) {
      throw new Error('Test result not found');
    }
    if (testResult.user_id !== userId) {
      throw new Error('Unauthorized: You do not own this test result');
    }

    // Extract required metrics
    const metrics = {
      download_speed_mbps: testResult.download_speed_mbps,
      upload_speed_mbps: testResult.upload_speed_mbps,
      ping_avg_ms: testResult.ping_avg_ms,
      jitter_ms: testResult.jitter_ms,
      packet_loss_percent: testResult.packet_loss_percent
    };

    // Validate required metrics exist (at least some of them)
    const hasAnyMetric = Object.values(metrics).some(val => val !== null && val !== undefined);
    if (!hasAnyMetric) {
      throw new Error('No network metrics found for this test result');
    }

    // Calculate scores
    const scores = this.calculateScores(metrics);

    // Update test result in database
    const updatedTestResult = await TestResult.update(testResultId, scores);

    return {
      test_result_id: testResultId,
      ...scores
    };
  }
}

module.exports = NetworkScoringService;
