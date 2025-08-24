// Investments and Assets Routes
const express = require('express');
const router = express.Router();
const {
  getInvestmentsAssets,
  getInvestmentsAssetsByYear,
  getInvestmentsAssetsByType
} = require('../controllers/investmentsAssetsController');

// Get all investments and assets
router.get('/', getInvestmentsAssets);

// Get data for a specific year
router.get('/year/:year', getInvestmentsAssetsByYear);

// Get data by asset type
router.get('/type/:type', getInvestmentsAssetsByType);

module.exports = router;