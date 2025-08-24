// Public Tenders Routes
const express = require('express');
const router = express.Router();
const {
  getPublicTenders,
  getPublicTendersByYear,
  getPublicTendersByStatus
} = require('../controllers/publicTendersController');

// Get all public tenders
router.get('/', getPublicTenders);

// Get tenders for a specific year
router.get('/year/:year', getPublicTendersByYear);

// Get tenders by execution status
router.get('/status/:status', getPublicTendersByStatus);

module.exports = router;