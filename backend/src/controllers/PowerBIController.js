/**
 * Power BI Data Controller
 * Handles API endpoints for Power BI data
 */

const fs = require('fs').promises;
const path = require('path');

class PowerBIController {
  constructor() {
    this.dataPath = path.join(__dirname, '../../../data/powerbi_extraction');
  }

  /**
   * Check if Power BI data is available
   */
  async checkDataStatus(req, res) {
    try {
      const latestDataPath = path.join(this.dataPath, 'powerbi_data_latest.json');
      const exists = await fs.access(latestDataPath).then(() => true).catch(() => false);
      
      res.json({ available: exists });
    } catch (error) {
      console.error('Error checking Power BI data status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get Power BI datasets
   */
  async getDatasets(req, res) {
    try {
      const data = await this.loadPowerBIData();
      const datasets = data.extracted_data?.datasets || [];
      
      res.json({ datasets });
    } catch (error) {
      console.error('Error loading Power BI datasets:', error);
      res.status(500).json({ error: 'Failed to load datasets' });
    }
  }

  /**
   * Get Power BI tables
   */
  async getTables(req, res) {
    try {
      const data = await this.loadPowerBIData();
      const tables = data.extracted_data?.tables || [];
      
      res.json({ tables });
    } catch (error) {
      console.error('Error loading Power BI tables:', error);
      res.status(500).json({ error: 'Failed to load tables' });
    }
  }

  /**
   * Get Power BI records with limit
   */
  async getRecords(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const data = await this.loadPowerBIData();
      const records = data.extracted_data?.records_sample || [];
      
      // Apply limit
      const limitedRecords = records.slice(0, limit);
      
      res.json({ records: limitedRecords });
    } catch (error) {
      console.error('Error loading Power BI records:', error);
      res.status(500).json({ error: 'Failed to load records' });
    }
  }

  /**
   * Get Power BI extraction report
   */
  async getReport(req, res) {
    try {
      const data = await this.loadPowerBIData();
      const report = data.extraction_report || {};
      
      res.json({ report });
    } catch (error) {
      console.error('Error loading Power BI report:', error);
      res.status(500).json({ error: 'Failed to load report' });
    }
  }

  /**
   * Get financial data for auditing
   */
  async getFinancialData(req, res) {
    try {
      const data = await this.loadPowerBIData();
      const records = data.extracted_data?.records_sample || [];
      
      // Filter for financial data that might be useful for auditing
      const financialRecords = records.filter(record => {
        const data = record.data || {};
        return data.category || data.amount || data.budgeted || data.actual;
      });
      
      res.json({ financialData: financialRecords });
    } catch (error) {
      console.error('Error loading Power BI financial data:', error);
      res.status(500).json({ error: 'Failed to load financial data' });
    }
  }

  /**
   * Trigger Power BI data extraction
   */
  async triggerExtraction(req, res) {
    try {
      // In a production environment, you would want to add authentication here
      // For now, we'll just run the extraction script
      
      const { spawn } = require('child_process');
      const scriptPath = path.join(__dirname, '../../../scripts/run_powerbi_extraction.py');
      
      const extractionProcess = spawn('python3', [scriptPath], {
        cwd: path.join(__dirname, '../../..')
      });
      
      let stdout = '';
      let stderr = '';
      
      extractionProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      extractionProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      extractionProcess.on('close', (code) => {
        if (code === 0) {
          res.json({ 
            success: true, 
            message: 'Power BI data extraction completed successfully',
            output: stdout
          });
        } else {
          res.status(500).json({ 
            success: false, 
            message: 'Power BI data extraction failed',
            error: stderr,
            exitCode: code
          });
        }
      });
      
      // Set a timeout to prevent hanging
      setTimeout(() => {
        extractionProcess.kill();
        res.status(500).json({ 
          success: false, 
          message: 'Power BI data extraction timed out'
        });
      }, 600000); // 10 minutes timeout
    } catch (error) {
      console.error('Error triggering Power BI data extraction:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to trigger Power BI data extraction',
        error: error.message 
      });
    }
  }

  /**
   * Load Power BI data from file
   */
  async loadPowerBIData() {
    try {
      const latestDataPath = path.join(this.dataPath, 'powerbi_data_latest.json');
      const data = await fs.readFile(latestDataPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading Power BI data:', error);
      throw new Error('Failed to load Power BI data');
    }
  }
}

module.exports = new PowerBIController();