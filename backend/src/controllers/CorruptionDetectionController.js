const CorruptionDetectionService = require('../services/CorruptionDetectionService');
const { handleError, handleSuccess } = require('../utils/responseHandlers');
const { validateYear } = require('../utils/validators');

class CorruptionDetectionController {
  constructor() {
    this.corruptionService = new CorruptionDetectionService();
    
    // Bind methods to preserve 'this' context
    this.getComprehensiveAnalysis = this.getComprehensiveAnalysis.bind(this);
    this.getCorruptionAlerts = this.getCorruptionAlerts.bind(this);
    this.compareWithOfficialData = this.compareWithOfficialData.bind(this);
    this.runFinancialTracker = this.runFinancialTracker.bind(this);
    this.runEnhancedAuditor = this.runEnhancedAuditor.bind(this);
    this.runPowerBIExtractor = this.runPowerBIExtractor.bind(this);
    this.getDashboard = this.getDashboard.bind(this);
  }

  /**
   * Get comprehensive corruption analysis for a specific year
   */
  async getComprehensiveAnalysis(req, res) {
    try {
      const year = parseInt(req.params.year);
      
      const validation = validateYear(year);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: validation.message
        });
      }

      console.log(`🔍 Running corruption analysis for year ${year}...`);
      const analysis = await this.corruptionService.getComprehensiveCorruptionAnalysis(year);
      
      return handleSuccess(res, analysis, 'Corruption analysis completed successfully');

    } catch (error) {
      console.error('Error in corruption analysis:', error);
      return handleError(res, error, 'Error performing corruption analysis');
    }
  }

  /**
   * Get real-time corruption alerts
   */
  async getCorruptionAlerts(req, res) {
    try {
      console.log('🚨 Generating corruption alerts...');
      const alerts = await this.corruptionService.getCorruptionAlerts();
      
      return handleSuccess(res, alerts, 'Corruption alerts generated successfully');

    } catch (error) {
      console.error('Error generating corruption alerts:', error);
      return handleError(res, error, 'Error generating corruption alerts');
    }
  }

  /**
   * Compare municipal data with official PowerBI data
   */
  async compareWithOfficialData(req, res) {
    try {
      const year = parseInt(req.params.year);
      
      const validation = validateYear(year);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: validation.message
        });
      }

      console.log(`📊 Comparing data with official sources for year ${year}...`);
      const comparison = await this.corruptionService.compareWithOfficialData(year);
      
      return handleSuccess(res, comparison, 'Data comparison completed successfully');

    } catch (error) {
      console.error('Error comparing with official data:', error);
      return handleError(res, error, 'Error comparing with official data');
    }
  }

  /**
   * Run Python financial irregularity tracker
   */
  async runFinancialTracker(req, res) {
    try {
      console.log('🐍 Running financial irregularity tracker...');
      const results = await this.corruptionService.runFinancialIrregularityTracker();
      
      const message = results.success ? 
        'Tracker executed successfully' : 
        'Tracker execution failed';

      return res.json({
        success: results.success,
        data: results.data,
        message,
        raw_output: results.raw_output,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error running tracker:', error);
      return handleError(res, error, 'Error running financial irregularity tracker');
    }
  }

  /**
   * Run enhanced Carmen de Areco auditor
   */
  async runEnhancedAuditor(req, res) {
    try {
      console.log('🏛️ Running enhanced auditor...');
      const results = await this.corruptionService.runEnhancedAuditor();
      
      const message = results.success ? 
        'Auditor executed successfully' : 
        'Auditor execution failed';

      return res.json({
        success: results.success,
        data: results.data,
        message,
        raw_output: results.raw_output,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error running auditor:', error);
      return handleError(res, error, 'Error running enhanced auditor');
    }
  }

  /**
   * Run PowerBI data extractor
   */
  async runPowerBIExtractor(req, res) {
    try {
      console.log('📊 Running PowerBI extractor...');
      const results = await this.corruptionService.runPowerBIExtractor();
      
      const message = results.success ? 
        'PowerBI extractor executed successfully' : 
        'PowerBI extractor execution failed';

      return res.json({
        success: results.success,
        data: results.data,
        message,
        raw_output: results.raw_output,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error running PowerBI extractor:', error);
      return handleError(res, error, 'Error running PowerBI extractor');
    }
  }

  /**
   * Get corruption detection dashboard data
   */
  async getDashboard(req, res) {
    try {
      const currentYear = new Date().getFullYear();
      
      console.log('📊 Loading corruption detection dashboard...');
      
      // Get analysis for current and previous year
      const [currentAnalysis, previousAnalysis, alerts] = await Promise.all([
        this.corruptionService.getComprehensiveCorruptionAnalysis(currentYear),
        this.corruptionService.getComprehensiveCorruptionAnalysis(currentYear - 1),
        this.corruptionService.getCorruptionAlerts()
      ]);

      const dashboard = {
        current_year: currentYear,
        current_analysis: currentAnalysis,
        previous_analysis: previousAnalysis,
        alerts: alerts,
        trends: {
          risk_level_change: currentAnalysis.risk_level !== previousAnalysis.risk_level,
          transparency_score_change: currentAnalysis.transparency_score - previousAnalysis.transparency_score,
          total_indicators_change: currentAnalysis.corruption_indicators.length - previousAnalysis.corruption_indicators.length
        },
        summary: {
          total_indicators: currentAnalysis.corruption_indicators.length,
          high_severity_count: currentAnalysis.corruption_indicators.filter(i => i.severity === 'HIGH').length,
          current_risk_level: currentAnalysis.risk_level,
          transparency_score: currentAnalysis.transparency_score,
          active_alerts: alerts.alert_count
        }
      };

      return handleSuccess(res, dashboard, 'Corruption dashboard loaded successfully');

    } catch (error) {
      console.error('Error loading corruption dashboard:', error);
      return handleError(res, error, 'Error loading corruption dashboard');
    }
  }
}

module.exports = CorruptionDetectionController;