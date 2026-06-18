const express = require('express');
const router = express.Router();
const {
  getOverview,
  getHistory,
  getTestDetails,
  getAnomalies
} = require('../controllers/analytics.controller');
const validateSupabaseJWT = require('../middleware/validateSupabaseJWT');

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Network analytics and insights endpoints
 */

/**
 * @swagger
 * /api/analytics/overview:
 *   get:
 *     summary: Get high-level summary of user network performance
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Overview data retrieved successfully
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
 *                     total_tests:
 *                       type: integer
 *                       example: 42
 *                     avg_download_mbps:
 *                       type: number
 *                       example: 45.5
 *                     avg_upload_mbps:
 *                       type: number
 *                       example: 12.3
 *                     avg_ping_ms:
 *                       type: number
 *                       example: 25.7
 *                       description: Average HTTP probe latency
 *                     avg_jitter_ms:
 *                       type: number
 *                       example: 5.2
 *                       description: Average HTTP probe jitter
 *                     avg_packet_loss_percent:
 *                       type: number
 *                       example: 0.5
 *                       description: Average HTTP probe failure rate estimate
 *                     best_network_health_score:
 *                       type: integer
 *                       example: 92
 *                     worst_network_health_score:
 *                       type: integer
 *                       example: 65
 *       401:
 *         description: Unauthorized
 */
router.get('/overview', validateSupabaseJWT, getOverview);

/**
 * @swagger
 * /api/analytics/history:
 *   get:
 *     summary: Get time-series data for graphs
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: range
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d]
 *           default: 30d
 *         description: Time range to retrieve history for
 *     responses:
 *       200:
 *         description: History data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                         example: 2026-06-01
 *                       avg_download:
 *                         type: number
 *                         example: 40
 *                       avg_upload:
 *                         type: number
 *                         example: 10
 *                       avg_ping:
 *                         type: number
 *                         example: 20
 *                         description: Daily average HTTP probe latency
 *                       avg_health_score:
 *                         type: integer
 *                         example: 85
 *       401:
 *         description: Unauthorized
 */
router.get('/history', validateSupabaseJWT, getHistory);

/**
 * @swagger
 * /api/analytics/test/{test_result_id}:
 *   get:
 *     summary: Get full detailed breakdown of a single test
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: test_result_id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: UUID of the test result
 *     responses:
 *       200:
 *         description: Test details retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Test result not found
 */
router.get('/test/:test_result_id', validateSupabaseJWT, getTestDetails);

/**
 * @swagger
 * /api/analytics/anomalies:
 *   get:
 *     summary: Detect and return network issues automatically
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Anomalies retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       test_result_id:
 *                         type: string
 *                         format: uuid
 *                       type:
 *                         type: string
 *                         enum: [high_latency, instability, packet_loss, slow_connection]
 *                       severity:
 *                         type: string
 *                         enum: [low, medium, high]
 *                       description:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 */
router.get('/anomalies', validateSupabaseJWT, getAnomalies);

module.exports = router;
