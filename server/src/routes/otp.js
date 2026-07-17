const express = require('express');
const router = express.Router();
const { registerUser, sendOtp, verifyOtp, resetPassword, verifyLink } = require('../controllers/otpController');
const verifyTurnstile = require('../middleware/verifyTurnstile');
const rateLimit = require('express-rate-limit');

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', code: 'RATE_LIMIT_EXCEEDED', message: 'Too many OTP requests. Please try again later.' },
});

/**
 * @swagger
 * /api/otp/register:
 *   post:
 *     tags: [OTP]
 *     summary: Register a new user (no native Supabase email) and send EmailJS verification link
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       201:
 *         description: Account created, verification email sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Account created. Please check your email to verify.
 *       400:
 *         description: Invalid input or user already exists
 *       429:
 *         description: Too many requests
 */
router.post('/register', otpLimiter, verifyTurnstile, registerUser);

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: OTP sent to your email
 *       400:
 *         description: Invalid input
 *       429:
 *         description: Too many requests
 */
router.post('/send', otpLimiter, verifyTurnstile, sendOtp);

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: Verification token for password reset flow
 *                     message:
 *                       type: string
 *                       example: OTP verified successfully
 *       400:
 *         description: Invalid or expired OTP
 *       429:
 *         description: Too many requests
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
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Password has been reset successfully
 *       400:
 *         description: Invalid token or weak password
 *       429:
 *         description: Too many requests
 */
router.post('/reset-password', otpLimiter, resetPassword);

/**
 * @swagger
 * /api/otp/verify-link:
 *   get:
 *     tags: [OTP]
 *     summary: Verify email via clickable link
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Email verified successfully
 *       400:
 *         description: Invalid or expired verification link
 */
router.get('/verify-link', verifyLink);

module.exports = router;
