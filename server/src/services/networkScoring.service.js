const TestResult = require('../models/TestResult');
const {
  DEFAULT_HTTP_SCORE_CONFIDENCE_VALUE,
  DEFAULT_HTTP_SCORE_METHOD,
  DEFAULT_HTTP_SCORE_EXPLANATION,
  getScoreContext
} = require('../utils/testResultPresentation');

class NetworkScoringService {
  static clampScore(score) {
    return Math.max(0, Math.min(100, score));
  }

  static applyConfidenceAdjustment(score, confidenceValue) {
    const confidenceFactor = Math.max(0, Math.min(1, confidenceValue / 100));
    const adjustedScore = 50 + ((score - 50) * confidenceFactor);
    return this.clampScore(Math.round(adjustedScore));
  }

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
      packet_loss_percent,
      probe_method
    } = metrics;

    // Normalize each metric
    const downloadScore = this.normalizeDownloadScore(download_speed_mbps || 0);
    const uploadScore = this.normalizeUploadScore(upload_speed_mbps || 0);
    const pingScore = this.normalizePingScore(ping_avg_ms || 0);
    const jitterScore = this.normalizeJitterScore(jitter_ms || 0);
    const packetLossScore = this.normalizePacketLossScore(packet_loss_percent || 0);

    // Calculate each composite score with weights
    const rawNetworkHealthScore = Math.round(
      (downloadScore * 0.35) +
      (uploadScore * 0.20) +
      (pingScore * 0.20) +
      (jitterScore * 0.15) +
      (packetLossScore * 0.10)
    );

    const rawGamingScore = Math.round(
      (pingScore * 0.45) +
      (jitterScore * 0.30) +
      (packetLossScore * 0.20) +
      (downloadScore * 0.05)
    );

    const rawStreamingScore = Math.round(
      (downloadScore * 0.60) +
      (uploadScore * 0.10) +
      (pingScore * 0.10) +
      (jitterScore * 0.10) +
      (packetLossScore * 0.10)
    );

    const rawVideoCallScore = Math.round(
      (uploadScore * 0.30) +
      (pingScore * 0.25) +
      (jitterScore * 0.25) +
      (packetLossScore * 0.15) +
      (downloadScore * 0.05)
    );

    const rawBrowsingScore = Math.round(
      (downloadScore * 0.40) +
      (pingScore * 0.30) +
      (uploadScore * 0.10) +
      (jitterScore * 0.10) +
      (packetLossScore * 0.10)
    );

    const scoreContext = getScoreContext({
      probe_method: probe_method || 'http-health',
      score_method: DEFAULT_HTTP_SCORE_METHOD,
      score_confidence_value: DEFAULT_HTTP_SCORE_CONFIDENCE_VALUE,
      score_explanation: DEFAULT_HTTP_SCORE_EXPLANATION
    });
    const confidenceValue = scoreContext.score_confidence_value;

    return {
      network_health_score: this.applyConfidenceAdjustment(rawNetworkHealthScore, confidenceValue),
      gaming_score: this.applyConfidenceAdjustment(rawGamingScore, confidenceValue),
      streaming_score: this.applyConfidenceAdjustment(rawStreamingScore, confidenceValue),
      video_call_score: this.applyConfidenceAdjustment(rawVideoCallScore, confidenceValue),
      browsing_score: this.applyConfidenceAdjustment(rawBrowsingScore, confidenceValue),
      score_method: scoreContext.score_method,
      score_confidence_label: scoreContext.score_confidence_label,
      score_confidence_value: scoreContext.score_confidence_value,
      score_explanation: scoreContext.score_explanation,
      score_context: scoreContext,
      raw_weighted_scores: {
        network_health_score: this.clampScore(rawNetworkHealthScore),
        gaming_score: this.clampScore(rawGamingScore),
        streaming_score: this.clampScore(rawStreamingScore),
        video_call_score: this.clampScore(rawVideoCallScore),
        browsing_score: this.clampScore(rawBrowsingScore)
      }
    };
  }

  // Process scoring for a test result
  static async calculateAndSaveScores(userId, anonymousId, testResultId) {
    // Verify ownership
    const testResult = await TestResult.findById(testResultId);
    if (!testResult) {
      throw new Error('Test result not found');
    }
    const ownsTest = userId && testResult.user_id === userId;
    const ownsAnon = anonymousId && testResult.anonymous_session_id === anonymousId;
    if (!ownsTest && !ownsAnon) {
      throw new Error('Unauthorized: You do not own this test result');
    }

    // Extract required metrics
    const metrics = {
      download_speed_mbps: testResult.download_speed_mbps,
      upload_speed_mbps: testResult.upload_speed_mbps,
      ping_avg_ms: testResult.ping_avg_ms,
      jitter_ms: testResult.jitter_ms,
      packet_loss_percent: testResult.packet_loss_percent,
      probe_method: testResult.probe_method
    };

    // Validate required metrics exist (at least some of them)
    const hasAnyMetric = Object.values(metrics).some(val => val !== null && val !== undefined);
    if (!hasAnyMetric) {
      throw new Error('No network metrics found for this test result');
    }

    // Calculate scores
    const scores = this.calculateScores(metrics);
    const persistedScores = {
      network_health_score: scores.network_health_score,
      gaming_score: scores.gaming_score,
      streaming_score: scores.streaming_score,
      video_call_score: scores.video_call_score,
      browsing_score: scores.browsing_score,
      score_method: scores.score_method,
      score_confidence_label: scores.score_confidence_label,
      score_confidence_value: scores.score_confidence_value,
      score_explanation: scores.score_explanation
    };

    // Update test result in database
    await TestResult.update(testResultId, persistedScores);

    return {
      test_result_id: testResultId,
      ...persistedScores,
      score_context: scores.score_context,
      raw_weighted_scores: scores.raw_weighted_scores
    };
  }
}

module.exports = NetworkScoringService;
