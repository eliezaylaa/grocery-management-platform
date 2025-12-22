const express = require("express");
const router = express.Router();
const reportController = require("../controllers/report.controller");
const {
  verifyToken,
  isAdmin,
  isManager,
} = require("../middleware/auth.middleware");

// ADMIN OR MANAGER
router.get("/kpis", verifyToken, isManager, reportController.getKPIs);
router.get("/sales", verifyToken, isManager, reportController.getSalesReport);

module.exports = router;
