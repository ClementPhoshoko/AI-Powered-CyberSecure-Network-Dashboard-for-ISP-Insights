const express = require('express');
const router = express.Router();
const { getMetrics, refreshAndGetMetrics } = require('../controllers/systemMetricsController');

/**
 * @swagger
 * /api/system/metrics:
 *   get:
 *     summary: Get public system metrics
 *     description: Returns public statistics including user count, countries, uptime, and founded year
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Successful response with metrics
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
 *                     total_users:
 *                       type: number
 *                     countries_count:
 *                       type: number
 *                     uptime_percentage:
 *                       type: number
 *                     founded_year:
 *                       type: number
 */
router.get('/metrics', getMetrics);

/**
 * @swagger
 * /api/system/metrics/refresh:
 *   post:
 *     summary: Refresh and get system metrics
 *     description: Refreshes metrics from the database and returns updated values
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Successful response with refreshed metrics
 */
router.post('/metrics/refresh', refreshAndGetMetrics);

module.exports = router;
