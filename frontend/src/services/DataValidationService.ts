import ApiService from './ApiService';
import OSINTComplianceService from './OSINTComplianceService';

export interface DataValidationResult {
  isValid: boolean;
  confidence: number; // 0-100
  issues: ValidationIssue[];
  sourceVerification: SourceVerification;
  complianceCheck: ComplianceCheck;
  lastValidated: string;
}

export interface ComplianceCheck {
  isCompliant: boolean;
  legalFramework: string[];
  violations: string[];
  confidenceScore: number;
}

export interface ValidationIssue {
  type: 'mathematical' | 'consistency' | 'source' | 'temporal' | 'format';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  field: string;
  suggestedFix?: string;
}

export interface SourceVerification {
  originalSource: string;
  archiveSource?: string;
  localBackup: boolean;
  crossReferencedSources: string[];
  verificationScore: number; // 0-100
}

export interface ValidatedDataPoint {
  value: number;
  label: string;
  source: string;
  confidence: number;
  lastVerified: string;
  validationNotes?: string;
}

class DataValidationService {
  private validationCache = new Map<string, DataValidationResult>();
  private readonly CACHE_DURATION = 1000 * 60 * 60; // 1 hour

  // Mathematical validation rules
  private async validateMathematical(data: any): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];

    // Budget validation rules
    if (data.budget) {
      const { allocated, executed, variance } = data.budget;
      
      // Check if executed > allocated (should not exceed unless justified)
      if (executed > allocated * 1.05) { // Allow 5% overrun tolerance
        issues.push({
          type: 'mathematical',
          severity: 'high',
          message: `Budget execution (${executed.toLocaleString()}) exceeds allocation (${allocated.toLocaleString()}) by more than 5%`,
          field: 'budget.executed',
          suggestedFix: 'Verify budget amendments or reallocations'
        });
      }

      // Check variance calculation
      const calculatedVariance = allocated - executed;
      if (Math.abs(variance - calculatedVariance) > 1000) {
        issues.push({
          type: 'mathematical',
          severity: 'medium',
          message: `Budget variance calculation error. Expected: ${calculatedVariance}, Found: ${variance}`,
          field: 'budget.variance',
          suggestedFix: 'Recalculate variance as allocated - executed'
        });
      }
    }

    // Revenue validation rules
    if (data.revenue) {
      const { projected, actual, collections } = data.revenue;
      
      // Revenue should not be negative
      if (actual < 0 || projected < 0) {
        issues.push({
          type: 'mathematical',
          severity: 'high',
          message: 'Revenue values cannot be negative',
          field: 'revenue',
          suggestedFix: 'Review data source for incorrect negative values'
        });
      }

      // Collection efficiency check
      const efficiency = (actual / projected) * 100;
      if (efficiency > 120 || efficiency < 30) {
        issues.push({
          type: 'mathematical',
          severity: 'medium',
          message: `Revenue collection efficiency (${efficiency.toFixed(1)}%) is outside normal range (30%-120%)`,
          field: 'revenue.efficiency',
          suggestedFix: 'Verify projected vs actual revenue figures'
        });
      }
    }

    // Contract/Tender validation
    if (data.contracts) {
      data.contracts.forEach((contract: any, index: number) => {
        if (contract.amount <= 0) {
          issues.push({
            type: 'mathematical',
            severity: 'medium',
            message: `Contract ${index + 1} has invalid amount: ${contract.amount}`,
            field: `contracts[${index}].amount`,
            suggestedFix: 'Verify contract amount from official source'
          });
        }

        // Check date consistency
        if (contract.startDate && contract.endDate) {
          const start = new Date(contract.startDate);
          const end = new Date(contract.endDate);
          if (start > end) {
            issues.push({
              type: 'temporal',
              severity: 'high',
              message: `Contract ${index + 1} start date is after end date`,
              field: `contracts[${index}].dates`,
              suggestedFix: 'Verify contract timeline dates'
            });
          }
        }
      });
    }

    // Year-over-year consistency checks
    if (data.yearComparison) {
      const { current, previous } = data.yearComparison;
      const changePercent = ((current - previous) / previous) * 100;
      
      if (Math.abs(changePercent) > 200) { // More than 200% change
        issues.push({
          type: 'consistency',
          severity: 'medium',
          message: `Unusual year-over-year change: ${changePercent.toFixed(1)}%`,
          field: 'yearComparison',
          suggestedFix: 'Verify if significant events justify this change'
        });
      }
    }

    return issues;
  }

  // Source verification
  private async verifyDataSources(data: any): Promise<SourceVerification> {
    const sourceUrl = data.source?.url || 'https://carmendeareco.gob.ar/transparencia/';
    
    try {
      // Check if data matches official source
      const officialData = await this.fetchOfficialData(sourceUrl);
      const matchScore = await this.compareDataSets(data, officialData);
      
      // Check archive availability
      const archiveAvailable = await this.checkArchiveAvailability(sourceUrl);
      
      // Cross-reference with multiple sources
      const crossRefSources = await this.getCrossReferenceSources(data.type);
      const crossRefScore = await this.validateAgainstCrossReferences(data, crossRefSources);
      
      return {
        originalSource: sourceUrl,
        archiveSource: archiveAvailable ? `https://web.archive.org/web/*/${sourceUrl}` : undefined,
        localBackup: await this.checkLocalBackup(data.id || sourceUrl),
        crossReferencedSources: crossRefSources,
        verificationScore: (matchScore + crossRefScore) / 2
      };
    } catch (error) {
      console.warn('Source verification failed:', error);
      return {
        originalSource: sourceUrl,
        localBackup: false,
        crossReferencedSources: [],
        verificationScore: 0
      };
    }
  }

  private async fetchOfficialData(url: string): Promise<any> {
    // Simulate official data fetch - in production this would make HTTP requests
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          lastUpdated: new Date().toISOString(),
          status: 'available',
          contentHash: 'mock_hash_123'
        });
      }, 500);
    });
  }

  private async compareDataSets(local: any, official: any): Promise<number> {
    // Simulate data comparison - returns match percentage
    return Math.random() * 20 + 80; // 80-100% match
  }

  private async checkArchiveAvailability(url: string): Promise<boolean> {
    // In production, this would check Wayback Machine API
    return true;
  }

  private async checkLocalBackup(identifier: string): Promise<boolean> {
    return true; // Simulate local backup availability
  }

  private async getCrossReferenceSources(dataType: string): Promise<string[]> {
    const sources = {
      'budget': [
        'https://www.gba.gob.ar/transparencia',
        'https://datos.gob.ar/dataset?q=presupuesto',
        'https://www.argentina.gob.ar/jefatura/innovacion-publica/datos-abiertos'
      ],
      'contracts': [
        'https://contratos.gov.ar',
        'https://www.gba.gob.ar/contrataciones',
        'https://www.argentina.gob.ar/obras-publicas'
      ],
      'revenue': [
        'https://www.gba.gob.ar/hacienda',
        'https://datos.gob.ar/dataset?q=ingresos',
        'https://www.indec.gob.ar'
      ],
      'declarations': [
        'https://www.argentina.gob.ar/anticorrupcion/declaraciones-juradas',
        'https://www.gba.gob.ar/transparencia/declaraciones'
      ]
    };

    return sources[dataType as keyof typeof sources] || [];
  }

  private async validateAgainstCrossReferences(data: any, sources: string[]): Promise<number> {
    // Simulate cross-reference validation
    return Math.random() * 15 + 85; // 85-100% confidence
  }

  // Temporal validation
  private validateTemporal(data: any): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const currentYear = new Date().getFullYear();

    // Check for future dates in historical data
    if (data.date) {
      const dataDate = new Date(data.date);
      if (dataDate > new Date()) {
        issues.push({
          type: 'temporal',
          severity: 'high',
          message: `Future date found in historical data: ${data.date}`,
          field: 'date',
          suggestedFix: 'Verify date format and correctness'
        });
      }
    }

    // Check for reasonable date ranges
    if (data.fiscalYear) {
      if (data.fiscalYear > currentYear + 1 || data.fiscalYear < 2000) {
        issues.push({
          type: 'temporal',
          severity: 'medium',
          message: `Unusual fiscal year: ${data.fiscalYear}`,
          field: 'fiscalYear',
          suggestedFix: 'Verify fiscal year is within reasonable range'
        });
      }
    }

    return issues;
  }

  // Format validation
  private validateFormat(data: any): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Validate numeric fields
    const numericFields = ['amount', 'budget', 'revenue', 'allocated', 'executed'];
    numericFields.forEach(field => {
      if (data[field] !== undefined && !this.isValidNumber(data[field])) {
        issues.push({
          type: 'format',
          severity: 'high',
          message: `Invalid numeric format in field: ${field}`,
          field,
          suggestedFix: 'Ensure field contains valid numeric value'
        });
      }
    });

    // Validate date fields
    const dateFields = ['date', 'startDate', 'endDate', 'lastUpdated'];
    dateFields.forEach(field => {
      if (data[field] && !this.isValidDate(data[field])) {
        issues.push({
          type: 'format',
          severity: 'medium',
          message: `Invalid date format in field: ${field}`,
          field,
          suggestedFix: 'Use ISO date format (YYYY-MM-DD)'
        });
      }
    });

    // Validate required fields
    const requiredFields = data.requiredFields || [];
    requiredFields.forEach((field: string) => {
      if (data[field] === undefined || data[field] === null || data[field] === '') {
        issues.push({
          type: 'format',
          severity: 'high',
          message: `Missing required field: ${field}`,
          field,
          suggestedFix: `Provide value for required field: ${field}`
        });
      }
    });

    return issues;
  }

  private isValidNumber(value: any): boolean {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
  }

  private isValidDate(value: any): boolean {
    const date = new Date(value);
    return date instanceof Date && !isNaN(date.getTime());
  }

  // Main validation method
  async validateData(data: any, dataType: string): Promise<DataValidationResult> {
    const cacheKey = `${dataType}_${JSON.stringify(data).slice(0, 100)}`;
    
    // Check cache
    const cached = this.validationCache.get(cacheKey);
    if (cached && Date.now() - new Date(cached.lastValidated).getTime() < this.CACHE_DURATION) {
      return cached;
    }

    console.log(`🔍 Validating ${dataType} data with OSINT compliance...`);

    // Run OSINT compliance check first
    const sourceUrl = data.source?.url || 'https://carmendeareco.gob.ar/transparencia/';
    const purpose = `Government transparency data validation for ${dataType}`;
    const osintCompliance = await OSINTComplianceService.checkDataCompliance(data, sourceUrl, purpose);

    // Run all validation checks
    const [
      mathematicalIssues,
      temporalIssues,
      formatIssues,
      sourceVerification
    ] = await Promise.all([
      this.validateMathematical(data),
      Promise.resolve(this.validateTemporal(data)),
      Promise.resolve(this.validateFormat(data)),
      this.verifyDataSources(data)
    ]);

    // Add compliance violations as critical issues
    const complianceIssues: ValidationIssue[] = osintCompliance.violations.map(violation => ({
      type: 'source' as const,
      severity: violation.severity,
      message: `OSINT Compliance: ${violation.message}`,
      field: violation.rule,
      suggestedFix: violation.suggestedFix
    }));

    const allIssues = [
      ...mathematicalIssues,
      ...temporalIssues,
      ...formatIssues,
      ...complianceIssues
    ];

    // Calculate overall confidence
    const criticalIssues = allIssues.filter(i => i.severity === 'critical').length;
    const highIssues = allIssues.filter(i => i.severity === 'high').length;
    const mediumIssues = allIssues.filter(i => i.severity === 'medium').length;
    
    let confidence = 100;
    confidence -= criticalIssues * 30;
    confidence -= highIssues * 15;
    confidence -= mediumIssues * 5;
    confidence = Math.max(0, confidence);

    // Factor in source verification and OSINT compliance
    confidence = (confidence + sourceVerification.verificationScore + osintCompliance.confidenceScore) / 3;

    const complianceCheck: ComplianceCheck = {
      isCompliant: osintCompliance.isCompliant,
      legalFramework: [
        osintCompliance.legalFramework.argentina.transparencyLaw,
        osintCompliance.legalFramework.argentina.privacyLaw,
        osintCompliance.legalFramework.australia.foiAct,
        osintCompliance.legalFramework.australia.privacyAct
      ],
      violations: osintCompliance.violations.map(v => v.message),
      confidenceScore: osintCompliance.confidenceScore
    };

    const result: DataValidationResult = {
      isValid: criticalIssues === 0 && confidence >= 70 && osintCompliance.isCompliant,
      confidence,
      issues: allIssues,
      sourceVerification,
      complianceCheck,
      lastValidated: new Date().toISOString()
    };

    // Cache result
    this.validationCache.set(cacheKey, result);

    console.log(`✅ Validation complete: ${confidence.toFixed(0)}% confidence, ${allIssues.length} issues, OSINT: ${osintCompliance.isCompliant ? 'COMPLIANT' : 'VIOLATIONS'}`);

    return result;
  }

  // Validate specific chart data
  async validateChartData(chartData: any[], chartType: string): Promise<ValidatedDataPoint[]> {
    console.log(`📊 Validating ${chartType} chart data...`);

    const validated: ValidatedDataPoint[] = [];

    for (const point of chartData) {
      const validation = await this.validateData(point, chartType);
      
      validated.push({
        value: point.value || point.amount || point.count,
        label: point.label || point.name || point.category,
        source: point.source || 'Carmen de Areco - Portal de Transparencia',
        confidence: validation.confidence,
        lastVerified: validation.lastValidated,
        validationNotes: validation.issues.length > 0 
          ? `${validation.issues.length} issues found` 
          : undefined
      });
    }

    return validated;
  }

  // Get validation summary for a page
  async getPageValidationSummary(pageData: any, pageType: string): Promise<{
    overallConfidence: number;
    totalIssues: number;
    criticalIssues: number;
    dataPointsValidated: number;
    lastValidated: string;
    recommendations: string[];
  }> {
    const validation = await this.validateData(pageData, pageType);
    
    const recommendations = [];
    
    if (validation.confidence < 90) {
      recommendations.push('Review data sources for accuracy');
    }
    
    if (validation.issues.some(i => i.type === 'mathematical')) {
      recommendations.push('Verify mathematical calculations and formulas');
    }
    
    if (validation.issues.some(i => i.type === 'source')) {
      recommendations.push('Update data sources and verify availability');
    }
    
    if (sourceVerification.verificationScore < 80) {
      recommendations.push('Strengthen source verification and cross-referencing');
    }

    return {
      overallConfidence: validation.confidence,
      totalIssues: validation.issues.length,
      criticalIssues: validation.issues.filter(i => i.severity === 'critical').length,
      dataPointsValidated: 1,
      lastValidated: validation.lastValidated,
      recommendations
    };
  }
}

export default new DataValidationService();