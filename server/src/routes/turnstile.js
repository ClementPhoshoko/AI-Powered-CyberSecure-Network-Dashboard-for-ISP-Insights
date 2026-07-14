const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const verifyTurnstile = require('../middleware/verifyTurnstile');

const turnstileLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', code: 'RATE_LIMIT_EXCEEDED', message: 'Too many verification attempts. Please try again later.' },
});

/**
 * @swagger
 * /api/turnstile/verify:
 *   post:
 *     tags: [Turnstile]
 *     summary: Verify a Cloudflare Turnstile token (for client-only flows like Login and Contact)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [turnstileToken]
 *             properties:
 *               turnstileToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Captcha verified
 *       400:
 *         description: Token missing
 *       403:
 *         description: Verification failed
 */
router.post('/verify', turnstileLimiter, verifyTurnstile, (req, res) => {
  res.status(200).json({ status: 'success', message: 'Captcha verified' });
});

module.exports = router;
