const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const DatabaseDataService = require('./DatabaseDataService');
const FinancialAnalysisService = require('./FinancialAnalysisService');
const CorruptionDetectionService = require('./CorruptionDetectionService');
const TransparencyMetricsService = require('./TransparencyMetricsService');

/**
 * Comprehensive audit trail system that tracks and verifies all transparency data
 * Provides immutable record of findings and analysis for accountability
 */
class AuditTrailService {
  constructor() {
    this.databaseService = new DatabaseDataService();
    this.financialService = new FinancialAnalysisService();
    this.corruptionService = new CorruptionDetectionService();
    this.transparencyService = new TransparencyMetricsService();
    
    this.auditPath = path.join(__dirname, '../../../data/audit_trail');
    this.ensureAuditDirectory();
    
    // Audit trail metadata
    this.currentSession = {
      id: this.generateSessionId(),
      start_time: new Date().toISOString(),
      version: '1.0.0',
      data_sources: [],
      analyses_performed: [],
      findings_hash: null
    };
  }

  async ensureAuditDirectory() {
    try {
      await fs.mkdir(this.auditPath, { recursive: true });
    } catch (error) {
      console.error('Error creating audit trail directory:', error);
    }
  }

  generateSessionId() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const random = crypto.randomBytes(4).toString('hex');
    return `audit_${timestamp}_${random}`;
  }

  /**
   * Generate comprehensive audit report combining all analysis tools
   */
  async generateComprehensiveAuditReport(years = [2024, 2023, 2022, 2021, 2020]) {
    console.log('🔍 Generating comprehensive audit report...');
    
    const auditReport = {
      audit_metadata: {
        session_id: this.currentSession.id,
        generated_at: new Date().toISOString(),
        generated_by: 'Carmen de Areco Transparency Portal',
        version: this.currentSession.version,
        scope: `Financial transparency audit for years ${years.join(', ')}`,
        methodology: 'Multi-source analysis including document review, financial analysis, corruption detection, and transparency scoring'
      },
      executive_summary: {
        total_years_analyzed: years.length,
        highest_risk_year: null,
        lowest_transparency_year: null,
        critical_findings: [],
        overall_risk_level: 'LOW',
        recommendations_count: 0
      },
      yearly_analyses: {},
      corruption_indicators: [],
      transparency_trends: {},
      legal_compliance: {},
      data_verification: {},
      recommendations: [],
      appendices: {
        data_sources: [],
        methodologies: [],
        raw_outputs: {}
      }
    };

    try {
      // Analyze each year comprehensively
      for (const year of years) {
        console.log(`📊 Analyzing year ${year}...`);
        
        const yearAnalysis = await this.analyzeYearComprehensively(year);
        auditReport.yearly_analyses[year] = yearAnalysis;
        
        // Collect corruption indicators
        if (yearAnalysis.corruption_analysis && yearAnalysis.corruption_analysis.corruption_indicators) {
          auditReport.corruption_indicators.push(...yearAnalysis.corruption_analysis.corruption_indicators.map(indicator => ({
            ...indicator,
            year: year
          })));
        }

        // Track highest risk year
        if (yearAnalysis.corruption_analysis && yearAnalysis.corruption_analysis.risk_level) {
          const riskLevels = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'CRITICAL': 4 };
          const currentRisk = riskLevels[yearAnalysis.corruption_analysis.risk_level] || 0;
          const highestRisk = riskLevels[auditReport.executive_summary.overall_risk_level] || 0;
          
          if (currentRisk > highestRisk) {
            auditReport.executive_summary.overall_risk_level = yearAnalysis.corruption_analysis.risk_level;
            auditReport.executive_summary.highest_risk_year = year;
          }
        }

        // Track lowest transparency year
        if (yearAnalysis.transparency_score && yearAnalysis.transparency_score.total_score) {
          if (!auditReport.executive_summary.lowest_transparency_year || 
              yearAnalysis.transparency_score.total_score < 
              auditReport.yearly_analyses[auditReport.executive_summary.lowest_transparency_year].transparency_score.total_score) {
            auditReport.executive_summary.lowest_transparency_year = year;
          }
        }
      }

      // Generate transparency trends analysis
      console.log('📈 Analyzing transparency trends...');
      auditReport.transparency_trends = await this.transparencyService.compareTransparencyTrends(years);

      // Generate consolidated recommendations
      console.log('📋 Generating recommendations...');
      auditReport.recommendations = this.generateConsolidatedRecommendations(auditReport);
      auditReport.executive_summary.recommendations_count = auditReport.recommendations.length;

      // Identify critical findings
      auditReport.executive_summary.critical_findings = this.identifyCriticalFindings(auditReport);

      // Add data verification
      auditReport.data_verification = await this.verifyDataIntegrity(years);

      // Add legal compliance assessment
      auditReport.legal_compliance = this.assessOverallLegalCompliance(auditReport);

      // Add appendices
      auditReport.appendices = this.generateAuditAppendices(auditReport);

      // Generate hash for integrity
      const reportHash = this.generateReportHash(auditReport);
      auditReport.audit_metadata.integrity_hash = reportHash;

      // Save audit report
      const reportPath = await this.saveAuditReport(auditReport);
      
      console.log(`✅ Comprehensive audit report generated: ${reportPath}`);
      
      return {
        success: true,
        report: auditReport,
        file_path: reportPath,
        session_id: this.currentSession.id
      };

    } catch (error) {
      console.error('Error generating comprehensive audit report:', error);
      return {
        success: false,
        error: error.message,
        session_id: this.currentSession.id
      };
    }
  }

  /**
   * Analyze a single year comprehensively using all available tools
   */
  async analyzeYearComprehensively(year) {
    const analysis = {
      year: parseInt(year),
      timestamp: new Date().toISOString(),
      data_quality: {},
      financial_analysis: {},
      corruption_analysis: {},
      transparency_score: {},
      red_flag_alerts: {},
      document_analysis: {}
    };

    try {
      // Get base data
      const yearData = await this.databaseService.getYearlyData(year);
      analysis.document_analysis = {
        total_documents: yearData.total_documents,
        budget_documents: yearData.budget_documents,
        data_availability: yearData.total_documents > 0 ? 'AVAILABLE' : 'LIMITED'
      };

      // Financial analysis
      if (yearData.budget.total > 0) {
        analysis.financial_analysis = await this.financialService.analyzeFinancialIrregularities(yearData);
      }

      // Corruption analysis
      analysis.corruption_analysis = await this.corruptionService.getComprehensiveCorruptionAnalysis(year);

      // Transparency scoring
      analysis.transparency_score = await this.transparencyService.calculateTransparencyScore(year);

      // Red flag alerts
      analysis.red_flag_alerts = await this.transparencyService.generateRedFlagAlerts(year);

      // Data quality assessment
      analysis.data_quality = this.assessDataQuality(yearData);

      return analysis;

    } catch (error) {
      console.error(`Error analyzing year ${year}:`, error);
      return {
        year: parseInt(year),
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Assess data quality for a given year
   */
  assessDataQuality(yearData) {
    const quality = {
      overall_score: 0,
      completeness: 0,
      consistency: 0,
      timeliness: 0,
      issues: []
    };

    let totalScore = 0;
    let factors = 0;

    // Completeness (25 points)
    let completenessScore = 0;
    if (yearData.total_documents > 0) completenessScore += 10;
    if (yearData.budget.total > 0) completenessScore += 10;
    if (yearData.revenue.total > 0) completenessScore += 3;
    if (yearData.expenses.total > 0) completenessScore += 2;
    
    quality.completeness = Math.min(100, completenessScore * 4);
    totalScore += quality.completeness;
    factors++;

    // Consistency (25 points)
    let consistencyScore = 0;
    if (yearData.budget.total > 0 && yearData.budget.executed > 0) {
      const executionRate = yearData.budget.executed / yearData.budget.total;
      if (executionRate >= 0.5 && executionRate <= 1.2) consistencyScore += 15;
      else if (executionRate > 0) consistencyScore += 10;
    }
    
    if (yearData.revenue.total > 0 && yearData.expenses.total > 0) {
      const balanceRatio = yearData.expenses.total / yearData.revenue.total;
      if (balanceRatio >= 0.8 && balanceRatio <= 1.1) consistencyScore += 10;
      else if (balanceRatio > 0) consistencyScore += 5;
    }

    quality.consistency = Math.min(100, consistencyScore * 4);
    totalScore += quality.consistency;
    factors++;

    // Timeliness (assume current data is timely)
    quality.timeliness = yearData.total_documents > 0 ? 80 : 20;
    totalScore += quality.timeliness;
    factors++;

    quality.overall_score = Math.round(totalScore / factors);

    // Identify issues
    if (yearData.total_documents === 0) {
      quality.issues.push('No documents available for analysis');
    }
    
    if (yearData.budget.total === 0) {
      quality.issues.push('No budget information available');
    }
    
    if (yearData.budget.executed === 0 && yearData.budget.total > 0) {
      quality.issues.push('Budget planned but no execution data');
    }

    return quality;
  }

  /**
   * Generate consolidated recommendations from all analyses
   */
  generateConsolidatedRecommendations(auditReport) {
    const recommendations = [];
    const seenRecommendations = new Set();

    // Collect recommendations from yearly analyses
    Object.values(auditReport.yearly_analyses).forEach(yearAnalysis => {
      // From corruption analysis
      if (yearAnalysis.corruption_analysis && yearAnalysis.corruption_analysis.recommendations) {
        yearAnalysis.corruption_analysis.recommendations.forEach(rec => {
          const key = `${rec.category}_${rec.action}`;
          if (!seenRecommendations.has(key)) {
            recommendations.push({
              source: 'corruption_analysis',
              priority: rec.priority,
              category: rec.category,
              action: rec.action,
              description: rec.description,
              years_affected: [yearAnalysis.year]
            });
            seenRecommendations.add(key);
          } else {
            // Add year to existing recommendation
            const existing = recommendations.find(r => `${r.category}_${r.action}` === key);
            if (existing && !existing.years_affected.includes(yearAnalysis.year)) {
              existing.years_affected.push(yearAnalysis.year);
            }
          }
        });
      }

      // From transparency score improvements
      if (yearAnalysis.transparency_score && yearAnalysis.transparency_score.improvement_areas) {
        yearAnalysis.transparency_score.improvement_areas.forEach(area => {
          const key = `transparency_${area.area}`;
          if (!seenRecommendations.has(key)) {
            recommendations.push({
              source: 'transparency_analysis',
              priority: area.priority,
              category: 'transparency',
              action: area.recommendation,
              description: `Improve ${area.area} (current score: ${area.score}/100)`,
              years_affected: [yearAnalysis.year]
            });
            seenRecommendations.add(key);
          }
        });
      }
    });

    // Add systemic recommendations based on trends
    if (auditReport.transparency_trends.trend_direction === 'DECLINING') {
      recommendations.push({
        source: 'trend_analysis',
        priority: 'CRITICAL',
        category: 'systemic',
        action: 'Implement transparency improvement program',
        description: `Transparency scores are declining (${auditReport.transparency_trends.improvement_rate} points). Immediate systemic intervention required.`,
        years_affected: auditReport.transparency_trends.years
      });
    }

    // Sort by priority
    const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    return recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }

  /**
   * Identify critical findings that require immediate attention
   */
  identifyCriticalFindings(auditReport) {
    const criticalFindings = [];

    // Check for critical corruption indicators
    const criticalCorruption = auditReport.corruption_indicators.filter(
      indicator => indicator.severity === 'HIGH' || indicator.severity === 'CRITICAL'
    );

    if (criticalCorruption.length > 0) {
      criticalFindings.push({
        type: 'corruption_risk',
        severity: 'CRITICAL',
        count: criticalCorruption.length,
        description: `${criticalCorruption.length} critical corruption indicators detected across analyzed years`,
        immediate_action_required: true
      });
    }

    // Check for transparency failures
    const lowTransparencyYears = Object.entries(auditReport.yearly_analyses)
      .filter(([year, analysis]) => 
        analysis.transparency_score && analysis.transparency_score.total_score < 50
      );

    if (lowTransparencyYears.length > 0) {
      criticalFindings.push({
        type: 'transparency_failure',
        severity: 'HIGH',
        count: lowTransparencyYears.length,
        description: `${lowTransparencyYears.length} years with critically low transparency scores (< 50/100)`,
        affected_years: lowTransparencyYears.map(([year]) => year),
        immediate_action_required: true
      });
    }

    // Check for missing essential data
    const yearsWithoutBudgetData = Object.entries(auditReport.yearly_analyses)
      .filter(([year, analysis]) => 
        !analysis.financial_analysis || 
        !analysis.document_analysis || 
        analysis.document_analysis.total_documents === 0
      );

    if (yearsWithoutBudgetData.length > 0) {
      criticalFindings.push({
        type: 'data_unavailability',
        severity: 'HIGH',
        count: yearsWithoutBudgetData.length,
        description: `${yearsWithoutBudgetData.length} years with missing or insufficient data for analysis`,
        affected_years: yearsWithoutBudgetData.map(([year]) => year),
        immediate_action_required: true
      });
    }

    return criticalFindings;
  }

  /**
   * Verify data integrity across all sources
   */
  async verifyDataIntegrity(years) {
    const verification = {
      timestamp: new Date().toISOString(),
      years_verified: years,
      data_sources_checked: [],
      integrity_status: 'VERIFIED',
      issues_found: [],
      checksums: {}
    };

    try {
      // Verify CSV data availability
      for (const year of years) {
        const yearData = await this.databaseService.getYearlyData(year);
        
        verification.data_sources_checked.push(`csv_data_${year}`);
        
        // Generate checksum for year data
        const dataString = JSON.stringify(yearData);
        const checksum = crypto.createHash('md5').update(dataString).digest('hex');
        verification.checksums[`year_${year}`] = checksum;

        // Check for data consistency issues
        if (yearData.budget.total > 0 && yearData.budget.executed === 0) {
          verification.issues_found.push({
            year: year,
            issue: 'budget_execution_missing',
            description: 'Budget total available but execution data missing'
          });
        }

        if (yearData.total_documents === 0) {
          verification.issues_found.push({
            year: year,
            issue: 'no_documents',
            description: 'No documents available for analysis'
          });
        }
      }

      // Check for Python scripts availability
      const scriptsPath = path.join(__dirname, '../../../scripts/audit');
      try {
        await fs.access(path.join(scriptsPath, 'financial_irregularity_tracker.py'));
        verification.data_sources_checked.push('python_irregularity_tracker');
      } catch (error) {
        verification.issues_found.push({
          issue: 'missing_python_script',
          description: 'Financial irregularity tracker script not accessible'
        });
      }

      try {
        await fs.access(path.join(scriptsPath, 'enhanced_carmen_areco_auditor.py'));
        verification.data_sources_checked.push('python_enhanced_auditor');
      } catch (error) {
        verification.issues_found.push({
          issue: 'missing_python_script',
          description: 'Enhanced auditor script not accessible'
        });
      }

      // Set overall integrity status
      if (verification.issues_found.length > 0) {
        verification.integrity_status = 'ISSUES_FOUND';
      }

      return verification;

    } catch (error) {
      verification.integrity_status = 'VERIFICATION_FAILED';
      verification.issues_found.push({
        issue: 'verification_error',
        description: error.message
      });
      return verification;
    }
  }

  /**
   * Assess overall legal compliance across all years
   */
  assessOverallLegalCompliance(auditReport) {
    const compliance = {
      overall_status: 'UNKNOWN',
      ley_27275_compliance: 'UNKNOWN',
      years_analyzed: Object.keys(auditReport.yearly_analyses),
      compliant_years: [],
      non_compliant_years: [],
      major_violations: [],
      recommendations: []
    };

    // Analyze each year's compliance
    Object.entries(auditReport.yearly_analyses).forEach(([year, analysis]) => {
      if (analysis.transparency_score && analysis.transparency_score.legal_compliance) {
        const yearCompliance = analysis.transparency_score.legal_compliance;
        
        if (yearCompliance.ley_27275_compliance.status === 'COMPLIANT' ||
            yearCompliance.ley_27275_compliance.status === 'PARTIALLY_COMPLIANT') {
          compliance.compliant_years.push(year);
        } else {
          compliance.non_compliant_years.push(year);
          
          // Add major violations
          yearCompliance.ley_27275_compliance.requirements_missing.forEach(missing => {
            compliance.major_violations.push({
              year: year,
              violation: missing,
              law: 'Ley 27.275'
            });
          });
        }
      }
    });

    // Set overall compliance status
    const totalYears = compliance.years_analyzed.length;
    const compliantCount = compliance.compliant_years.length;
    
    if (compliantCount === totalYears) {
      compliance.overall_status = 'FULLY_COMPLIANT';
      compliance.ley_27275_compliance = 'COMPLIANT';
    } else if (compliantCount >= totalYears * 0.6) {
      compliance.overall_status = 'PARTIALLY_COMPLIANT';
      compliance.ley_27275_compliance = 'PARTIALLY_COMPLIANT';
    } else {
      compliance.overall_status = 'NON_COMPLIANT';
      compliance.ley_27275_compliance = 'NON_COMPLIANT';
    }

    // Generate compliance recommendations
    if (compliance.non_compliant_years.length > 0) {
      compliance.recommendations.push({
        priority: 'CRITICAL',
        action: 'Implement comprehensive transparency compliance program',
        description: `${compliance.non_compliant_years.length} years found non-compliant with transparency laws`
      });
    }

    if (compliance.major_violations.length > 0) {
      compliance.recommendations.push({
        priority: 'HIGH',
        action: 'Address specific legal requirement violations',
        description: `${compliance.major_violations.length} specific violations of Ley 27.275 identified`
      });
    }

    return compliance;
  }

  /**
   * Generate audit appendices with supporting data
   */
  generateAuditAppendices(auditReport) {
    return {
      data_sources: [
        {
          name: 'CSV Document Extracts',
          description: 'Structured data extracted from PDF documents',
          coverage: '2018-2025',
          reliability: 'HIGH'
        },
        {
          name: 'JavaScript Financial Analysis Service',
          description: 'Automated financial irregularity detection',
          methodology: 'Statistical analysis and pattern recognition',
          reliability: 'HIGH'
        },
        {
          name: 'Python Audit Tools',
          description: 'Advanced corruption detection and OSINT analysis',
          components: ['Financial Irregularity Tracker', 'Enhanced Auditor', 'PowerBI Extractor'],
          reliability: 'HIGH'
        },
        {
          name: 'Transparency Metrics System',
          description: 'Compliance assessment based on Argentine transparency laws',
          legal_basis: 'Ley 27.275 de Acceso a la Información Pública',
          reliability: 'HIGH'
        }
      ],
      methodologies: [
        {
          name: 'Financial Irregularity Detection',
          description: 'Multi-layered analysis combining statistical analysis, pattern recognition, and expert rules',
          indicators: ['Budget execution anomalies', 'Overspending patterns', 'Contract irregularities', 'Salary anomalies']
        },
        {
          name: 'Transparency Scoring',
          description: 'Weighted scoring system based on document availability, budget transparency, contract disclosure, salary transparency, and timeliness',
          scale: '0-100 points',
          legal_compliance: 'Ley 27.275 requirements'
        },
        {
          name: 'Corruption Risk Assessment',
          description: 'Risk-based approach combining multiple indicators to assess overall corruption risk',
          risk_levels: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
        }
      ],
      audit_standards: [
        'International Standards on Auditing (ISA)',
        'Argentine National Auditing Standards',
        'Transparency International Best Practices',
        'OECD Guidelines on Managing Conflict of Interest in the Public Sector'
      ]
    };
  }

  /**
   * Generate hash for report integrity verification
   */
  generateReportHash(report) {
    // Remove hash field temporarily for calculation
    const reportCopy = { ...report };
    delete reportCopy.audit_metadata.integrity_hash;
    
    const reportString = JSON.stringify(reportCopy, null, 0);
    return crypto.createHash('sha256').update(reportString).digest('hex');
  }

  /**
   * Save audit report to file with timestamp
   */
  async saveAuditReport(auditReport) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `comprehensive_audit_report_${timestamp}.json`;
    const filePath = path.join(this.auditPath, filename);

    try {
      await fs.writeFile(filePath, JSON.stringify(auditReport, null, 2), 'utf8');
      
      // Also save a human-readable summary
      const summaryPath = path.join(this.auditPath, `audit_summary_${timestamp}.txt`);
      const summary = this.generateTextSummary(auditReport);
      await fs.writeFile(summaryPath, summary, 'utf8');

      return filePath;
    } catch (error) {
      console.error('Error saving audit report:', error);
      throw error;
    }
  }

  /**
   * Generate human-readable text summary of audit report
   */
  generateTextSummary(auditReport) {
    return `
CARMEN DE ARECO - COMPREHENSIVE TRANSPARENCY AUDIT REPORT
Generated: ${auditReport.audit_metadata.generated_at}
Session: ${auditReport.audit_metadata.session_id}

EXECUTIVE SUMMARY
================
Years Analyzed: ${auditReport.executive_summary.total_years_analyzed}
Overall Risk Level: ${auditReport.executive_summary.overall_risk_level}
Highest Risk Year: ${auditReport.executive_summary.highest_risk_year}
Lowest Transparency Year: ${auditReport.executive_summary.lowest_transparency_year}
Total Recommendations: ${auditReport.executive_summary.recommendations_count}

CRITICAL FINDINGS
================
${auditReport.executive_summary.critical_findings.map(finding => 
  `- ${finding.description} (${finding.severity})`
).join('\n')}

TRANSPARENCY TRENDS
==================
Trend Direction: ${auditReport.transparency_trends.trend_direction}
Improvement Rate: ${auditReport.transparency_trends.improvement_rate} points

LEGAL COMPLIANCE
================
Overall Status: ${auditReport.legal_compliance.overall_status}
Ley 27.275 Compliance: ${auditReport.legal_compliance.ley_27275_compliance}
Compliant Years: ${auditReport.legal_compliance.compliant_years.join(', ')}
Non-compliant Years: ${auditReport.legal_compliance.non_compliant_years.join(', ')}

TOP RECOMMENDATIONS
==================
${auditReport.recommendations.slice(0, 5).map((rec, index) => 
  `${index + 1}. [${rec.priority}] ${rec.action}\n   ${rec.description}`
).join('\n\n')}

DATA VERIFICATION
================
Status: ${auditReport.data_verification.integrity_status}
Sources Checked: ${auditReport.data_verification.data_sources_checked.length}
Issues Found: ${auditReport.data_verification.issues_found.length}

For detailed analysis and complete findings, refer to the full JSON report.
Report Integrity Hash: ${auditReport.audit_metadata.integrity_hash}
    `.trim();
  }

  /**
   * Get audit trail summary for API
   */
  async getAuditTrailSummary() {
    try {
      const files = await fs.readdir(this.auditPath);
      const auditFiles = files.filter(f => f.startsWith('comprehensive_audit_report_') && f.endsWith('.json'));
      
      const summary = {
        total_reports: auditFiles.length,
        latest_report: auditFiles.length > 0 ? auditFiles.sort().reverse()[0] : null,
        audit_trail_path: this.auditPath,
        current_session: this.currentSession,
        available_reports: auditFiles.slice(0, 10) // Last 10 reports
      };

      return summary;
    } catch (error) {
      console.error('Error getting audit trail summary:', error);
      return {
        total_reports: 0,
        error: error.message,
        current_session: this.currentSession
      };
    }
  }
}

module.exports = AuditTrailService;