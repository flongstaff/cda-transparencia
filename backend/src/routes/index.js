const express = require('express');
const router = express.Router();

// Comprehensive transparency system (our main and only system)
const comprehensiveTransparencyRoutes = require('./comprehensiveTransparencyRoutes');
const staticDataRoutes = require('./staticDataRoutes');
const externalProxyRoutes = require('./externalProxyRoutes');
const externalDataRoutes = require('./externalDataRoutes');
const searchRoutes = require('./searchRoutes');
const openDataRoutes = require('./openDataRoutes');

// Main transparency portal for citizens (consolidated PostgreSQL and real documents system)
router.use('/transparency', comprehensiveTransparencyRoutes);

// Static data integration from all three data folders
router.use('/data', staticDataRoutes);

// External API proxy routes to bypass CORS issues
router.use('/external', externalProxyRoutes);

// External data source routes for comprehensive data integration
router.use('/external-data', externalDataRoutes);

// Search routes for semantic and traditional search capabilities
router.use('/search', searchRoutes);

// Open data catalog and API routes following AAIP guidelines
router.use('/open-data', openDataRoutes);

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
      external_proxy: 'active',
      external_data_sources: 'active',
      search_functionality: 'active',
      open_data_catalog: 'active'
    },
    version: '3.0.0',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;