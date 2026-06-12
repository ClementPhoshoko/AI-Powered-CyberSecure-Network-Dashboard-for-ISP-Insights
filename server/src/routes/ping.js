const express = require('express');
const router = express.Router();
const { 
  runPingTest, 
  getPingTestById, 
  getPingHistory, 
  getPingSummary 
} = require('../controllers/pingController');
const validateSupabaseJWT = require('../middleware/validateSupabaseJWT');

/**
 * @swagger
 * tags:
 *   name: Ping
 *   description: Ping test management
 */

/**
 * @swagger
 * /api/ping/tests:
 *   post:
 *     summary: Run a new ping test
 *     tags: [Ping]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pings
 *             properties:
 *               pings:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - sequence_number
 *                     - latency_ms
 *                   properties:
 *                     sequence_number:
 *                       type: integer
 *                     latency_ms:
 *                       type: number
 *               packet_loss_percent:
 *                 type: number
 *               test_duration_seconds:
 *                 type: integer
 *               isp_name:
 *                 type: string
 *               country:
 *                 type: string
 *               province:
 *                 type: string
 *               city:
 *                 type: string
 *               device_type:
 *                 type: string
 *               browser_name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ping test created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 */
router.post('/tests', validateSupabaseJWT, runPingTest);

/**
 * @swagger
 * /api/ping/tests/{id}:
 *   get:
 *     summary: Get a specific ping test by ID
 *     tags: [Ping]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Test result ID
 *     responses:
 *       200:
 *         description: Test result retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Test result not found
 */
router.get('/tests/:id', validateSupabaseJWT, getPingTestById);

/**
 * @swagger
 * /api/ping/history:
 *   get:
 *     summary: Get ping test history
 *     tags: [Ping]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Number of results to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of results to skip
 *     responses:
 *       200:
 *         description: History retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/history', validateSupabaseJWT, getPingHistory);

/**
 * @swagger
 * /api/ping/summary:
 *   get:
 *     summary: Get ping summary statistics
 *     tags: [Ping]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 averagePing:
 *                   type: number
 *                 averageJitter:
 *                   type: number
 *                 averagePacketLoss:
 *                   type: number
 *                 totalTests:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/summary', validateSupabaseJWT, getPingSummary);

module.exports = router;
