/**
 * Simple Anomaly Detection Service
 * Basic anomaly detection for financial data without extensive dependencies
 */

export interface SimpleAnomaly {
  id: string;
  type: string;
  severity: 'info' | 'warning' | 'critical';
  category: string;
  description: string;
  value: number;
  threshold: number;
  recommendation: string;
}

export interface SimpleAnomalyDetectionResult {
  anomalies: SimpleAnomaly[];
  score: number;
  summary: {
    critical: number;
    warning: number;
    info: number;
    total: number;
  };
}

class SimpleAnomalyDetectionService {
  private static instance: SimpleAnomalyDetectionService;

  private constructor() {}

  public static getInstance(): SimpleAnomalyDetectionService {
    if (!SimpleAnomalyDetectionService.instance) {
      SimpleAnomalyDetectionService.instance = new SimpleAnomalyDetectionService();
    }
    return SimpleAnomalyDetectionService.instance;
  }

  /**
   * Simple budget execution anomaly detection
   */
  detectBudgetAnomalies(data: any[]): SimpleAnomalyDetectionResult {
    const anomalies: SimpleAnomaly[] = [];
    let anomalyScore = 0;

    data.forEach((item, index) => {
      // Handle different field name variations
      const executionRate = item.execution_rate || item.executionRate || item['execution rate'] ||
                           (item.executed / item.budgeted) * 100 || 0;
      
      const category = item.category || item.Category || item.name || item.Name || 'Unknown';
      
      // High execution rate anomalies (>120%)
      if (executionRate > 120) {
        anomalies.push({
          id: `high_exec_${index}`,
          type: 'high_execution',
          severity: executionRate > 150 ? 'critical' : 'warning',
          category: category,
          description: `Execution rate of ${executionRate.toFixed(1)}% exceeds budget by ${(executionRate - 100).toFixed(1)}%`,
          value: executionRate,
          threshold: 120,
          recommendation: 'Review budget adjustments and expenditure records'
        });
        anomalyScore += executionRate > 150 ? 10 : 5;
      }
      
      // Low execution rate anomalies (<80%)
      else if (executionRate < 80) {
        anomalies.push({
          id: `low_exec_${index}`,
          type: 'low_execution',
          severity: executionRate < 50 ? 'critical' : 'warning',
          category: category,
          description: `Execution rate of ${executionRate.toFixed(1)}% is below budget by ${(100 - executionRate).toFixed(1)}%`,
          value: executionRate,
          threshold: 80,
          recommendation: 'Investigate delayed projects or budget cuts'
        });
        anomalyScore += executionRate < 50 ? 10 : 5;
      }

      // Large variance anomalies
      const variance = Math.abs((item.executed - item.budgeted) / item.budgeted) * 100 || 0;
      if (variance > 30) {
        anomalies.push({
          id: `variance_${index}`,
          type: 'unusual_pattern',
          severity: variance > 50 ? 'critical' : 'warning',
          category: category,
          description: `Large variance of ${variance.toFixed(1)}% between budgeted and executed amounts`,
          value: variance,
          threshold: 30,
          recommendation: 'Verify budget planning accuracy and expenditure tracking'
        });
        anomalyScore += variance > 50 ? 8 : 4;
      }
    });

    // Calculate summary
    const critical = anomalies.filter(a => a.severity === 'critical').length;
    const warning = anomalies.filter(a => a.severity === 'warning').length;
    const info = anomalies.filter(a => a.severity === 'info').length;
    const total = anomalies.length;

    // Normalize anomaly score (0-100)
    const maxPossibleScore = data.length * 10; // Max 10 points per item
    const normalizedScore = maxPossibleScore > 0 ? Math.min(100, (anomalyScore / maxPossibleScore) * 100) : 0;

    return {
      anomalies,
      score: normalizedScore,
      summary: {
        critical,
        warning,
        info,
        total
      }
    };
  }

  /**
   * Simple supplier concentration detection
   */
  detectSupplierAnomalies(contracts: any[]): SimpleAnomalyDetectionResult {
    const anomalies: SimpleAnomaly[] = [];
    let anomalyScore = 0;

    // Group contracts by supplier
    const supplierTotals: Record<string, { count: number; total: number }> = {};
    
    contracts.forEach(contract => {
      // Handle different field name variations
      const supplier = contract.supplier || contract.vendor || contract.provider || contract.Supplier || 'Unknown';
      const amount = contract.amount || contract.value || contract.cost || contract.Amount || 0;
      
      if (!supplierTotals[supplier]) {
        supplierTotals[supplier] = { count: 0, total: 0 };
      }
      
      supplierTotals[supplier].count++;
      supplierTotals[supplier].total += amount;
    });

    // Calculate total contract value
    const totalValue = Object.values(supplierTotals).reduce((sum, supplier) => sum + supplier.total, 0);
    
    // Check for supplier concentration (>70% of total)
    Object.entries(supplierTotals).forEach(([supplier, data]) => {
      const percentage = totalValue > 0 ? (data.total / totalValue) * 100 : 0;
      
      if (percentage > 70) {
        anomalies.push({
          id: `supplier_conc_${supplier}`,
          type: 'supplier_concentration',
          severity: 'critical',
          category: 'Procurement',
          description: `Supplier ${supplier} represents ${percentage.toFixed(1)}% of total procurement value`,
          value: percentage,
          threshold: 70,
          recommendation: 'Evaluate supplier diversification strategy to reduce dependency risk'
        });
        anomalyScore += 15;
      } else if (percentage > 50) {
        anomalies.push({
          id: `supplier_conc_${supplier}`,
          type: 'supplier_concentration',
          severity: 'warning',
          category: 'Procurement',
          description: `Supplier ${supplier} represents ${percentage.toFixed(1)}% of total procurement value`,
          value: percentage,
          threshold: 50,
          recommendation: 'Monitor supplier concentration levels'
        });
        anomalyScore += 8;
      }
    });

    // Calculate summary
    const critical = anomalies.filter(a => a.severity === 'critical').length;
    const warning = anomalies.filter(a => a.severity === 'warning').length;
    const info = anomalies.filter(a => a.severity === 'info').length;
    const total = anomalies.length;

    // Normalize anomaly score (0-100)
    const maxPossibleScore = contracts.length > 0 ? contracts.length * 15 : 100;
    const normalizedScore = maxPossibleScore > 0 ? Math.min(100, (anomalyScore / maxPossibleScore) * 100) : 0;

    return {
      anomalies,
      score: normalizedScore,
      summary: {
        critical,
        warning,
        info,
        total
      }
    };
  }
}

export default SimpleAnomalyDetectionService.getInstance();
