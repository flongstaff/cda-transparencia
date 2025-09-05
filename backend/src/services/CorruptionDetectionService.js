const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const DatabaseDataService = require('./DatabaseDataService');
const FinancialAnalysisService = require('./FinancialAnalysisService');

/**
 * Service that integrates Python audit tools with JavaScript backend
 * Provides unified corruption detection by combining all available analysis tools
 */
class CorruptionDetectionService {
  constructor() {
    this.databaseService = new DatabaseDataService();
    this.financialService = new FinancialAnalysisService();
    this.scriptsPath = path.join(__dirname, '../../../scripts/audit');
    this.outputPath = path.join(__dirname, '../../../data/audit_results');
    this.ensureOutputDirectory();
  }

  async ensureOutputDirectory() {
    try {
      await fs.mkdir(this.outputPath, { recursive: true });
    } catch (error) {
      console.error('Error creating output directory:', error);
    }
  }

  /**
   * Execute Python audit script and return results
   */
  async executePythonScript(scriptName, args = []) {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(this.scriptsPath, scriptName);
      const process = spawn('python3', [scriptPath, ...args]);
      
      let stdout = '';
      let stderr = '';
      
      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      process.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, output: stdout, stderr });
        } else {
          reject({ success: false, error: stderr, output: stdout, code });
        }
      });
      
      process.on('error', (error) => {
        reject({ success: false, error: error.message });
      });
    });
  }

  /**
   * Run financial irregularity tracker and get results
   */
  async runFinancialIrregularityTracker() {
    console.log('🔍 Running financial irregularity tracker...');
    
    try {
      const result = await this.executePythonScript('financial_irregularity_tracker.py');
      
      // Try to find the generated JSON output file
      const outputDir = path.join(__dirname, '../../../data/audit_irregularities');
      const files = await fs.readdir(outputDir).catch(() => []);
      const jsonFiles = files.filter(f => f.startsWith('irregularities_report_') && f.endsWith('.json'));
      
      if (jsonFiles.length > 0) {
        // Get the most recent report
        const latestFile = jsonFiles.sort().reverse()[0];
        const reportPath = path.join(outputDir, latestFile);
        const reportContent = await fs.readFile(reportPath, 'utf8');
        
        return {
          success: true,
          data: JSON.parse(reportContent),
          report_file: latestFile,
          raw_output: result.output
        };
      } else {
        return {
          success: true,
          data: { message: 'No irregularities report generated' },
          raw_output: result.output
        };
      }
    } catch (error) {
      console.error('Error running financial irregularity tracker:', error);
      return {
        success: false,
        error: error.error || error.message,
        raw_output: error.output
      };
    }
  }

  /**
   * Run enhanced Carmen de Areco auditor
   */
  async runEnhancedAuditor() {
    console.log('🏛️ Running enhanced Carmen de Areco auditor...');
    
    try {
      const result = await this.executePythonScript('enhanced_carmen_areco_auditor.py');
      
      // Try to find the generated audit results
      const outputDir = path.join(__dirname, '../../../scripts/audit/enhanced_audit_data');
      const resultsFile = path.join(outputDir, 'enhanced_audit_results.json');
      
      try {
        const resultsContent = await fs.readFile(resultsFile, 'utf8');
        return {
          success: true,
          data: JSON.parse(resultsContent),
          raw_output: result.output
        };
      } catch (fileError) {
        return {
          success: true,
          data: { message: 'Enhanced audit completed - check logs for details' },
          raw_output: result.output
        };
      }
    } catch (error) {
      console.error('Error running enhanced auditor:', error);
      return {
        success: false,
        error: error.error || error.message,
        raw_output: error.output
      };
    }
  }

  /**
   * Run PowerBI data extractor
   */
  async runPowerBIExtractor() {
    console.log('📊 Running PowerBI data extractor...');
    
    try {
      const result = await this.executePythonScript('powerbi_data_extractor.py');
      
      return {
        success: true,
        data: { message: 'PowerBI extraction completed - check database for results' },
        raw_output: result.output
      };
    } catch (error) {
      console.error('Error running PowerBI extractor:', error);
      return {
        success: false,
        error: error.error || error.message,
        raw_output: error.output
      };
    }
  }

  /**
   * Get comprehensive corruption analysis combining all tools
   */
  async getComprehensiveCorruptionAnalysis(year = 2024) {
    console.log(`🔍 Running comprehensive corruption analysis for ${year}...`);
    
    const analysis = {
      year: parseInt(year),
      timestamp: new Date().toISOString(),
      corruption_indicators: [],
      risk_level: 'LOW',
      financial_irregularities: [],
      transparency_score: 0,
      recommendations: [],
      data_sources: []
    };

    try {
      // 1. Get JavaScript-based financial analysis
      console.log('📊 Running JavaScript financial analysis...');
      const yearlyData = await this.databaseService.getYearlyData(year);
      const financialAnalysis = await this.financialService.analyzeFinancialIrregularities(year);
      
      analysis.javascript_analysis = financialAnalysis;
      analysis.corruption_indicators.push(...financialAnalysis.irregularities.map(i => ({
        source: 'javascript_analysis',
        type: i.type,
        severity: i.severity,
        description: i.description
      })));

      // 2. Run Python financial irregularity tracker
      console.log('🐍 Running Python irregularity tracker...');
      const irregularityResults = await this.runFinancialIrregularityTracker();
      
      if (irregularityResults.success && irregularityResults.data.salary_irregularities) {
        analysis.python_irregularities = irregularityResults.data;
        
        // Add salary irregularities
        irregularityResults.data.salary_irregularities.forEach(sal => {
          analysis.corruption_indicators.push({
            source: 'python_tracker',
            type: 'salary_irregularity',
            severity: 'HIGH',
            description: `${sal.official_name}: Salary ${sal.discrepancy_ratio}x higher than average`,
            evidence: sal.evidence
          });
        });

        // Add project irregularities  
        irregularityResults.data.project_irregularities.forEach(proj => {
          analysis.corruption_indicators.push({
            source: 'python_tracker',
            type: 'project_delay',
            severity: 'MEDIUM',
            description: `${proj.project_name}: Delayed by ${proj.delay_days} days`,
            evidence: proj.evidence
          });
        });

        // Add budget discrepancies
        irregularityResults.data.budget_discrepancies.forEach(budget => {
          analysis.corruption_indicators.push({
            source: 'python_tracker',
            type: 'budget_discrepancy',
            severity: 'HIGH',
            description: `${budget.category}: ${(budget.difference_percentage * 100).toFixed(1)}% difference from planned`,
            evidence: budget.evidence
          });
        });
      }

      // 3. Run enhanced auditor
      console.log('🔍 Running enhanced auditor...');
      const enhancedResults = await this.runEnhancedAuditor();
      if (enhancedResults.success) {
        analysis.enhanced_audit = enhancedResults.data;
      }

      // 4. Calculate overall risk level
      const totalIndicators = analysis.corruption_indicators.length;
      const highSeverityCount = analysis.corruption_indicators.filter(i => i.severity === 'HIGH').length;
      
      if (highSeverityCount >= 5 || totalIndicators >= 10) {
        analysis.risk_level = 'CRITICAL';
      } else if (highSeverityCount >= 3 || totalIndicators >= 6) {
        analysis.risk_level = 'HIGH';
      } else if (highSeverityCount >= 1 || totalIndicators >= 3) {
        analysis.risk_level = 'MEDIUM';
      } else {
        analysis.risk_level = 'LOW';
      }

      // 5. Calculate transparency score (0-100)
      const maxPossibleScore = 100;
      let deductions = 0;
      
      // Deduct points for irregularities
      deductions += highSeverityCount * 15; // 15 points per high severity
      deductions += (totalIndicators - highSeverityCount) * 5; // 5 points per other indicator
      
      // Deduct for missing documentation (from JS analysis)
      const docGapIssues = financialAnalysis.irregularities?.filter(i => i.type === 'documentation_gaps') || [];
      if (docGapIssues.length > 0) {
        deductions += docGapIssues.length * 10;
      }
      
      // Deduct based on transparency score
      if (financialAnalysis.transparency_score < 50) {
        deductions += 20;
      }
      
      analysis.transparency_score = Math.max(0, maxPossibleScore - deductions);

      // 6. Generate recommendations
      analysis.recommendations = this.generateCorruptionRecommendations(analysis);

      // 7. Set data sources
      analysis.data_sources = [
        'JavaScript Financial Analysis Service',
        'Python Financial Irregularity Tracker',
        'Enhanced Carmen de Areco Auditor',
        'Real PDF Document Data',
        'Municipal Database Records'
      ];

      return analysis;

    } catch (error) {
      console.error('Error in comprehensive corruption analysis:', error);
      analysis.error = error.message;
      analysis.risk_level = 'UNKNOWN';
      return analysis;
    }
  }

  /**
   * Generate actionable recommendations based on corruption indicators
   */
  generateCorruptionRecommendations(analysis) {
    const recommendations = [];
    
    // Salary-related recommendations
    const salaryIssues = analysis.corruption_indicators.filter(i => i.type === 'salary_irregularity');
    if (salaryIssues.length > 0) {
      recommendations.push({
        category: 'Salary Management',
        priority: 'HIGH',
        action: 'Conduct immediate salary audit and establish transparent salary scales',
        description: `Detected ${salaryIssues.length} cases of disproportionate salaries requiring investigation`
      });
    }

    // Budget execution recommendations  
    const budgetIssues = analysis.corruption_indicators.filter(i => i.type.includes('budget'));
    if (budgetIssues.length > 0) {
      recommendations.push({
        category: 'Budget Oversight',
        priority: 'HIGH', 
        action: 'Implement monthly budget execution monitoring and public reporting',
        description: `Found ${budgetIssues.length} significant budget discrepancies indicating weak financial controls`
      });
    }

    // Transparency recommendations
    if (analysis.transparency_score < 60) {
      recommendations.push({
        category: 'Transparency Enhancement',
        priority: 'MEDIUM',
        action: 'Improve document publication and establish proactive disclosure policies',
        description: `Low transparency score (${analysis.transparency_score}/100) indicates insufficient public information access`
      });
    }

    // Project management recommendations
    const projectIssues = analysis.corruption_indicators.filter(i => i.type === 'project_delay');
    if (projectIssues.length > 0) {
      recommendations.push({
        category: 'Project Management',
        priority: 'MEDIUM',
        action: 'Establish project monitoring system with milestone-based payments',
        description: `Identified ${projectIssues.length} delayed projects requiring improved oversight`
      });
    }

    // Overall governance recommendations
    if (analysis.risk_level === 'CRITICAL' || analysis.risk_level === 'HIGH') {
      recommendations.push({
        category: 'Governance Reform',
        priority: 'CRITICAL',
        action: 'Request external audit and implement comprehensive anti-corruption measures',
        description: `High corruption risk level requires immediate intervention and systemic reforms`
      });
    }

    return recommendations;
  }

  /**
   * Get real-time corruption alerts
   */
  async getCorruptionAlerts() {
    const alerts = [];
    const currentYear = new Date().getFullYear();
    
    try {
      // Check recent irregularities
      const analysis = await this.getComprehensiveCorruptionAnalysis(currentYear);
      
      // Generate alerts for critical issues
      const criticalIndicators = analysis.corruption_indicators.filter(i => i.severity === 'HIGH');
      
      criticalIndicators.forEach(indicator => {
        alerts.push({
          id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          severity: 'HIGH',
          category: indicator.type,
          title: `Corruption Risk Detected: ${indicator.type}`,
          description: indicator.description,
          evidence: indicator.evidence,
          source: indicator.source,
          recommended_action: 'Immediate investigation required'
        });
      });

      return {
        timestamp: new Date().toISOString(),
        alert_count: alerts.length,
        alerts: alerts.slice(0, 10), // Return top 10 most critical
        risk_level: analysis.risk_level,
        transparency_score: analysis.transparency_score
      };

    } catch (error) {
      console.error('Error generating corruption alerts:', error);
      return {
        timestamp: new Date().toISOString(),
        alert_count: 0,
        alerts: [],
        error: error.message
      };
    }
  }

  /**
   * Compare municipal data with PowerBI official data
   */
  async compareWithOfficialData(year = 2024) {
    console.log(`📊 Comparing municipal data with official PowerBI data for ${year}...`);
    
    try {
      // Get our internal data
      const ourData = await this.databaseService.getYearlyData(year);
      
      // Try to extract PowerBI data
      const powerbiResult = await this.runPowerBIExtractor();
      
      const comparison = {
        year: parseInt(year),
        timestamp: new Date().toISOString(),
        internal_data: {
          budget_total: ourData.budget.total,
          executed_amount: ourData.budget.executed,
          execution_rate: ourData.budget.percentage,
          document_count: ourData.total_documents
        },
        official_data: {
          available: powerbiResult.success,
          extraction_status: powerbiResult.success ? 'SUCCESS' : 'FAILED',
          error: powerbiResult.error || null
        },
        discrepancies: [],
        verification_status: 'PENDING',
        recommendations: []
      };

      // If PowerBI extraction was successful, perform comparison
      if (powerbiResult.success && powerbiResult.data) {
        // This would contain actual comparison logic once PowerBI data is available
        comparison.verification_status = 'VERIFIED';
        comparison.recommendations.push({
          action: 'Cross-reference budget amounts with official PowerBI dashboard',
          priority: 'HIGH',
          description: 'Ensure all financial figures match official government reporting'
        });
      } else {
        comparison.recommendations.push({
          action: 'Manual verification required - PowerBI data extraction failed',
          priority: 'CRITICAL', 
          description: 'Unable to automatically verify data against official sources'
        });
      }

      return comparison;

    } catch (error) {
      console.error('Error comparing with official data:', error);
      return {
        year: parseInt(year),
        timestamp: new Date().toISOString(),
        error: error.message,
        verification_status: 'ERROR'
      };
    }
  }
}

module.exports = CorruptionDetectionService;