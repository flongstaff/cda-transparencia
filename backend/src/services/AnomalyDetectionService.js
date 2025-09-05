// Anomaly Detection Service
class AnomalyDetectionService {
  constructor() {
    // Initialize any required dependencies or configurations
    this.anomalyThreshold = 0.1; // 10% threshold for what's considered an anomaly
  }

  /**
   * Detect anomalies in financial data
   * @param {Object} financialData - Financial data to analyze for anomalies
   * @returns {Object} Analysis results including any detected anomalies
   */
  async detectFinancialAnomalies(financialData) {
    try {
      const anomalies = [];
      
      // Check for unusual spending patterns
      if (financialData && financialData.categories) {
        const totalBudget = financialData.totalBudget || 0;
        
        for (const category of financialData.categories) {
          if (category.budgeted && totalBudget > 0) {
            const percentage = (category.executed / totalBudget) * 100;
            
            // Flag categories that are significantly over or under budget
            if (percentage > 100) {
              anomalies.push({
                type: 'budget_overrun',
                category: category.name,
                details: `Over Budget by ${percentage - 100}%`,
                severity: 'high'
              });
            } else if (percentage < 50) {
              anomalies.push({
                type: 'underutilized_budget',
                category: category.name,
                details: `Under Budget by ${50 - percentage}%`,
                severity: 'medium'
              });
            }
          }
        }
      }

      // Check for salary anomalies  
      if (financialData && financialData.salary_data) {
        const salaries = financialData.salary_data;
        
        // Calculate salary trends and compare to previous data
        if (salaries && salaries.length > 1) {
          const currentYearSalary = salaries[salaries.length - 1];
          const previousYearSalary = salaries[salaries.length - 2];
          
          if (currentYearSalary && previousYearSalary) {
            const salaryChange = ((currentYearSalary.totalPayroll - previousYearSalary.totalPayroll) / 
                                previousYearSalary.totalPayroll) * 100;
            
            if (Math.abs(salaryChange) > 25) { // More than 25% change
              anomalies.push({
                type: 'salary_anomaly',
                details: `Unusual salary change of ${salaryChange.toFixed(2)}%`,
                severity: Math.abs(salaryChange) > 50 ? 'high' : 'medium'
              });
            }
          }
        }
      }

      return {
        success: true,
        anomalies: anomalies,
        timestamp: new Date().toISOString(),
        totalAnomalies: anomalies.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Detect anomalies in salary data specifically 
   * @param {Object} salaryData - Salary data to analyze
   * @returns {Object} Anomaly detection results for salaries
   */
  detectSalaryAnomalies(salaryData) {
    try {
      const anomalies = [];
      
      if (!salaryData || !salaryData.positions) return { anomalies: [], totalAnomalies: 0 };

      // Check for unusually high or low salary positions
      const maxSalary = Math.max(...salaryData.positions.map(pos => pos.netSalary || 0));
      const avgSalary = salaryData.positions.reduce((sum, pos) => sum + (pos.netSalary || 0), 0) / 
                       salaryData.positions.length;
      
      // Flag salaries that are significantly higher or lower than average
      for (const position of salaryData.positions) {
        if (position.netSalary && avgSalary > 0) {
          const deviation = Math.abs((position.netSalary - avgSalary) / avgSalary);
          
          if (deviation > this.anomalyThreshold) {
            anomalies.push({
              type: 'salary_deviation',
              position: position.name,
              salary: position.netSalary,
              deviationPercentage: (deviation * 100).toFixed(2),
              severity: deviation > 0.3 ? 'high' : 'medium'
            });
          }
        }
      }

      return {
        success: true,
        anomalies: anomalies,
        timestamp: new Date().toISOString(),
        totalAnomalies: anomalies.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Detect anomalies in tender data 
   * @param {Object} tenderData - Tender data to analyze
   * @returns {Object} Anomaly detection results for tenders
   */
  detectTenderAnomalies(tenderData) {
    try {
      const anomalies = [];
      
      if (!tenderData || !tenderData.tenders) return { anomalies: [], totalAnomalies: 0 };
      
      // Check for unusually high tender values
      const maxTenderValue = Math.max(...tenderData.tenders.map(tender => tender.value || 0));
      const avgTenderValue = tenderData.tenders.reduce((sum, tender) => sum + (tender.value || 0), 0) / 
                            tenderData.tenders.length;
      
      // Flag tenders that are significantly higher than average
      for (const tender of tenderData.tenders) {
        if (tender.value && avgTenderValue > 0) {
          const deviation = Math.abs((tender.value - avgTenderValue) / avgTenderValue);
          
          if (deviation > this.anomalyThreshold * 2) { // Higher threshold for tenders
            anomalies.push({
              type: 'tender_value_anomaly',
              tenderId: tender.id,
              value: tender.value,
              deviationPercentage: (deviation * 100).toFixed(2),
              severity: deviation > 0.5 ? 'high' : 'medium'
            });
          }
        }
      }

      return {
        success: true,
        anomalies: anomalies,
        timestamp: new Date().toISOString(),
        totalAnomalies: anomalies.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate anomaly report 
   * @param {Object} dataSources - Various financial data sources to analyze
   * @returns {Object} Comprehensive anomaly report
   */
  async generateAnomalyReport(dataSources) {
    try {
      const results = {
        timestamp: new Date().toISOString(),
        summary: {
          totalAnomalies: 0,
          highSeverityAnomalies: 0,
          mediumSeverityAnomalies: 0
        },
        details: {
          salaryAnomalies: [],
          financialAnomalies: [],
          tenderAnomalies: []
        }
      };

      // Process salary anomalies
      if (dataSources.salaryData) {
        const salaryResults = this.detectSalaryAnomalies(dataSources.salaryData);
        results.details.salaryAnomalies = salaryResults.anomalies || [];
        
        if (salaryResults.success) {
          results.summary.totalAnomalies += salaryResults.totalAnomalies || 0;
          
          // Categorize anomalies by severity
          results.summary.highSeverityAnomalies += 
            (salaryResults.anomalies || []).filter(a => a.severity === 'high').length;
          results.summary.mediumSeverityAnomalies += 
            (salaryResults.anomalies || []).filter(a => a.severity === 'medium').length;
        }
      }

      // Process financial anomalies
      if (dataSources.financialData) {
        const financialResults = this.detectFinancialAnomalies(dataSources.financialData);
        results.details.financialAnomalies = financialResults.anomalies || [];
        
        if (financialResults.success) {
          results.summary.totalAnomalies += financialResults.totalAnomalies || 0;
          
          // Categorize anomalies by severity
          results.summary.highSeverityAnomalies += 
            (financialResults.anomalies || []).filter(a => a.severity === 'high').length;
          results.summary.mediumSeverityAnomalies += 
            (financialResults.anomalies || []).filter(a => a.severity === 'medium').length;
        }
      }

      // Process tender anomalies
      if (dataSources.tenderData) {
        const tenderResults = this.detectTenderAnomalies(dataSources.tenderData);
        results.details.tenderAnomalies = tenderResults.anomalies || [];
        
        if (tenderResults.success) {
          results.summary.totalAnomalies += tenderResults.totalAnomalies || 0;
          
          // Categorize anomalies by severity
          results.summary.highSeverityAnomalies += 
            (tenderResults.anomalies || []).filter(a => a.severity === 'high').length;
          results.summary.mediumSeverityAnomalies += 
            (tenderResults.anomalies || []).filter(a => a.severity === 'medium').length;
        }
      }

      return {
        success: true,
        report: results
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Validate anomaly detection configuration and thresholds
   */
  validateConfiguration() {
    return {
      threshold: this.anomalyThreshold,
      valid: true
    };
  }
}

module.exports = AnomalyDetectionService;
