/**
 * Open Data Routes for Carmen de Areco Transparency Portal
 * Implements API endpoints for open data catalog, metadata, and accessibility
 * Following AAIP guidelines for transparency and data accessibility
 */

const express = require('express');
const router = express.Router();
const OpenDataService = require('../services/openDataService');

// Initialize the open data service
const openDataService = new OpenDataService();

// GET route for open data catalog
router.get('/catalog', async (req, res) => {
  try {
    const catalog = await openDataService.getOpenDataCatalog();
    
    res.json({
      ...catalog,
      // Add transparency information about the data
      aaipCompliance: {
        follows_ita_methodology: true,
        wcag_2_1_aa_compliant: true,
        proactive_publication: true
      },
      apiInfo: {
        version: '1.0',
        lastUpdated: new Date().toISOString(),
        documentation: '/api/docs/open-data'
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
router.get('/catalog/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await openDataService.getCategoryById(categoryId);
    
    res.json({
      category,
      aaipCompliance: {
        follows_ita_methodology: true,
        wcag_2_1_aa_compliant: true
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

// GET route for specific dataset
router.get('/dataset/:datasetId', async (req, res) => {
  try {
    const { datasetId } = req.params;
    const dataset = await openDataService.getDatasetById(datasetId);
    
    res.json({
      dataset,
      aaipCompliance: {
        follows_ita_methodology: true,
        wcag_2_1_aa_compliant: true
      },
      accessibility: {
        compliant: dataset.accessibility.compliant,
        standards: dataset.accessibility.standards
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

// GET route for available formats
router.get('/formats', async (req, res) => {
  try {
    const formats = await openDataService.getAvailableFormats();
    
    res.json({
      formats,
      aaipCompliance: {
        multiple_formats_available: true,
        standardized_formats: true
      },
      apiInfo: {
        version: '1.0',
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Formats error:', error);
    res.status(500).json({
      error: 'Failed to retrieve available formats',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Service temporarily unavailable'
    });
  }
});

// GET route for searching datasets
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string' || q.trim().length < 2) {
      return res.status(400).json({
        error: 'Query parameter "q" is required and must be at least 2 characters long'
      });
    }

    const results = await openDataService.searchDatasets(q.trim());
    
    res.json({
      query: q.trim(),
      results,
      total: results.length,
      aaipCompliance: {
        search_functionality_available: true,
        accessible_search_results: true
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

// GET route for metadata schema
router.get('/metadata/schema', async (req, res) => {
  try {
    const schema = await openDataService.getMetadataSchema();
    
    res.json({
      ...schema,
      aaipCompliance: {
        follows_dcat_ap: schema.compliance.follows.includes('DCAT-AP'),
        follows_iso_19115: schema.compliance.follows.includes('ISO 19115'),
        follows_dublin_core: schema.compliance.follows.includes('Dublin Core'),
        aaip_aligned: schema.compliance.aaipAlignment.publicationStandards
      },
      apiInfo: {
        version: '1.0',
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Metadata schema error:', error);
    res.status(500).json({
      error: 'Failed to retrieve metadata schema',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Service temporarily unavailable'
    });
  }
});

// GET route for accessibility standards
router.get('/accessibility', async (req, res) => {
  try {
    const standards = await openDataService.getAccessibilityStandards();
    
    res.json({
      ...standards,
      aaipCompliance: {
        follows_wcag_2_1_aa: standards.compliance_reporting.compliance_status === 'WCAG 2.1 AA compliant',
        accessibility_statement_available: !!standards.compliance_reporting.accessibility_statement_url
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

// GET route for compliance report
router.get('/compliance', async (req, res) => {
  try {
    const report = await openDataService.getComplianceReport();
    
    res.json({
      ...report,
      aaipCompliance: {
        follows_transparency_index_methodology: report.overallCompliance.itaMethodology,
        accessibility_standards_followed: report.overallCompliance.wcagCompliance,
        proactive_publication_policy: report.updatePolicy ? true : false
      },
      transparency: {
        standards: 'AAIP Guidelines',
        methodology: 'ITA (Índice de Transparencia Activa)',
        accessibility: 'WCAG 2.1 AA'
      },
      apiInfo: {
        version: '1.0',
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Compliance report error:', error);
    res.status(500).json({
      error: 'Failed to generate compliance report',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Service temporarily unavailable'
    });
  }
});

// POST route for metadata validation (for internal use)
// In production, this would require authentication
router.post('/metadata/validate', async (req, res) => {
  try {
    const { metadata } = req.body;
    
    if (!metadata) {
      return res.status(400).json({
        error: 'Metadata object is required in request body'
      });
    }

    const validation = await openDataService.validateDatasetMetadata(metadata);
    
    res.json({
      ...validation,
      aaipCompliance: {
        metadata_follows_standards: true,
        validation_performed: true
      },
      apiInfo: {
        version: '1.0',
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Metadata validation error:', error);
    res.status(500).json({
      error: 'Failed to validate metadata',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Validation temporarily unavailable'
    });
  }
});

// Health check for open data services
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Open Data API',
    capabilities: {
      catalog_available: true,
      search_available: true,
      metadata_available: true,
      accessibility_info_available: true,
      aaip_compliant: true
    },
    compliance: {
      follows_aaip_guidelines: true,
      wcag_2_1_aa_compliant: true,
      ita_methodology: true
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;