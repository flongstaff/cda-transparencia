// auditFinancialSystem.ts - Comprehensive audit system for detecting potential malversations
import { 
  getMultiYearFinancialData, 
  getContractData,
  YearlyData,
  ContractData
} from '../services/financialDataService';

// Define audit interfaces
export interface FinancialIrregularity {
  id: string;
  year: number;
  type: 'high_personnel_costs' | 'infrastructure_under_execution' | 'contract_diversion' | 'budget_reallocation' | 'missing_documents';
  severity: 'low' | 'medium' | 'high';
  description: string;
  amount: number;
  percentage: number;
  evidence: string[];
  recommendation: string;
  status: 'detected' | 'under_review' | 'confirmed' | 'dismissed';
  timestamp: string;
}

export interface AuditFinding {
  year: number;
  category: string;
  budgeted: number;
  executed: number;
  variance: number;
  variancePercentage: number;
  isIrregular: boolean;
  irregularityType?: string;
  evidence: string[];
}

export interface MoneyFlowAudit {
  year: number;
  totalBudget: number;
  totalExecuted: number;
  totalContracts: number;
  contractValue: number;
  executedInfra: number;
  plannedInfra: number;
  executedPersonnel: number;
  personnelPercentage: number;
  infraExecutionRate: number;
  hasIrregularities: boolean;
  irregularities: FinancialIrregularity[];
}

class AuditFinancialSystem {
  private static instance: AuditFinancialSystem;
  private auditFindings: FinancialIrregularity[] = [];
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): AuditFinancialSystem {
    if (!AuditFinancialSystem.instance) {
      AuditFinancialSystem.instance = new AuditFinancialSystem();
    }
    return AuditFinancialSystem.instance;
  }

  /**
   * Perform comprehensive financial audit
   */
  public async performFinancialAudit(): Promise<MoneyFlowAudit[]> {
    const cacheKey = 'financial-audit';
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      // Load all required data
      const [financialData, contractData] = await Promise.all([
        getMultiYearFinancialData(),
        getContractData()
      ]);

      // Perform audit on each year
      const auditResults: MoneyFlowAudit[] = financialData.map(yearData => {
        const yearContracts = contractData.filter(c => c.year === yearData.year);
        const totalContractValue = yearContracts.reduce((sum, c) => sum + c.amount, 0);
        
        // Calculate key metrics
        const personnelPercentage = yearData.total_executed ? 
          (yearData.personnel / yearData.total_executed) * 100 : 0;
          
        const infraExecutionRate = yearData.planned_infra ? 
          (yearData.executed_infra / yearData.planned_infra) * 100 : 0;
        
        // Detect irregularities
        const irregularities: FinancialIrregularity[] = [];
        
        // High personnel costs (>45% is often a concern)
        if (personnelPercentage > 45) {
          irregularities.push({
            id: `personnel-${yearData.year}`,
            year: yearData.year,
            type: 'high_personnel_costs',
            severity: personnelPercentage > 50 ? 'high' : 'medium',
            description: `Gastos de personal elevados (${personnelPercentage.toFixed(1)}% del total ejecutado)`,
            amount: yearData.personnel,
            percentage: parseFloat(personnelPercentage.toFixed(1)),
            evidence: [
              `Estado de ejecución de gastos ${yearData.year}`,
              `Reporte de remuneraciones ${yearData.year}`
            ],
            recommendation: 'Revisar si los gastos de personal están alineados con el presupuesto aprobado',
            status: 'detected',
            timestamp: new Date().toISOString()
          });
        }
        
        // Infrastructure under-execution (<80% is often a concern)
        if (infraExecutionRate < 80) {
          irregularities.push({
            id: `infra-${yearData.year}`,
            year: yearData.year,
            type: 'infrastructure_under_execution',
            severity: infraExecutionRate < 70 ? 'high' : 'medium',
            description: `Baja ejecución de infraestructura (${infraExecutionRate.toFixed(1)}% del planificado)`,
            amount: yearData.planned_infra - yearData.executed_infra,
            percentage: parseFloat(infraExecutionRate.toFixed(1)),
            evidence: [
              `Estado de ejecución de gastos por carácter económico ${yearData.year}`,
              `Informe de obras ${yearData.year}`
            ],
            recommendation: 'Investigar causas de subejecución en infraestructura',
            status: 'detected',
            timestamp: new Date().toISOString()
          });
        }
        
        // Contract value vs infrastructure execution
        if (totalContractValue > 0 && yearData.executed_infra > 0) {
          const contractToInfraRatio = totalContractValue / yearData.executed_infra;
          
          // If contracts are significantly higher than infrastructure execution, potential diversion
          if (contractToInfraRatio > 1.5) {
            irregularities.push({
              id: `contract-diversion-${yearData.year}`,
              year: yearData.year,
              type: 'contract_diversion',
              severity: contractToInfraRatio > 2 ? 'high' : 'medium',
              description: `Desvío potencial: contratos superan ejecución de infraestructura en ${(contractToInfraRatio * 100 - 100).toFixed(1)}%`,
              amount: totalContractValue - yearData.executed_infra,
              percentage: parseFloat(((contractToInfraRatio - 1) * 100).toFixed(1)),
              evidence: [
                `Contratos adjudicados ${yearData.year}`,
                `Estado de ejecución de gastos ${yearData.year}`
              ],
              recommendation: 'Verificar que los fondos contratados se ejecuten en infraestructura',
              status: 'detected',
              timestamp: new Date().toISOString()
            });
          }
        }
        
        // Missing budget documentation
        if (yearData.total_budget === 0) {
          irregularities.push({
            id: `missing-budget-${yearData.year}`,
            year: yearData.year,
            type: 'missing_documents',
            severity: 'high',
            description: 'Falta de documentación presupuestaria',
            amount: 0,
            percentage: 0,
            evidence: [
              `No se encontró presupuesto aprobado para ${yearData.year}`
            ],
            recommendation: 'Solicitar documentación presupuestaria al municipio',
            status: 'detected',
            timestamp: new Date().toISOString()
          });
        }

        return {
          year: yearData.year,
          totalBudget: yearData.total_budget,
          totalExecuted: yearData.total_executed,
          totalContracts: yearContracts.length,
          contractValue: totalContractValue,
          executedInfra: yearData.executed_infra,
          plannedInfra: yearData.planned_infra,
          executedPersonnel: yearData.personnel,
          personnelPercentage: parseFloat(personnelPercentage.toFixed(1)),
          infraExecutionRate: parseFloat(infraExecutionRate.toFixed(1)),
          hasIrregularities: irregularities.length > 0,
          irregularities
        };
      });

      this.cache.set(cacheKey, { data: auditResults, timestamp: Date.now() });
      this.auditFindings = auditResults.flatMap(audit => audit.irregularities);
      
      return auditResults;
    } catch (error) {
      console.error('Error performing financial audit:', error);
      throw error;
    }
  }

  /**
   * Get all detected irregularities
   */
  public async getIrregularities(): Promise<FinancialIrregularity[]> {
    const auditResults = await this.performFinancialAudit();
    return auditResults.flatMap(audit => audit.irregularities);
  }

  /**
   * Get irregularities by severity
   */
  public async getIrregularitiesBySeverity(severity: 'low' | 'medium' | 'high'): Promise<FinancialIrregularity[]> {
    const irregularities = await this.getIrregularities();
    return irregularities.filter(irregularity => irregularity.severity === severity);
  }

  /**
   * Get irregularities by type
   */
  public async getIrregularitiesByType(type: string): Promise<FinancialIrregularity[]> {
    const irregularities = await this.getIrregularities();
    return irregularities.filter(irregularity => irregularity.type === type);
  }

  /**
   * Get irregularities by year
   */
  public async getIrregularitiesByYear(year: number): Promise<FinancialIrregularity[]> {
    const irregularities = await this.getIrregularities();
    return irregularities.filter(irregularity => irregularity.year === year);
  }

  /**
   * Get audit summary statistics
   */
  public async getAuditSummary(): Promise<{
    totalIrregularities: number;
    highSeverity: number;
    mediumSeverity: number;
    lowSeverity: number;
    byType: Record<string, number>;
    byYear: Record<number, number>;
    recommendationCount: number;
  }> {
    const irregularities = await this.getIrregularities();
    
    const byType: Record<string, number> = {};
    const byYear: Record<number, number> = {};
    
    irregularities.forEach(irregularity => {
      // Count by type
      if (!byType[irregularity.type]) byType[irregularity.type] = 0;
      byType[irregularity.type]++;
      
      // Count by year
      if (!byYear[irregularity.year]) byYear[irregularity.year] = 0;
      byYear[irregularity.year]++;
    });
    
    return {
      totalIrregularities: irregularities.length,
      highSeverity: irregularities.filter(i => i.severity === 'high').length,
      mediumSeverity: irregularities.filter(i => i.severity === 'medium').length,
      lowSeverity: irregularities.filter(i => i.severity === 'low').length,
      byType,
      byYear,
      recommendationCount: irregularities.filter(i => i.recommendation).length
    };
  }

  /**
   * Format amount in ARS
   */
  public formatARS(num: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(num);
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get audit findings
   */
  public getAuditFindings(): FinancialIrregularity[] {
    return [...this.auditFindings];
  }
}

// Export singleton instance
export const auditFinancialSystem = AuditFinancialSystem.getInstance();
export default auditFinancialSystem;