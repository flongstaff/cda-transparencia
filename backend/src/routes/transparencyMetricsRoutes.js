const express = require('express');
const TransparencyMetricsController = require('../controllers/TransparencyMetricsController');

const router = express.Router();
const transparencyController = new TransparencyMetricsController();

// Transparency scoring endpoints
router.get('/score/:year', transparencyController.getTransparencyScore);
router.get('/red-flags/:year', transparencyController.getRedFlagAlerts);
router.get('/trends', transparencyController.getTransparencyTrends);

module.exports = router;