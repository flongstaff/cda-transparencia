const express = require('express');
const router = express.Router();

// Core routes that work with real data
const budgetRoutes = require('./budgetRoutes');
const salaryRoutes = require('./salaryRoutes');
const documentsRoutes = require('./documentsRoutes');
const yearsRoutes = require('./yearsRoutes');

// Essential financial routes
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

// Anti-corruption dashboard (works with real data)
const antiCorruptionDashboardRoutes = require('./antiCorruptionDashboardRoutes');

// Comprehensive transparency system (our main citizen portal)
const comprehensiveTransparencyRoutes = require('./comprehensiveTransparencyRoutes');

// Enhanced audit system (our new system that works with system.py data)
const enhancedAuditRoutes = require('./enhancedAuditRoutes');

// Core financial and transparency routes
router.use('/budget', budgetRoutes);
router.use('/salary', salaryRoutes);
router.use('/documents', documentsRoutes);
router.use('/years', yearsRoutes);

// Essential municipal data routes
router.use('/declarations', propertyDeclarationsRoutes);
router.use('/salaries', salariesRoutes);
router.use('/tenders', publicTendersRoutes);
router.use('/reports', financialReportsRoutes);
router.use('/treasury', treasuryMovementsRoutes);
router.use('/fees', feesRightsRoutes);
router.use('/expenses', operationalExpensesRoutes);
router.use('/debt', municipalDebtRoutes);
router.use('/investments', investmentsAssetsRoutes);
router.use('/indicators', financialIndicatorsRoutes);

// Main transparency portal for citizens (works with PostgreSQL and real documents)
router.use('/transparency', comprehensiveTransparencyRoutes);

// Enhanced audit system (works with system.py and all local audit data)
router.use('/audit', enhancedAuditRoutes);

// Anti-corruption dashboard (existing system that works)
router.use('/anti-corruption', antiCorruptionDashboardRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'Carmen de Areco Transparency API is operational',
    services: {
      transparency_portal: 'active',
      enhanced_audit: 'active',
      anti_corruption_dashboard: 'active',
      document_management: 'active'
    },
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;