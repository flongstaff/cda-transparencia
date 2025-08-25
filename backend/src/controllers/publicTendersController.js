// Public Tenders Controller
const { PublicTender } = require('../models');

// Get all public tenders
const getPublicTenders = async (req, res) => {
  try {
    const tenders = await PublicTender.findAll();
    res.json(tenders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get tenders for a specific year
const getPublicTendersByYear = async (req, res) => {
  try {
    const { year } = req.params;
    const tenders = await PublicTender.findAll({
      where: { year: year }
    });
    res.json(tenders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get tenders by execution status
const getPublicTendersByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const tenders = await PublicTender.findAll({
      where: { execution_status: status }
    });
    res.json(tenders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getPublicTenders,
  getPublicTendersByYear,
  getPublicTendersByStatus
};