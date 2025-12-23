const express = require("express");
const router = express.Router();
const reportController = require("../controllers/report.controller");
const {
  verifyToken,
  isManager,
} = require("../middleware/auth.middleware");

/**
 * @swagger
 * /api/reports/kpis:
 *   get:
 *     summary: Get all KPIs for dashboard (Manager/Admin only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: KPI data
 *       403:
 *         description: Manager access required
 */
router.get("/kpis", verifyToken, isManager, reportController.getKPIs);

/**
 * @swagger
 * /api/reports/sales:
 *   get:
 *     summary: Get sales report (Manager/Admin only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of days to include in report
 *     responses:
 *       200:
 *         description: Sales report data
 *       403:
 *         description: Manager access required
 */
router.get("/sales", verifyToken, isManager, reportController.getSalesReport);

module.exports = router;
