const express = require('express');
const AntiCorruptionDashboardController = require('../controllers/AntiCorruptionDashboardController');

const router = express.Router();
const dashboardController = new AntiCorruptionDashboardController();

// Dashboard endpoints
router.get('/dashboard', dashboardController.getComprehensiveDashboard);
router.get('/system-status', dashboardController.getSystemStatus);

module.exports = router;