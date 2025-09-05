// Anomaly Detection Routes
const express = require('express');
const router = express.Router();
const AnomalyDetectionController = require('../controllers/AnomalyDetectionController');

// Initialize the controller
const anomalyDetectionController = new AnomalyDetectionController();

// Route to detect financial anomalies
router.post('/financial', anomalyDetectionController.detectFinancialAnomalies);

// Route to detect salary anomalies
router.post('/salary', anomalyDetectionController.detectSalaryAnomalies);

// Route to detect tender anomalies
router.post('/tender', anomalyDetectionController.detectTenderAnomalies);

// Route to generate comprehensive anomaly report
router.post('/report', anomalyDetectionController.generateComprehensiveReport);

// Route to validate configuration
router.get('/config/validate', anomalyDetectionController.validateConfiguration);

// Route to get system status
router.get('/status', anomalyDetectionController.getSystemStatus);

module.exports = router;
