const { GoogleGenerativeAI } = require('@google/generative-ai');
const TestResult = require('../models/TestResult');
require('dotenv').config({ path: './src/.env' });

class AiSummaryService {
  // Rule-based fallback generator (CRITICAL SAFETY NET)
  static generateRuleBasedSummary(metrics) {
    // Determine overall quality
    let quality;
    if (metrics.network_health_score >= 85) quality = 'excellent';
    else if (metrics.network_health_score >= 70) quality = 'good';
    else if (metrics.network_health_score >= 50) quality = 'fair';
    else quality = 'poor';

    // Determine suitability for each use case
    const suitability = [];
    if (metrics.gaming_score >= 70) suitability.push('gaming');
    if (metrics.streaming_score >= 70) suitability.push('streaming');
    if (metrics.video_call_score >= 70) suitability.push('video calls');

    // Build summary
    if (suitability.length === 3) {
      return `Your connection is ${quality} overall. It performs well for gaming, streaming, and video calls, providing a smooth experience for all your online activities.`;
    } else if (suitability.length === 2) {
      return `Your connection is ${quality}. It is suitable for ${suitability.join(' and ')}, but may have some limitations in other areas.`;
    } else if (suitability.length === 1) {
      return `Your connection is ${quality}. It is suitable for ${suitability[0]}, but you may experience issues with other online activities.`;
    } else {
      return `Your connection is ${quality}. You may experience issues with gaming, streaming, and video calls. Browsing may also be slower than expected.`;
    }
  }

  // Gemini API client
  static async generateGeminiSummary(metrics) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
You are a network performance summarizer. You will be given network metrics and scores, and you must generate a friendly, human-readable summary (2-4 sentences).

RULES:
- ONLY use the provided metrics and scores. DO NOT calculate anything new.
- Describe overall network quality (excellent, good, fair, poor) based on network_health_score.
- Mention suitability for gaming, streaming, and video calls based on their respective scores.
- Highlight strengths and weaknesses without listing every single raw number.
- Keep it natural and conversational, not robotic.

METRICS AND SCORES:
- Download speed: ${metrics.download_speed_mbps || 'N/A'} Mbps
- Upload speed: ${metrics.upload_speed_mbps || 'N/A'} Mbps
- Ping: ${metrics.ping_avg_ms || 'N/A'} ms
- Jitter: ${metrics.jitter_ms || 'N/A'} ms
- Packet loss: ${metrics.packet_loss_percent || 'N/A'}%
- Network health score: ${metrics.network_health_score || 0}/100
- Gaming score: ${metrics.gaming_score || 0}/100
- Streaming score: ${metrics.streaming_score || 0}/100
- Video call score: ${metrics.video_call_score || 0}/100
- Browsing score: ${metrics.browsing_score || 0}/100

Please return ONLY the summary text, no extra formatting or JSON.
    `.trim();

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    return text.trim();
  }

  // Main method to generate summary with fallbacks
  static async generateSummary(userId, testResultId) {
    // Fetch test result and verify ownership
    const testResult = await TestResult.findById(testResultId);
    if (!testResult) {
      throw new Error('Test result not found');
    }
    if (testResult.user_id !== userId) {
      throw new Error('Unauthorized: You do not own this test result');
    }

    // Extract metrics and scores
    const metrics = {
      download_speed_mbps: testResult.download_speed_mbps,
      upload_speed_mbps: testResult.upload_speed_mbps,
      ping_avg_ms: testResult.ping_avg_ms,
      jitter_ms: testResult.jitter_ms,
      packet_loss_percent: testResult.packet_loss_percent,
      network_health_score: testResult.network_health_score,
      gaming_score: testResult.gaming_score,
      streaming_score: testResult.streaming_score,
      video_call_score: testResult.video_call_score,
      browsing_score: testResult.browsing_score
    };

    let summary;
    try {
      // Try primary provider (Gemini)
      summary = await AiSummaryService.generateGeminiSummary(metrics);
    } catch (error) {
      console.warn('Gemini API failed, using rule-based fallback:', error.message);
      // Fallback to rule-based
      summary = AiSummaryService.generateRuleBasedSummary(metrics);
    }

    // Save summary to database
    await TestResult.update(testResultId, { ai_summary: summary });

    return { ai_summary: summary };
  }
}

module.exports = AiSummaryService;
