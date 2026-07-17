const express = require('express');
const validateSupabaseJWT = require('../middleware/validateSupabaseJWT');
const {
  runPortRiskAssessment,
  runStandalonePortRiskAssessment,
  getPortRiskAssessment,
  getPortRiskAssessmentByTestResult,
  getUserPortRiskAssessments,
  getPortKnowledgeBase
} = require('../controllers/portRiskController');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Port Risk
 *   description: Port scanning and security risk assessment
 */

/**
 * @swagger
 * /api/port-risk/assess:
 *   post:
 *     summary: Run port risk assessment
 *     tags: [Port Risk]
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
 *                 description: ID of the test result to assess
 *     responses:
 *       200:
 *         description: Port risk assessment completed successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Test result not found
 */
router.post('/assess', validateSupabaseJWT, runPortRiskAssessment);

/**
 * @swagger
 * /api/port-risk/standalone:
 *   post:
 *     summary: Run standalone port risk assessment (no speed test required)
 *     tags: [Port Risk]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ip_address:
 *                 type: string
 *                 description: Optional custom IP address to scan (defaults to user's public IP)
 *     responses:
 *       200:
 *         description: Standalone port risk assessment completed successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 */
router.post('/standalone', validateSupabaseJWT, runStandalonePortRiskAssessment);

/**
 * @swagger
 * /api/port-risk/assessment/{id}:
 *   get:
 *     summary: Get port risk assessment by ID
 *     tags: [Port Risk]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Assessment ID
 *     responses:
 *       200:
 *         description: Port risk assessment retrieved
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
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     test_result_id:
 *                       type: string
 *                       format: uuid
 *                     ip_address:
 *                       type: string
 *                     overall_risk:
 *                       type: string
 *                       enum: [critical, high, medium, low]
 *                     open_ports:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           port:
 *                             type: integer
 *                           service:
 *                             type: string
 *                           risk:
 *                             type: string
 *                           description:
 *                             type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Assessment not found
 */
router.get('/assessment/:id', validateSupabaseJWT, getPortRiskAssessment);

/**
 * @swagger
 * /api/port-risk/test-result/{testResultId}:
 *   get:
 *     summary: Get port risk assessment by test result ID
 *     tags: [Port Risk]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: testResultId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Test result ID
 *     responses:
 *       200:
 *         description: Port risk assessment retrieved
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
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     test_result_id:
 *                       type: string
 *                       format: uuid
 *                     ip_address:
 *                       type: string
 *                     overall_risk:
 *                       type: string
 *                       enum: [critical, high, medium, low]
 *                     open_ports:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           port:
 *                             type: integer
 *                           service:
 *                             type: string
 *                           risk:
 *                             type: string
 *                           description:
 *                             type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Assessment not found
 */
router.get('/test-result/:testResultId', validateSupabaseJWT, getPortRiskAssessmentByTestResult);

/**
 * @swagger
 * /api/port-risk/assessments:
 *   get:
 *     summary: Get all port risk assessments for current user
 *     tags: [Port Risk]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of port risk assessments
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
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       test_result_id:
 *                         type: string
 *                         format: uuid
 *                       ip_address:
 *                         type: string
 *                       overall_risk:
 *                         type: string
 *                         enum: [critical, high, medium, low]
 *                       open_ports_count:
 *                         type: integer
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 */
router.get('/assessments', validateSupabaseJWT, getUserPortRiskAssessments);

/**
 * @swagger
 * /api/port-risk/knowledge-base:
 *   get:
 *     summary: Get port knowledge base (common ports and risk levels)
 *     tags: [Port Risk]
 *     responses:
 *       200:
 *         description: Port knowledge base retrieved
 */
router.get('/knowledge-base', getPortKnowledgeBase);

module.exports = router;