// Anomaly Detection Controller
const AnomalyDetectionService = require('../services/AnomalyDetectionService');
const { handleError, handleSuccess } = require('../utils/responseHandlers');

class AnomalyDetectionController {
  constructor() {
    this.anomalyDetectionService = new AnomalyDetectionService();
    
    // Bind methods to preserve 'this' context
    this.detectFinancialAnomalies = this.detectFinancialAnomalies.bind(this);
    this.detectSalaryAnomalies = this.detectSalaryAnomalies.bind(this);
    this.detectTenderAnomalies = this.detectTenderAnomalies.bind(this);
    this.generateComprehensiveReport = this.generateComprehensiveReport.bind(this);
  }

  /**
   * Detect financial anomalies in the provided data
   */
  async detectFinancialAnomalies(req, res) {
    try {
      console.log('🔍 Detecting financial anomalies...');
      
      const { financialData } = req.body;
      
      if (!financialData) {
        return res.status(400).json({
          success: false,
          error: 'Financial data is required for anomaly detection'
        });
      }

      const result = await this.anomalyDetectionService.detectFinancialAnomalies(financialData);
      
      if (result.success) {
        return handleSuccess(res, result, 'Financial anomalies detected successfully');
      } else {
        return handleError(res, new Error(result.error), 'Error detecting financial anomalies');
      }
    } catch (error) {
      console.error('Error in detectFinancialAnomalies:', error);
      return handleError(res, error, 'Internal server error while detecting financial anomalies');
    }
  }

  /**
   * Detect salary anomalies in the provided data
   */
  async detectSalaryAnomalies(req, res) {
    try {
      console.log('🔍 Detecting salary anomalies...');
      
      const { salaryData } = req.body;
      
      if (!salaryData) {
        return res.status(400).json({
          success: false,
          error: 'Salary data is required for anomaly detection'
        });
      }

      const result = this.anomalyDetectionService.detectSalaryAnomalies(salaryData);
      
      if (result.success) {
        return handleSuccess(res, result, 'Salary anomalies detected successfully');
      } else {
        return handleError(res, new Error(result.error), 'Error detecting salary anomalies');
      }
    } catch (error) {
      console.error('Error in detectSalaryAnomalies:', error);
      return handleError(res, error, 'Internal server error while detecting salary anomalies');
    }
  }

  /**
   * Detect tender anomalies in the provided data
   */
  async detectTenderAnomalies(req, res) {
    try {
      console.log('🔍 Detecting tender anomalies...');
      
      const { tenderData } = req.body;
      
      if (!tenderData) {
        return res.status(400).json({
          success: false,
          error: 'Tender data is required for anomaly detection'
        });
      }

      const result = this.anomalyDetectionService.detectTenderAnomalies(tenderData);
      
      if (result.success) {
        return handleSuccess(res, result, 'Tender anomalies detected successfully');
      } else {
        return handleError(res, new Error(result.error), 'Error detecting tender anomalies');
      }
    } catch (error) {
      console.error('Error in detectTenderAnomalies:', error);
      return handleError(res, error, 'Internal server error while detecting tender anomalies');
    }
  }

  /**
   * Generate comprehensive anomaly report from all data sources
   */
  async generateComprehensiveReport(req, res) {
    try {
      console.log('📋 Generating comprehensive anomaly report...');
      
      const { dataSources } = req.body;
      
      if (!dataSources) {
        return res.status(400).json({
          success: false,
          error: 'Data sources are required for comprehensive anomaly report generation'
        });
      }

      const result = await this.anomalyDetectionService.generateAnomalyReport(dataSources);
      
      if (result.success) {
        return handleSuccess(res, result.report, 'Comprehensive anomaly report generated successfully');
      } else {
        return handleError(res, new Error(result.error), 'Error generating comprehensive anomaly report');
      }
    } catch (error) {
      console.error('Error in generateComprehensiveReport:', error);
      return handleError(res, error, 'Internal server error while generating comprehensive anomaly report');
    }
  }

  /**
   * Validate the anomaly detection configuration
   */
  async validateConfiguration(req, res) {
    try {
      console.log('⚙️ Validating anomaly detection configuration...');
      
      const validation = this.anomalyDetectionService.validateConfiguration();
      
      return handleSuccess(res, validation, 'Anomaly detection configuration validated successfully');
    } catch (error) {
      console.error('Error in validateConfiguration:', error);
      return handleError(res, error, 'Internal server error while validating anomaly detection configuration');
    }
  }

  /**
   * Get system status and statistics for anomaly detection
   */
  async getSystemStatus(req, res) {
    try {
      console.log('📊 Getting anomaly detection system status...');
      
      const configuration = this.anomalyDetectionService.validateConfiguration();
      
      return handleSuccess(res, {
        systemStatus: 'active',
        configuration: configuration,
        timestamp: new Date().toISOString()
      }, 'Anomaly detection system status retrieved successfully');
    } catch (error) {
      console.error('Error in getSystemStatus:', error);
      return handleError(res, error, 'Internal server error while retrieving system status');
    }
  }
}

module.exports = AnomalyDetectionController;
