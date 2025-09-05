
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;

// Get salary data
router.get('/salaries/:year', async (req, res) => {
  try {
    const year = req.params.year;
    const dataPath = path.join(__dirname, '../../../data/salary_data_' + year + '.json');
    const data = await fs.readFile(dataPath, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(404).json({ error: 'Salary data not found for year ' + req.params.year });
  }
});

module.exports = router;
