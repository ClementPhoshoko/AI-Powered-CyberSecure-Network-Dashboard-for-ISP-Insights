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

    // Generate actionable advice
    let advice = '';
    if (metrics.was_unstable) {
      advice = ' Your connection showed noticeable speed fluctuation, which can cause lag spikes in games and dropouts in video calls. If this keeps happening, try restarting your router or moving closer to it.';
    } else if (quality === 'excellent' || quality === 'good') {
      advice = ' For the best experience, try to keep other devices from downloading large files while you game or stream.';
    } else {
      advice = ' Consider moving closer to your router or checking for Wi-Fi interference. If issues persist, you might want to restart your router.';
    }

    // Build summary
    let summary = '';
    if (suitability.length === 3) {
      summary = `Your connection looks ${quality} overall based on your measured speed and responsiveness. It appears suitable for gaming, streaming, and video calls, with smooth performance for most online activities.`;
    } else if (suitability.length === 2) {
      summary = `Your connection looks ${quality} based on your measured speed and responsiveness. It appears suitable for ${suitability.join(' and ')}, but you may notice some limits in other activities.`;
    } else if (suitability.length === 1) {
      summary = `Your connection looks ${quality} from the available test data. It appears suitable for ${suitability[0]}, but you may experience issues with other online activities.`;
    } else {
      summary = `Your connection looks ${quality} from the available test data. You may experience issues with gaming, streaming, and video calls, and browsing may also feel slower than expected.`;
    }

    return summary + advice;
  }

  // Fallback model chain — tried in order when a model returns 503 (high demand).
  // User-configured GEMINI_MODEL is tried first, then this list.
  static FALLBACK_MODELS = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-2.5-pro',
    'gemini-1.5-pro',
  ];

  // Gemini API client with automatic model fallback on 503/overload
  static async generateGeminiSummary(metrics) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const preferred = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    // Build try-order: preferred first, then remaining fallbacks
    const tryOrder = [preferred, ...this.FALLBACK_MODELS.filter(m => m !== preferred)];
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    let lastError;

    for (const modelName of tryOrder) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(buildPrompt(metrics));
        const text = result.response.text().trim();
        if (text) return text;
      } catch (err) {
        lastError = err;
        const isOverload = err.message?.includes('503') || err.message?.includes('high demand') || err.message?.includes('ResourceExhausted');
        if (isOverload && modelName !== tryOrder[tryOrder.length - 1]) {
          console.warn(`[aiSummary] Model ${modelName} overloaded, falling back to next model`);
          continue;
        }
        throw err;
      }
    }
    throw lastError || new Error('All Gemini models failed');
  }

  // Main method to generate summary with fallbacks
  static async generateSummary(userId, anonymousId, testResultId) {
    // Fetch test result and verify ownership
    const testResult = await TestResult.findById(testResultId);
    if (!testResult) {
      throw new Error('Test result not found');
    }
    const ownsTest = userId && testResult.user_id === userId;
    const ownsAnon = anonymousId && testResult.anonymous_session_id === anonymousId;
    if (!ownsTest && !ownsAnon) {
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
      browsing_score: testResult.browsing_score,
      was_unstable: testResult.was_unstable || false
    };

    let summary;
    try {
      // Try primary provider (Gemini) only if API key exists
      if (process.env.GEMINI_API_KEY) {
        summary = await AiSummaryService.generateGeminiSummary(metrics);
      } else {
        throw new Error('GEMINI_API_KEY not configured');
      }
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

// Prompt builder — standalone function outside the class
function buildPrompt(metrics) {
  return `You are a friendly network performance assistant. You will be given network metrics and scores, and you must generate a human-readable summary with actionable advice (total 3-5 sentences).

RULES:
- STRICT LIMIT: The final text MUST NOT exceed 600 characters total. 
- ONLY use the provided metrics and scores. DO NOT calculate anything new.
- Describe overall network quality (excellent, good, fair, poor) based on network_health_score.
- Mention suitability for gaming, streaming, and video calls based on their respective scores.
- Include 1-2 specific, actionable pieces of advice (e.g., move closer to router, limit other downloads, restart router, etc.)
- Highlight strengths and weaknesses without listing every single raw number.
- Keep it natural and conversational, not robotic. Explain what the current network state means in plain language.
- Avoid internal terms like probe, ICMP, transport-layer, backend timing model, or confidence metadata.
- Describe latency or responsiveness simply as responsiveness or delay.
- Keep the wording user-friendly and product-facing.
- If a metric is 'N/A', ignore it naturally. Do not say 'N/A' in the text.
- If instability_flag is true, briefly mention the connection seemed erratic and advise the user to check their router placement or restart it.
- If the connection was stable, you can note that as a positive.

METRICS AND SCORES:
- Download speed: ${metrics.download_speed_mbps || 'N/A'} Mbps
- Upload speed: ${metrics.upload_speed_mbps || 'N/A'} Mbps
- Latency: ${metrics.ping_avg_ms || 'N/A'} ms
- Stability variation: ${metrics.jitter_ms || 'N/A'} ms
- Packet loss: ${metrics.packet_loss_percent || 'N/A'}%
- Network health score: ${metrics.network_health_score || 0}/100
- Gaming score: ${metrics.gaming_score || 0}/100
- Streaming score: ${metrics.streaming_score || 0}/100
- Video call score: ${metrics.video_call_score || 0}/100
- Browsing score: ${metrics.browsing_score || 0}/100
- instability_flag: ${metrics.was_unstable}

Please return ONLY the summary text, no extra formatting, no quote marks, and no JSON.
`.trim();
}

module.exports = AiSummaryService;
