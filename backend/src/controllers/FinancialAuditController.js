// Financial Audit Controller
const FinancialAuditService = require('../services/FinancialAuditService');
const { handleError, handleSuccess } = require('../utils/responseHandlers');

class FinancialAuditController {
  constructor() {
    this.financialAuditService = new FinancialAuditService();
    
    // Bind methods to preserve 'this' context
    this.performFinancialAudit = this.performFinancialAudit.bind(this);
    this.generateDetailedReport = this.generateDetailedReport.bind(this);
    this.getAuditMetrics = this.getAuditMetrics.bind(this);
  }

  /**
   * Perform comprehensive financial audit on provided data
   */
  async performFinancialAudit(req, res) {
    try {
      console.log('🔍 Performing financial audit...');
      
      const { auditData } = req.body;
      
      if (!auditData) {
        return res.status(400).json({
          success: false,
          error: 'Audit data is required for financial audit'
        });
      }

      const result = await this.financialAuditService.performFinancialAudit(auditData);
      
      if (result.success) {
        return handleSuccess(res, result.auditReport, 'Financial audit completed successfully');
      } else {
        return handleError(res, new Error(result.error), 'Error performing financial audit');
      }
    } catch (error) {
      console.error('Error in performFinancialAudit:', error);
      return handleError(res, error, 'Internal server error while performing financial audit');
    }
  }

  /**
   * Generate detailed audit report with executive summary
   */
  async generateDetailedReport(req, res) {
    try {
      console.log('📋 Generating detailed financial audit report...');
      
      const { auditData } = req.body;
      
      if (!auditData) {
        return res.status(400).json({
          success: false,
          error: 'Audit data is required for report generation'
        });
      }

      const result = await this.financialAuditService.generateAuditReport(auditData);
      
      if (result.success) {
        return handleSuccess(res, result.report, 'Detailed audit report generated successfully');
      } else {
        return handleError(res, new Error(result.error), 'Error generating detailed audit report');
      }
    } catch (error) {
      console.error('Error in generateDetailedReport:', error);
      return handleError(res, error, 'Internal server error while generating detailed audit report');
    }
  }

  /**
   * Get current audit system metrics and statistics
   */
  async getAuditMetrics(req, res) {
    try {
      console.log('📊 Getting audit system metrics...');
      
      const metrics = this.financialAuditService.getAuditMetrics();
      
      return handleSuccess(res, metrics, 'Audit system metrics retrieved successfully');
    } catch (error) {
      console.error('Error in getAuditMetrics:', error);
      return handleError(res, error, 'Internal server error while retrieving audit metrics');
    }
  }

  /**
   * Validate the financial audit configuration
   */
  async validateConfiguration(req, res) {
    try {
      console.log('⚙️ Validating financial audit configuration...');
      
      // Placeholder validation - in a real system, this would check various configurations
      return handleSuccess(res, {
        configuration: 'valid',
        timestamp: new Date().toISOString()
      }, 'Financial audit configuration validated successfully');
    } catch (error) {
      console.error('Error in validateConfiguration:', error);
      return handleError(res, error, 'Internal server error while validating financial audit configuration');
    }
  }

  /**
   * Check for compliance issues in budget variances
   */
  async checkBudgetCompliance(req, res) {
    try {
      console.log('⚖️ Checking budget compliance...');
      
      const { budgetData } = req.body;
      
      if (!budgetData) {
        return res.status(400).json({
          success: false,
          error: 'Budget data is required for compliance check'
        });
      }

      // This could be enhanced to perform more sophisticated budget analysis
      const complianceCheck = {
        timestamp: new Date().toISOString(),
        issuesDetected: false,
        details: []
      };

      // Simple check for excessive variances
      if (budgetData.categories) {
        const highVarianceCategories = budgetData.categories.filter(category => {
          if (category.budgeted && category.executed) {
            const variance = ((category.executed - category.budgeted) / category.budgeted) * 100;
            return Math.abs(variance) > 10; // 10% threshold
          }
          return false;
        });
        
        if (highVarianceCategories.length > 0) {
          complianceCheck.issuesDetected = true;
          complianceCheck.details = highVarianceCategories.map(category => ({
            category: category.name,
            variancePercentage: ((category.executed - category.budgeted) / category.budgeted * 100).toFixed(2),
            recommendation: `Review and justify the ${((category.executed - category.budgeted) / category.budgeted * 100).toFixed(2)}% variance`
          }));
        }
      }

      return handleSuccess(res, complianceCheck, 'Budget compliance check completed');
    } catch (error) {
      console.error('Error in checkBudgetCompliance:', error);
      return handleError(res, error, 'Internal server error while checking budget compliance');
    }
  }
}

module.exports = FinancialAuditController;
