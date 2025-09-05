// Financial Audit Routes
const express = require('express');
const router = express.Router();
const FinancialAuditController = require('../controllers/FinancialAuditController');

// Initialize the controller
const financialAuditController = new FinancialAuditController();

// Route to perform comprehensive financial audit
router.post('/audit', financialAuditController.performFinancialAudit);

// Route to generate detailed audit report 
router.post('/report', financialAuditController.generateDetailedReport);

// Route to get audit system metrics
router.get('/metrics', financialAuditController.getAuditMetrics);

// Route to validate configuration
router.get('/config/validate', financialAuditController.validateConfiguration);

// Route to check budget compliance
router.post('/budget-compliance', financialAuditController.checkBudgetCompliance);

module.exports = router;
