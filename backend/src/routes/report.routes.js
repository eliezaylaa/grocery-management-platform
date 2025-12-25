const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { verifyToken, isManager } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /api/reports/kpis:
 *   get:
 *     summary: Get all KPIs and analytics data (Manager/Admin only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: KPI data for dashboard and reports
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalRevenue:
 *                   type: object
 *                   properties:
 *                     value:
 *                       type: string
 *                     change:
 *                       type: number
 *                       description: Percentage change from last month
 *                 averageTransaction:
 *                   type: object
 *                   properties:
 *                     value:
 *                       type: string
 *                 salesGrowth:
 *                   type: object
 *                   properties:
 *                     growthRate:
 *                       type: number
 *                     thisWeek:
 *                       type: string
 *                     lastWeek:
 *                       type: string
 *                 last24Hours:
 *                   type: object
 *                   properties:
 *                     orders:
 *                       type: integer
 *                     revenue:
 *                       type: string
 *                     averagePurchase:
 *                       type: string
 *                 today:
 *                   type: object
 *                   properties:
 *                     orders:
 *                       type: integer
 *                     revenue:
 *                       type: string
 *                 medianPayment:
 *                   type: string
 *                 customers:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     newThisMonth:
 *                       type: integer
 *                 orders:
 *                   type: object
 *                   properties:
 *                     pending:
 *                       type: integer
 *                     completed:
 *                       type: integer
 *                     failed:
 *                       type: integer
 *                 topProducts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       brand:
 *                         type: string
 *                       quantitySold:
 *                         type: integer
 *                       revenue:
 *                         type: string
 *                 lowStock:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 paymentDistribution:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       method:
 *                         type: string
 *                         enum: [card, cash, paypal]
 *                       count:
 *                         type: integer
 *                       total:
 *                         type: string
 *                 dailySales:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                       dayName:
 *                         type: string
 *                       orders:
 *                         type: integer
 *                       revenue:
 *                         type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Manager access required
 */
router.get('/kpis', verifyToken, isManager, reportController.getKPIs);

module.exports = router;
