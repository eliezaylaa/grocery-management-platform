const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoice.controller");
const {
  verifyToken,
  isAdmin,
  isManager,
  isEmployee,
} = require("../middleware/auth.middleware");

/**
 * @swagger
 * components:
 *   schemas:
 *     InvoiceItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         invoiceId:
 *           type: string
 *           format: uuid
 *         productId:
 *           type: string
 *           format: uuid
 *         quantity:
 *           type: integer
 *         unitPrice:
 *           type: number
 *           format: decimal
 *         subtotal:
 *           type: number
 *           format: decimal
 *         product:
 *           $ref: '#/components/schemas/Product'
 *     Invoice:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         invoiceNumber:
 *           type: string
 *         userId:
 *           type: string
 *           format: uuid
 *         totalAmount:
 *           type: number
 *           format: decimal
 *         paymentMethod:
 *           type: string
 *           enum: [cash, card, paypal]
 *         paymentStatus:
 *           type: string
 *           enum: [pending, completed, failed, refunded]
 *         paypalTransactionId:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/User'
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/InvoiceItem'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     InvoiceInput:
 *       type: object
 *       required:
 *         - items
 *       properties:
 *         userId:
 *           type: string
 *           format: uuid
 *         paymentMethod:
 *           type: string
 *           enum: [cash, card, paypal]
 *           default: card
 *         paymentStatus:
 *           type: string
 *           enum: [pending, completed, failed, refunded]
 *           default: pending
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *                 format: uuid
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 */

/**
 * @swagger
 * /api/invoices:
 *   get:
 *     summary: Get all invoices (Admin/Manager/Employee)
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of invoices
 *       403:
 *         description: Employee access required
 */
router.get("/", verifyToken, isEmployee, invoiceController.getInvoices);

/**
 * @swagger
 * /api/invoices/my-orders:
 *   get:
 *     summary: Get current user's orders
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's invoices
 */
router.get("/my-orders", verifyToken, invoiceController.getMyInvoices);

/**
 * @swagger
 * /api/invoices:
 *   post:
 *     summary: Create a new invoice/order
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InvoiceInput'
 *     responses:
 *       201:
 *         description: Invoice created successfully
 *       400:
 *         description: Invalid input or insufficient stock
 *       404:
 *         description: Product not found
 */
router.post("/", verifyToken, invoiceController.createInvoice);

/**
 * @swagger
 * /api/invoices/{id}:
 *   put:
 *     summary: Update invoice payment status (Admin/Manager/Employee)
 *     tags: [Invoices]
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
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentStatus:
 *                 type: string
 *                 enum: [pending, completed, failed, refunded]
 *     responses:
 *       200:
 *         description: Invoice updated successfully
 *       404:
 *         description: Invoice not found
 *       403:
 *         description: Employee access required
 */
router.put("/:id", verifyToken, isEmployee, invoiceController.updateInvoice);

/**
 * @swagger
 * /api/invoices/{id}:
 *   delete:
 *     summary: Delete an invoice (Admin only)
 *     tags: [Invoices]
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
 *         description: Invoice deleted successfully
 *       404:
 *         description: Invoice not found
 *       403:
 *         description: Admin access required
 */
router.delete("/:id", verifyToken, isAdmin, invoiceController.deleteInvoice);

module.exports = router;
