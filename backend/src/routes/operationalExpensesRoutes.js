// Operational Expenses Routes
const express = require('express');
const router = express.Router();
const {
  getOperationalExpenses,
  getOperationalExpensesByYear,
  getOperationalExpensesByCategory
} = require('../controllers/operationalExpensesController');

// Get all operational expenses
router.get('/', getOperationalExpenses);

// Get expenses for a specific year
router.get('/year/:year', getOperationalExpensesByYear);

// Get expenses by category
router.get('/category/:category', getOperationalExpensesByCategory);

module.exports = router;