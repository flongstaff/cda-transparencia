/** 
 * Chart Data Service - Loads and processes consolidated chart data
 * Handles loading of CSV data for the 13 chart types across all years (2019-2025)
 */

import Papa from 'papaparse';
import { buildDataUrl } from '../../config/apiConfig';

// Chart types that we have consolidated data for
export const CHART_TYPES = [
  'Budget_Execution',
  'Debt_Report',
  'Economic_Report',
  'Education_Data',
  'Expenditure_Report',
  'Financial_Reserves',
  'Fiscal_Balance_Report',
  'Health_Statistics',
  'Infrastructure_Projects',
  'Investment_Report',
  'Personnel_Expenses',
  'Revenue_Report',
  'Revenue_Sources',
  'Quarterly_Execution',
  'Programmatic_Performance',
  'Gender_Budgeting',
  'Waterfall_Execution'
] as const;

export type ChartType = typeof CHART_TYPES[number];

// Mapping chart types to human-readable names
export const CHART_TYPE_NAMES: Record<ChartType, string> = {
  'Budget_Execution': 'Ejecución Presupuestaria',
  'Debt_Report': 'Informe de Deuda',
  'Economic_Report': 'Informe Económico',
  'Education_Data': 'Datos Educativos',
  'Expenditure_Report': 'Informe de Gastos',
  'Financial_Reserves': 'Reservas Financieras',
  'Fiscal_Balance_Report': 'Balance Fiscal',
  'Health_Statistics': 'Estadísticas de Salud',
  'Infrastructure_Projects': 'Proyectos de Infraestructura',
  'Investment_Report': 'Informe de Inversiones',
  'Personnel_Expenses': 'Gastos en Personal',
  'Revenue_Report': 'Informe de Ingresos',
  'Revenue_Sources': 'Fuentes de Ingresos',
  'Quarterly_Execution': 'Ejecución Trimestral',
  'Programmatic_Performance': 'Rendimiento Programático',
  'Gender_Budgeting': 'Presupuesto de Género',
  'Waterfall_Execution': 'Ejecución en Cascada'
};

// Mapping chart types to descriptions
export const CHART_TYPE_DESCRIPTIONS: Record<ChartType, string> = {
  'Budget_Execution': 'Muestra cómo se ejecutó el presupuesto municipal a lo largo del tiempo, comparando lo planificado vs lo ejecutado',
  'Debt_Report': "Detalla las obligaciones de deuda del municipio, tasas de interés y cronogramas de pago",
  'Economic_Report': 'Proporciona indicadores económicos generales para el municipio',
  'Education_Data': 'Rastrea estadísticas educativas, matrícula escolar y gastos en educación',
  'Expenditure_Report': 'Desglose detallado de los gastos municipales por categoría',
  'Financial_Reserves': 'Información sobre reservas financieras y fondos de contingencia',
  'Fiscal_Balance_Report': 'Muestra el balance fiscal (ingresos menos gastos) a lo largo del tiempo',
  'Health_Statistics': 'Estadísticas de salud, datos de centros de salud y gastos médicos',
  'Infrastructure_Projects': 'Detalles de proyectos de infraestructura importantes y su avance',
  'Investment_Report': 'Actividades de inversión y proyectos de gasto de capital',
  'Personnel_Expenses': 'Costos de personal incluyendo salarios, beneficios y niveles de contratación',
  'Revenue_Report': 'Desglose detallado de las fuentes de ingresos municipales',
  'Revenue_Sources': 'Análisis de diferentes corrientes de ingresos y sus contribuciones',
  'Quarterly_Execution': 'Tendencias trimestrales en la ejecución del presupuesto con visualización combinada',
  'Programmatic_Performance': 'Métricas de rendimiento para programas municipales clave e iniciativas',
  'Gender_Budgeting': 'Análisis de perspectiva de género en el presupuestamiento y personal municipal',
  'Waterfall_Execution': 'Visualización acumulativa de la ejecución del presupuesto a través de períodos'
};

class ChartDataService {
  private static instance: ChartDataService;
  private cache = new Map<string, { data: any; timestamp: number; expires: number }>();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  private constructor() {}

  public static getInstance(): ChartDataService {
    if (!ChartDataService.instance) {
      ChartDataService.instance = new ChartDataService();
    }
    return ChartDataService.instance;
  }

  /**
   * Load consolidated chart data for a specific chart type
   */
  public async loadChartData(chartType: ChartType): Promise<any[] | null> {
    const cacheKey = `chart-data-${chartType}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() < cached.expires) {
      console.log(`[CHART DATA SERVICE] Cache hit for: ${chartType}`);
      return cached.data;
    }

    try {
      console.log(`[CHART DATA SERVICE] Loading chart data for: ${chartType}`);
      
      // Construct the URL for the consolidated CSV file using the new API config
      const csvUrl = buildDataUrl(`${chartType}_consolidated_2019-2025.csv`);
      
      // Fetch the CSV file
      const response = await fetch(csvUrl);
      
      if (!response.ok) {
        console.warn(`[CHART DATA SERVICE] Failed to load ${chartType} data from ${csvUrl}: HTTP ${response.status}`);
        
        // Fallback to local CSV if API failed
        const localUrl = `/data/charts/${chartType}_consolidated_2019-2025.csv`;
        console.log(`[CHART DATA SERVICE] Trying local fallback: ${localUrl}`);
        const localResponse = await fetch(localUrl);
        
        if (!localResponse.ok) {
          console.warn(`[CHART DATA SERVICE] Failed to load ${chartType} data from ${localUrl}: HTTP ${localResponse.status}`);
          // Return empty data instead of throwing error to allow graceful degradation
          return [];
        }
        
        const csvText = await localResponse.text();
      } else {
        const csvText = await response.text();
      }
      
      // Parse the CSV data
      const parsed = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        transform: (value) => {
          // Handle monetary values with dollar signs and commas
          if (typeof value === 'string') {
            // Check if it's a monetary value like \$330,000,000
            if (value.startsWith('$')) {
              return parseFloat(value.replace(/[$,]/g, ''));
            }
          }
          return value;
        }
      });

      console.log(`[CHART DATA SERVICE] ✅ Loaded ${parsed.data.length} rows for ${chartType}`);
      return parsed.data;
    } catch (error) {
      console.error(`[CHART DATA SERVICE] ❌ Failed to load ${chartType}:`, error);
      return null;
    }
  }

  /**
   * Load all chart data for a dashboard view
   */
  public async loadAllChartData(): Promise<Record<ChartType, any[] | null>> {
    console.log('[CHART DATA SERVICE] Loading all chart data...');
    
    // Load all chart types in parallel
    const loadDataPromises = CHART_TYPES.map(chartType => 
      this.loadChartData(chartType).then(data => ({ chartType, data }))
    );
    
    const results = await Promise.all(loadDataPromises);
    
    // Convert to record format
    const allData: Record<ChartType, any[] | null> = {} as Record<ChartType, any[] | null>;
    
    results.forEach(({ chartType, data }) => {
      allData[chartType] = data;
    });
    
    console.log('[CHART DATA SERVICE] Loaded all chart data');
    return allData;
  }

  /**
   * Get chart metadata including available years and data points
   */
  public async getChartMetadata(chartType: ChartType): Promise<any> {
    const data = await this.loadChartData(chartType);
    
    if (!data || data.length === 0) {
      return {
        chartType,
        availableYears: [],
        totalRecords: 0,
        dataPoints: 0,
        lastUpdated: new Date().toISOString()
      };
    }
    
    // Extract unique years
    const years = [...new Set(data.map(row => row.year))].sort((a, b) => b - a);
    
    return {
      chartType,
      availableYears: years,
      totalRecords: data.length,
      dataPoints: Object.keys(data[0] || {}).length,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Get all chart metadata
   */
  public async getAllChartMetadata(): Promise<any[]> {
    const metadataPromises = CHART_TYPES.map(chartType => 
      this.getChartMetadata(chartType)
    );
    
    return Promise.all(metadataPromises);
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.cache.clear();
    console.log('[CHART DATA SERVICE] Cache cleared');
  }

  /**
   * Get cache stats
   */
  public getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
const chartDataService = ChartDataService.getInstance();
export default chartDataService;

// Export for named imports
export { chartDataService };
