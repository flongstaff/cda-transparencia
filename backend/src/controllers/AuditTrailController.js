const AuditTrailService = require('../services/AuditTrailService');
const { handleError, handleSuccess } = require('../utils/responseHandlers');
const { validateYearArray } = require('../utils/validators');

class AuditTrailController {
  constructor() {
    this.auditTrailService = new AuditTrailService();
    
    // Bind methods to preserve 'this' context
    this.generateComprehensiveReport = this.generateComprehensiveReport.bind(this);
    this.getAuditTrailSummary = this.getAuditTrailSummary.bind(this);
  }

  /**
   * Generate comprehensive audit report
   */
  async generateComprehensiveReport(req, res) {
    try {
      const yearsParam = req.body.years || [2024, 2023, 2022, 2021, 2020];
      
      const validation = validateYearArray(yearsParam);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: validation.message
        });
      }

      console.log(`🔍 Generating comprehensive audit report for years: ${yearsParam.join(', ')}`);
      const auditResult = await this.auditTrailService.generateComprehensiveAuditReport(yearsParam);
      
      if (auditResult.success) {
        return res.json({
          success: true,
          data: {
            session_id: auditResult.session_id,
            file_path: auditResult.file_path,
            summary: auditResult.report.executive_summary,
            total_findings: auditResult.report.corruption_indicators.length,
            recommendations_count: auditResult.report.recommendations.length
          },
          message: 'Comprehensive audit report generated successfully',
          timestamp: new Date().toISOString()
        });
      } else {
        return res.status(500).json({
          success: false,
          error: 'Error generating audit report',
          details: auditResult.error,
          session_id: auditResult.session_id
        });
      }

    } catch (error) {
      console.error('Error generating audit report:', error);
      return handleError(res, error, 'Error generating comprehensive audit report');
    }
  }

  /**
   * Get audit trail summary
   */
  async getAuditTrailSummary(req, res) {
    try {
      console.log('📋 Getting audit trail summary...');
      const summary = await this.auditTrailService.getAuditTrailSummary();
      
      return handleSuccess(res, summary, 'Audit trail summary retrieved successfully');

    } catch (error) {
      console.error('Error getting audit trail summary:', error);
      return handleError(res, error, 'Error getting audit trail summary');
    }
  }
}

module.exports = AuditTrailController;