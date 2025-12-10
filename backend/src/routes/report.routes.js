const express = require("express");
const router = express.Router();
const reportController = require("../controllers/report.controller");
const { verifyToken } = require("../middleware/auth.middleware");

router.get("/kpis", verifyToken, reportController.getKPIs);
router.get("/sales", verifyToken, reportController.getSalesReport);

module.exports = router;
