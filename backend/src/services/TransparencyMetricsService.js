const DatabaseDataService = require('./DatabaseDataService');
const FinancialAnalysisService = require('./FinancialAnalysisService');

/**
 * Service to calculate transparency metrics and generate red flag alerts
 * Based on Argentine transparency laws and international best practices
 */
class TransparencyMetricsService {
  constructor() {
    this.databaseService = new DatabaseDataService();
    this.financialService = new FinancialAnalysisService();
    
    // Argentine legal requirements (Ley 27.275 de Acceso a la Información Pública)
    this.legalRequirements = {
      budget_publication_days: 30, // Days from approval to publication
      quarterly_reports_required: 4, // Quarterly execution reports
      contract_threshold_disclosure: 100000, // ARS amount requiring disclosure
      salary_declaration_frequency: 12, // Months between declarations
      minimum_document_categories: 8 // Minimum transparency categories
    };

    // Transparency scoring weights
    this.scoringWeights = {
      document_availability: 0.25,
      budget_transparency: 0.30,
      contract_disclosure: 0.20,
      salary_transparency: 0.15,
      timeliness: 0.10
    };
  }

  /**
   * Calculate comprehensive transparency score (0-100)
   */
  async calculateTransparencyScore(year = 2024) {
    console.log(`📊 Calculating transparency score for ${year}...`);
    
    try {
      const yearData = await this.databaseService.getYearlyData(year);
      const allYears = await this.databaseService.getAvailableYears();
      
      const scores = {
        document_availability: await this.calculateDocumentAvailabilityScore(yearData, allYears),
        budget_transparency: await this.calculateBudgetTransparencyScore(yearData),
        contract_disclosure: await this.calculateContractDisclosureScore(yearData),
        salary_transparency: await this.calculateSalaryTransparencyScore(yearData),
        timeliness: await this.calculateTimelinessScore(yearData)
      };

      // Calculate weighted total score
      let totalScore = 0;
      for (const [category, score] of Object.entries(scores)) {
        totalScore += score * this.scoringWeights[category];
      }

      return {
        year: parseInt(year),
        total_score: Math.round(totalScore),
        category_scores: scores,
        grade: this.getTransparencyGrade(totalScore),
        compliance_status: this.getComplianceStatus(scores),
        improvement_areas: this.identifyImprovementAreas(scores),
        legal_compliance: this.assessLegalCompliance(yearData, scores)
      };

    } catch (error) {
      console.error('Error calculating transparency score:', error);
      return {
        year: parseInt(year),
        total_score: 0,
        error: error.message,
        grade: 'F',
        compliance_status: 'NON_COMPLIANT'
      };
    }
  }

  /**
   * Calculate document availability score based on coverage and completeness
   */
  async calculateDocumentAvailabilityScore(yearData, allYears) {
    const totalDocuments = yearData.total_documents;
    const budgetDocuments = yearData.budget_documents;
    
    // Expected minimum documents per year based on legal requirements
    const expectedMinimum = 12; // Monthly reports minimum
    
    let score = 0;
    
    // Base score for document count (40 points)
    if (totalDocuments >= expectedMinimum * 2) {
      score += 40; // Excellent coverage
    } else if (totalDocuments >= expectedMinimum) {
      score += 30; // Good coverage
    } else if (totalDocuments >= expectedMinimum / 2) {
      score += 20; // Minimal coverage
    } else {
      score += 10; // Poor coverage
    }

    // Budget document coverage (30 points)
    if (budgetDocuments >= 4) {
      score += 30; // Quarterly reports available
    } else if (budgetDocuments >= 2) {
      score += 20; // Semi-annual reports
    } else if (budgetDocuments >= 1) {
      score += 10; // Annual report only
    }

    // Historical coverage consistency (20 points)
    const recentYears = allYears.filter(y => y >= yearData.year - 2 && y <= yearData.year);
    if (recentYears.length >= 3) {
      score += 20; // Good historical coverage
    } else if (recentYears.length >= 2) {
      score += 10; // Partial historical coverage
    }

    // Category diversity (10 points)
    const categoryCount = yearData.documents ? 
      new Set(yearData.documents.map(d => d.category)).size : 0;
    
    if (categoryCount >= this.legalRequirements.minimum_document_categories) {
      score += 10;
    } else if (categoryCount >= 5) {
      score += 5;
    }

    return Math.min(100, score);
  }

  /**
   * Calculate budget transparency score
   */
  async calculateBudgetTransparencyScore(yearData) {
    let score = 0;
    const budget = yearData.budget;

    // Budget execution data availability (40 points)
    if (budget.total > 0 && budget.executed > 0) {
      score += 40;
    } else if (budget.total > 0) {
      score += 20; // Budget exists but no execution data
    }

    // Detailed category breakdown (30 points)
    if (budget.categories && budget.categories.length >= 4) {
      score += 30; // Good category detail
    } else if (budget.categories && budget.categories.length >= 2) {
      score += 15; // Basic categories
    }

    // Execution rate transparency (20 points)
    if (budget.percentage > 0) {
      if (budget.percentage >= 70 && budget.percentage <= 100) {
        score += 20; // Healthy execution rate
      } else if (budget.percentage >= 50) {
        score += 15; // Acceptable execution
      } else {
        score += 5; // Poor execution but reported
      }
    }

    // Revenue transparency (10 points)
    if (yearData.revenue && yearData.revenue.sources && yearData.revenue.sources.length > 0) {
      score += 10;
    }

    return Math.min(100, score);
  }

  /**
   * Calculate contract disclosure score
   */
  async calculateContractDisclosureScore(yearData) {
    let score = 0;
    const contracts = yearData.contracts;

    // Contract data availability (50 points)
    if (contracts.count > 0 && contracts.total > 0) {
      score += 50; // Contract data available
    } else if (contracts.count > 0) {
      score += 25; // Count only, no amounts
    }

    // Contract volume reasonableness (30 points)
    if (contracts.total > 0 && yearData.budget.total > 0) {
      const contractRatio = contracts.total / yearData.budget.total;
      
      if (contractRatio >= 0.05 && contractRatio <= 0.15) {
        score += 30; // Reasonable contract volume
      } else if (contractRatio > 0 && contractRatio <= 0.25) {
        score += 20; // High but possibly acceptable
      } else if (contractRatio > 0) {
        score += 10; // Data exists but suspicious levels
      }
    }

    // Documentation completeness (20 points)
    if (contracts.items && contracts.items.length > 0) {
      score += 20; // Detailed contract information
    } else if (contracts.count >= 5) {
      score += 10; // Multiple contracts reported
    }

    return Math.min(100, score);
  }

  /**
   * Calculate salary transparency score
   */
  async calculateSalaryTransparencyScore(yearData) {
    let score = 0;
    const salaries = yearData.salaries;

    // Salary data availability (40 points)
    if (salaries.total > 0 && salaries.average_salary > 0) {
      score += 40;
    } else if (salaries.total > 0) {
      score += 20;
    }

    // Department breakdown (30 points)
    if (salaries.departments && salaries.departments.length >= 3) {
      score += 30; // Good departmental detail
    } else if (salaries.departments && salaries.departments.length >= 1) {
      score += 15; // Some departmental detail
    }

    // Salary reasonableness (20 points)
    if (salaries.average_salary > 0) {
      // Check against realistic salary ranges for Argentina (2024: 300K-500K ARS average)
      const avgSalary = salaries.average_salary;
      
      if (avgSalary >= 250000 && avgSalary <= 600000) {
        score += 20; // Realistic salary range
      } else if (avgSalary >= 150000 && avgSalary <= 800000) {
        score += 10; // Possibly realistic
      } else {
        score += 5; // Questionable but reported
      }
    }

    // Personnel cost ratio (10 points)
    if (salaries.total > 0 && yearData.budget.total > 0) {
      const personnelRatio = salaries.total / yearData.budget.total;
      
      if (personnelRatio >= 0.25 && personnelRatio <= 0.45) {
        score += 10; // Healthy personnel cost ratio
      } else if (personnelRatio > 0 && personnelRatio <= 0.60) {
        score += 5; // High but reported
      }
    }

    return Math.min(100, score);
  }

  /**
   * Calculate timeliness score based on publication patterns
   */
  async calculateTimelinessScore(yearData) {
    let score = 0;
    
    // Document recency (50 points)
    if (yearData.documents && yearData.documents.length > 0) {
      const hasRecentDocs = yearData.documents.some(doc => {
        if (!doc.date) return false;
        const docDate = new Date(doc.date);
        const monthsAgo = (new Date() - docDate) / (1000 * 60 * 60 * 24 * 30);
        return monthsAgo <= 6; // Within last 6 months
      });
      
      if (hasRecentDocs) {
        score += 50;
      } else {
        score += 25; // Has documents but not recent
      }
    }

    // Regular publication pattern (30 points)
    if (yearData.total_documents >= 4) {
      score += 30; // Appears to have regular publications
    } else if (yearData.total_documents >= 2) {
      score += 15; // Some regular publication
    }

    // Budget execution reporting (20 points)
    if (yearData.budget.executed > 0 && yearData.budget.percentage > 0) {
      score += 20; // Current execution data available
    }

    return Math.min(100, score);
  }

  /**
   * Get transparency grade based on score
   */
  getTransparencyGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'A-';
    if (score >= 75) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 65) return 'B-';
    if (score >= 60) return 'C+';
    if (score >= 55) return 'C';
    if (score >= 50) return 'C-';
    if (score >= 40) return 'D';
    return 'F';
  }

  /**
   * Assess compliance with Argentine transparency laws
   */
  getComplianceStatus(scores) {
    const criticalThreshold = 60;
    const goodThreshold = 75;

    const avgScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;

    if (avgScore >= goodThreshold) {
      return 'FULLY_COMPLIANT';
    } else if (avgScore >= criticalThreshold) {
      return 'PARTIALLY_COMPLIANT';
    } else {
      return 'NON_COMPLIANT';
    }
  }

  /**
   * Identify areas needing improvement
   */
  identifyImprovementAreas(scores) {
    const improvements = [];
    const threshold = 70;

    if (scores.document_availability < threshold) {
      improvements.push({
        area: 'Disponibilidad de Documentos',
        score: scores.document_availability,
        priority: 'HIGH',
        recommendation: 'Incrementar la publicación de documentos oficiales y reportes periódicos'
      });
    }

    if (scores.budget_transparency < threshold) {
      improvements.push({
        area: 'Transparencia Presupuestaria',
        score: scores.budget_transparency,
        priority: 'CRITICAL',
        recommendation: 'Publicar presupuesto detallado y reportes de ejecución trimestrales'
      });
    }

    if (scores.contract_disclosure < threshold) {
      improvements.push({
        area: 'Divulgación de Contratos',
        score: scores.contract_disclosure,
        priority: 'HIGH',
        recommendation: 'Implementar portal de contrataciones con información completa'
      });
    }

    if (scores.salary_transparency < threshold) {
      improvements.push({
        area: 'Transparencia Salarial',
        score: scores.salary_transparency,
        priority: 'MEDIUM',
        recommendation: 'Publicar escalas salariales y nómina de funcionarios públicos'
      });
    }

    if (scores.timeliness < threshold) {
      improvements.push({
        area: 'Oportunidad de Publicación',
        score: scores.timeliness,
        priority: 'MEDIUM',
        recommendation: 'Establecer cronograma de publicaciones y mantener información actualizada'
      });
    }

    return improvements;
  }

  /**
   * Assess legal compliance with Argentine laws
   */
  assessLegalCompliance(yearData, scores) {
    const compliance = {
      ley_27275_compliance: {
        name: 'Ley 27.275 - Acceso a la Información Pública',
        status: 'UNKNOWN',
        requirements_met: [],
        requirements_missing: []
      },
      municipal_requirements: {
        name: 'Normativas Municipales de Transparencia',
        status: 'UNKNOWN',
        requirements_met: [],
        requirements_missing: []
      }
    };

    // Check Ley 27.275 requirements
    if (yearData.budget.total > 0) {
      compliance.ley_27275_compliance.requirements_met.push('Información presupuestaria disponible');
    } else {
      compliance.ley_27275_compliance.requirements_missing.push('Falta información presupuestaria');
    }

    if (yearData.contracts.count > 0) {
      compliance.ley_27275_compliance.requirements_met.push('Información de contrataciones disponible');
    } else {
      compliance.ley_27275_compliance.requirements_missing.push('Falta información de contrataciones');
    }

    if (yearData.salaries.departments && yearData.salaries.departments.length > 0) {
      compliance.ley_27275_compliance.requirements_met.push('Información de personal disponible');
    } else {
      compliance.ley_27275_compliance.requirements_missing.push('Falta información de personal y salarios');
    }

    // Set overall compliance status
    const metRequirements = compliance.ley_27275_compliance.requirements_met.length;
    const totalRequirements = metRequirements + compliance.ley_27275_compliance.requirements_missing.length;
    
    if (metRequirements === totalRequirements) {
      compliance.ley_27275_compliance.status = 'COMPLIANT';
    } else if (metRequirements >= totalRequirements * 0.6) {
      compliance.ley_27275_compliance.status = 'PARTIALLY_COMPLIANT';
    } else {
      compliance.ley_27275_compliance.status = 'NON_COMPLIANT';
    }

    return compliance;
  }

  /**
   * Generate red flag alerts based on transparency issues
   */
  async generateRedFlagAlerts(year = 2024) {
    console.log(`🚨 Generating red flag alerts for ${year}...`);
    
    const alerts = [];
    
    try {
      const transparencyScore = await this.calculateTransparencyScore(year);
      const yearData = await this.databaseService.getYearlyData(year);

      // Critical transparency score
      if (transparencyScore.total_score < 50) {
        alerts.push({
          id: `transparency_critical_${year}`,
          severity: 'CRITICAL',
          category: 'transparency',
          title: 'Puntuación de Transparencia Crítica',
          description: `Puntuación de transparencia muy baja (${transparencyScore.total_score}/100) indica falta grave de información pública`,
          data: transparencyScore,
          recommended_action: 'Implementar medidas urgentes de transparencia y publicación proactiva'
        });
      } else if (transparencyScore.total_score < 70) {
        alerts.push({
          id: `transparency_low_${year}`,
          severity: 'HIGH',
          category: 'transparency',
          title: 'Transparencia Insuficiente',
          description: `Puntuación de transparencia baja (${transparencyScore.total_score}/100) requiere mejoras`,
          data: transparencyScore,
          recommended_action: 'Mejorar publicación de documentos y reportes oficiales'
        });
      }

      // Missing budget execution data
      if (yearData.budget.total > 0 && yearData.budget.executed === 0) {
        alerts.push({
          id: `budget_execution_missing_${year}`,
          severity: 'HIGH',
          category: 'budget',
          title: 'Falta Información de Ejecución Presupuestaria',
          description: 'Presupuesto planificado disponible pero sin datos de ejecución',
          data: { budget_planned: yearData.budget.total },
          recommended_action: 'Publicar reportes de ejecución presupuestaria'
        });
      }

      // Low document count
      if (yearData.total_documents < 6) {
        alerts.push({
          id: `documents_insufficient_${year}`,
          severity: 'MEDIUM',
          category: 'documentation',
          title: 'Documentación Insuficiente',
          description: `Solo ${yearData.total_documents} documentos disponibles para el año ${year}`,
          data: { document_count: yearData.total_documents, expected_minimum: 12 },
          recommended_action: 'Incrementar publicación de documentos oficiales y reportes'
        });
      }

      // Missing salary information
      if (yearData.salaries.total === 0 || yearData.salaries.average_salary === 0) {
        alerts.push({
          id: `salary_data_missing_${year}`,
          severity: 'MEDIUM',
          category: 'salary',
          title: 'Falta Información Salarial',
          description: 'No hay información disponible sobre salarios y personal municipal',
          data: yearData.salaries,
          recommended_action: 'Publicar nómina y escalas salariales según normativa'
        });
      }

      // No contract information
      if (yearData.contracts.count === 0 || yearData.contracts.total === 0) {
        alerts.push({
          id: `contracts_missing_${year}`,
          severity: 'HIGH',
          category: 'contracts',
          title: 'Falta Información de Contrataciones',
          description: 'No hay información disponible sobre contrataciones públicas',
          data: yearData.contracts,
          recommended_action: 'Implementar portal de contrataciones y licitaciones'
        });
      }

      // Check for improvement areas
      transparencyScore.improvement_areas.forEach((area, index) => {
        if (area.priority === 'CRITICAL' || area.priority === 'HIGH') {
          alerts.push({
            id: `improvement_${area.area.toLowerCase().replace(/\s+/g, '_')}_${year}`,
            severity: area.priority,
            category: 'improvement',
            title: `Área de Mejora: ${area.area}`,
            description: area.recommendation,
            data: { score: area.score, threshold: 70 },
            recommended_action: area.recommendation
          });
        }
      });

      return {
        year: parseInt(year),
        timestamp: new Date().toISOString(),
        alert_count: alerts.length,
        alerts: alerts.sort((a, b) => {
          const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
          return severityOrder[a.severity] - severityOrder[b.severity];
        }),
        transparency_score: transparencyScore.total_score,
        compliance_status: transparencyScore.compliance_status
      };

    } catch (error) {
      console.error('Error generating red flag alerts:', error);
      return {
        year: parseInt(year),
        timestamp: new Date().toISOString(),
        alert_count: 0,
        alerts: [],
        error: error.message
      };
    }
  }

  /**
   * Compare transparency scores across years
   */
  async compareTransparencyTrends(years = [2024, 2023, 2022]) {
    console.log(`📈 Comparing transparency trends across years: ${years.join(', ')}`);
    
    const trends = {
      years: years.sort((a, b) => b - a),
      scores: [],
      trend_direction: 'STABLE',
      improvement_rate: 0,
      concerns: [],
      positive_changes: []
    };

    try {
      // Get transparency scores for each year
      for (const year of trends.years) {
        const score = await this.calculateTransparencyScore(year);
        trends.scores.push({
          year: year,
          score: score.total_score,
          grade: score.grade,
          category_scores: score.category_scores
        });
      }

      // Calculate trend direction
      if (trends.scores.length >= 2) {
        const latest = trends.scores[0].score;
        const previous = trends.scores[1].score;
        const change = latest - previous;

        if (change > 5) {
          trends.trend_direction = 'IMPROVING';
        } else if (change < -5) {
          trends.trend_direction = 'DECLINING';
        } else {
          trends.trend_direction = 'STABLE';
        }

        trends.improvement_rate = change;
      }

      // Identify concerns and positive changes
      if (trends.scores.length >= 2) {
        const categories = ['document_availability', 'budget_transparency', 'contract_disclosure', 'salary_transparency', 'timeliness'];
        
        categories.forEach(category => {
          const latest = trends.scores[0].category_scores[category];
          const previous = trends.scores[1].category_scores[category];
          const change = latest - previous;

          if (change < -10) {
            trends.concerns.push({
              category: category,
              change: change,
              description: `${category} score declined by ${Math.abs(change)} points`
            });
          } else if (change > 10) {
            trends.positive_changes.push({
              category: category,
              change: change,
              description: `${category} score improved by ${change} points`
            });
          }
        });
      }

      return trends;

    } catch (error) {
      console.error('Error comparing transparency trends:', error);
      return {
        years: years,
        scores: [],
        error: error.message,
        trend_direction: 'UNKNOWN'
      };
    }
  }
}

module.exports = TransparencyMetricsService;