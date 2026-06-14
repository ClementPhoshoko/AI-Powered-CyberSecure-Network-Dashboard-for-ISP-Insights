const express = require('express');
const router = express.Router();
const { calculateNetworkScores } = require('../controllers/networkScoringController');
const validateSupabaseJWT = require('../middleware/validateSupabaseJWT');

/**
 * @swagger
 * tags:
 *   name: Network Scoring
 *   description: Network scoring and health assessment endpoints
 */

/**
 * @swagger
 * /api/network/score:
 *   post:
 *     summary: Calculate and save network scores for a test result
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
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Test result not found
 */
router.post('/score', validateSupabaseJWT, calculateNetworkScores);

module.exports = router;
