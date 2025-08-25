// Financial Indicators Routes
const express = require('express');
const router = express.Router();
const {
  getFinancialIndicators,
  getFinancialIndicatorsByYear,
  getFinancialIndicatorsByName
} = require('../controllers/financialIndicatorsController');

// Get all financial indicators
router.get('/', getFinancialIndicators);

// Get indicators for a specific year
router.get('/year/:year', getFinancialIndicatorsByYear);

// Get specific indicator data
router.get('/name/:name', getFinancialIndicatorsByName);

module.exports = router;