const express = require('express');
const AuditTrailController = require('../controllers/AuditTrailController');
const { rateLimit } = require('express-rate-limit');

const router = express.Router();
const auditTrailController = new AuditTrailController();

// Rate limiting for audit report generation (very strict due to resource intensity)
const auditReportRateLimit = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 3, // Limit each IP to 3 audit report generations per 30 minutes
  message: {
    success: false,
    error: 'Audit report generation is resource intensive. Please try again later.'
  }
});

// Audit trail endpoints
router.post('/generate-report', auditReportRateLimit, auditTrailController.generateComprehensiveReport);
router.get('/trail-summary', auditTrailController.getAuditTrailSummary);

module.exports = router;