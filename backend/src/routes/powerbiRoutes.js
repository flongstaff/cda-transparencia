const express = require('express');
const router = express.Router();
const PowerBIController = require('../controllers/PowerBIController');

// Power BI routes
router.get('/status', PowerBIController.checkDataStatus);
router.get('/datasets', PowerBIController.getDatasets);
router.get('/tables', PowerBIController.getTables);
router.get('/records', PowerBIController.getRecords);
router.get('/report', PowerBIController.getReport);
router.get('/financial-data', PowerBIController.getFinancialData);
router.post('/extract', PowerBIController.triggerExtraction);

module.exports = router;