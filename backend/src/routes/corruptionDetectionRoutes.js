const express = require('express');
const CorruptionDetectionController = require('../controllers/CorruptionDetectionController');
const { rateLimit } = require('express-rate-limit');

const router = express.Router();
const corruptionController = new CorruptionDetectionController();

// Rate limiting for corruption detection endpoints (stricter due to resource intensity)
const corruptionRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs for corruption detection
  message: {
    success: false,
    error: 'Too many corruption analysis requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Analysis endpoints
router.get('/analysis/:year', corruptionRateLimit, corruptionController.getComprehensiveAnalysis);
router.get('/alerts', corruptionController.getCorruptionAlerts);
router.get('/compare-official/:year', corruptionController.compareWithOfficialData);
router.get('/dashboard', corruptionController.getDashboard);

// Python script execution endpoints (more restrictive rate limiting)
const scriptRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // Limit each IP to 5 script executions per 5 minutes
  message: {
    success: false,
    error: 'Too many script execution requests, please try again later.'
  }
});

router.post('/run-tracker', scriptRateLimit, corruptionController.runFinancialTracker);
router.post('/run-auditor', scriptRateLimit, corruptionController.runEnhancedAuditor);
router.post('/run-powerbi-extractor', scriptRateLimit, corruptionController.runPowerBIExtractor);

module.exports = router;