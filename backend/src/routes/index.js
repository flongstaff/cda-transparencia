const express = require('express');
const router = express.Router();

// Comprehensive transparency system (our main and only system)
const comprehensiveTransparencyRoutes = require('./comprehensiveTransparencyRoutes');
const staticDataRoutes = require('./staticDataRoutes');
const externalProxyRoutes = require('./externalProxyRoutes');

// Main transparency portal for citizens (consolidated PostgreSQL and real documents system)
router.use('/transparency', comprehensiveTransparencyRoutes);

// Static data integration from all three data folders
router.use('/data', staticDataRoutes);

// External API proxy routes to bypass CORS issues
router.use('/external', externalProxyRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'Carmen de Areco Comprehensive Transparency API is operational',
    services: {
      comprehensive_transparency: 'active',
      document_management: 'active',
      budget_analysis: 'active',
      citizen_portal: 'active',
      external_proxy: 'active'
    },
    version: '3.0.0',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;