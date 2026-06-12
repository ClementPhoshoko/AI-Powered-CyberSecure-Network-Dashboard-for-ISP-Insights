const express = require('express');
const router = express.Router();
const { devLogin } = require('../controllers/devAuthController');

/**
 * @swagger
 * tags:
 *   name: Dev Auth
 *   description: 'Development-only auth endpoints for testing! Do NOT use in production!'
 */

/**
 * @swagger
 * /dev/auth/login:
 *   post:
 *     summary: 'DEV-ONLY: Get JWT token for testing'
 *     tags: [Dev Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: test@example.com
 *               password:
 *                 type: string
 *                 example: testpassword123
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Successfully logged in, returns JWT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 access_token:
 *                   type: string
 *                 refresh_token:
 *                   type: string
 *                 expires_in:
 *                   type: integer
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *       400:
 *         description: Email/password required
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: Endpoint disabled (production mode)
 */
router.post('/login', devLogin);

module.exports = router;