// Financial Indicators Controller
const { FinancialIndicator } = require('../models');

// Get all financial indicators
const getFinancialIndicators = async (req, res) => {
  try {
    const indicators = await FinancialIndicator.findAll();
    res.json(indicators);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get indicators for a specific year
const getFinancialIndicatorsByYear = async (req, res) => {
  try {
    const { year } = req.params;
    const indicators = await FinancialIndicator.findAll({
      where: { year: year }
    });
    res.json(indicators);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get specific indicator data
const getFinancialIndicatorsByName = async (req, res) => {
  try {
    const { name } = req.params;
    const indicators = await FinancialIndicator.findAll({
      where: { indicator_name: name }
    });
    res.json(indicators);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getFinancialIndicators,
  getFinancialIndicatorsByYear,
  getFinancialIndicatorsByName
};