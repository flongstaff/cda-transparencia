// Operational Expenses Controller
const { OperationalExpense } = require('../models');

// Get all operational expenses
const getOperationalExpenses = async (req, res) => {
  try {
    const expenses = await OperationalExpense.findAll();
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get expenses for a specific year
const getOperationalExpensesByYear = async (req, res) => {
  try {
    const { year } = req.params;
    const expenses = await OperationalExpense.findAll({
      where: { year: year }
    });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get expenses by category
const getOperationalExpensesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const expenses = await OperationalExpense.findAll({
      where: { category: category }
    });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getOperationalExpenses,
  getOperationalExpensesByYear,
  getOperationalExpensesByCategory
};