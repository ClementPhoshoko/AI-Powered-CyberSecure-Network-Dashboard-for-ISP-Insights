const express = require('express');
const router = express.Router();
const { 
  pingHealthCheck,
  runPingTest, 
  getPingTestById, 
  getPingHistory, 
  getPingSummary 
} = require('../controllers/pingController');
const validateSupabaseJWT = require('../middleware/validateSupabaseJWT');
const optionalAuth = require('../middleware/optionalAuth');

/**
 * @swagger
 * tags:
 *   name: Ping
 *   description: HTTP probe latency test management
 */

/**
 * @swagger
 * /api/ping/health:
 *   get:
 *     summary: Simple health check used for HTTP probe latency sampling
 *     tags: [Ping]
 *     responses:
 *       200:
 *         description: Health check successful
 */
router.get('/health', pingHealthCheck);

/**
 * @swagger
 * /api/ping/tests:
 *   post:
 *     summary: Run a new HTTP probe latency test
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
 *                 description: Estimated failure rate across HTTP probe samples
 *               test_duration_seconds:
 *                 type: integer
 *               probe_method:
 *                 type: string
 *                 example: http-health
 *               probe_target:
 *                 type: string
 *                 description: HTTP endpoint targeted by the probe
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
 *         description: HTTP probe latency test created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 */
router.post('/tests', optionalAuth, runPingTest);

/**
 * @swagger
 * /api/ping/tests/{id}:
 *   get:
 *     summary: Get a specific HTTP probe latency test by ID
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
 *     summary: Get HTTP probe latency test history
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
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter tests created on or after this date
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter tests created on or before this date
 *     responses:
 *       200:
 *         description: History retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     limit:
 *                       type: integer
 *                     offset:
 *                       type: integer
 *                     total:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/history', validateSupabaseJWT, getPingHistory);

/**
 * @swagger
 * /api/ping/summary:
 *   get:
 *     summary: Get HTTP probe latency summary statistics
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
 *                   description: Average HTTP probe latency in milliseconds
 *                 averageJitter:
 *                   type: number
 *                   description: Average HTTP probe jitter in milliseconds
 *                 averagePacketLoss:
 *                   type: number
 *                   description: Average HTTP probe failure rate estimate
 *                 totalTests:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/summary', validateSupabaseJWT, getPingSummary);

module.exports = router;
