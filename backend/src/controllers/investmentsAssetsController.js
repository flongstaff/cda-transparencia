// Investments and Assets Controller
const { InvestmentAsset } = require('../models');

// Get all investments and assets
const getInvestmentsAssets = async (req, res) => {
  try {
    const investments = await InvestmentAsset.findAll();
    res.json(investments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get data for a specific year
const getInvestmentsAssetsByYear = async (req, res) => {
  try {
    const { year } = req.params;
    const investments = await InvestmentAsset.findAll({
      where: { year: year }
    });
    res.json(investments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get data by asset type
const getInvestmentsAssetsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const investments = await InvestmentAsset.findAll({
      where: { asset_type: type }
    });
    res.json(investments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getInvestmentsAssets,
  getInvestmentsAssetsByYear,
  getInvestmentsAssetsByType
};