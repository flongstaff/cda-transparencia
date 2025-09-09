// utils/dataLoader.ts
// Utility for loading local JSON data as mock sources

/**
 * Data loader utility that loads local JSON files as mock data sources
 */
class DataLoader {
  private cache: Map<string, any>;

  constructor() {
    this.cache = new Map();
  }

  /**
   * Load a JSON file from the local filesystem
   */
  async loadJsonFile(filePath: string): Promise<any> {
    try {
      // Check cache first
      if (this.cache.has(filePath)) {
        const cached = this.cache.get(filePath);
        if (Date.now() - cached.timestamp < 300000) { // 5 minutes cache
          return cached.data;
        }
      }

      // In browser environment, we can't directly read files
      // Instead, we'll simulate loading by returning mock data
      console.warn(`Cannot directly load file ${filePath} in browser environment. Using mock data.`);
      
      // Return appropriate mock data based on file path
      if (filePath.includes('debt_data')) {
        return this.getMockDebtData();
      } else if (filePath.includes('budget_data')) {
        return this.getMockBudgetData();
      } else if (filePath.includes('detailed_inventory')) {
        return this.getMockDetailedInventory();
      } else if (filePath.includes('analysis_results')) {
        return this.getMockAnalysisResults();
      }
      
      // Default empty object
      return {};
    } catch (error) {
      console.error(`Error loading JSON file ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Get mock debt data
   */
  getMockDebtData(): any {
    return {
      year: 2024,
      total_debt: 85000000,
      debt_to_budget_ratio: 1.7,
      debt_service: 45000000,
      debt_service_to_revenue_ratio: 2.1,
      debt_evolution: [
        {
          year: 2018,
          total_debt: 45000000,
          debt_service: 25000000,
          ratio_to_budget: 3
        },
        {
          year: 2019,
          total_debt: 52000000,
          debt_service: 28000000,
          ratio_to_budget: 2.8
        },
        {
          year: 2020,
          total_debt: 65000000,
          debt_service: 32000000,
          ratio_to_budget: 2.5
        },
        {
          year: 2021,
          total_debt: 72000000,
          debt_service: 38000000,
          ratio_to_budget: 2.2
        },
        {
          year: 2022,
          total_debt: 78000000,
          debt_service: 41000000,
          ratio_to_budget: 2
        },
        {
          year: 2023,
          total_debt: 82000000,
          debt_service: 43000000,
          ratio_to_budget: 1.9
        },
        {
          year: 2024,
          total_debt: 85000000,
          debt_service: 45000000,
          ratio_to_budget: 1.7
        }
      ],
      debt_by_type: {
        'Banco Nación': {
          amount: 52000000,
          percentage: 61.2,
          color: '#3B82F6'
        },
        'Banco Provincia': {
          amount: 28000000,
          percentage: 32.9,
          color: '#10B981'
        },
        'Otros Acreedores': {
          amount: 5000000,
          percentage: 5.9,
          color: '#F59E0B'
        }
      },
      metadata: {
        year: 2024,
        last_updated: new Date().toISOString(),
        source: 'mock_data'
      }
    };
  }

  /**
   * Get mock budget data
   */
  getMockBudgetData(): any {
    return {
      year: 2024,
      totalBudget: 5000000000,
      totalExecuted: 3750000000,
      executionPercentage: 75,
      transparencyScore: 40,
      categories: [
        {
          name: 'Gastos Corrientes',
          budgeted: 3000000000,
          executed: 2250000000,
          percentage: 75
        },
        {
          name: 'Gastos de Capital',
          budgeted: 1250000000,
          executed: 937500000,
          percentage: 75
        },
        {
          name: 'Servicio de Deuda',
          budgeted: 500000000,
          executed: 375000000,
          percentage: 75
        },
        {
          name: 'Transferencias',
          budgeted: 250000000,
          executed: 187500000,
          percentage: 75
        }
      ]
    };
  }

  /**
   * Get mock detailed inventory
   */
  getMockDetailedInventory(): any {
    return {
      data_analysis: {
        description: 'Data analysis outputs',
        file_count: 24,
        files: [
          {
            name: 'all_documents.csv',
            path: 'data_analysis/csv_exports/all_documents.csv',
            size_bytes: 129884,
            extension: '.csv'
          },
          {
            name: 'budget_vs_execution_20250829_175206.png',
            path: 'data_analysis/visualizations/budget_vs_execution_20250829_175206.png',
            size_bytes: 236071,
            extension: '.png'
          }
        ]
      },
      document_sources: {
        description: 'Document sources and origins',
        file_count: 18,
        files: [
          {
            name: 'wayback_machine_archives.json',
            path: 'document_sources/wayback_machine_archives.json',
            size_bytes: 87654,
            extension: '.json'
          }
        ]
      },
      financial_oversight: {
        description: 'Financial oversight and monitoring data',
        file_count: 32,
        files: [
          {
            name: 'budget_execution_2024.json',
            path: 'financial_oversight/budget_execution_2024.json',
            size_bytes: 45678,
            extension: '.json'
          }
        ]
      },
      governance_review: {
        description: 'Governance and compliance reviews',
        file_count: 15,
        files: [
          {
            name: 'transparency_compliance_2024.json',
            path: 'governance_review/transparency_compliance_2024.json',
            size_bytes: 34567,
            extension: '.json'
          }
        ]
      },
      audit_cycles: {
        description: 'Audit cycle reports and findings',
        file_count: 28,
        files: [
          {
            name: 'cycle_20250902_205947.json',
            path: 'audit_cycles/cycle_reports/cycle_20250902_205947.json',
            size_bytes: 78901,
            extension: '.json'
          }
        ]
      }
    };
  }

  /**
   * Get mock analysis results
   */
  getMockAnalysisResults(): any {
    return {
      analysis_timestamp: new Date().toISOString(),
      municipality: 'Carmen de Areco',
      data_sources_analyzed: [
        'boletin_oficial',
        'boletin_oficial_provincia',
        'datos_gob_ar',
        'datos_buenos_aires',
        'afip'
      ],
      corruption_cases_tracked: 4,
      documents_processed: 168,
      anomalies_detected: 12,
      overall_risk_level: 'medium',
      detailed_findings: {
        boletin_oficial: [],
        boletin_oficial_provincia: [],
        datos_gob_ar: [
          {
            id: 'transporte_f87b93d4-ade2-44fc-a409-d3736ba9f3ba',
            title: 'Recorridos de Líneas de Transporte de Región Metropolitana de Buenos Aires (RMBA)',
            description: 'Recorridos de Líneas de Transporte de Región Metropolitana de Buenos Aires (RMBA).-',
            organization: ' Secretaría de Transporte',
            tags: [
              'AMBA',
              'BUENOS AIRES',
              'BUS',
              'FFCC',
              'Movilidad Urbana',
              'RMBA'
            ]
          }
        ]
      }
    };
  }

  /**
   * Load debt data from local JSON file
   */
  async loadDebtData(year: number): Promise<any> {
    try {
      // Try to load the specific year file
      const filePath = `organized_analysis/financial_oversight/debt_monitoring/debt_data_${year}.json`;
      return await this.loadJsonFile(filePath);
    } catch (error) {
      console.warn(`Failed to load debt data for year ${year}, trying fallback:`, error.message);
      
      // Try fallback to 2024 data
      try {
        const fallbackData = await this.loadJsonFile('organized_analysis/financial_oversight/debt_monitoring/debt_data_2024.json');
        return {
          ...fallbackData,
          year: year,
          debt_evolution: fallbackData.debt_evolution.map((entry: any) => ({
            ...entry,
            year: year - (2024 - entry.year) // Adjust years to match requested year
          })),
          metadata: {
            source: 'fallback_2024_data_adjusted_for_' + year,
            last_updated: new Date().toISOString()
          }
        };
      } catch (fallbackError) {
        console.error('Failed to load fallback debt data:', fallbackError.message);
        throw fallbackError;
      }
    }
  }

  /**
   * Load budget data from local JSON file
   */
  async loadBudgetData(year: number): Promise<any> {
    try {
      // Try to load the specific year file
      const filePath = `organized_analysis/financial_oversight/budget_analysis/budget_data_${year}.json`;
      return await this.loadJsonFile(filePath);
    } catch (error) {
      console.warn(`Failed to load budget data for year ${year}, trying fallback:`, error.message);
      
      // Try fallback to 2024 data
      try {
        const fallbackData = await this.loadJsonFile('organized_analysis/financial_oversight/budget_analysis/budget_data_2024.json');
        return {
          ...fallbackData,
          year: year,
          categories: fallbackData.categories.map((category: any) => ({
            ...category,
            // Adjust values slightly to simulate year changes
            budgeted: Math.round(category.budgeted * (1 + (year - 2024) * 0.05)), // 5% annual growth
            executed: Math.round(category.executed * (1 + (year - 2024) * 0.05))
          })),
          totalBudget: Math.round(fallbackData.totalBudget * (1 + (year - 2024) * 0.05)),
          totalExecuted: Math.round(fallbackData.totalExecuted * (1 + (year - 2024) * 0.05)),
          metadata: {
            source: 'fallback_2024_data_adjusted_for_' + year,
            last_updated: new Date().toISOString()
          }
        };
      } catch (fallbackError) {
        console.error('Failed to load fallback budget data:', fallbackError.message);
        throw fallbackError;
      }
    }
  }

  /**
   * Load detailed inventory data
   */
  async loadDetailedInventory(): Promise<any> {
    return await this.loadJsonFile('organized_analysis/detailed_inventory.json');
  }

  /**
   * Load analysis results data
   */
  async loadAnalysisResults(): Promise<any> {
    // Return mock data for analysis results
    return this.getMockAnalysisResults();
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { cache_size: number; cache_keys: string[] } {
    return {
      cache_size: this.cache.size,
      cache_keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const dataLoader = new DataLoader();
export default dataLoader;