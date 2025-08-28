/**
 * Cross-Validation Service for Carmen de Areco Transparency Portal
 * Compares PowerBI data with official documents and backend API data
 */

import CarmenArecoPowerBIService, { CarmenArecoPowerBIData } from './CarmenArecoPowerBIService';
import OfficialDataService, { OfficialDocument } from './OfficialDataService';
import RealDataService, { RealDocumentData } from './RealDataService';
import ApiService from './ApiService';
import MarkdownDataService from './MarkdownDataService';

export interface IrregularityReport {
  type: 'budget_deviation' | 'missing_documentation' | 'unusual_pattern' | 'fund_misallocation' | 'suspicious_transaction';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedAmount: number;
  evidence: string[];
  requiredAction: string;
  investigationPriority: number;
}

export interface ValidationResult {
  category: string;
  powerBIValue: number;
  documentValue?: number;
  apiValue?: number;
  discrepancyPercentage: number;
  status: 'match' | 'minor_discrepancy' | 'major_discrepancy' | 'missing_data' | 'suspicious_pattern' | 'fraud_indicator';
  confidence: number;
  details: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  fraudIndicators: string[];
  sources: {
    powerBI: boolean;
    documents: boolean;
    api: boolean;
  };
}

export interface CrossValidationReport {
  year: number;
  generatedAt: string;
  summary: {
    totalValidations: number;
    matches: number;
    minorDiscrepancies: number;
    majorDiscrepancies: number;
    missingData: number;
    suspiciousPatterns: number;
    fraudIndicators: number;
    overallAccuracy: number;
    riskScore: number;
  };
  validations: ValidationResult[];
  documentAnalysis: {
    documentsProcessed: OfficialDocument[];
    extractedData: any[];
    ocrResults: any[];
    ejecucionPresupuestariaAnalysis: any[];
  };
  fraudAnalysis: {
    irregularities: IrregularityReport[];
    riskFactors: string[];
    priorityInvestigations: string[];
  };
  recommendations: string[];
}

class CrossValidationService {
  private static instance: CrossValidationService;
  
  private constructor() {}

  static getInstance(): CrossValidationService {
    if (!CrossValidationService.instance) {
      CrossValidationService.instance = new CrossValidationService();
    }
    return CrossValidationService.instance;
  }

  /**
   * Perform comprehensive cross-validation for a specific year
   */
  async performCrossValidation(year: number): Promise<CrossValidationReport> {
    console.log(`🔍 Starting cross-validation for Carmen de Areco data (${year})`);
    
    try {
      // 1. Get PowerBI data
      const powerBIService = CarmenArecoPowerBIService.getInstance();
      const powerBIData = await powerBIService.getMunicipalData(year);
      
      // 2. Get official documents for the year
      const officialDocs = OfficialDataService.getDocumentsByYear(year);
      
      // 3. Extract data from documents (simulate OCR/parsing)
      const documentData = await this.extractDataFromDocuments(officialDocs);
      
      // 4. Get API data for comparison
      const apiData = await this.getAPIDataForYear(year);
      
      // 5. Perform validations
      const validations = await this.performValidations(powerBIData, documentData, apiData);
      
      // 6. Generate report
      const report = this.generateValidationReport(year, validations, officialDocs, documentData);
      
      console.log(`✅ Cross-validation completed for ${year}:`, {
        totalValidations: report.summary.totalValidations,
        accuracy: report.summary.overallAccuracy,
        documentsProcessed: report.documentAnalysis.documentsProcessed.length
      });
      
      return report;
      
    } catch (error) {
      console.error('Cross-validation failed:', error);
      throw new Error(`Failed to perform cross-validation for year ${year}`);
    }
  }

  /**
   * Extract financial data from official documents
   */
  private async extractDataFromDocuments(documents: OfficialDocument[]): Promise<any[]> {
    const extractedData = [];
    const markdownService = MarkdownDataService.getInstance();
    
    for (const doc of documents) {
      // Get the markdown content for the document
      const markdownDoc = markdownService.getDocumentById(doc.id);
      if (markdownDoc) {
        // Simulate extraction from markdown content
        const extractionResult = this.processMarkdownContent(markdownDoc);
        extractedData.push({
          documentId: doc.id,
          title: doc.title,
          year: doc.year,
          extractedData: extractionResult,
          extractionConfidence: 0.95, // High confidence as it's from processed markdown
          extractionMethod: 'MARKDOWN_PARSING',
          pagesProcessed: markdownDoc.metadata.pages,
          fraudIndicators: this.detectDocumentFraudIndicators(extractionResult, doc.year)
        });
      }
    }
    
    return extractedData;
  }

  private processMarkdownContent(markdownDoc: any): any {
    // This is a simplified example. In a real scenario, you'd parse the markdown
    // content to extract structured financial data.
    // For now, we'll use the financialData already present in the markdownDoc
    return markdownDoc.financialData;
  }

  

  /**
   * Get API data for comparison
   */
  private async getAPIDataForYear(year: number): Promise<any> {
    try {
      const [
        financialReports,
        salaries,
        contracts,
        expenses
      ] = await Promise.all([
        ApiService.getFinancialReports(year),
        ApiService.getSalaries(year),
        ApiService.getPublicTenders(year),
        ApiService.getOperationalExpenses(year)
      ]);

      return {
        totalBudget: financialReports.reduce((sum, r) => sum + (r.income || 0), 0),
        totalExpenses: expenses.reduce((sum, e) => sum + (e.amount || 0), 0),
        employeeCount: salaries.length,
        totalPayroll: salaries.reduce((sum, s) => sum + (s.net_salary || 0), 0),
        contractsValue: contracts.reduce((sum, c) => sum + (c.budget || 0), 0)
      };
    } catch (error) {
      console.warn('API data not available for validation:', error);
      return null;
    }
  }

  /**
   * Perform individual validations comparing different data sources
   */
  private async performValidations(
    powerBIData: CarmenArecoPowerBIData,
    documentData: any[],
    apiData: any
  ): Promise<ValidationResult[]> {
    const validations: ValidationResult[] = [];

    // Find the main financial document
    const mainFinancialDoc = documentData.find(doc => 
      doc.title.includes('Económico-Financiera') && doc.extractedData.totalBudget
    );

    // Validation 1: Total Budget
    validations.push(this.validateMetric(
      'Total Budget',
      powerBIData.presupuesto.totalBudget,
      mainFinancialDoc?.extractedData.totalBudget,
      apiData?.totalBudget,
      'presupuesto'
    ));

    // Validation 2: Total Revenue
    validations.push(this.validateMetric(
      'Total Revenue',
      powerBIData.ingresos.total,
      mainFinancialDoc?.extractedData.totalIncome,
      null,
      'ingresos'
    ));

    // Validation 3: Total Expenses
    validations.push(this.validateMetric(
      'Total Expenses',
      powerBIData.gastos.total,
      mainFinancialDoc?.extractedData.totalExpenses,
      apiData?.totalExpenses,
      'gastos'
    ));

    // Validation 4: Employee Count
    const orgDoc = documentData.find(doc => doc.title.includes('Organigrama'));
    validations.push(this.validateMetric(
      'Employee Count',
      powerBIData.salarios.employeeCount,
      orgDoc?.extractedData.employeeCount || mainFinancialDoc?.extractedData.employeeCount,
      apiData?.employeeCount,
      'empleados'
    ));

    // Validation 5: Total Payroll
    validations.push(this.validateMetric(
      'Total Payroll',
      powerBIData.salarios.totalPayroll,
      mainFinancialDoc?.extractedData.totalPayroll,
      apiData?.totalPayroll,
      'nomina'
    ));

    // Validation 6: Municipal Debt
    validations.push(this.validateMetric(
      'Municipal Debt',
      powerBIData.deuda.totalDebt,
      null, // Usually not in basic financial reports
      null,
      'deuda'
    ));

    return validations.filter(v => v !== null);
  }

  

  

  

  /**
   * Validate a specific metric across data sources
   */
  private validateMetric(
    category: string,
    powerBIValue: number,
    documentValue?: number,
    apiValue?: number,
    type: string = 'general'
  ): ValidationResult {
    const sources = {
      powerBI: powerBIValue !== undefined && powerBIValue !== null,
      documents: documentValue !== undefined && documentValue !== null,
      api: apiValue !== undefined && apiValue !== null
    };

    // Calculate discrepancies
    let discrepancyPercentage = 0;
    let status: 'match' | 'minor_discrepancy' | 'major_discrepancy' | 'missing_data' | 'suspicious_pattern' | 'fraud_indicator' = 'missing_data';
    let confidence = 0;
    let details = '';
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let fraudIndicators: string[] = [];

    if (sources.powerBI && sources.documents) {
      discrepancyPercentage = Math.abs((powerBIValue - documentValue!) / powerBIValue) * 100;
      
      if (discrepancyPercentage < 2) {
        status = 'match';
        confidence = 0.95;
        riskLevel = 'low';
        details = `PowerBI y documento coinciden dentro del 2% (${discrepancyPercentage.toFixed(2)}%)`;
      } else if (discrepancyPercentage < 10) {
        status = 'minor_discrepancy';
        confidence = 0.75;
        riskLevel = 'medium';
        details = `Discrepancia menor del ${discrepancyPercentage.toFixed(2)}% entre PowerBI y documento`;
      } else if (discrepancyPercentage < 25) {
        status = 'major_discrepancy';
        confidence = 0.3;
        riskLevel = 'high';
        details = `Discrepancia mayor del ${discrepancyPercentage.toFixed(2)}% - requiere investigación`;
        fraudIndicators.push('DISCREPANCIA_DATOS_OFICIAL');
      } else {
        status = 'fraud_indicator';
        confidence = 0.1;
        riskLevel = 'critical';
        details = `Discrepancia crítica del ${discrepancyPercentage.toFixed(2)}% - posible manipulación de datos`;
        fraudIndicators.push('DISCREPANCIA_CRITICA', 'POSIBLE_MANIPULACION');
      }

      // Enhanced fraud detection patterns
      fraudIndicators = [...fraudIndicators, ...this.detectFraudPatterns(category, powerBIValue, documentValue!, discrepancyPercentage)];

      // Cross-validate with API if available
      if (sources.api) {
        const apiDiscrepancy = Math.abs((powerBIValue - apiValue!) / powerBIValue) * 100;
        details += `. Validación API: ${apiDiscrepancy.toFixed(2)}% diferencia`;
        
        // Triple validation fraud detection
        if (apiDiscrepancy > 20 && discrepancyPercentage > 20) {
          fraudIndicators.push('INCONSISTENCIA_MULTIPLES_FUENTES');
          riskLevel = 'critical';
          status = 'fraud_indicator';
        }
        
        confidence = Math.min(confidence, 0.9);
      }
    } else if (sources.powerBI && sources.api) {
      discrepancyPercentage = Math.abs((powerBIValue - apiValue!) / powerBIValue) * 100;
      
      if (discrepancyPercentage < 5) {
        status = 'match';
        riskLevel = 'low';
      } else if (discrepancyPercentage < 15) {
        status = 'minor_discrepancy';
        riskLevel = 'medium';
      } else if (discrepancyPercentage < 30) {
        status = 'major_discrepancy';
        riskLevel = 'high';
        fraudIndicators.push('DISCREPANCIA_POWERBI_API');
      } else {
        status = 'suspicious_pattern';
        riskLevel = 'critical';
        fraudIndicators.push('PATRON_SOSPECHOSO', 'VALIDACION_FALLIDA');
      }
      
      confidence = 0.7;
      details = `Comparación PowerBI vs API: ${discrepancyPercentage.toFixed(2)}% diferencia`;
    } else if (sources.powerBI) {
      status = 'missing_data';
      confidence = 0.5;
      riskLevel = 'medium';
      details = 'Solo datos de PowerBI disponibles - no hay validación cruzada posible';
      fraudIndicators.push('FALTA_DOCUMENTACION');
    } else {
      status = 'missing_data';
      confidence = 0.1;
      riskLevel = 'high';
      details = 'Datos insuficientes para validación';
      fraudIndicators.push('DATOS_INSUFICIENTES');
    }

    return {
      category,
      powerBIValue,
      documentValue,
      apiValue,
      discrepancyPercentage,
      status,
      confidence,
      details,
      riskLevel,
      fraudIndicators,
      sources
    };
  }

  /**
   * Detect specific fraud patterns based on category and values
   */
  private detectFraudPatterns(category: string, powerBIValue: number, documentValue: number, discrepancy: number): string[] {
    const patterns = [];
    
    // Budget-specific fraud patterns
    if (category.includes('Budget') || category.includes('Presupuesto')) {
      if (powerBIValue > documentValue * 1.15) {
        patterns.push('INFLACION_PRESUPUESTO');
      }
      if (documentValue > powerBIValue * 1.2) {
        patterns.push('OCULTACION_GASTOS');
      }
    }
    
    // Payroll fraud patterns
    if (category.includes('Payroll') || category.includes('Salarios')) {
      if (discrepancy > 15) {
        patterns.push('NOMINAS_FANTASMA');
      }
    }
    
    // Contract fraud patterns  
    if (category.includes('Contract') || category.includes('Contrato')) {
      if (powerBIValue < documentValue * 0.7) {
        patterns.push('CONTRATOS_FICTICIOS');
      }
    }
    
    // Revenue fraud patterns
    if (category.includes('Revenue') || category.includes('Ingresos')) {
      if (documentValue > powerBIValue * 1.3) {
        patterns.push('INGRESOS_INFLADOS');
      }
    }
    
    return patterns;
  }

  /**
   * Generate comprehensive validation report
   */
  private generateValidationReport(
    year: number,
    validations: ValidationResult[],
    documents: OfficialDocument[],
    documentData: any[]
  ): CrossValidationReport {
    const summary = {
      totalValidations: validations.length,
      matches: validations.filter(v => v.status === 'match').length,
      minorDiscrepancies: validations.filter(v => v.status === 'minor_discrepancy').length,
      majorDiscrepancies: validations.filter(v => v.status === 'major_discrepancy').length,
      missingData: validations.filter(v => v.status === 'missing_data').length,
      suspiciousPatterns: validations.filter(v => v.status === 'suspicious_pattern').length,
      fraudIndicators: validations.filter(v => v.status === 'fraud_indicator').length,
      overallAccuracy: validations.length > 0 ? 
        (validations.filter(v => v.status === 'match').length / validations.length) * 100 : 0,
      riskScore: this.calculateOverallRiskScore(validations)
    };

    const fraudAnalysis = this.generateFraudAnalysis(validations, documentData);
    const recommendations = this.generateRecommendations(validations, summary);

    // Find Ejecución Presupuestaria documents
    const ejecucionDocs = documentData.filter(d => 
      d.title.includes('Ejecución Presupuestaria') || d.title.includes('Económico-Financiera')
    );

    return {
      year,
      generatedAt: new Date().toISOString(),
      summary,
      validations,
      documentAnalysis: {
        documentsProcessed: documents,
        extractedData: documentData,
        ocrResults: documentData.map(d => ({
          documentId: d.documentId,
          confidence: d.extractionConfidence,
          method: d.extractionMethod,
          pages: d.pagesProcessed
        })),
        ejecucionPresupuestariaAnalysis: ejecucionDocs.map(d => ({
          documentId: d.documentId,
          budgetExecution: d.extractedData.budgetExecution,
          fraudIndicators: d.fraudIndicators || [],
          monthlyPattern: d.extractedData.monthlyExecution || [],
          categoryBreakdown: d.extractedData.categoryBreakdown || {}
        }))
      },
      fraudAnalysis,
      recommendations
    };
  }

  /**
   * Calculate overall risk score based on validation results
   */
  private calculateOverallRiskScore(validations: ValidationResult[]): number {
    if (validations.length === 0) return 0;
    
    let totalRiskPoints = 0;
    validations.forEach(v => {
      switch (v.riskLevel) {
        case 'low': totalRiskPoints += 1; break;
        case 'medium': totalRiskPoints += 3; break;
        case 'high': totalRiskPoints += 7; break;
        case 'critical': totalRiskPoints += 10; break;
      }
      
      // Add points for fraud indicators
      totalRiskPoints += v.fraudIndicators.length * 2;
    });
    
    const maxPossibleRisk = validations.length * 10;
    return Math.min((totalRiskPoints / maxPossibleRisk) * 100, 100);
  }

  /**
   * Generate comprehensive fraud analysis
   */
  private generateFraudAnalysis(validations: ValidationResult[], documentData: any[]): any {
    const irregularities: IrregularityReport[] = [];
    const riskFactors: string[] = [];
    const priorityInvestigations: string[] = [];
    
    // Analyze validation results for irregularities
    validations.forEach(validation => {
      if (validation.status === 'fraud_indicator' || validation.riskLevel === 'critical') {
        irregularities.push({
          type: this.categorizeIrregularity(validation.category),
          severity: validation.riskLevel === 'critical' ? 'critical' : 'high',
          description: `${validation.category}: ${validation.details}`,
          affectedAmount: validation.powerBIValue,
          evidence: validation.fraudIndicators,
          requiredAction: this.generateRequiredAction(validation.fraudIndicators),
          investigationPriority: validation.riskLevel === 'critical' ? 10 : 7
        });
      }
    });

    // Analyze document-specific fraud indicators
    documentData.forEach(doc => {
      if (doc.fraudIndicators && doc.fraudIndicators.length > 0) {
        doc.fraudIndicators.forEach(indicator => {
          const severity = this.assessIndicatorSeverity(indicator);
          if (severity === 'high' || severity === 'critical') {
            irregularities.push({
              type: 'budget_deviation',
              severity,
              description: `Indicador de fraude en ${doc.title}: ${indicator}`,
              affectedAmount: doc.extractedData.totalBudget || 0,
              evidence: [indicator],
              requiredAction: this.generateActionForIndicator(indicator),
              investigationPriority: severity === 'critical' ? 10 : 6
            });
          }
        });
      }
    });

    // Generate risk factors
    const allFraudIndicators = validations.flatMap(v => v.fraudIndicators);
    const indicatorCounts = this.countIndicators(allFraudIndicators);
    
    Object.entries(indicatorCounts).forEach(([indicator, count]) => {
      if (count >= 2) {
        riskFactors.push(`Patrón recurrente: ${indicator} (${count} ocurrencias)`);
      }
    });

    // High-risk categories for priority investigation
    if (irregularities.some(i => i.type === 'fund_misallocation')) {
      priorityInvestigations.push('Investigar asignación irregular de fondos públicos');
    }
    if (irregularities.some(i => i.evidence.includes('CONTRATOS_FICTICIOS'))) {
      priorityInvestigations.push('Auditar contratos con indicadores de irregularidad');
    }
    if (irregularities.some(i => i.evidence.includes('GASTO_CONCENTRADO_DICIEMBRE'))) {
      priorityInvestigations.push('Revisar gastos concentrados al final del período fiscal');
    }

    return {
      irregularities: irregularities.sort((a, b) => b.investigationPriority - a.investigationPriority),
      riskFactors,
      priorityInvestigations
    };
  }

  private categorizeIrregularity(category: string): IrregularityReport['type'] {
    if (category.includes('Budget') || category.includes('Presupuesto')) return 'budget_deviation';
    if (category.includes('Contract') || category.includes('Contrato')) return 'suspicious_transaction';
    if (category.includes('Payroll') || category.includes('Salarios')) return 'fund_misallocation';
    return 'unusual_pattern';
  }

  private assessIndicatorSeverity(indicator: string): IrregularityReport['severity'] {
    const criticalIndicators = ['PRESUPUESTO_SOBREEJECUCION', 'CONTRATOS_FICTICIOS', 'NOMINAS_FANTASMA'];
    const highIndicators = ['GASTO_CONCENTRADO_DICIEMBRE', 'TRANSFERENCIAS_EXCESIVAS'];
    
    if (criticalIndicators.includes(indicator)) return 'critical';
    if (highIndicators.includes(indicator)) return 'high';
    return 'medium';
  }

  private generateRequiredAction(fraudIndicators: string[]): string {
    if (fraudIndicators.includes('DISCREPANCIA_CRITICA')) {
      return 'Auditoría inmediata de registros contables y documentación de respaldo';
    }
    if (fraudIndicators.includes('CONTRATOS_FICTICIOS')) {
      return 'Verificación física de contratos y proveedores relacionados';
    }
    if (fraudIndicators.includes('NOMINAS_FANTASMA')) {
      return 'Verificación de existencia real de empleados y puestos de trabajo';
    }
    return 'Revisión detallada de documentación y procedimientos';
  }

  private generateActionForIndicator(indicator: string): string {
    const actions = {
      'PRESUPUESTO_SOBREEJECUCION': 'Revisar autorizaciones de gastos excedentes',
      'GASTO_CONCENTRADO_DICIEMBRE': 'Auditar justificaciones de gastos de fin de año',
      'TRANSFERENCIAS_EXCESIVAS': 'Verificar destino y justificación de transferencias',
      'CONTRATOS_VALOR_ANOMALO': 'Comparar precios con mercado y licitaciones similares',
      'INVERSIONES_INSUFICIENTES': 'Revisar planificación y ejecución de inversiones públicas'
    };
    return actions[indicator] || 'Análisis detallado requerido';
  }

  private countIndicators(indicators: string[]): Record<string, number> {
    return indicators.reduce((acc, indicator) => {
      acc[indicator] = (acc[indicator] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Generate recommendations based on validation results
   */
  private generateRecommendations(validations: ValidationResult[], summary: any): string[] {
    const recommendations = [];

    // Overall assessment
    if (summary.riskScore < 20) {
      recommendations.push('✅ Bajo riesgo de irregularidades detectadas');
    } else if (summary.riskScore < 50) {
      recommendations.push('⚠️ Riesgo moderado - requiere monitoreo continuo');
    } else if (summary.riskScore < 75) {
      recommendations.push('🔴 Alto riesgo - auditoría detallada recomendada');
    } else {
      recommendations.push('🚨 Riesgo crítico - investigación inmediata requerida');
    }

    // Data consistency
    if (summary.overallAccuracy > 90) {
      recommendations.push('✅ Excelente consistencia entre fuentes de datos');
    } else if (summary.overallAccuracy > 75) {
      recommendations.push('⚠️ Buena consistencia con algunas discrepancias menores');
    } else {
      recommendations.push('🔴 Discrepancias significativas requieren investigación');
    }

    // Fraud-specific recommendations
    if (summary.fraudIndicators > 0) {
      recommendations.push(`🚨 URGENTE: ${summary.fraudIndicators} indicadores de posible fraude detectados`);
      recommendations.push('🔍 Realizar auditoría forense inmediata');
    }

    if (summary.suspiciousPatterns > 0) {
      recommendations.push(`⚠️ ${summary.suspiciousPatterns} patrones sospechosos requieren investigación`);
    }

    if (summary.majorDiscrepancies > 0) {
      recommendations.push(`🔍 Revisar ${summary.majorDiscrepancies} discrepancias mayores identificadas`);
    }

    // Data completeness
    if (summary.missingData > summary.totalValidations * 0.3) {
      recommendations.push('📄 Completar datos faltantes en documentos oficiales');
    }

    // Technical improvements
    const lowConfidenceValidations = validations.filter(v => v.confidence < 0.7);
    if (lowConfidenceValidations.length > 0) {
      recommendations.push(`🔬 Mejorar extracción de datos para ${lowConfidenceValidations.length} categorías`);
    }

    // Specific Ejecución Presupuestaria recommendations
    const budgetValidations = validations.filter(v => 
      v.category.includes('Budget') || v.category.includes('Presupuesto')
    );
    if (budgetValidations.some(v => v.fraudIndicators.includes('PRESUPUESTO_SOBREEJECUCION'))) {
      recommendations.push('📊 Implementar control de ejecución presupuestaria en tiempo real');
    }

    if (budgetValidations.some(v => v.fraudIndicators.includes('GASTO_CONCENTRADO_DICIEMBRE'))) {
      recommendations.push('📅 Establecer alertas para gastos concentrados al final del período');
    }

    // System improvements
    recommendations.push('📊 Integrar más fuentes de datos para validación cruzada');
    recommendations.push('🤖 Automatizar proceso de validación mensual');
    recommendations.push('🔔 Configurar alertas automáticas para discrepancias críticas');

    // Legal/procedural recommendations
    if (summary.riskScore > 50) {
      recommendations.push('⚖️ Considerar reporte a autoridades de control');
      recommendations.push('📋 Documentar todos los hallazgos para posible investigación legal');
    }

    return recommendations;
  }

  /**
   * Get validation history for trend analysis
   */
  async getValidationHistory(startYear: number, endYear: number): Promise<CrossValidationReport[]> {
    const reports = [];
    
    for (let year = startYear; year <= endYear; year++) {
      try {
        const report = await this.performCrossValidation(year);
        reports.push(report);
      } catch (error) {
        console.warn(`Skipping validation for year ${year}:`, error);
      }
    }
    
    return reports;
  }

  /**
   * Export validation report to different formats
   */
  exportReport(report: CrossValidationReport, format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(report, null, 2);
    }
    
    // CSV export
    const csvLines = [
      'Categoria,PowerBI,Documento,API,Discrepancia_%,Estado,Confianza,Detalles'
    ];
    
    report.validations.forEach(v => {
      csvLines.push([
        v.category,
        v.powerBIValue.toString(),
        v.documentValue?.toString() || 'N/A',
        v.apiValue?.toString() || 'N/A',
        v.discrepancyPercentage.toFixed(2),
        v.status,
        (v.confidence * 100).toFixed(1),
        `"${v.details}"`
      ].join(','));
    });
    
    return csvLines.join('\n');
  }
}

export default CrossValidationService;