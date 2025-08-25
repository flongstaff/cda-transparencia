// Treasury Movements Routes
const express = require('express');
const router = express.Router();
const {
  getTreasuryMovements,
  getTreasuryMovementsByYear,
  getTreasuryMovementsByCategory
} = require('../controllers/treasuryMovementsController');

// Get all treasury movements
router.get('/', getTreasuryMovements);

// Get movements for a specific year
router.get('/year/:year', getTreasuryMovementsByYear);

// Get movements by category
router.get('/category/:category', getTreasuryMovementsByCategory);

module.exports = router;