const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { verifyToken } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /api/payments/stripe/key:
 *   get:
 *     summary: Get Stripe publishable key
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: Stripe publishable key
 */
router.get('/stripe/key', paymentController.getStripeKey);

/**
 * @swagger
 * /api/payments/stripe/create-payment-intent:
 *   post:
 *     summary: Create Stripe payment intent
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Amount in EUR
 *               currency:
 *                 type: string
 *                 default: eur
 *     responses:
 *       200:
 *         description: Payment intent created
 */
router.post('/stripe/create-payment-intent', verifyToken, paymentController.createStripePaymentIntent);

/**
 * @swagger
 * /api/payments/stripe/confirm:
 *   post:
 *     summary: Confirm Stripe payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentIntentId
 *             properties:
 *               paymentIntentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment confirmed
 */
router.post('/stripe/confirm', verifyToken, paymentController.confirmStripePayment);

/**
 * @swagger
 * /api/payments/paypal/client-id:
 *   get:
 *     summary: Get PayPal client ID
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: PayPal client ID
 */
router.get('/paypal/client-id', paymentController.getPayPalClientId);

/**
 * @swagger
 * /api/payments/paypal/create-order:
 *   post:
 *     summary: Create PayPal order
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Amount in EUR
 *               currency:
 *                 type: string
 *                 default: EUR
 *     responses:
 *       200:
 *         description: PayPal order created
 */
router.post('/paypal/create-order', verifyToken, paymentController.createPayPalOrder);

/**
 * @swagger
 * /api/payments/paypal/capture-order:
 *   post:
 *     summary: Capture PayPal order after approval
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment captured
 */
router.post('/paypal/capture-order', verifyToken, paymentController.capturePayPalOrder);

module.exports = router;
