const express = require('express');
const router = express.Router();
const { getSubscriber, subscribe, updateSubscription, unsubscribe } = require('../controllers/subscriberController');
const validateSupabaseJWT = require('../middleware/validateSupabaseJWT');

/**
 * @swagger
 * tags:
 *   name: Subscribers
 *   description: Newsletter subscription management
 */

/**
 * @swagger
 * /api/subscriber:
 *   get:
 *     summary: Get current user's subscription info
 *     tags: [Subscribers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscriber info retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', validateSupabaseJWT, getSubscriber);

/**
 * @swagger
 * /api/subscriber:
 *   post:
 *     summary: Subscribe current user
 *     tags: [Subscribers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address for subscription
 *               first_name:
 *                 type: string
 *                 description: First name of subscriber
 *               last_name:
 *                 type: string
 *                 description: Last name of subscriber
 *               status:
 *                 type: string
 *                 enum: [active, inactive, unsubscribed]
 *                 description: Subscription status
 *     responses:
 *       201:
 *         description: Subscribed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Already subscribed
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', validateSupabaseJWT, subscribe);

/**
 * @swagger
 * /api/subscriber:
 *   put:
 *     summary: Update current user's subscription
 *     tags: [Subscribers]
 *     security:
 *       - bearerAuth: []
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
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive, unsubscribed]
 *     responses:
 *       200:
 *         description: Subscription updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Subscriber not found
 *       500:
 *         description: Server error
 */
router.put('/', validateSupabaseJWT, updateSubscription);

/**
 * @swagger
 * /api/subscriber:
 *   delete:
 *     summary: Unsubscribe current user
 *     tags: [Subscribers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unsubscribed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Subscriber not found
 *       500:
 *         description: Server error
 */
router.delete('/', validateSupabaseJWT, unsubscribe);

module.exports = router;
