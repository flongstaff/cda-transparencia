// Municipal Debt Routes
const express = require('express');
const router = express.Router();
const {
  getMunicipalDebt,
  getMunicipalDebtByYear,
  getMunicipalDebtByStatus
} = require('../controllers/municipalDebtController');

// Get all municipal debt data
router.get('/', getMunicipalDebt);

// Get debt data for a specific year
router.get('/year/:year', getMunicipalDebtByYear);

// Get debt by status
router.get('/status/:status', getMunicipalDebtByStatus);

module.exports = router;