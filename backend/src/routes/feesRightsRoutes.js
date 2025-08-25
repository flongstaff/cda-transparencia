// Fees and Rights Routes
const express = require('express');
const router = express.Router();
const {
  getFeesRights,
  getFeesRightsByYear,
  getFeesRightsByCategory
} = require('../controllers/feesRightsController');

// Get all fees and rights data
router.get('/', getFeesRights);

// Get data for a specific year
router.get('/year/:year', getFeesRightsByYear);

// Get data by category
router.get('/category/:category', getFeesRightsByCategory);

module.exports = router;