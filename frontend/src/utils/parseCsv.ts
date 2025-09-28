/**
 * CSV Parsing and Data Analysis Utilities
 * Provides functions for parsing CSV data and detecting anomalies
 */

import Papa from "papaparse";

// Define types for financial data
export interface FinancialDataRow {
  year?: number | string;
  quarter?: string;
  month?: string;
  budgeted?: number;
  executed?: number;
  execution_rate?: number;
  category?: string;
  department?: string;
  [key: string]: any; // Allow for additional fields
}

// Define anomaly detection types
export interface Anomaly {
  type: 'low_execution' | 'high_execution' | 'variance_spike' | 'missing_data' | 'duplicate_entry';
  field: string;
  value: any;
  expected?: any;
  severity: 'low' | 'medium' | 'high';
  row_index: number;
  description: string;
}

/**
 * Parse CSV data with enhanced error handling and data cleaning
 * @param csvText - Raw CSV text content
 * @param options - PapaParse options
 * @returns Parsed data array
 */
export const parseCsv = (
  csvText: string, 
  options: Papa.ParseConfig = {}
): Papa.ParseResult<any> => {
  try {
    const result = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      ...options
    });

    // Clean and normalize data
    const cleanedData = result.data.map((row: any) => {
      const cleanedRow: any = {};
      
      // Normalize keys and clean values
      Object.keys(row).forEach(key => {
        const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, '_');
        const value = row[key];
        
        // Handle different data types
        if (typeof value === 'string') {
          // Remove currency symbols and commas
          const cleanedValue = value.replace(/[$,\s]/g, '');
          if (/^\d+(\.\d+)?$/.test(cleanedValue)) {
            cleanedRow[normalizedKey] = parseFloat(cleanedValue);
          } else {
            cleanedRow[normalizedKey] = value.trim();
          }
        } else {
          cleanedRow[normalizedKey] = value;
        }
      });
      
      return cleanedRow;
    });

    return {
      ...result,
      data: cleanedData
    };
  } catch (error) {
    console.error('Error parsing CSV:', error);
    throw error;
  }
};

/**
 * Detect anomalies in financial data
 * @param data - Array of financial data rows
 * @returns Array of detected anomalies
 */
export const detectAnomalies = (data: FinancialDataRow[]): Anomaly[] => {
  const anomalies: Anomaly[] = [];

  data.forEach((row, index) => {
    // Check for low execution rates (< 50%)
    if (row.execution_rate !== undefined && row.execution_rate < 0.5) {
      anomalies.push({
        type: 'low_execution',
        field: 'execution_rate',
        value: row.execution_rate,
        severity: 'high',
        row_index: index,
        description: `Tasa de ejecución muy baja (${(row.execution_rate * 100).toFixed(1)}%)`
      });
    }

    // Check for high execution rates (> 120%)
    if (row.execution_rate !== undefined && row.execution_rate > 1.2) {
      anomalies.push({
        type: 'high_execution',
        field: 'execution_rate',
        value: row.execution_rate,
        severity: 'medium',
        row_index: index,
        description: `Tasa de ejecución alta (${(row.execution_rate * 100).toFixed(1)}%)`
      });
    }

    // Check for large variances between budgeted and executed
    if (row.budgeted !== undefined && row.executed !== undefined) {
      const variance = Math.abs(row.executed - row.budgeted) / row.budgeted;
      if (variance > 0.3) { // 30% variance threshold
        anomalies.push({
          type: 'variance_spike',
          field: 'budget_variance',
          value: variance,
          severity: variance > 0.5 ? 'high' : 'medium',
          row_index: index,
          description: `Alta varianza entre presupuestado y ejecutado (${(variance * 100).toFixed(1)}%)`
        });
      }
    }

    // Check for missing critical data
    const criticalFields = ['year', 'budgeted', 'executed'];
    criticalFields.forEach(field => {
      if (row[field as keyof FinancialDataRow] === undefined || row[field as keyof FinancialDataRow] === null) {
        anomalies.push({
          type: 'missing_data',
          field,
          value: row[field as keyof FinancialDataRow],
          severity: 'low',
          row_index: index,
          description: `Dato crítico faltante: ${field}`
        });
      }
    });
  });

  return anomalies;
};

/**
 * Format currency values for ARS display
 * @param amount - Numeric amount
 * @returns Formatted currency string
 */
export const formatCurrencyARS = (amount: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format percentage values for display
 * @param value - Decimal percentage value (0-1)
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
};

/**
 * Generate color based on execution rate for visualizations
 * @param executionRate - Execution rate value (0-1)
 * @returns CSS color string
 */
export const getColorForExecutionRate = (executionRate: number): string => {
  if (executionRate < 0.5) return '#ef4444'; // red-500
  if (executionRate < 0.75) return '#f97316'; // orange-500
  if (executionRate < 1.0) return '#22c55e'; // green-500
  if (executionRate < 1.2) return '#3b82f6'; // blue-500
  return '#8b5cf6'; // violet-500
};

/**
 * Calculate execution rate from budgeted and executed values
 * @param budgeted - Budgeted amount
 * @param executed - Executed amount
 * @returns Execution rate (0-1)
 */
export const calculateExecutionRate = (budgeted: number, executed: number): number => {
  if (budgeted === 0) return executed > 0 ? Infinity : 0;
  return executed / budgeted;
};

export default {
  parseCsv,
  detectAnomalies,
  formatCurrencyARS,
  formatPercentage,
  getColorForExecutionRate,
  calculateExecutionRate
};