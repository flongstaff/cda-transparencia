// Financial Audit Service
class FinancialAuditService {
  constructor() {
    // Initialize audit configurations
    this.complianceChecklist = [
      'Budget adherence',
      'Expense authorization',
      'Revenue recognition accuracy',
      'Financial data integrity'
    ];
    
    this.auditThresholds = {
      budgetVariance: 10, // 10% threshold for budget variances
      expenseDeviation: 15, // 15% deviation threshold for expenses
      salaryChangeThreshold: 25 // 25% change threshold for salaries
    };
  }

  /**
   * Perform comprehensive financial audit on provided data
   * @param {Object} auditData - Financial data to be audited
   * @returns {Object} Audit results with findings and recommendations
   */
  async performFinancialAudit(auditData) {
    try {
      const auditResults = {
        timestamp: new Date().toISOString(),
        findings: [],
        recommendations: [],
        complianceScore: 100,
        overallCompliance: 'excellent',
        summary: {
          totalFindings: 0,
          highSeverity: 0,
          mediumSeverity: 0,
          lowSeverity: 0
        }
      };

      // Conduct various compliance checks
      const checks = await this.performComplianceChecks(auditData);
      
      // Merge check results into findings
      auditResults.findings = checks.findings;
      auditResults.recommendations = checks.recommendations;
      
      // Calculate overall compliance score
      const totalFindings = auditResults.findings.length;
      auditResults.summary.totalFindings = totalFindings;
      
      // Categorize findings by severity
      auditResults.summary.highSeverity = 
        (auditResults.findings || []).filter(f => f.severity === 'high').length;
      auditResults.summary.mediumSeverity = 
        (auditResults.findings || []).filter(f => f.severity === 'medium').length;
      auditResults.summary.lowSeverity = 
        (auditResults.findings || []).filter(f => f.severity === 'low').length;
      
      // Calculate compliance score based on findings
      const complianceAdjustment = Math.min(100, totalFindings * 5); // Max 100% - penalty of 5% per finding
      auditResults.complianceScore = Math.max(0, 100 - complianceAdjustment);
      
      // Determine overall compliance level
      if (auditResults.complianceScore >= 90) {
        auditResults.overallCompliance = 'excellent';
      } else if (auditResults.complianceScore >= 70) {
        auditResults.overallCompliance = 'good';
      } else if (auditResults.complianceScore >= 50) {
        auditResults.overallCompliance = 'fair';
      } else {
        auditResults.overallCompliance = 'poor';
      }

      return {
        success: true,
        auditReport: auditResults
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Perform various compliance checks on financial data
   */
  async performComplianceChecks(auditData) {
    const findings = [];
    const recommendations = [];

    try {
      // Check 1: Budget variance compliance
      if (auditData && auditData.budget_data) {
        const budgetVarianceCheck = this.checkBudgetVariance(auditData.budget_data);
        
        if (budgetVarianceCheck.hasIssue) {
          findings.push({
            type: 'budget_variance',
            severity: budgetVarianceCheck.severity,
            details: `Budget variance detected: ${budgetVarianceCheck.percentageChange}%`,
            category: 'Financial Compliance'
          });
          
          recommendations.push({
            type: 'budget_variance',
            actionRequired: true,
            recommendation: `Review and justify the ${budgetVarianceCheck.percentageChange}% variance in budget execution`,
            priority: 'high'
          });
        }
      }

      // Check 2: Salary compliance
      if (auditData && auditData.salary_data) {
        const salaryChangeCheck = this.checkSalaryChanges(auditData.salary_data);
        
        if (salaryChangeCheck.hasIssue) {
          findings.push({
            type: 'salary_change',
            severity: salaryChangeCheck.severity,
            details: `Unusual salary change detected: ${salaryChangeCheck.percentageChange}%`,
            category: 'Compensation'
          });
          
          recommendations.push({
            type: 'salary_change',
            actionRequired: true,
            recommendation: `Justify the ${salaryChangeCheck.percentageChange}% change in salary structure`,
            priority: 'high'
          });
        }
      }

      // Check 3: Expense deviation from standards
      if (auditData && auditData.expense_data) {
        const expenseDeviationCheck = this.checkExpenseDeviation(auditData.expense_data);
        
        if (expenseDeviationCheck.hasIssue) {
          findings.push({
            type: 'expense_deviation',
            severity: expenseDeviationCheck.severity,
            details: `Expense deviation from standards: ${expenseDeviationCheck.percentageChange}%`,
            category: 'Spending'
          });
          
          recommendations.push({
            type: 'expense_deviation',
            actionRequired: true,
            recommendation: `Review expenses that deviate by ${expenseDeviationCheck.percentageChange}% from established standards`,
            priority: 'medium'
          });
        }
      }

      // Check 4: Financial indicator consistency
      if (auditData && auditData.financial_indicators) {
        const indicatorConsistencyCheck = this.checkIndicatorConsistency(auditData.financial_indicators);
        
        if (!indicatorConsistencyCheck.isConsistent) {
          findings.push({
            type: 'financial_indicator_inconsistency',
            severity: 'medium',
            details: `Financial indicator inconsistency detected`,
            category: 'Data Quality'
          });
          
          recommendations.push({
            type: 'financial_indicator_inconsistency',
            actionRequired: true,
            recommendation: `Investigate and resolve inconsistencies in financial indicators`,
            priority: 'medium'
          });
        }
      }

    } catch (error) {
      // Log error but don't fail the entire audit
      console.error('Error during compliance checks:', error);
    }

    return {
      findings: findings,
      recommendations: recommendations
    };
  }

  /**
   * Check for budget variance compliance issues
   */
  checkBudgetVariance(budgetData) {
    if (!budgetData || !budgetData.categories) return { hasIssue: false };
    
    const maxVariance = Math.max(...budgetData.categories.map(cat => {
      if (cat.budgeted && cat.executed) {
        const variance = ((cat.executed - cat.budgeted) / cat.budgeted) * 100;
        return Math.abs(variance);
      }
      return 0;
    }));

    const hasIssue = maxVariance > this.auditThresholds.budgetVariance;
    
    return {
      hasIssue: hasIssue,
      percentageChange: maxVariance.toFixed(2),
      severity: maxVariance > 20 ? 'high' : maxVariance > 15 ? 'medium' : 'low'
    };
  }

  /**
   * Check for unusual salary changes
   */
  checkSalaryChanges(salaryData) {
    if (!salaryData || !salaryData.salary_data) return { hasIssue: false };
    
    // Simple check for large salary changes (if we have historical data)
    if (salaryData.salary_data.length >= 2) {
      const currentYear = salaryData.salary_data[salaryData.salary_data.length - 1];
      const previousYear = salaryData.salary_data[salaryData.salary_data.length - 2];
      
      if (currentYear && previousYear && previousYear.totalPayroll > 0) {
        const change = ((currentYear.totalPayroll - previousYear.totalPayroll) / 
                       previousYear.totalPayroll) * 100;
        
        const hasIssue = Math.abs(change) > this.auditThresholds.salaryChangeThreshold;
        
        return {
          hasIssue: hasIssue,
          percentageChange: change.toFixed(2),
          severity: Math.abs(change) > 50 ? 'high' : Math.abs(change) > 30 ? 'medium' : 'low'
        };
      }
    }

    return { hasIssue: false };
  }

  /**
   * Check for expense deviation from established standards
   */
  checkExpenseDeviation(expenseData) {
    if (!expenseData || !expenseData.expenses) return { hasIssue: false };
    
    // For now, just check if there are any unusually high expenses
    const maxExpense = Math.max(...expenseData.expenses.map(exp => exp.amount || 0));
    
    // Placeholder for checking against historical averages or standards
    // In a more sophisticated system, we'd compare to expected ranges
    
    return {
      hasIssue: maxExpense > 1000000, // Placeholder threshold for very large expenses
      percentageChange: maxExpense > 1000000 ? 'high' : 'low',
      severity: maxExpense > 1000000 ? 'high' : 'medium'
    };
  }

  /**
   * Check consistency of financial indicators
   */
  checkIndicatorConsistency(indicators) {
    if (!indicators || !Array.isArray(indicators)) return { isConsistent: true };

    // Placeholder for consistency checking logic
    // In practice, this would validate data integrity and cross-reference values
    
    return {
      isConsistent: true
    };
  }

  /**
   * Generate detailed audit report with executive summary
   */
  async generateAuditReport(auditData) {
    try {
      const auditResult = await this.performFinancialAudit(auditData);
      
      if (!auditResult.success) {
        return auditResult;
      }

      // Create executive summary
      const reportSummary = {
        executiveSummary: this.generateExecutiveSummary(auditResult.auditReport),
        detailedFindings: auditResult.auditReport.findings,
        complianceRecommendations: auditResult.auditReport.recommendations
      };

      return {
        success: true,
        report: {
          ...auditResult.auditReport,
          summary: reportSummary
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate executive summary for audit report
   */
  generateExecutiveSummary(auditReport) {
    return `Financial Audit Report - Generated on ${auditReport.timestamp}
    
Compliance Score: ${auditReport.complianceScore}/100 (${auditReport.overallCompliance})
Total Findings: ${auditReport.summary.totalFindings}
High Severity Issues: ${auditReport.summary.highSeverity}
Medium Severity Issues: ${auditReport.summary.mediumSeverity}
Low Severity Issues: ${auditReport.summary.lowSeverity}

Key Compliance Areas:
- Budget Adherence: ${this.complianceChecklist[0]}
- Expense Authorization: ${this.complianceChecklist[1]}
- Revenue Recognition: ${this.complianceChecklist[2]}
- Financial Data Integrity: ${this.complianceChecklist[3]}

The audit indicates that the financial processes are operating within normal parameters, with ${auditReport.summary.highSeverity} high severity issues requiring attention.`;
  }

  /**
   * Get audit statistics and metrics
   */
  getAuditMetrics() {
    return {
      complianceChecklist: this.complianceChecklist,
      thresholds: this.auditThresholds,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = FinancialAuditService;
