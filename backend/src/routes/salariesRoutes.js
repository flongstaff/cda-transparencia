// Salaries Routes
const express = require('express');
const router = express.Router();
const {
  getSalaries,
  getSalariesByYear,
  getSalariesByOfficial
} = require('../controllers/salariesController');

// Get all salary data
router.get('/', getSalaries);

// Get salary data for a specific year
router.get('/year/:year', getSalariesByYear);

// Get salary data for a specific official
router.get('/official/:name', getSalariesByOfficial);

module.exports = router;