// Budget Data API Routes
const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// Get budget execution data for a specific year and period
router.get('/budget-execution/:year/:quarter', async (req, res) => {
  try {
    const { year, quarter } = req.params;
    
    // Validate parameters
    if (!year || !quarter || isNaN(parseInt(year)) || isNaN(parseInt(quarter))) {
      return res.status(400).json({
        error: 'Invalid parameters',
        message: 'Year and quarter must be valid numbers'
      });
    }
    
    const yearNum = parseInt(year);
    const quarterNum = parseInt(quarter);
    
    if (quarterNum < 1 || quarterNum > 4) {
      return res.status(400).json({
        error: 'Invalid quarter',
        message: 'Quarter must be between 1 and 4'
      });
    }
    
    // Construct file path for the budget data
    const fileName = `ESTADO-DE-EJECUCION-DE-GASTOS-${yearNum}-Q${quarterNum}_parsed.json`;
    const filePath = path.join(__dirname, `../../../data/pdfs/${fileName}`);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (err) {
      return res.status(404).json({
        error: 'Budget execution data not found',
        message: `No budget execution data available for Q${quarterNum} ${yearNum}`,
        available_periods: await getAvailableBudgetPeriods()
      });
    }
    
    // Read and parse the budget data
    const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
    
    res.json({
      success: true,
      data: data,
      period: `${yearNum}-Q${quarterNum}`
    });
  } catch (error) {
    console.error('Error fetching budget execution data:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve budget execution data'
    });
  }
});

// Get available budget periods
router.get('/budget-periods', async (req, res) => {
  try {
    const periods = await getAvailableBudgetPeriods();
    const years = await getAvailableBudgetYears();
    
    res.json({
      success: true,
      data: {
        periods: periods,
        years: years
      }
    });
  } catch (error) {
    console.error('Error fetching budget periods:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve available budget periods'
    });
  }
});

// Helper function to get available budget periods
async function getAvailableBudgetPeriods() {
  try {
    const pdfDir = path.join(__dirname, `../../../data/pdfs`);
    const files = await fs.readdir(pdfDir);
    
    const periods = [];
    const regex = /ESTADO-DE-EJECUCION-DE-GASTOS-(\d{4})-Q(\d)/;
    
    for (const file of files) {
      const match = file.match(regex);
      if (match) {
        periods.push({
          year: match[1],
          quarter: match[2],
          period: `${match[1]}-Q${match[2]}`
        });
      }
    }
    
    return periods.sort((a, b) => {
      if (a.year !== b.year) {
        return b.year - a.year;
      }
      return b.quarter - a.quarter;
    });
  } catch (error) {
    console.error('Error getting available budget periods:', error);
    return [];
  }
}

// Helper function to get available budget years
async function getAvailableBudgetYears() {
  try {
    const periods = await getAvailableBudgetPeriods();
    const years = [...new Set(periods.map(p => p.year))];
    return years.sort((a, b) => b - a); // Sort descending
  } catch (error) {
    console.error('Error getting available budget years:', error);
    return [];
  }
}

module.exports = router;