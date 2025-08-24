// Treasury Movements Controller
const { TreasuryMovement } = require('../models');
const { Op } = require('sequelize');

// Get all treasury movements
const getTreasuryMovements = async (req, res) => {
  try {
    const movements = await TreasuryMovement.findAll();
    res.json(movements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get movements for a specific year
const getTreasuryMovementsByYear = async (req, res) => {
  try {
    const { year } = req.params;
    const movements = await TreasuryMovement.findAll({
      where: { 
        date: {
          [Op.gte]: new Date(year, 0, 1),
          [Op.lt]: new Date(year + 1, 0, 1)
        }
      }
    });
    res.json(movements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get movements by category
const getTreasuryMovementsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const movements = await TreasuryMovement.findAll({
      where: { category: category }
    });
    res.json(movements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getTreasuryMovements,
  getTreasuryMovementsByYear,
  getTreasuryMovementsByCategory
};