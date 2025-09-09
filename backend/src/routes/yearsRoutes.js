const express = require('express');
const router = express.Router();
const PostgreSQLDataService = require('../services/PostgreSQLDataService');
const TransparencyMetricsService = require('../services/TransparencyMetricsService');

// Initialize the services
const pgService = new PostgreSQLDataService();
const metricsService = new TransparencyMetricsService();

// Get available years
router.get('/', async (req, res) => {
  try {
    const years = await pgService.getAvailableYears();
    res.json({ years });
  } catch (error) {
    console.error('Error fetching available years:', error);
    res.status(500).json({ error: 'Error fetching available years' });
  }
});

// Get complete data for a specific year - NEW endpoint that fetches ALL data in parallel
router.get('/:year', async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    
    if (!year || isNaN(year)) {
      return res.status(400).json({ error: 'Invalid year' });
    }

    // Fetch all data in parallel
    const [yearData, metrics] = await Promise.all([
      pgService.getFullYearData(year),
      metricsService.getTransparencyDashboard(year)
    ]);

    res.json({
      ...yearData,
      metrics,
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error loading yearly data:', error);
    res.status(500).json({
      error: 'Failed to load data for year',
      details: error.message
    });
  }
});

// Get documents for a specific year (keeping for backward compatibility)
router.get('/:year/documents', async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    
    if (!year || isNaN(year)) {
      return res.status(400).json({ error: 'Invalid year parameter' });
    }
    
    const documents = await pgService.getDocumentsByYear(year);
    
    res.json({ documents });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents for year', details: error.message });
  }
});

// Get categories for a specific year (keeping for backward compatibility)
router.get('/:year/categories', async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    
    if (!year || isNaN(year)) {
      return res.status(400).json({ error: 'Invalid year parameter' });
    }
    
    const documents = await pgService.getDocumentsByYear(year);
    const categories = {};
    documents.forEach(doc => {
      const category = doc.category || 'Sin Categoría';
      if (!categories[category]) {
        categories[category] = 0;
      }
      categories[category]++;
    });
    
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching categories for year', details: error.message });
  }
});

module.exports = router;