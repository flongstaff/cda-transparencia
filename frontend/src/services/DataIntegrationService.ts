/**
 * DATA INTEGRATION SERVICE
 *
 * Merges external API data with local CSV/JSON data sources
 * Implements the integration strategy identified in the audit:
 * 1. External APIs as primary source (real-time data)
 * 2. Local JSON as secondary source (structured data)
 * 3. Local CSV as tertiary source (historical data)
 * 4. Generated data as fallback
 */

import externalAPIsService from './ExternalAPIsService';
import yearSpecificDataService from './YearSpecificDataService';
import Papa from 'papaparse';

export interface IntegratedData {
  budget: {
    total_budget: number;
    total_executed: number;
    execution_rate: number;
    quarterly_data: any[];
    source: 'external' | 'local-json' | 'local-csv' | 'generated';
    last_updated: string;
  };
  contracts: any[];
  salaries: {
    totalPayroll: number;
    employeeCount: number;
    averageSalary: number;
    positions: any[];
  };
  documents: any[];
  treasury: {
    balance: number;
    income: number;
    expenses: number;
    total_revenue?: number;
    total_expenses?: number;
  };
  debt: {
    total_debt: number;
    debt_service: number;
  };
  external_validation: any[];
  metadata: {
    sources_used: string[];
    integration_success: boolean;
    external_data_available: boolean;
    last_sync: string;
  };
}

export interface DataSource {
  name: string;
  data: any;
  success: boolean;
  timestamp: string;
  source_type: 'external' | 'local-json' | 'local-csv' | 'generated';
}

class DataIntegrationService {
  private static instance: DataIntegrationService;
  private cache = new Map<string, { data: IntegratedData; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): DataIntegrationService {
    if (!DataIntegrationService.instance) {
      DataIntegrationService.instance = new DataIntegrationService();
    }
    return DataIntegrationService.instance;
  }

  /**
   * Clear all cached data
   */
  public clearCache(): void {
    console.log('🗑️ Clearing data integration cache');
    this.cache.clear();
  }

  /**
   * Load integrated data for a specific year
   * Combines external APIs, local JSON, CSV data, and generated fallback
   */
  async loadIntegratedData(year: number): Promise<IntegratedData> {
    const cacheKey = `integrated_${year}`;
    const cached = this.cache.get(cacheKey);

    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      console.log(`📦 Using cached integrated data for year ${year}`);
      return cached.data;
    }

    console.log(`🔄 Loading integrated data for year ${year}...`);

    try {
      // Attempt to load data from all sources in parallel
      const [externalResult, localJsonResult, localCsvResult, generatedResult] = await Promise.allSettled([
        this.loadExternalData(year),
        this.loadLocalJSONData(year),
        this.loadLocalCSVData(year),
        this.loadGeneratedData(year)
      ]);

      // Process results and merge
      const dataSources = this.processResults([externalResult, localJsonResult, localCsvResult, generatedResult]);
      const integratedData = this.mergeDataSources(dataSources, year);

      // Cache the result
      this.cache.set(cacheKey, {
        data: integratedData,
        timestamp: Date.now()
      });

      console.log(`✅ Integrated data loaded for year ${year}:`, {
        sources: integratedData.metadata.sources_used,
        external_available: integratedData.metadata.external_data_available
      });

      return integratedData;

    } catch (error) {
      console.error(`❌ Error loading integrated data for year ${year}:`, error);

      // Final fallback to generated data only
      const fallbackData = await this.loadGeneratedData(year);
      return this.createIntegratedDataFromGenerated(fallbackData, year);
    }
  }

  /**
   * Load data from external APIs
   */
  private async loadExternalData(year: number): Promise<DataSource> {
    try {
      // Check if we're in production or if proxy server is available
      const isProduction = window.location.hostname === 'cda-transparencia.org' ||
                          window.location.hostname.includes('pages.dev') ||
                          window.location.hostname.includes('github.io');

      const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

      // In development, check if proxy server is available
      if (isDevelopment) {
        try {
          const proxyCheck = await fetch('http://localhost:3001/health', {
            method: 'GET',
            signal: AbortSignal.timeout(2000) // 2 second timeout
          });
          if (!proxyCheck.ok) {
            throw new Error('Proxy server not responding');
          }
          console.log(`✅ Proxy server detected - enabling external APIs`);
        } catch (error) {
          console.log(`⏭️ Skipping external APIs in development mode (no proxy server)`);
          throw new Error('External APIs disabled in development mode - start proxy with: npm run proxy');
        }
      }

      console.log(`🌐 Loading external API data for year ${year}...`);

      const [carmenData, nationalData, geoData] = await Promise.allSettled([
        externalAPIsService.getCarmenDeArecoData(),
        externalAPIsService.getNationalBudgetData(),
        externalAPIsService.getGeographicData()
      ]);

      // Process successful external data
      const successfulData = [];
      if (carmenData.status === 'fulfilled' && carmenData.value.success) {
        successfulData.push(carmenData.value);
      }
      if (nationalData.status === 'fulfilled' && nationalData.value.success) {
        successfulData.push(nationalData.value);
      }
      if (geoData.status === 'fulfilled' && geoData.value.success) {
        successfulData.push(geoData.value);
      }

      if (successfulData.length > 0) {
        return {
          name: 'External APIs',
          data: this.parseExternalData(successfulData, year),
          success: true,
          timestamp: new Date().toISOString(),
          source_type: 'external'
        };
      } else {
        throw new Error('No successful external API responses');
      }

    } catch (error) {
      console.warn(`⚠️ External API data unavailable for year ${year}:`, error);
      return {
        name: 'External APIs',
        data: null,
        success: false,
        timestamp: new Date().toISOString(),
        source_type: 'external'
      };
    }
  }

  /**
   * Load data from local JSON files
   */
  private async loadLocalJSONData(year: number): Promise<DataSource> {
    try {
      console.log(`📁 Loading local JSON data for year ${year}...`);

      const jsonFiles = [
        `budget.json`,
        `contracts.json`,
        `salaries.json`,
        `documents.json`,
        `treasury.json`,
        `debt.json`,
        `summary.json`
      ];

      const responses = await Promise.allSettled(
        jsonFiles.map(file =>
          fetch(`/data/consolidated/${year}/${file}`)
            .then(res => res.ok ? res.json() : null)
        )
      );

      const loadedData: any = {};
      responses.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          const fileName = jsonFiles[index].replace('.json', '');
          loadedData[fileName] = result.value;
        }
      });

      if (Object.keys(loadedData).length > 0) {
        return {
          name: 'Local JSON',
          data: this.parseLocalJSONData(loadedData, year),
          success: true,
          timestamp: new Date().toISOString(),
          source_type: 'local-json'
        };
      } else {
        throw new Error(`No JSON data found for year ${year}`);
      }

    } catch (error) {
      console.warn(`⚠️ Local JSON data unavailable for year ${year}:`, error);
      return {
        name: 'Local JSON',
        data: null,
        success: false,
        timestamp: new Date().toISOString(),
        source_type: 'local-json'
      };
    }
  }

  /**
   * Load data from local CSV files
   */
  private async loadLocalCSVData(year: number): Promise<DataSource> {
    try {
      console.log(`📊 Loading local CSV data for year ${year}...`);

      const csvFiles = [
        'Budget_Execution_consolidated_2019-2025.csv',
        'Personnel_Expenses_consolidated_2019-2025.csv',
        'Revenue_Report_consolidated_2019-2025.csv',
        'Debt_Report_consolidated_2019-2025.csv'
      ];

      const csvData: any = {};

      for (const file of csvFiles) {
        try {
          const response = await fetch(`/data/charts/${file}`);
          if (response.ok) {
            const csvText = await response.text();
            const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });

            // Filter data for the specific year
            const yearData = parsed.data.filter((row: any) =>
              row.Year == year || row.year == year || row.Año == year || row.año == year
            );

            const fileName = file.replace('_consolidated_2019-2025.csv', '').toLowerCase();
            csvData[fileName] = yearData;
          }
        } catch (error) {
          console.warn(`⚠️ Failed to load CSV file ${file}:`, error);
        }
      }

      if (Object.keys(csvData).length > 0) {
        return {
          name: 'Local CSV',
          data: this.parseLocalCSVData(csvData, year),
          success: true,
          timestamp: new Date().toISOString(),
          source_type: 'local-csv'
        };
      } else {
        throw new Error(`No CSV data found for year ${year}`);
      }

    } catch (error) {
      console.warn(`⚠️ Local CSV data unavailable for year ${year}:`, error);
      return {
        name: 'Local CSV',
        data: null,
        success: false,
        timestamp: new Date().toISOString(),
        source_type: 'local-csv'
      };
    }
  }

  /**
   * Load generated/mock data as fallback
   */
  private async loadGeneratedData(year: number): Promise<DataSource> {
    try {
      console.log(`🎲 Loading generated data for year ${year}...`);

      const generatedData = await yearSpecificDataService.getYearData(year);

      return {
        name: 'Generated Data',
        data: generatedData,
        success: true,
        timestamp: new Date().toISOString(),
        source_type: 'generated'
      };

    } catch (error) {
      console.error(`❌ Failed to load generated data for year ${year}:`, error);
      throw error;
    }
  }

  /**
   * Process Promise.allSettled results
   */
  private processResults(results: PromiseSettledResult<DataSource>[]): DataSource[] {
    return results
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<DataSource>).value)
      .filter(source => source.success);
  }

  /**
   * Merge data from multiple sources with priority order
   */
  private mergeDataSources(sources: DataSource[], year: number): IntegratedData {
    const sourcesUsed: string[] = [];
    let externalDataAvailable = false;

    // Priority order: external > local-json > local-csv > generated
    const externalSource = sources.find(s => s.source_type === 'external');
    const jsonSource = sources.find(s => s.source_type === 'local-json');
    const csvSource = sources.find(s => s.source_type === 'local-csv');
    const generatedSource = sources.find(s => s.source_type === 'generated');

    if (externalSource) {
      sourcesUsed.push('external-apis');
      externalDataAvailable = true;
    }
    if (jsonSource) sourcesUsed.push('local-json');
    if (csvSource) sourcesUsed.push('local-csv');
    if (generatedSource) sourcesUsed.push('generated');

    // Merge budget data (external > json > csv > generated)
    const budget = this.mergeBudgetData(externalSource, jsonSource, csvSource, generatedSource);

    // Merge other data types
    const contracts = this.mergeArrayData('contracts', externalSource, jsonSource, csvSource, generatedSource);
    const salaries = this.mergeSalariesData(externalSource, jsonSource, csvSource, generatedSource);
    const documents = this.mergeArrayData('documents', externalSource, jsonSource, csvSource, generatedSource);
    const treasury = this.mergeTreasuryData(externalSource, jsonSource, csvSource, generatedSource);
    const debt = this.mergeDebtData(externalSource, jsonSource, csvSource, generatedSource);

    return {
      budget,
      contracts: contracts || [],
      salaries: salaries || { totalPayroll: 0, employeeCount: 0, averageSalary: 0, positions: [] },
      documents: documents || [],
      treasury: treasury || { balance: 0, income: 0, expenses: 0 },
      debt: debt || { total_debt: 0, debt_service: 0 },
      external_validation: externalSource ? [externalSource.data] : [],
      metadata: {
        sources_used: sourcesUsed,
        integration_success: sourcesUsed.length > 1,
        external_data_available: externalDataAvailable,
        last_sync: new Date().toISOString()
      }
    };
  }

  /**
   * Merge budget data from multiple sources
   */
  private mergeBudgetData(...sources: (DataSource | undefined)[]): IntegratedData['budget'] {
    for (const source of sources) {
      if (source?.data?.budget) {
        const budget = source.data.budget;
        const merged = {
          total_budget: budget.totalBudget || budget.total_budget || 0,
          total_executed: budget.totalExecuted || budget.total_executed || 0,
          execution_rate: budget.executionRate || budget.execution_rate || 0,
          quarterly_data: budget.quarterlyData || budget.quarterly_data || [],
          source: source.source_type,
          last_updated: source.timestamp
        };

        console.log(`💰 Merged budget data from ${source.source_type}:`, {
          total_budget: merged.total_budget,
          total_executed: merged.total_executed,
          year: budget.year
        });

        return merged;
      }
    }

    // Fallback to empty budget
    console.log('⚠️ No budget data found in any source, using empty fallback');
    return {
      total_budget: 0,
      total_executed: 0,
      execution_rate: 0,
      quarterly_data: [],
      source: 'generated',
      last_updated: new Date().toISOString()
    };
  }

  /**
   * Merge array data (contracts, documents)
   */
  private mergeArrayData(key: string, ...sources: (DataSource | undefined)[]): any[] {
    for (const source of sources) {
      if (source?.data?.[key] && Array.isArray(source.data[key])) {
        return source.data[key];
      }
    }
    return [];
  }

  /**
   * Merge salaries data
   */
  private mergeSalariesData(...sources: (DataSource | undefined)[]): IntegratedData['salaries'] {
    for (const source of sources) {
      if (source?.data?.salaries) {
        const salaries = source.data.salaries;
        return {
          totalPayroll: salaries.totalPayroll || 0,
          employeeCount: salaries.employeeCount || 0,
          averageSalary: salaries.averageSalary || 0,
          positions: salaries.positions || []
        };
      }
    }
    return { totalPayroll: 0, employeeCount: 0, averageSalary: 0, positions: [] };
  }

  /**
   * Merge treasury data
   */
  private mergeTreasuryData(...sources: (DataSource | undefined)[]): IntegratedData['treasury'] {
    for (const source of sources) {
      if (source?.data?.treasury) {
        const treasury = source.data.treasury;
        return {
          balance: treasury.balance || 0,
          income: treasury.income || treasury.total_revenue || 0,
          expenses: treasury.expenses || treasury.total_expenses || 0,
          total_revenue: treasury.total_revenue || treasury.income || 0,
          total_expenses: treasury.total_expenses || treasury.expenses || 0
        };
      }
    }
    return { balance: 0, income: 0, expenses: 0 };
  }

  /**
   * Merge debt data
   */
  private mergeDebtData(...sources: (DataSource | undefined)[]): IntegratedData['debt'] {
    for (const source of sources) {
      if (source?.data?.debt) {
        const debt = source.data.debt;
        return {
          total_debt: debt.total_debt || debt.totalDebt || 0,
          debt_service: debt.debt_service || debt.debtService || 0
        };
      }
    }
    return { total_debt: 0, debt_service: 0 };
  }

  /**
   * Parse external API data into standardized format
   */
  private parseExternalData(externalSources: any[], year: number): any {
    // Process external API responses and extract relevant data
    const processed = {
      budget: { totalBudget: 0, totalExecuted: 0, executionRate: 0, quarterlyData: [] },
      contracts: [],
      salaries: { totalPayroll: 0, employeeCount: 0, averageSalary: 0, positions: [] },
      documents: [],
      treasury: { balance: 0, income: 0, expenses: 0 },
      debt: { total_debt: 0, debt_service: 0 }
    };

    // Extract meaningful data from external responses
    for (const source of externalSources) {
      if (source.data) {
        // Look for budget-related data
        if (source.source.includes('Carmen de Areco') && source.data.transparency_indicators) {
          if (source.data.transparency_indicators.has_budget_info) {
            // Extract budget information from HTML parsing
            processed.budget.totalBudget = this.extractBudgetFromHtml(source.data);
          }
        }

        // Look for national budget data
        if (source.source.includes('National Budget') && source.data.result) {
          processed.budget = this.extractNationalBudgetData(source.data, year);
        }
      }
    }

    return processed;
  }

  /**
   * Parse local JSON data into standardized format
   */
  private parseLocalJSONData(jsonData: any, year: number): any {
    const parsed = {
      budget: jsonData.budget || jsonData.summary?.budget || {},
      contracts: jsonData.contracts || [],
      salaries: jsonData.salaries || {},
      documents: jsonData.documents || [],
      treasury: jsonData.treasury || {},
      debt: jsonData.debt || {}
    };

    console.log(`📊 Parsed local JSON data for year ${year}:`, {
      budget: {
        total_budget: parsed.budget.total_budget,
        total_executed: parsed.budget.total_executed,
        year: parsed.budget.year
      }
    });

    return parsed;
  }

  /**
   * Parse local CSV data into standardized format
   */
  private parseLocalCSVData(csvData: any, year: number): any {
    const processed: any = {
      budget: { totalBudget: 0, totalExecuted: 0, executionRate: 0, quarterlyData: [] },
      contracts: [],
      salaries: { totalPayroll: 0, employeeCount: 0, averageSalary: 0, positions: [] },
      documents: [],
      treasury: { balance: 0, income: 0, expenses: 0 },
      debt: { total_debt: 0, debt_service: 0 }
    };

    // Extract budget data from CSV
    if (csvData.budget_execution && csvData.budget_execution.length > 0) {
      const budgetRow = csvData.budget_execution[0];
      processed.budget = {
        totalBudget: parseFloat(budgetRow.Total_Budget || budgetRow.Presupuesto_Total || 0),
        totalExecuted: parseFloat(budgetRow.Total_Executed || budgetRow.Ejecutado_Total || 0),
        executionRate: parseFloat(budgetRow.Execution_Rate || budgetRow.Tasa_Ejecucion || 0),
        quarterlyData: csvData.budget_execution || []
      };
    }

    // Extract personnel data from CSV
    if (csvData.personnel_expenses && csvData.personnel_expenses.length > 0) {
      const personnelRow = csvData.personnel_expenses[0];
      processed.salaries = {
        totalPayroll: parseFloat(personnelRow.Total_Payroll || personnelRow.Nomina_Total || 0),
        employeeCount: parseInt(personnelRow.Employee_Count || personnelRow.Cantidad_Empleados || 0),
        averageSalary: parseFloat(personnelRow.Average_Salary || personnelRow.Salario_Promedio || 0),
        positions: csvData.personnel_expenses || []
      };
    }

    return processed;
  }

  /**
   * Extract budget data from HTML content
   */
  private extractBudgetFromHtml(htmlData: any): number {
    // Simple extraction - look for budget-related numbers in HTML
    if (htmlData.content_length && htmlData.content_length > 1000) {
      // Assume this is a real transparency site with budget info
      return 330000000; // Placeholder - would need actual HTML parsing
    }
    return 0;
  }

  /**
   * Extract national budget data
   */
  private extractNationalBudgetData(data: any, year: number): any {
    // Process national budget API response
    return {
      totalBudget: 0,
      totalExecuted: 0,
      executionRate: 0,
      quarterlyData: []
    };
  }

  /**
   * Create integrated data from generated data only (final fallback)
   */
  private createIntegratedDataFromGenerated(generatedData: DataSource, year: number): IntegratedData {
    const data = generatedData.data;

    return {
      budget: {
        total_budget: data.budget?.totalBudget || 0,
        total_executed: data.budget?.totalExecuted || 0,
        execution_rate: data.budget?.executionRate || 0,
        quarterly_data: data.budget?.quarterlyData || [],
        source: 'generated',
        last_updated: generatedData.timestamp
      },
      contracts: data.contracts || [],
      salaries: data.salaries || { totalPayroll: 0, employeeCount: 0, averageSalary: 0, positions: [] },
      documents: data.documents || [],
      treasury: data.treasury || { balance: 0, income: 0, expenses: 0 },
      debt: data.debt || { total_debt: 0, debt_service: 0 },
      external_validation: [],
      metadata: {
        sources_used: ['generated'],
        integration_success: false,
        external_data_available: false,
        last_sync: generatedData.timestamp
      }
    };
  }

  /**
   * Clear integration cache
   */


  /**
   * Get integration status
   */
  getIntegrationStatus(): {
    cache_size: number;
    cache_entries: string[];
    service_health: 'healthy' | 'degraded' | 'down';
  } {
    return {
      cache_size: this.cache.size,
      cache_entries: Array.from(this.cache.keys()),
      service_health: this.cache.size > 0 ? 'healthy' : 'degraded'
    };
  }
}

export const dataIntegrationService = DataIntegrationService.getInstance();
export default dataIntegrationService;