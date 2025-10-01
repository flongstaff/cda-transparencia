const express = require('express');
const router = express.Router();
const ExternalDataSourceService = require('../services/ExternalDataSourceService');

// Initialize the external data source service
const externalDataService = new ExternalDataSourceService();

// Get comprehensive external data from all sources
router.get('/comprehensive', async (req, res) => {
  try {
    const data = await externalDataService.getComprehensiveExternalData();
    
    res.json({
      success: true,
      data: data,
      responseTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ External data comprehensive fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      responseTime: new Date().toISOString()
    });
  }
});

// Get national-level data
router.get('/national', async (req, res) => {
  try {
    const nationalData = await externalDataService.getNationalData();
    
    res.json({
      success: true,
      data: nationalData,
      source: 'national',
      responseTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ External data national fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      source: 'national',
      responseTime: new Date().toISOString()
    });
  }
});

// Get provincial-level data
router.get('/provincial', async (req, res) => {
  try {
    const provincialData = await externalDataService.getProvincialData();
    
    res.json({
      success: true,
      data: provincialData,
      source: 'provincial',
      responseTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ External data provincial fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      source: 'provincial',
      responseTime: new Date().toISOString()
    });
  }
});

// Get municipal-level data
router.get('/municipal', async (req, res) => {
  try {
    const municipalData = await externalDataService.getMunicipalData();
    
    res.json({
      success: true,
      data: municipalData,
      source: 'municipal',
      responseTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ External data municipal fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      source: 'municipal',
      responseTime: new Date().toISOString()
    });
  }
});

// Get organization-level data
router.get('/organizations', async (req, res) => {
  try {
    const organizationData = await externalDataService.getOrganizationData();
    
    res.json({
      success: true,
      data: organizationData,
      source: 'organizations',
      responseTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ External data organizations fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      source: 'organizations',
      responseTime: new Date().toISOString()
    });
  }
});

// Get API endpoints data
router.get('/api-endpoints', async (req, res) => {
  try {
    const endpointData = await externalDataService.getApiEndpoints();
    
    res.json({
      success: true,
      data: endpointData,
      source: 'api-endpoints',
      responseTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ External data API endpoints fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      source: 'api-endpoints',
      responseTime: new Date().toISOString()
    });
  }
});

// Get summary statistics
router.get('/summary', async (req, res) => {
  try {
    const stats = await externalDataService.getSummaryStats();
    
    res.json({
      success: true,
      data: stats,
      responseTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ External data summary fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      responseTime: new Date().toISOString()
    });
  }
});

// Health check for external data sources
router.get('/health', async (req, res) => {
  try {
    const stats = await externalDataService.getSummaryStats();
    
    res.json({
      success: true,
      health: {
        status: stats.health >= 70 ? 'good' : stats.health >= 40 ? 'fair' : 'poor',
        score: stats.health,
        available_sources: stats.summary.total_data_sources,
        total_possible_sources: 15
      },
      responseTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ External data health check error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      responseTime: new Date().toISOString()
    });
  }
});

// Clear cache endpoint
router.post('/clear-cache', (req, res) => {
  try {
    externalDataService.clearCache();
    
    res.json({
      success: true,
      message: 'External data service cache cleared',
      responseTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ External data cache clear error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      responseTime: new Date().toISOString()
    });
  }
});

// Get cache statistics
router.get('/cache-stats', (req, res) => {
  try {
    const cacheStats = externalDataService.getCacheStats();
    
    res.json({
      success: true,
      data: cacheStats,
      responseTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ External data cache stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      responseTime: new Date().toISOString()
    });
  }
});

module.exports = router;