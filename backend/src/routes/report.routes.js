const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { verifyToken, isManager } = require('../middleware/auth.middleware');

// Get KPIs - managers and admins only
router.get('/kpis', verifyToken, isManager, reportController.getKPIs);

module.exports = router;
