const express = require('express');
const router = express.Router();
const receiptController = require('../controllers/receipt.controller');
const { verifyToken } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /api/receipts/{id}/download:
 *   get:
 *     summary: Download receipt as PDF
 *     tags: [Receipts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: PDF file
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/:id/download', verifyToken, receiptController.downloadReceiptPDF);

/**
 * @swagger
 * /api/receipts/{id}/email:
 *   post:
 *     summary: Send receipt via email
 *     tags: [Receipts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Optional - send to different email
 *     responses:
 *       200:
 *         description: Receipt sent successfully
 */
router.post('/:id/email', verifyToken, receiptController.sendReceiptEmail);

module.exports = router;
