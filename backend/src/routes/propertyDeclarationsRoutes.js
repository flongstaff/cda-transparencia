// Property Declarations Routes
const express = require('express');
const router = express.Router();
const {
  getPropertyDeclarations,
  getPropertyDeclarationsByYear,
  getPropertyDeclarationsByOfficial
} = require('../controllers/propertyDeclarationsController');

// Get all property declarations
router.get('/', getPropertyDeclarations);

// Get declarations for a specific year
router.get('/year/:year', getPropertyDeclarationsByYear);

// Get declarations for a specific official
router.get('/official/:name', getPropertyDeclarationsByOfficial);

module.exports = router;