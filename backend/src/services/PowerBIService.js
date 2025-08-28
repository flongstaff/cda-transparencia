const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

class PowerBIService {
  constructor() {
    this.dataPath = path.join(__dirname, '../../../data/powerbi_extraction');
    this.extractedDataPath = path.join(this.dataPath, 'powerbi_data_latest.json');
  }

  /**
   * Check if Power BI data extraction has been run
   */
  async isDataAvailable() {
    try {
      await fs.access(this.extractedDataPath);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get the latest extracted Power BI data
   */
  async getPowerBIData() {
    try {
      const data = await fs.readFile(this.extractedDataPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      throw new Error('Power BI data not available. Please run extraction first.');
    }
  }

  /**
   * Get Power BI datasets
   */
  async getDatasets() {
    const data = await this.getPowerBIData();
    return data.extracted_data.datasets || [];
  }

  /**
   * Get Power BI tables
   */
  async getTables() {
    const data = await this.getPowerBIData();
    return data.extracted_data.tables || [];
  }

  /**
   * Get Power BI records (limited for performance)
   */
  async getRecords(limit = 100) {
    const data = await this.getPowerBIData();
    const records = data.extracted_data.records_sample || [];
    return records.slice(0, limit);
  }

  /**
   * Get extraction report
   */
  async getExtractionReport() {
    const data = await this.getPowerBIData();
    return data.extraction_report || {};
  }

  /**
   * Get financial data specifically for auditing
   */
  async getFinancialDataForAudit() {
    const data = await this.getPowerBIData();
    const records = data.extracted_data.records_sample || [];
    
    // Filter for financial data that might be useful for auditing
    const financialRecords = records.filter(record => {
      const data = record.data || {};
      return data.category || data.amount || data.budgeted || data.actual;
    });
    
    return financialRecords;
  }

  /**
   * Compare Power BI data with PDF extracted data
   */
  async compareWithPDFData(pdfData) {
    const powerbiData = await this.getFinancialDataForAudit();
    
    // This is a simplified comparison - in reality, you'd want to match on specific fields
    const comparison = {
      powerbiRecordCount: powerbiData.length,
      pdfRecordCount: pdfData.length,
      discrepancies: [],
      matches: []
    };
    
    // For now, we'll just return basic comparison info
    // A full implementation would do field-by-field comparison
    return comparison;
  }
}

module.exports = PowerBIService;