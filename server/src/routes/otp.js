const express = require('express');
const router = express.Router();
const { sendOtp, verifyOtp, resetPassword } = require('../controllers/otpController');
const rateLimit = require('express-rate-limit');

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many OTP requests. Please try again later.' },
});

/**
 * @swagger
 * /api/otp/send:
 *   post:
 *     tags: [OTP]
 *     summary: Send a verification or reset OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, purpose]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               purpose:
 *                 type: string
 *                 enum: [verify, reset]
 *     responses:
 *       200:
 *         description: OTP sent
 */
router.post('/send', otpLimiter, sendOtp);

/**
 * @swagger
 * /api/otp/verify:
 *   post:
 *     tags: [OTP]
 *     summary: Verify an OTP code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, code, purpose]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               code:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 6
 *               purpose:
 *                 type: string
 *                 enum: [verify, reset]
 *     responses:
 *       200:
 *         description: OTP verified
 */
router.post('/verify', otpLimiter, verifyOtp);

/**
 * @swagger
 * /api/otp/reset-password:
 *   post:
 *     tags: [OTP]
 *     summary: Reset password using verified OTP token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, resetToken, newPassword]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               resetToken:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password reset
 */
router.post('/reset-password', otpLimiter, resetPassword);

module.exports = router;
