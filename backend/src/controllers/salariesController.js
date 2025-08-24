// Salaries Controller
const { Salary } = require('../models');

// Get all salary data
const getSalaries = async (req, res) => {
  try {
    const salaries = await Salary.findAll();
    res.json(salaries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get salary data for a specific year
const getSalariesByYear = async (req, res) => {
  try {
    const { year } = req.params;
    const salaries = await Salary.findAll({
      where: { year: year }
    });
    res.json(salaries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get salary data for a specific official
const getSalariesByOfficial = async (req, res) => {
  try {
    const { name } = req.params;
    const salaries = await Salary.findAll({
      where: { official_name: name }
    });
    res.json(salaries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getSalaries,
  getSalariesByYear,
  getSalariesByOfficial
};