const DatabaseDataService = require('./DatabaseDataService');

/**
 * Financial Analysis Service for Transparency and Corruption Detection
 * Carmen de Areco Transparency Portal
 * 
 * This service analyzes municipal financial data to detect:
 * - Budget execution irregularities
 * - Overspending patterns
 * - Contract anomalies
 * - Salary inconsistencies
 * - Missing documentation
 * - Unusual expenditure patterns
 */
class FinancialAnalysisService {
  constructor() {
    this.databaseService = new DatabaseDataService();
    this.analysisCache = new Map();
    this.cacheExpiry = 10 * 60 * 1000; // 10 minutes
    this.lastAnalysis = new Date();
  }

  /**
   * Generate comprehensive financial irregularity report for a year
   */
  async analyzeFinancialIrregularities(year) {
    try {
      console.log(`🔍 Analyzing financial irregularities for ${year}...`);
      
      const yearData = await this.databaseService.getYearlyData(year);
      const documents = await this.databaseService.getDocumentsForYear(year);
      
      if (!yearData.budget.total || yearData.budget.total === 0) {
        return {
          year,
          analysis_status: 'insufficient_data',
          irregularities: [],
          risk_score: 0,
          transparency_score: 0
        };
      }

      const irregularities = [];
      let riskScore = 0;
      
      // 1. BUDGET EXECUTION ANALYSIS
      const budgetIrregularities = this.analyzeBudgetExecution(yearData);
      irregularities.push(...budgetIrregularities.issues);
      riskScore += budgetIrregularities.risk;

      // 2. OVERSPENDING DETECTION
      const overspendingIssues = this.detectOverspending(yearData);
      irregularities.push(...overspendingIssues.issues);
      riskScore += overspendingIssues.risk;

      // 3. CONTRACT ANALYSIS
      const contractIssues = this.analyzeContracts(yearData);
      irregularities.push(...contractIssues.issues);
      riskScore += contractIssues.risk;

      // 4. SALARY IRREGULARITIES
      const salaryIssues = this.analyzeSalaryIrregularities(yearData);
      irregularities.push(...salaryIssues.issues);
      riskScore += salaryIssues.risk;

      // 5. DOCUMENTATION GAPS
      const documentationIssues = this.analyzeDocumentationGaps(yearData, documents);
      irregularities.push(...documentationIssues.issues);
      riskScore += documentationIssues.risk;

      // 6. EXPENSE PATTERN ANALYSIS
      const expenseIssues = this.analyzeExpensePatterns(yearData);
      irregularities.push(...expenseIssues.issues);
      riskScore += expenseIssues.risk;

      // Calculate transparency score (inverse of risk)
      const transparencyScore = Math.max(0, 100 - riskScore);

      const analysis = {
        year,
        analysis_date: new Date().toISOString(),
        analysis_status: 'complete',
        total_budget: yearData.budget.total,
        executed_budget: yearData.budget.executed,
        execution_rate: yearData.budget.percentage,
        documents_analyzed: documents.length,
        irregularities: irregularities.sort((a, b) => b.severity - a.severity),
        risk_score: Math.min(100, riskScore),
        transparency_score: transparencyScore,
        summary: {
          high_risk_issues: irregularities.filter(i => i.severity >= 8).length,
          medium_risk_issues: irregularities.filter(i => i.severity >= 5 && i.severity < 8).length,
          low_risk_issues: irregularities.filter(i => i.severity < 5).length,
          total_issues: irregularities.length,
          requires_investigation: irregularities.some(i => i.severity >= 8),
          overall_assessment: this.getOverallAssessment(transparencyScore, irregularities.length)
        },
        recommendations: this.generateRecommendations(irregularities, yearData),
        official_sources: this.getOfficialSources(year)
      };

      // Cache the analysis
      this.analysisCache.set(year, analysis);
      
      console.log(`✅ Financial analysis complete for ${year}: ${irregularities.length} issues found, risk score: ${riskScore}`);
      
      return analysis;

    } catch (error) {
      console.error(`Error analyzing ${year}:`, error);
      return {
        year,
        analysis_status: 'error',
        error: error.message,
        irregularities: [],
        risk_score: 0,
        transparency_score: 0
      };
    }
  }

  /**
   * Analyze budget execution for irregularities
   */
  analyzeBudgetExecution(yearData) {
    const issues = [];
    let risk = 0;

    const executionRate = yearData.budget.percentage;
    
    // Very low execution rate
    if (executionRate < 60) {
      issues.push({
        type: 'budget_execution',
        severity: 7,
        title: 'Muy Baja Ejecución Presupuestaria',
        description: `Solo se ejecutó el ${executionRate}% del presupuesto. Esto puede indicar planificación deficiente o fondos retenidos indebidamente.`,
        amount: yearData.budget.total - yearData.budget.executed,
        category: 'execution_efficiency'
      });
      risk += 15;
    }

    // Extremely high execution rate (over 98%) - suspicious
    if (executionRate > 98) {
      issues.push({
        type: 'budget_execution',
        severity: 6,
        title: 'Ejecución Presupuestaria Sospechosamente Alta',
        description: `Se ejecutó el ${executionRate}% del presupuesto. Tasas tan altas pueden indicar gastos apresurados al final del año.`,
        amount: yearData.budget.executed,
        category: 'execution_patterns'
      });
      risk += 10;
    }

    // Check category imbalances
    if (yearData.budget.categories && yearData.budget.categories.length > 0) {
      yearData.budget.categories.forEach(category => {
        if (category.percentage > 100) {
          issues.push({
            type: 'budget_overrun',
            severity: 9,
            title: `Sobreejecución en ${category.name}`,
            description: `La categoría "${category.name}" se ejecutó al ${category.percentage}%, excediendo el presupuesto autorizado.`,
            amount: category.executed - category.budgeted,
            category: 'overspending'
          });
          risk += 20;
        }
      });
    }

    return { issues, risk };
  }

  /**
   * Detect overspending patterns
   */
  detectOverspending(yearData) {
    const issues = [];
    let risk = 0;

    // Check if total executed exceeds total budget
    if (yearData.budget.executed > yearData.budget.total) {
      const overspend = yearData.budget.executed - yearData.budget.total;
      issues.push({
        type: 'total_overspending',
        severity: 10,
        title: 'Sobregasto del Presupuesto Total',
        description: `El gasto ejecutado excede el presupuesto aprobado por $${(overspend/1000000).toFixed(1)}M. Esto es una violación presupuestaria grave.`,
        amount: overspend,
        category: 'critical_overspending'
      });
      risk += 25;
    }

    // Check expense categories for unusual patterns
    if (yearData.expenses.categories) {
      const totalExpenses = yearData.expenses.total;
      const budgetTotal = yearData.budget.total;
      
      yearData.expenses.categories.forEach(expense => {
        const expenseRatio = (expense.amount / totalExpenses) * 100;
        
        // Administrative expenses over 15% is suspicious
        if (expense.category === 'Administración' && expenseRatio > 15) {
          issues.push({
            type: 'administrative_overspending',
            severity: 7,
            title: 'Gastos Administrativos Excesivos',
            description: `Los gastos administrativos representan el ${expenseRatio.toFixed(1)}% del total, por encima del 15% recomendado.`,
            amount: expense.amount,
            category: 'administrative_waste'
          });
          risk += 12;
        }

        // Personal costs over 50% is a red flag
        if (expense.category === 'Personal' && expenseRatio > 50) {
          issues.push({
            type: 'personnel_overspending',
            severity: 8,
            title: 'Gastos de Personal Desproporcionados',
            description: `Los gastos de personal representan el ${expenseRatio.toFixed(1)}% del presupuesto total, indicando posible sobrecontratación.`,
            amount: expense.amount,
            category: 'personnel_issues'
          });
          risk += 15;
        }
      });
    }

    return { issues, risk };
  }

  /**
   * Analyze contracts for irregularities
   */
  analyzeContracts(yearData) {
    const issues = [];
    let risk = 0;

    if (yearData.contracts.total > 0) {
      const contractRatio = (yearData.contracts.total / yearData.budget.total) * 100;
      
      // High contract spending relative to budget
      if (contractRatio > 20) {
        issues.push({
          type: 'contract_spending',
          severity: 6,
          title: 'Alto Nivel de Contrataciones',
          description: `Las contrataciones representan el ${contractRatio.toFixed(1)}% del presupuesto total. Requiere monitoreo para evitar favoritismo.`,
          amount: yearData.contracts.total,
          category: 'contract_oversight'
        });
        risk += 10;
      }

      // Very low documentation for contracts
      if (yearData.contracts.count < 3 && yearData.contracts.total > yearData.budget.total * 0.05) {
        issues.push({
          type: 'contract_documentation',
          severity: 8,
          title: 'Documentación Insuficiente de Contratos',
          description: `Solo ${yearData.contracts.count} contratos documentados para $${(yearData.contracts.total/1000000).toFixed(1)}M en contrataciones.`,
          amount: yearData.contracts.total,
          category: 'transparency'
        });
        risk += 16;
      }
    }

    return { issues, risk };
  }

  /**
   * Analyze salary irregularities
   */
  analyzeSalaryIrregularities(yearData) {
    const issues = [];
    let risk = 0;

    if (yearData.salaries.total > 0) {
      const salaryRatio = (yearData.salaries.total / yearData.budget.total) * 100;
      
      // Salary costs over 45% of budget
      if (salaryRatio > 45) {
        issues.push({
          type: 'salary_costs',
          severity: 7,
          title: 'Costos Salariales Excesivos',
          description: `Los salarios representan el ${salaryRatio.toFixed(1)}% del presupuesto, por encima del 45% recomendado.`,
          amount: yearData.salaries.total,
          category: 'personnel_costs'
        });
        risk += 12;
      }

      // Unrealistic average salary
      const avgSalary = yearData.salaries.average_salary;
      const year = yearData.year;
      const expectedRange = {
        2018: [250000, 400000],
        2019: [280000, 450000],
        2020: [320000, 500000],
        2021: [360000, 550000],
        2022: [400000, 650000],
        2023: [450000, 750000],
        2024: [500000, 850000],
        2025: [550000, 950000]
      };

      const [minExpected, maxExpected] = expectedRange[year] || [400000, 700000];
      
      if (avgSalary > maxExpected) {
        issues.push({
          type: 'salary_levels',
          severity: 8,
          title: 'Salarios Municipales Inflados',
          description: `Salario promedio de $${avgSalary.toLocaleString()} excede rangos normales para ${year} ($${maxExpected.toLocaleString()} máximo esperado).`,
          amount: avgSalary,
          category: 'compensation_irregularities'
        });
        risk += 15;
      }
    }

    return { issues, risk };
  }

  /**
   * Analyze documentation gaps
   */
  analyzeDocumentationGaps(yearData, documents) {
    const issues = [];
    let risk = 0;

    const budgetSize = yearData.budget.total;
    const docCount = documents.length;

    // Insufficient documentation for budget size
    const expectedDocs = budgetSize > 3000000000 ? 50 : budgetSize > 1500000000 ? 25 : 15;
    
    if (docCount < expectedDocs) {
      issues.push({
        type: 'documentation_gaps',
        severity: 9,
        title: 'Documentación Insuficiente',
        description: `Solo ${docCount} documentos para un presupuesto de $${(budgetSize/1000000).toFixed(1)}M. Se esperan al menos ${expectedDocs} documentos.`,
        amount: budgetSize,
        category: 'transparency_deficit'
      });
      risk += 18;
    }

    // Missing key document types
    const requiredCategories = ['Presupuesto Municipal', 'Ejecución de Gastos', 'Ejecución de Recursos'];
    const availableCategories = [...new Set(documents.map(d => d.category))];
    const missingCategories = requiredCategories.filter(cat => !availableCategories.includes(cat));

    if (missingCategories.length > 0) {
      issues.push({
        type: 'missing_documents',
        severity: 8,
        title: 'Documentos Obligatorios Faltantes',
        description: `Faltan documentos clave: ${missingCategories.join(', ')}. Esto compromete la transparencia fiscal.`,
        amount: 0,
        category: 'legal_compliance'
      });
      risk += 16;
    }

    return { issues, risk };
  }

  /**
   * Analyze expense patterns for anomalies
   */
  analyzeExpensePatterns(yearData) {
    const issues = [];
    let risk = 0;

    // Look for unusual expense concentrations
    if (yearData.expenses.categories) {
      const expenses = yearData.expenses.categories;
      const totalExpenses = yearData.expenses.total;

      // Check for single category dominating expenses (over 60%)
      expenses.forEach(expense => {
        if (expense.percentage > 60) {
          issues.push({
            type: 'expense_concentration',
            severity: 7,
            title: `Concentración Excesiva en ${expense.category}`,
            description: `El ${expense.percentage}% del gasto se concentra en "${expense.category}". Esto puede indicar falta de diversificación o manipulación.`,
            amount: expense.amount,
            category: 'spending_patterns'
          });
          risk += 12;
        }
      });

      // Check for suspiciously round numbers (often indicates estimates rather than actual data)
      expenses.forEach(expense => {
        if (expense.amount % 1000000 === 0 && expense.amount > 10000000) {
          issues.push({
            type: 'round_numbers',
            severity: 4,
            title: `Cifras Sospechosamente Redondas en ${expense.category}`,
            description: `El monto de $${(expense.amount/1000000).toFixed(0)}M exactos sugiere estimaciones en lugar de gastos reales.`,
            amount: expense.amount,
            category: 'data_quality'
          });
          risk += 5;
        }
      });
    }

    return { issues, risk };
  }

  /**
   * Generate assessment based on transparency score
   */
  getOverallAssessment(transparencyScore, issueCount) {
    if (transparencyScore >= 90 && issueCount <= 2) {
      return 'TRANSPARENCIA EXCELENTE - Gestión fiscal responsable';
    } else if (transparencyScore >= 75 && issueCount <= 5) {
      return 'TRANSPARENCIA BUENA - Algunas áreas de mejora identificadas';
    } else if (transparencyScore >= 60 && issueCount <= 10) {
      return 'TRANSPARENCIA REGULAR - Requiere atención y mejoras';
    } else if (transparencyScore >= 40) {
      return 'TRANSPARENCIA DEFICIENTE - Múltiples irregularidades detectadas';
    } else {
      return 'TRANSPARENCIA CRÍTICA - Requiere investigación inmediata';
    }
  }

  /**
   * Generate specific recommendations based on findings
   */
  generateRecommendations(irregularities, yearData) {
    const recommendations = [];

    // High severity issues require immediate action
    const criticalIssues = irregularities.filter(i => i.severity >= 8);
    if (criticalIssues.length > 0) {
      recommendations.push({
        priority: 'URGENTE',
        action: 'Auditoría Externa Inmediata',
        description: `Se detectaron ${criticalIssues.length} irregularidades críticas que requieren auditoría externa independiente.`,
        timeline: 'Dentro de 30 días'
      });
    }

    // Documentation issues
    if (irregularities.some(i => i.type === 'documentation_gaps')) {
      recommendations.push({
        priority: 'ALTA',
        action: 'Mejorar Transparencia Documental',
        description: 'Publicar todos los documentos presupuestarios obligatorios y establecer cronograma de publicación regular.',
        timeline: 'Dentro de 60 días'
      });
    }

    // Budget execution issues
    if (irregularities.some(i => i.type === 'budget_execution')) {
      recommendations.push({
        priority: 'MEDIA',
        action: 'Revisar Proceso de Ejecución Presupuestaria',
        description: 'Implementar controles de seguimiento mensual y reportes trimestrales públicos.',
        timeline: 'Próximo período fiscal'
      });
    }

    return recommendations;
  }

  /**
   * Get official source references
   */
  getOfficialSources(year) {
    return {
      municipal_transparency: `https://carmendeareco.gob.ar/transparencia/`,
      budget_documents: `https://carmendeareco.gob.ar/transparencia/presupuesto-${year}`,
      execution_reports: `https://carmendeareco.gob.ar/transparencia/ejecucion-${year}`,
      powerbi_dashboard: `https://app.powerbi.com/view?r=eyJrIjoiYzhjNWNhNmItOWY5Zi00OWExLTliMzAtMjYxZTM0NjM1Y2Y2IiwidCI6Ijk3MDQwMmVmLWNhZGMtNDcyOC05MjI2LTk3ZGRlODY4ZDg2ZCIsImMiOjR9&pageName=ReportSection`,
      official_portal: `https://carmendeareco.gob.ar/`,
      legal_framework: 'Ley de Acceso a la Información Pública Nacional 27.275'
    };
  }

  /**
   * Compare data with PowerBI dashboard
   */
  async compareWithPowerBI(year, powerBIData) {
    try {
      const localData = await this.databaseService.getYearlyData(year);
      const discrepancies = [];

      // Compare budget totals
      if (powerBIData.budget && Math.abs(localData.budget.total - powerBIData.budget.total) > localData.budget.total * 0.05) {
        discrepancies.push({
          type: 'budget_discrepancy',
          severity: 9,
          title: 'Discrepancia en Presupuesto Total',
          description: `Diferencia significativa entre datos locales ($${(localData.budget.total/1000000).toFixed(1)}M) y PowerBI ($${(powerBIData.budget.total/1000000).toFixed(1)}M).`,
          local_amount: localData.budget.total,
          powerbi_amount: powerBIData.budget.total,
          difference: Math.abs(localData.budget.total - powerBIData.budget.total)
        });
      }

      return {
        year,
        comparison_date: new Date().toISOString(),
        discrepancies,
        data_consistency: discrepancies.length === 0 ? 'CONSISTENT' : 'DISCREPANCIES_FOUND',
        recommendation: discrepancies.length > 0 ? 'Revisar origen de las diferencias en los datos' : 'Datos consistentes entre fuentes'
      };

    } catch (error) {
      return {
        year,
        comparison_date: new Date().toISOString(),
        error: error.message,
        data_consistency: 'COMPARISON_FAILED'
      };
    }
  }

  /**
   * Generate multi-year corruption trends analysis
   */
  async generateCorruptionTrendsReport(startYear = 2018, endYear = 2025) {
    const yearlyAnalyses = [];
    const trends = {};

    for (let year = startYear; year <= endYear; year++) {
      const analysis = await this.analyzeFinancialIrregularities(year);
      yearlyAnalyses.push(analysis);
    }

    // Analyze trends across years
    const riskScores = yearlyAnalyses.map(a => ({ year: a.year, risk: a.risk_score }));
    const transparencyScores = yearlyAnalyses.map(a => ({ year: a.year, transparency: a.transparency_score }));

    trends.risk_trend = this.calculateTrend(riskScores.map(r => r.risk));
    trends.transparency_trend = this.calculateTrend(transparencyScores.map(t => t.transparency));

    return {
      period: `${startYear}-${endYear}`,
      analysis_date: new Date().toISOString(),
      yearly_analyses: yearlyAnalyses,
      trends: {
        risk_direction: trends.risk_trend > 0 ? 'EMPEORANDO' : trends.risk_trend < 0 ? 'MEJORANDO' : 'ESTABLE',
        transparency_direction: trends.transparency_trend > 0 ? 'MEJORANDO' : trends.transparency_trend < 0 ? 'EMPEORANDO' : 'ESTABLE',
        overall_assessment: this.getMultiYearAssessment(yearlyAnalyses)
      },
      critical_patterns: this.identifyCriticalPatterns(yearlyAnalyses)
    };
  }

  calculateTrend(values) {
    const n = values.length;
    const sumX = values.reduce((sum, _, i) => sum + i, 0);
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, i) => sum + (i * val), 0);
    const sumXX = values.reduce((sum, _, i) => sum + (i * i), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope;
  }

  getMultiYearAssessment(analyses) {
    const avgTransparency = analyses.reduce((sum, a) => sum + a.transparency_score, 0) / analyses.length;
    const criticalYears = analyses.filter(a => a.transparency_score < 50).length;

    if (criticalYears > analyses.length / 2) {
      return 'GESTIÓN MUNICIPAL ALTAMENTE PROBLEMÁTICA - Requiere intervención';
    } else if (avgTransparency < 60) {
      return 'GESTIÓN MUNICIPAL DEFICIENTE - Múltiples áreas de preocupación';
    } else if (avgTransparency < 80) {
      return 'GESTIÓN MUNICIPAL REGULAR - Mejoras necesarias';
    } else {
      return 'GESTIÓN MUNICIPAL ACEPTABLE - Monitoreo continuo recomendado';
    }
  }

  identifyCriticalPatterns(analyses) {
    const patterns = [];
    
    // Consistent overspending
    const overspendingYears = analyses.filter(a => 
      a.irregularities.some(i => i.type === 'total_overspending')
    );
    
    if (overspendingYears.length >= 2) {
      patterns.push({
        type: 'PATRÓN CRÍTICO',
        description: `Sobregasto del presupuesto en ${overspendingYears.length} años diferentes`,
        affected_years: overspendingYears.map(y => y.year),
        severity: 'CRÍTICO'
      });
    }

    return patterns;
  }
}

module.exports = FinancialAnalysisService;