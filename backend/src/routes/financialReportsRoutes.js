// Financial Reports Routes
const express = require('express');
const router = express.Router();
const {
  getFinancialReports,
  getFinancialReportsByYear,
  getFinancialReportsByYearAndQuarter
} = require('../controllers/financialReportsController');

// Get all financial reports
router.get('/', getFinancialReports);

// Get reports for a specific year
router.get('/year/:year', getFinancialReportsByYear);

// Get reports for a specific year and quarter
router.get('/year/:year/quarter/:quarter', getFinancialReportsByYearAndQuarter);

module.exports = router;