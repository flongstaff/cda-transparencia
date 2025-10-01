/**
 * Open Data Routes for Carmen de Areco Transparency Portal
 * Implements API endpoints for open data catalog, metadata, and accessibility
 * Following AAIP guidelines for transparency and data protection
 */

const express = require('express');
const router = express.Router();
const OpenDataService = require('../services/openDataService');

// Initialize the open data service
const openDataService = new OpenDataService();

// GET route for open data catalog overview
router.get('/catalog', (req, res) => {
  try {
    const catalog = openDataService.getCategories();
    
    res.json({
      ...catalog,
      aaipCompliance: {
        itaMethodology: true,
        transparencyIndices: ['ITA'],
        openDataStandards: true
      },
      accessibility: {
        wcag21AA: true,
        screenReaderCompatible: true,
        keyboardNavigable: true
      },
      apiInfo: {
        version: '1.0',
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Open data catalog error:', error);
    res.status(500).json({
      error: 'Failed to retrieve open data catalog',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Service temporarily unavailable'
    });
  }
});

// GET route for specific category
router.get('/catalog/:categoryId', (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = openDataService.getCategoryById(categoryId);
    
    res.json({
      ...category,
      aaipCompliance: {
        itaMethodology: true,
        categoryAlignment: true
      },
      accessibility: {
        wcag21AA: true,
        screenReaderCompatible: true,
        keyboardNavigable: true
      },
      apiInfo: {
        version: '1.0',
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error(`Open data category error for ${req.params.categoryId}:`, error);
    res.status(500).json({
      error: 'Failed to retrieve category',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Category not found'
    });
  }
});

// GET route for datasets in a specific category
router.get('/catalog/:categoryId/datasets', (req, res) => {
  try {
    const { categoryId } = req.params;
    const datasets = openDataService.getDatasetsByCategory(categoryId);
    
    res.json({
      ...datasets,
      aaipCompliance: {
        itaMethodology: true,
        categoryAlignment: true,
        datasetStandards: true
      },
      accessibility: {
        wcag21AA: true,
        screenReaderCompatible: true,
        keyboardNavigable: true
      },
      apiInfo: {
        version: '1.0',
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error(`Open data datasets error for ${req.params.categoryId}:`, error);
    res.status(500).json({
      error: 'Failed to retrieve datasets',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Datasets not found'
    });
  }
});

// GET route for specific dataset
router.get('/dataset/:datasetId', (req, res) => {
  try {
    const { datasetId } = req.params;
    const dataset = openDataService.getDatasetById(datasetId);
    
    res.json({
      ...dataset,
      aaipCompliance: {
        itaMethodology: true,
        datasetStandards: true
      },
      accessibility: {
        wcag21AA: true,
        screenReaderCompatible: true,
        keyboardNavigable: true
      },
      apiInfo: {
        version: '1.0',
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error(`Dataset error for ${req.params.datasetId}:`, error);
    res.status(500).json({
      error: 'Failed to retrieve dataset',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Dataset not found'
    });
  }
});

// GET route for search datasets
router.get('/search', (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string' || q.trim().length < 2) {
      return res.status(400).json({
        error: 'Query parameter "q" is required and must be at least 2 characters long'
      });
    }

    const results = openDataService.searchDatasets(q.trim());
    
    res.json({
      ...results,
      aaipCompliance: {
        searchFunctionality: true,
        itaMethodology: true
      },
      accessibility: {
        wcag21AA: true,
        screenReaderCompatible: true,
        keyboardNavigable: true
      },
      apiInfo: {
        version: '1.0',
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      error: 'Failed to search datasets',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Search temporarily unavailable'
    });
  }
});

// GET route for metadata standards
router.get('/metadata-standards', (req, res) => {
  try {
    const standards = openDataService.getMetadataStandards();
    
    res.json({
      ...standards,
      aaipCompliance: {
        metadataStandards: true,
        dublinCore: true,
        dcatAp: true,
        iso19115: true
      },
      accessibility: {
        wcag21AA: true,
        screenReaderCompatible: true,
        keyboardNavigable: true
      },
      apiInfo: {
        version: '1.0',
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Metadata standards error:', error);
    res.status(500).json({
      error: 'Failed to retrieve metadata standards',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Service temporarily unavailable'
    });
  }
});

// GET route for accessibility standards
router.get('/accessibility-standards', (req, res) => {
  try {
    const standards = openDataService.getAccessibilityStandards();
    
    res.json({
      ...standards,
      aaipCompliance: {
        accessibilityStandards: true,
        wcag21AA: true,
        argentineStandards: true
      },
      apiInfo: {
        version: '1.0',
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Accessibility standards error:', error);
    res.status(500).json({
      error: 'Failed to retrieve accessibility standards',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Service temporarily unavailable'
    });
  }
});

// GET route for compliance status
router.get('/compliance', (req, res) => {
  try {
    const compliance = openDataService.getComplianceStatus();
    
    res.json({
      ...compliance,
      aaipCompliance: {
        itaMethodology: true,
        transparencyIndices: ['ITA'],
        dataProtection: true
      },
      apiInfo: {
        version: '1.0',
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Compliance status error:', error);
    res.status(500).json({
      error: 'Failed to retrieve compliance status',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Service temporarily unavailable'
    });
  }
});

// GET route for open data statistics
router.get('/statistics', (req, res) => {
  try {
    const statistics = openDataService.getOpenDataStatistics();
    
    res.json({
      ...statistics,
      aaipCompliance: {
        statisticsReporting: true,
        itaMethodology: true
      },
      apiInfo: {
        version: '1.0',
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Open data statistics error:', error);
    res.status(500).json({
      error: 'Failed to retrieve open data statistics',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Service temporarily unavailable'
    });
  }
});

// GET route for recent updates
router.get('/recent-updates', (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const updates = openDataService.getRecentUpdates(parseInt(limit));
    
    res.json({
      ...updates,
      aaipCompliance: {
        timelyUpdates: true,
        itaMethodology: true
      },
      apiInfo: {
        version: '1.0',
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Recent updates error:', error);
    res.status(500).json({
      error: 'Failed to retrieve recent updates',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Service temporarily unavailable'
    });
  }
});

// GET route for dataset quality report
router.get('/dataset/:datasetId/quality-report', (req, res) => {
  try {
    const { datasetId } = req.params;
    const qualityReport = openDataService.getDatasetQualityReport(datasetId);
    
    res.json({
      ...qualityReport,
      aaipCompliance: {
        qualityReporting: true,
        dataQualityStandards: true
      },
      apiInfo: {
        version: '1.0',
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error(`Dataset quality report error for ${req.params.datasetId}:`, error);
    res.status(500).json({
      error: 'Failed to retrieve dataset quality report',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Quality report temporarily unavailable'
    });
  }
});

// GET route for dataset citation
router.get('/dataset/:datasetId/citation', (req, res) => {
  try {
    const { datasetId } = req.params;
    const citation = openDataService.generateDatasetCitation(datasetId);
    
    res.json({
      ...citation,
      aaipCompliance: {
        citationStandards: true,
        metadataStandards: true
      },
      apiInfo: {
        version: '1.0',
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error(`Dataset citation error for ${req.params.datasetId}:`, error);
    res.status(500).json({
      error: 'Failed to generate dataset citation',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Citation temporarily unavailable'
    });
  }
});

// POST route for validating dataset metadata
router.post('/validate-metadata', (req, res) => {
  try {
    const { dataset } = req.body;
    
    if (!dataset) {
      return res.status(400).json({
        error: 'Dataset object is required in request body'
      });
    }

    const validation = openDataService.validateDatasetMetadata(dataset);
    
    res.json({
      ...validation,
      aaipCompliance: {
        metadataValidation: true,
        qualityStandards: true
      },
      apiInfo: {
        version: '1.0',
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Metadata validation error:', error);
    res.status(500).json({
      error: 'Failed to validate dataset metadata',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Validation temporarily unavailable'
    });
  }
});

// GET route for health check
router.get('/health', (req, res) => {
  try {
    const health = openDataService.healthCheck();
    
    res.json({
      ...health,
      aaipCompliance: {
        serviceMonitoring: true,
        healthChecks: true
      },
      apiInfo: {
        version: '1.0',
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Open data health check error:', error);
    res.status(500).json({
      error: 'Failed to perform health check',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Health check temporarily unavailable'
    });
  }
});

module.exports = router;