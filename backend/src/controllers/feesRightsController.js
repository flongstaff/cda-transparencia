// Fees and Rights Controller
const { FeeRight } = require('../models');

// Get all fees and rights data
const getFeesRights = async (req, res) => {
  try {
    const feesRights = await FeeRight.findAll();
    res.json(feesRights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get data for a specific year
const getFeesRightsByYear = async (req, res) => {
  try {
    const { year } = req.params;
    const feesRights = await FeeRight.findAll({
      where: { year: year }
    });
    res.json(feesRights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get data by category
const getFeesRightsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const feesRights = await FeeRight.findAll({
      where: { category: category }
    });
    res.json(feesRights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getFeesRights,
  getFeesRightsByYear,
  getFeesRightsByCategory
};