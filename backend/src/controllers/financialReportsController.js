// Financial Reports Controller
const { FinancialReport } = require('../models');

// Get all financial reports
const getFinancialReports = async (req, res) => {
  try {
    const reports = await FinancialReport.findAll();
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get reports for a specific year
const getFinancialReportsByYear = async (req, res) => {
  try {
    const { year } = req.params;
    const reports = await FinancialReport.findAll({
      where: { year: year }
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get reports for a specific year and quarter
const getFinancialReportsByYearAndQuarter = async (req, res) => {
  try {
    const { year, quarter } = req.params;
    const reports = await FinancialReport.findAll({
      where: { 
        year: year,
        quarter: quarter
      }
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getFinancialReports,
  getFinancialReportsByYear,
  getFinancialReportsByYearAndQuarter
};