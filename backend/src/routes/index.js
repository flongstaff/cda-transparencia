const express = require('express');
const budgetRoutes = require('./budgetRoutes');
const salaryRoutes = require('./salaryRoutes');
const router = express.Router();

const fs = require('fs');
const path = require('path');

// Import all route files
const propertyDeclarationsRoutes = require('./propertyDeclarationsRoutes');
const salariesRoutes = require('./salariesRoutes');
const publicTendersRoutes = require('./publicTendersRoutes');
const financialReportsRoutes = require('./financialReportsRoutes');
const treasuryMovementsRoutes = require('./treasuryMovementsRoutes');
const feesRightsRoutes = require('./feesRightsRoutes');
const operationalExpensesRoutes = require('./operationalExpensesRoutes');
const municipalDebtRoutes = require('./municipalDebtRoutes');
const investmentsAssetsRoutes = require('./investmentsAssetsRoutes');
const financialIndicatorsRoutes = require('./financialIndicatorsRoutes');
const documentsRoutes = require('./documentsRoutes');
const powerbiRoutes = require('./powerbiRoutes');
const yearsRoutes = require('./yearsRoutes');

// Import new anti-corruption system routes
const corruptionDetectionRoutes = require('./corruptionDetectionRoutes');
const transparencyMetricsRoutes = require('./transparencyMetricsRoutes');
const auditTrailRoutes = require('./auditTrailRoutes');
const antiCorruptionDashboardRoutes = require('./antiCorruptionDashboardRoutes');
const advancedFraudDetectionRoutes = require('./advancedFraudDetectionRoutes');
const anomalyDetectionRoutes = require('./anomalyDetectionRoutes');
const financialAuditRoutes = require('./financialAuditRoutes');

// Use all routes
router.use('/declarations', propertyDeclarationsRoutes);
router.use('/tenders', publicTendersRoutes);
router.use('/reports', financialReportsRoutes);
router.use('/treasury', treasuryMovementsRoutes);
router.use('/fees', feesRightsRoutes);
router.use('/expenses', operationalExpensesRoutes);
router.use('/debt', municipalDebtRoutes);
router.use('/investments', investmentsAssetsRoutes);
router.use('/indicators', financialIndicatorsRoutes);
router.use('/documents', documentsRoutes);
router.use('/powerbi', powerbiRoutes);
router.use('/years', yearsRoutes);

// Updated routes to avoid conflicts with existing salary route
router.use('/budget-data', budgetRoutes);
router.use('/salary-data', salaryRoutes);

// Original salary route (keep for backward compatibility)
router.use('/salaries', salariesRoutes);

// Anti-corruption system routes (priority routes)
router.use('/corruption', corruptionDetectionRoutes);
router.use('/transparency', transparencyMetricsRoutes);
router.use('/audit', auditTrailRoutes);
router.use('/anti-corruption', antiCorruptionDashboardRoutes);
router.use('/advanced-fraud', advancedFraudDetectionRoutes);

// Financial audit routes
router.use('/financial-audit', financialAuditRoutes);

// Anomaly detection routes
router.use('/anomaly-detection', anomalyDetectionRoutes);

module.exports = router;
