const { verifyTurnstileToken } = require('../services/turnstileService');

/**
 * Middleware that validates a Cloudflare Turnstile token before allowing the
 * request through. The client must send the token in the request body as
 * `turnstileToken` (or `captchaToken`).
 *
 * Missing-keys behavior:
 * - Development: if TURNSTILE_SECRET_KEY is not set, verification is SKIPPED
 *   (fail-open) so local development is not blocked before keys are configured.
 * - Production: if TURNSTILE_SECRET_KEY is not set, requests are REJECTED
 *   (fail-closed) to avoid silently disabling bot protection.
 */
async function verifyTurnstile(req, res, next) {
  const NODE_ENV = process.env.NODE_ENV || 'development';
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    if (NODE_ENV === 'production') {
      console.error('[Turnstile] TURNSTILE_SECRET_KEY not set — rejecting request (production)');
      return res.status(500).json({
        status: 'error',
        code: 'SERVER_CONFIG_ERROR',
        message: 'Server configuration error. Please try again later.',
      });
    }
    console.warn('[Turnstile] TURNSTILE_SECRET_KEY not set — skipping verification (development)');
    return next();
  }

  const token = req.body?.turnstileToken || req.body?.captchaToken;
  if (!token) {
      return res.status(400).json({
        status: 'error',
        code: 'CAPTCHA_REQUIRED',
        message: 'Captcha verification required. Please complete the challenge and try again.',
      });
  }

  try {
    const remoteip = req.headers['cf-connecting-ip'] || req.ip;
    const result = await verifyTurnstileToken(token, remoteip);

    if (!result.success) {
      console.warn('[Turnstile] Verification failed:', result['error-codes']);
      return res.status(403).json({
        status: 'error',
        code: 'CAPTCHA_FAILED',
        message: 'Captcha verification failed. Please try again.',
      });
    }

    req.turnstile = result;
    next();
  } catch (error) {
    console.error('[Turnstile] Verification error:', error.message);
    return res.status(502).json({
      status: 'error',
      code: 'CAPTCHA_UNAVAILABLE',
      message: 'Unable to verify captcha right now. Please try again.',
    });
  }
}

module.exports = verifyTurnstile;

/*
 * verifyTurnstile Middleware Notes:
 * - Protect only public form ENTRY points (login, register, send-otp, contact)
 * - Do NOT chain onto authenticated/dashboard routes
 * - Reads the token from req.body.turnstileToken (single-use); reset the widget
 *   on the client after every submit, success or failure
 */
