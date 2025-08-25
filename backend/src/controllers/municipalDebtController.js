// Municipal Debt Controller
const { MunicipalDebt } = require('../models');

// Get all municipal debt data
const getMunicipalDebt = async (req, res) => {
  try {
    const debt = await MunicipalDebt.findAll();
    res.json(debt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get debt data for a specific year
const getMunicipalDebtByYear = async (req, res) => {
  try {
    const { year } = req.params;
    const debt = await MunicipalDebt.findAll({
      where: { year: year }
    });
    res.json(debt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get debt by status
const getMunicipalDebtByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const debt = await MunicipalDebt.findAll({
      where: { status: status }
    });
    res.json(debt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getMunicipalDebt,
  getMunicipalDebtByYear,
  getMunicipalDebtByStatus
};