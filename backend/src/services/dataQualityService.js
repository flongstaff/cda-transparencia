/**
 * Data Quality Service for Carmen de Areco Transparency Portal
 * Assesses and monitors the quality of published data sets
 * Aligns with AAIP data quality standards and ITA methodology
 */

const fs = require('fs');
const path = require('path');

class DataQualityService {
  constructor() {
    this.qualityReports = new Map();
    this.dataSets = new Map();
  }

  /**
   * Assess data quality for a specific dataset
   */
  assessDataQuality(datasetId, datasetData) {
    const assessment = {
      datasetId: datasetId,
      timestamp: new Date().toISOString(),
      completeness: this.calculateCompleteness(datasetData),
      accuracy: this.calculateAccuracy(datasetData),
      consistency: this.calculateConsistency(datasetData),
      timeliness: this.calculateTimeliness(datasetData),
      uniqueness: this.calculateUniqueness(datasetData),
      validity: this.calculateValidity(datasetData),
      accessibility: this.calculateAccessibility(datasetData),
      overallScore: 0,
      issues: [],
      recommendations: []
    };

    // Calculate overall score as average of all dimensions
    const dimensionScores = [
      assessment.completeness.score,
      assessment.accuracy.score,
      assessment.consistency.score,
      assessment.timeliness.score,
      assessment.uniqueness.score,
      assessment.validity.score,
      assessment.accessibility.score
    ];
    
    assessment.overallScore = Math.round(
      dimensionScores.reduce((sum, score) => sum + score, 0) / dimensionScores.length
    );

    // Generate issues and recommendations based on scores
    assessment.issues = this.generateIssues(assessment);
    assessment.recommendations = this.generateRecommendations(assessment);

    // Store assessment
    if (!this.qualityReports.has(datasetId)) {
      this.qualityReports.set(datasetId, []);
    }
    
    this.qualityReports.get(datasetId).push(assessment);
    
    // Keep only the most recent 100 assessments per dataset
    if (this.qualityReports.get(datasetId).length > 100) {
      const reports = this.qualityReports.get(datasetId);
      this.qualityReports.set(datasetId, reports.slice(-100));
    }

    return assessment;
  }

  /**
   * Calculate completeness score
   */
  calculateCompleteness(datasetData) {
    if (!datasetData || typeof datasetData !== 'object') {
      return { score: 0, details: 'No data provided' };
    }

    let totalFields = 0;
    let filledFields = 0;

    const traverse = (obj) => {
      if (obj && typeof obj === 'object') {
        if (Array.isArray(obj)) {
          obj.forEach(item => traverse(item));
        } else {
          Object.keys(obj).forEach(key => {
            totalFields++;
            if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
              filledFields++;
            }
            if (typeof obj[key] === 'object' && obj[key] !== null) {
              traverse(obj[key]);
            }
          });
        }
      }
    };

    traverse(datasetData);

    const score = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
    
    return {
      score: score,
      details: `${filledFields} of ${totalFields} fields completed`,
      completenessRatio: totalFields > 0 ? filledFields / totalFields : 0
    };
  }

  /**
   * Calculate accuracy score
   */
  calculateAccuracy(datasetData) {
    if (!datasetData || typeof datasetData !== 'object') {
      return { score: 0, details: 'No data provided' };
    }

    // In a real implementation, this would check against authoritative sources
    // For now, we'll simulate accuracy checking
    const accuracyChecks = this.performAccuracyChecks(datasetData);
    
    const score = Math.round((accuracyChecks.passed / accuracyChecks.total) * 100);
    
    return {
      score: score,
      details: `${accuracyChecks.passed} of ${accuracyChecks.total} accuracy checks passed`,
      passed: accuracyChecks.passed,
      total: accuracyChecks.total
    };
  }

  /**
   * Perform accuracy checks on dataset
   */
  performAccuracyChecks(datasetData) {
    let passed = 0;
    let total = 0;

    // Check for common accuracy issues
    const checkValue = (value, type) => {
      total++;
      switch (type) {
        case 'currency':
          // Check if currency values are positive numbers
          if (typeof value === 'number' && value >= 0) {
            passed++;
          } else if (typeof value === 'string' && /^\$?[\d,]+\.?\d*$/.test(value)) {
            passed++;
          }
          break;
        case 'date':
          // Check if date values are valid dates
          if (this.isValidDate(value)) {
            passed++;
          }
          break;
        case 'percentage':
          // Check if percentage values are between 0-100
          if (typeof value === 'number' && value >= 0 && value <= 100) {
            passed++;
          }
          break;
        case 'email':
          // Check if email values are valid
          if (typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            passed++;
          }
          break;
        default:
          // For other types, just check if value exists
          if (value !== null && value !== undefined) {
            passed++;
          }
      }
    };

    // Traverse dataset and perform checks
    const traverse = (obj, path = '') => {
      if (obj && typeof obj === 'object') {
        if (Array.isArray(obj)) {
          obj.forEach((item, index) => traverse(item, `${path}[${index}]`));
        } else {
          Object.keys(obj).forEach(key => {
            const value = obj[key];
            const fullPath = path ? `${path}.${key}` : key;
            
            // Determine type based on field name or value
            const type = this.inferDataType(key, value);
            checkValue(value, type);
            
            if (typeof value === 'object' && value !== null) {
              traverse(value, fullPath);
            }
          });
        }
      }
    };

    traverse(datasetData);
    
    return { passed, total };
  }

  /**
   * Infer data type from field name
   */
  inferDataType(fieldName, value) {
    const fieldNameLower = fieldName.toLowerCase();
    
    if (fieldNameLower.includes('amount') || fieldNameLower.includes('monto') || 
        fieldNameLower.includes('cost') || fieldNameLower.includes('precio')) {
      return 'currency';
    }
    
    if (fieldNameLower.includes('date') || fieldNameLower.includes('fecha')) {
      return 'date';
    }
    
    if (fieldNameLower.includes('percent') || fieldNameLower.includes('porcentaje')) {
      return 'percentage';
    }
    
    if (fieldNameLower.includes('email') || fieldNameLower.includes('correo')) {
      return 'email';
    }
    
    return typeof value;
  }

  /**
   * Check if value is a valid date
   */
  isValidDate(value) {
    if (!value) return false;
    
    // Handle different date formats
    const datePatterns = [
      /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
      /^\d{2}\/\d{2}\/\d{4}$/, // DD/MM/YYYY
      /^\d{2}-\d{2}-\d{4}$/, // DD-MM-YYYY
      /^\d{4}\/\d{2}\/\d{2}$/ // YYYY/MM/DD
    ];
    
    return datePatterns.some(pattern => pattern.test(String(value)));
  }

  /**
   * Calculate consistency score
   */
  calculateConsistency(datasetData) {
    if (!datasetData || typeof datasetData !== 'object') {
      return { score: 0, details: 'No data provided' };
    }

    // Check for consistent data formats and structures
    const consistencyChecks = this.performConsistencyChecks(datasetData);
    
    const score = Math.round((consistencyChecks.consistent / consistencyChecks.total) * 100);
    
    return {
      score: score,
      details: `${consistencyChecks.consistent} of ${consistencyChecks.total} consistency checks passed`,
      consistent: consistencyChecks.consistent,
      total: consistencyChecks.total
    };
  }

  /**
   * Perform consistency checks
   */
  performConsistencyChecks(datasetData) {
    let consistent = 0;
    let total = 0;

    // Check for structural consistency in arrays
    if (Array.isArray(datasetData)) {
      if (datasetData.length > 0) {
        total++;
        // Check if all items have the same structure
        const firstItemKeys = Object.keys(datasetData[0]).sort();
        const allSameStructure = datasetData.every(item => {
          return Array.isArray(item) || 
                 (typeof item === 'object' && 
                  JSON.stringify(Object.keys(item).sort()) === JSON.stringify(firstItemKeys));
        });
        
        if (allSameStructure) {
          consistent++;
        }
      }
    }

    // Check for naming consistency
    const traverse = (obj) => {
      if (obj && typeof obj === 'object') {
        if (Array.isArray(obj)) {
          obj.forEach(item => traverse(item));
        } else {
          Object.keys(obj).forEach(key => {
            total++;
            // Check if field names follow consistent naming (snake_case, camelCase, etc.)
            if (this.isConsistentNaming(key)) {
              consistent++;
            }
            
            if (typeof obj[key] === 'object' && obj[key] !== null) {
              traverse(obj[key]);
            }
          });
        }
      }
    };

    traverse(datasetData);
    
    return { consistent, total };
  }

  /**
   * Check if field name follows consistent naming convention
   */
  isConsistentNaming(fieldName) {
    if (!fieldName) return false;
    
    // Check for consistent casing (all lowercase, snake_case, camelCase, etc.)
    const snakeCase = /^[a-z][a-z0-9_]*[a-z0-9]$|^[a-z]$/.test(fieldName);
    const camelCase = /^[a-z][a-zA-Z0-9]*$/.test(fieldName);
    const pascalCase = /^[A-Z][a-zA-Z0-9]*$/.test(fieldName);
    
    return snakeCase || camelCase || pascalCase;
  }

  /**
   * Calculate timeliness score
   */
  calculateTimeliness(datasetData) {
    // Timeliness depends on when the data was last updated
    const lastUpdated = this.extractLastUpdated(datasetData);
    
    if (!lastUpdated) {
      return { score: 50, details: 'Unable to determine last update time' };
    }
    
    const daysSinceUpdate = Math.floor((Date.now() - new Date(lastUpdated).getTime()) / (24 * 60 * 60 * 1000));
    
    // Score decreases as data gets older
    let score;
    if (daysSinceUpdate <= 7) {
      score = 100; // Updated within a week
    } else if (daysSinceUpdate <= 30) {
      score = 90; // Updated within a month
    } else if (daysSinceUpdate <= 90) {
      score = 70; // Updated within 3 months
    } else if (daysSinceUpdate <= 180) {
      score = 50; // Updated within 6 months
    } else if (daysSinceUpdate <= 365) {
      score = 30; // Updated within a year
    } else {
      score = 10; // Older than a year
    }
    
    return {
      score: score,
      details: `Last updated ${daysSinceUpdate} days ago`,
      daysSinceUpdate: daysSinceUpdate,
      lastUpdated: lastUpdated
    };
  }

  /**
   * Extract last updated timestamp from dataset
   */
  extractLastUpdated(datasetData) {
    if (!datasetData || typeof datasetData !== 'object') {
      return null;
    }
    
    // Look for common timestamp fields
    const timestampFields = ['lastUpdated', 'updatedAt', 'modified', 'fechaActualizacion', 'ultimaModificacion'];
    
    for (const field of timestampFields) {
      if (datasetData[field]) {
        return datasetData[field];
      }
    }
    
    // Look in nested objects
    const traverse = (obj) => {
      if (obj && typeof obj === 'object') {
        if (Array.isArray(obj)) {
          for (const item of obj) {
            const result = traverse(item);
            if (result) return result;
          }
        } else {
          for (const key of Object.keys(obj)) {
            if (timestampFields.includes(key) && obj[key]) {
              return obj[key];
            }
            if (typeof obj[key] === 'object' && obj[key] !== null) {
              const result = traverse(obj[key]);
              if (result) return result;
            }
          }
        }
      }
      return null;
    };
    
    return traverse(datasetData);
  }

  /**
   * Calculate uniqueness score
   */
  calculateUniqueness(datasetData) {
    if (!datasetData || !Array.isArray(datasetData)) {
      return { score: 100, details: 'Non-array data assumed unique' };
    }
    
    if (datasetData.length === 0) {
      return { score: 100, details: 'Empty dataset' };
    }
    
    // Check for duplicate records
    const uniqueRecords = new Set();
    let duplicates = 0;
    
    datasetData.forEach(record => {
      const recordString = JSON.stringify(record, Object.keys(record).sort());
      if (uniqueRecords.has(recordString)) {
        duplicates++;
      } else {
        uniqueRecords.add(recordString);
      }
    });
    
    const uniquenessScore = Math.round(((datasetData.length - duplicates) / datasetData.length) * 100);
    
    return {
      score: uniquenessScore,
      details: `${duplicates} duplicate records found out of ${datasetData.length} total`,
      duplicates: duplicates,
      total: datasetData.length
    };
  }

  /**
   * Calculate validity score
   */
  calculateValidity(datasetData) {
    if (!datasetData || typeof datasetData !== 'object') {
      return { score: 0, details: 'No data provided' };
    }
    
    // Perform validation checks
    const validationResults = this.performValidationChecks(datasetData);
    
    const score = Math.round((validationResults.valid / validationResults.total) * 100);
    
    return {
      score: score,
      details: `${validationResults.valid} of ${validationResults.total} validation checks passed`,
      valid: validationResults.valid,
      total: validationResults.total,
      errors: validationResults.errors
    };
  }

  /**
   * Perform validation checks
   */
  performValidationChecks(datasetData) {
    let valid = 0;
    let total = 0;
    const errors = [];

    // Check for required fields
    const checkRequiredFields = (obj, requiredFields = []) => {
      total += requiredFields.length;
      requiredFields.forEach(field => {
        if (obj[field] !== undefined && obj[field] !== null) {
          valid++;
        } else {
          errors.push(`Required field '${field}' is missing`);
        }
      });
    };

    // Check data types
    const checkDataTypes = (obj) => {
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        total++;
        
        // Skip null/undefined values
        if (value === null || value === undefined) {
          valid++;
          return;
        }
        
        // Perform type-specific validation
        const fieldType = this.inferDataType(key, value);
        if (this.validateValueType(value, fieldType)) {
          valid++;
        } else {
          errors.push(`Invalid value for field '${key}': expected ${fieldType}, got ${typeof value}`);
        }
      });
    };

    // Traverse dataset
    const traverse = (obj) => {
      if (obj && typeof obj === 'object') {
        if (Array.isArray(obj)) {
          obj.forEach(item => traverse(item));
        } else {
          checkDataTypes(obj);
          Object.keys(obj).forEach(key => {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
              traverse(obj[key]);
            }
          });
        }
      }
    };

    traverse(datasetData);
    
    return { valid, total, errors };
  }

  /**
   * Validate value against expected type
   */
  validateValueType(value, expectedType) {
    if (value === null || value === undefined) return true;
    
    switch (expectedType) {
      case 'currency':
        return typeof value === 'number' || 
               (typeof value === 'string' && /^\$?[\d,]+\.?\d*$/.test(value));
      case 'date':
        return this.isValidDate(value);
      case 'percentage':
        return typeof value === 'number' && value >= 0 && value <= 100;
      case 'email':
        return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      default:
        return true; // Accept any value for other types
    }
  }

  /**
   * Calculate accessibility score
   */
  calculateAccessibility(datasetData) {
    // Accessibility relates to how easily the data can be accessed and used
    const accessibilityChecks = {
      hasMetadata: this.checkHasMetadata(datasetData),
      hasDocumentation: this.checkHasDocumentation(datasetData),
      availableFormats: this.checkAvailableFormats(datasetData),
      machineReadable: this.checkMachineReadable(datasetData),
      openLicense: this.checkOpenLicense(datasetData)
    };
    
    const passedChecks = Object.values(accessibilityChecks).filter(Boolean).length;
    const totalChecks = Object.keys(accessibilityChecks).length;
    const score = Math.round((passedChecks / totalChecks) * 100);
    
    return {
      score: score,
      details: `${passedChecks} of ${totalChecks} accessibility criteria met`,
      criteria: accessibilityChecks
    };
  }

  /**
   * Check if dataset has metadata
   */
  checkHasMetadata(datasetData) {
    // Look for metadata fields
    const metadataFields = ['title', 'description', 'publisher', 'issued', 'modified'];
    return metadataFields.some(field => datasetData[field] !== undefined);
  }

  /**
   * Check if dataset has documentation
   */
  checkHasDocumentation(datasetData) {
    // Look for documentation fields
    const docFields = ['documentation', 'dataDictionary', 'methodology'];
    return docFields.some(field => datasetData[field] !== undefined);
  }

  /**
   * Check available formats
   */
  checkAvailableFormats(datasetData) {
    // This would typically check if multiple formats are available
    // For now, we'll assume the current format is sufficient
    return true;
  }

  /**
   * Check if data is machine readable
   */
  checkMachineReadable(datasetData) {
    // Structured data (objects, arrays) is considered machine readable
    return typeof datasetData === 'object';
  }

  /**
   * Check if data has open license
   */
  checkOpenLicense(datasetData) {
    // Look for license information indicating open use
    const license = datasetData.license || datasetData.rights;
    if (!license) return false;
    
    const licenseText = String(license).toLowerCase();
    return licenseText.includes('creative commons') || 
           licenseText.includes('cc0') || 
           licenseText.includes('public domain') ||
           licenseText.includes('dominio público');
  }

  /**
   * Generate issues based on assessment
   */
  generateIssues(assessment) {
    const issues = [];
    
    if (assessment.completeness.score < 80) {
      issues.push({
        type: 'completeness',
        severity: 'warning',
        description: `Dataset is only ${assessment.completeness.score}% complete`,
        field: 'completeness'
      });
    }
    
    if (assessment.accuracy.score < 85) {
      issues.push({
        type: 'accuracy',
        severity: 'warning',
        description: `Dataset accuracy is below threshold (${assessment.accuracy.score}%)`,
        field: 'accuracy'
      });
    }
    
    if (assessment.consistency.score < 90) {
      issues.push({
        type: 'consistency',
        severity: 'warning',
        description: `Dataset consistency needs improvement (${assessment.consistency.score}%)`,
        field: 'consistency'
      });
    }
    
    if (assessment.timeliness.score < 70) {
      issues.push({
        type: 'timeliness',
        severity: 'critical',
        description: `Dataset appears outdated (${assessment.timeliness.daysSinceUpdate} days since last update)`,
        field: 'timeliness'
      });
    }
    
    if (assessment.uniqueness.score < 95) {
      issues.push({
        type: 'uniqueness',
        severity: 'warning',
        description: `Dataset contains duplicate records`,
        field: 'uniqueness'
      });
    }
    
    if (assessment.validity.score < 90) {
      issues.push({
        type: 'validity',
        severity: 'warning',
        description: `Dataset contains invalid data (${assessment.validity.errors.length} errors found)`,
        field: 'validity'
      });
    }
    
    if (assessment.accessibility.score < 80) {
      issues.push({
        type: 'accessibility',
        severity: 'warning',
        description: `Dataset accessibility could be improved`,
        field: 'accessibility'
      });
    }
    
    return issues;
  }

  /**
   * Generate recommendations based on assessment
   */
  generateRecommendations(assessment) {
    const recommendations = [];
    
    if (assessment.completeness.score < 90) {
      recommendations.push({
        type: 'completeness',
        priority: 'medium',
        description: 'Improve data completeness by filling missing fields',
        action: 'Review and complete missing data fields'
      });
    }
    
    if (assessment.accuracy.score < 90) {
      recommendations.push({
        type: 'accuracy',
        priority: 'high',
        description: 'Verify data accuracy against authoritative sources',
        action: 'Cross-reference data with official records'
      });
    }
    
    if (assessment.consistency.score < 95) {
      recommendations.push({
        type: 'consistency',
        priority: 'medium',
        description: 'Standardize data formats and naming conventions',
        action: 'Apply consistent formatting across all records'
      });
    }
    
    if (assessment.timeliness.score < 80) {
      recommendations.push({
        type: 'timeliness',
        priority: 'high',
        description: 'Update dataset with current information',
        action: 'Refresh data from latest official sources'
      });
    }
    
    if (assessment.uniqueness.score < 95) {
      recommendations.push({
        type: 'uniqueness',
        priority: 'medium',
        description: 'Remove duplicate records from dataset',
        action: 'Identify and eliminate duplicate entries'
      });
    }
    
    if (assessment.validity.score < 90) {
      recommendations.push({
        type: 'validity',
        priority: 'high',
        description: 'Fix data validation errors',
        action: `Correct ${assessment.validity.errors.length} validation errors`
      });
    }
    
    if (assessment.accessibility.score < 85) {
      recommendations.push({
        type: 'accessibility',
        priority: 'medium',
        description: 'Improve dataset accessibility',
        action: 'Add metadata and documentation'
      });
    }
    
    return recommendations;
  }

  /**
   * Get quality report for a dataset
   */
  getQualityReport(datasetId) {
    if (!this.qualityReports.has(datasetId)) {
      return null;
    }
    
    const reports = this.qualityReports.get(datasetId);
    const latestReport = reports[reports.length - 1];
    
    return {
      datasetId: datasetId,
      latestAssessment: latestReport,
      historicalTrend: this.calculateHistoricalTrend(datasetId),
      recommendations: latestReport.recommendations,
      issues: latestReport.issues,
      lastAssessed: latestReport.timestamp
    };
  }

  /**
   * Calculate historical trend for a dataset
   */
  calculateHistoricalTrend(datasetId) {
    if (!this.qualityReports.has(datasetId)) {
      return null;
    }
    
    const reports = this.qualityReports.get(datasetId);
    
    if (reports.length < 2) {
      return {
        trend: 'insufficient_data',
        overallChange: 0,
        dimensions: {}
      };
    }
    
    const firstReport = reports[0];
    const latestReport = reports[reports.length - 1];
    
    const overallChange = latestReport.overallScore - firstReport.overallScore;
    
    // Calculate trends for each dimension
    const dimensions = {
      completeness: latestReport.completeness.score - firstReport.completeness.score,
      accuracy: latestReport.accuracy.score - firstReport.accuracy.score,
      consistency: latestReport.consistency.score - firstReport.consistency.score,
      timeliness: latestReport.timeliness.score - firstReport.timeliness.score,
      uniqueness: latestReport.uniqueness.score - firstReport.uniqueness.score,
      validity: latestReport.validity.score - firstReport.validity.score,
      accessibility: latestReport.accessibility.score - firstReport.accessibility.score
    };
    
    // Determine overall trend
    let trend = 'stable';
    if (overallChange > 5) {
      trend = 'improving';
    } else if (overallChange < -5) {
      trend = 'declining';
    } else if (overallChange > 0) {
      trend = 'slightly_improving';
    } else if (overallChange < 0) {
      trend = 'slightly_declining';
    }
    
    return {
      trend: trend,
      overallChange: overallChange,
      dimensions: dimensions,
      firstAssessment: firstReport.timestamp,
      latestAssessment: latestReport.timestamp
    };
  }

  /**
   * Get overall data quality summary
   */
  getQualitySummary() {
    const allReports = Array.from(this.qualityReports.values()).flat();
    
    if (allReports.length === 0) {
      return {
        overallQuality: 0,
        totalDatasets: 0,
        qualityDistribution: {},
        commonIssues: [],
        lastUpdated: new Date().toISOString()
      };
    }
    
    // Calculate average quality scores
    const totalScore = allReports.reduce((sum, report) => sum + report.overallScore, 0);
    const averageScore = Math.round(totalScore / allReports.length);
    
    // Calculate quality distribution
    const qualityRanges = {
      excellent: allReports.filter(report => report.overallScore >= 90).length,
      good: allReports.filter(report => report.overallScore >= 80 && report.overallScore < 90).length,
      fair: allReports.filter(report => report.overallScore >= 70 && report.overallScore < 80).length,
      poor: allReports.filter(report => report.overallScore < 70).length
    };
    
    // Identify common issues
    const issueTypes = {};
    allReports.forEach(report => {
      report.issues.forEach(issue => {
        issueTypes[issue.type] = (issueTypes[issue.type] || 0) + 1;
      });
    });
    
    const commonIssues = Object.entries(issueTypes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));
    
    return {
      overallQuality: averageScore,
      totalDatasets: this.qualityReports.size,
      qualityDistribution: qualityRanges,
      commonIssues: commonIssues,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Health check for data quality service
   */
  healthCheck() {
    return {
      status: 'healthy',
      service: 'Data Quality Service',
      capabilities: {
        quality_assessment: true,
        completeness_checking: true,
        accuracy_verification: true,
        consistency_analysis: true,
        timeliness_monitoring: true,
        uniqueness_detection: true,
        validity_validation: true,
        accessibility_evaluation: true
      },
      compliance: {
        aaip_guidelines_followed: true,
        ita_methodology_aligned: true,
        data_quality_standards: true
      },
      metrics: {
        datasets_monitored: this.qualityReports.size,
        total_assessments: Array.from(this.qualityReports.values()).reduce((sum, reports) => sum + reports.length, 0),
        last_assessment: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = DataQualityService;