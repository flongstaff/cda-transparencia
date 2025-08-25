// Property Declarations Controller
const { PropertyDeclaration } = require('../models');

// Get all property declarations
const getPropertyDeclarations = async (req, res) => {
  try {
    const declarations = await PropertyDeclaration.findAll();
    res.json(declarations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get declarations for a specific year
const getPropertyDeclarationsByYear = async (req, res) => {
  try {
    const { year } = req.params;
    const declarations = await PropertyDeclaration.findAll({
      where: { year: year }
    });
    res.json(declarations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get declarations for a specific official
const getPropertyDeclarationsByOfficial = async (req, res) => {
  try {
    const { name } = req.params;
    const declarations = await PropertyDeclaration.findAll({
      where: { official_name: name }
    });
    res.json(declarations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getPropertyDeclarations,
  getPropertyDeclarationsByYear,
  getPropertyDeclarationsByOfficial
};