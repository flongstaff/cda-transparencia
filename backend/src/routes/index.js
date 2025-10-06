const express = require('express');
const router = express.Router();

// Comprehensive transparency system (our main and only system)
const comprehensiveTransparencyRoutes = require('./comprehensiveTransparencyRoutes');
const staticDataRoutes = require('./staticDataRoutes');
const externalProxyRoutes = require('./externalProxyRoutes');
const externalDataRoutes = require('./externalDataRoutes');
const externalAPIRoutes = require('./externalAPIRoutes');
const searchRoutes = require('./searchRoutes');
const openDataRoutes = require('./openDataRoutes');
const documentRoutes = require('./documentRoutes');
const privacyRoutes = require('./privacyRoutes');
const monitoringRoutes = require('./monitoringRoutes');
const feedbackRoutes = require('./feedbackRoutes');
const carmenRoutes = require('./carmenRoutes');
const pdfExtractionRoutes = require('./pdfExtractionRoutes');
const scrapingSchedulerRoutes = require('./scrapingSchedulerRoutes');
const documentIndexRoutes = require('./documentIndexRoutes');

// Main transparency portal for citizens (consolidated PostgreSQL and real documents system)
router.use('/transparency', comprehensiveTransparencyRoutes);

// Carmen de Areco specific routes
router.use('/carmen', carmenRoutes);

// Static data integration from all three data folders
router.use('/data', staticDataRoutes);

// External API proxy routes to bypass CORS issues
router.use('/external', externalProxyRoutes);

// External data source routes for comprehensive data integration
router.use('/external-data', externalDataRoutes);

// External API routes for government data sources (Georef, Presupuesto, etc.)
router.use('/external-api', externalAPIRoutes);

// Search routes for semantic and traditional search capabilities
router.use('/search', searchRoutes);

// Open data catalog and API routes following AAIP guidelines
router.use('/open-data', openDataRoutes);

// Document analysis routes for intelligent document processing
router.use('/documents', documentRoutes);

// Privacy and data protection routes following AAIP guidelines
router.use('/privacy', privacyRoutes);

// Monitoring and evaluation routes for system performance and compliance
router.use('/monitoring', monitoringRoutes);

// User feedback routes for collecting and managing user input
router.use('/feedback', feedbackRoutes);

// PDF extraction routes for document processing
router.use('/pdf-extraction', pdfExtractionRoutes);

// Scraping scheduler routes for automated tasks
router.use('/scraping-scheduler', scrapingSchedulerRoutes);

// Document indexing routes for document management and search
router.use('/document-index', documentIndexRoutes);

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
      open_data_catalog: 'active',
      document_analysis: 'active',
      privacy_protection: 'active',
      monitoring_evaluation: 'active',
      user_feedback: 'active'
    },
    version: '3.0.0',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;