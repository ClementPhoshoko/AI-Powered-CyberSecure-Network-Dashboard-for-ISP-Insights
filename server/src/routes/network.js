const express = require('express');
const router = express.Router();
const { calculateNetworkScores } = require('../controllers/networkScoringController');
const { generateSummary } = require('../controllers/aiSummary.controller');
const validateSupabaseJWT = require('../middleware/validateSupabaseJWT');

/**
 * @swagger
 * tags:
 *   - name: Network Scoring
 *     description: Network scoring and health assessment endpoints
 *   - name: Network AI Summary
 *     description: AI-generated network performance summaries
 */

/**
 * @swagger
 * /api/network/score:
 *   post:
 *     summary: Calculate and save derived network scores for a test result
 *     tags: [Network Scoring]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - test_result_id
 *             properties:
 *               test_result_id:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of the test result to calculate scores for
 *     responses:
 *       200:
 *         description: Scores calculated and saved successfully
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
 *                     test_result_id:
 *                       type: string
 *                       format: uuid
 *                     network_health_score:
 *                       type: integer
 *                       minimum: 0
 *                       maximum: 100
 *                     gaming_score:
 *                       type: integer
 *                       minimum: 0
 *                       maximum: 100
 *                     streaming_score:
 *                       type: integer
 *                       minimum: 0
 *                       maximum: 100
 *                     video_call_score:
 *                       type: integer
 *                       minimum: 0
 *                       maximum: 100
 *                     browsing_score:
 *                       type: integer
 *                       minimum: 0
 *                       maximum: 100
 *                     score_method:
 *                       type: string
 *                       example: derived-http-probe-estimate
 *                     score_confidence_label:
 *                       type: string
 *                       example: medium
 *                     score_confidence_value:
 *                       type: number
 *                       example: 60
 *                     score_explanation:
 *                       type: string
 *                       description: Explains that the scores are derived from throughput plus HTTP probe metrics
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Test result not found
 */
router.post('/score', validateSupabaseJWT, calculateNetworkScores);

/**
 * @swagger
 * /api/network/summary:
 *   post:
 *     summary: Generate and save AI summary for a test result
 *     tags: [Network AI Summary]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - test_result_id
 *             properties:
 *               test_result_id:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of the test result to generate a summary for
 *     responses:
 *       200:
 *         description: Summary generated and saved successfully
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
 *                     ai_summary:
 *                       type: string
 *                       description: Human-readable AI-generated summary of network performance
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Test result not found
 */
router.post('/summary', validateSupabaseJWT, generateSummary);

module.exports = router;
