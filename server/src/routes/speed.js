const express = require('express');
const router = express.Router();
const {
  streamDownloadTest,
  submitDownloadResult,
  submitMultipleDownloadResults
} = require('../controllers/speedController');
const validateSupabaseJWT = require('../middleware/validateSupabaseJWT');

/**
 * @swagger
 * tags:
 *   name: Speed
 *   description: Download speed test endpoints
 */

/**
 * @swagger
 * /api/speed/download:
 *   get:
 *     summary: Stream binary data for download testing
 *     tags: [Speed]
 *     parameters:
 *       - in: query
 *         name: sizeMb
 *         schema:
 *           type: integer
 *           enum: [1, 5, 10, 20]
 *         required: true
 *         description: Size of test file in MB
 *     responses:
 *       200:
 *         description: Binary data stream
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid size parameter
 */
router.get('/download', streamDownloadTest);

/**
 * @swagger
 * /api/speed/tests/download:
 *   post:
 *     summary: Submit client-measured download test results
 *     tags: [Speed]
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
 *               - download_speed_mbps
 *               - file_size_mb
 *               - test_duration_seconds
 *             properties:
 *               test_result_id:
 *                 type: string
 *                 format: uuid
 *               download_speed_mbps:
 *                 type: number
 *                 minimum: 0
 *                 exclusiveMinimum: true
 *               file_size_mb:
 *                 type: integer
 *                 enum: [1, 5, 10, 20]
 *               test_duration_seconds:
 *                 type: number
 *                 minimum: 0
 *                 exclusiveMinimum: true
 *     responses:
 *       200:
 *         description: Test result updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Test result not found
 */
router.post('/tests/download', validateSupabaseJWT, submitDownloadResult);

/**
 * @swagger
 * /api/speed/tests/download/bulk:
 *   post:
 *     summary: Submit multiple client-measured download test results (full sequence)
 *     tags: [Speed]
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
 *               - final_result
 *               - all_measurements
 *             properties:
 *               test_result_id:
 *                 type: string
 *                 format: uuid
 *               final_result:
 *                 type: object
 *                 required:
 *                   - download_speed_mbps
 *                   - file_size_mb
 *                   - test_duration_seconds
 *                 properties:
 *                   download_speed_mbps:
 *                     type: number
 *                     minimum: 0
 *                     exclusiveMinimum: true
 *                   file_size_mb:
 *                     type: integer
 *                     enum: [1, 5, 10, 20]
 *                   test_duration_seconds:
 *                     type: number
 *                     minimum: 0
 *                     exclusiveMinimum: true
 *               all_measurements:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - file_size_mb
 *                     - download_speed_mbps
 *                     - test_duration_seconds
 *                   properties:
 *                     file_size_mb:
 *                       type: integer
 *                       enum: [1, 5, 10, 20]
 *                     download_speed_mbps:
 *                       type: number
 *                       minimum: 0
 *                       exclusiveMinimum: true
 *                     test_duration_seconds:
 *                       type: number
 *                       minimum: 0
 *                       exclusiveMinimum: true
 *     responses:
 *       200:
 *         description: Test result and measurements saved successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Test result not found
 */
router.post('/tests/download/bulk', validateSupabaseJWT, submitMultipleDownloadResults);

module.exports = router;
