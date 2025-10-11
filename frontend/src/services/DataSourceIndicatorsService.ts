/**
 * DataSourceIndicatorsService
 * 
 * Service that creates data source indicators for UI display,
 * showing which data sources are available, their status,
 * and their reliability metrics.
 */

import { externalAPIsService } from "./ExternalDataAdapter";
import { dataNormalizationService } from './DataNormalizationService';
import { NormalizedDataPoint } from './DataNormalizationService';

export interface DataSourceIndicator {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'slow' | 'error';
  lastUpdated: string;
  dataPoints: number;
  reliability: number; // 0-1 score
  coverage: number; // 0-1 score
  responseTime: number; // in ms
  notes?: string[];
}

export interface DataSourceHealth {
  totalSources: number;
  onlineSources: number;
  offlineSources: number;
  averageReliability: number;
  lastCheck: string;
}

class DataSourceIndicatorsService {
  private static instance: DataSourceIndicatorsService;
  private indicators: Map<string, DataSourceIndicator> = new Map();
  private lastCheck: Date | null = null;

  private constructor() {}

  public static getInstance(): DataSourceIndicatorsService {
    if (!DataSourceIndicatorsService.instance) {
      DataSourceIndicatorsService.instance = new DataSourceIndicatorsService();
    }
    return DataSourceIndicatorsService.instance;
  }

  /**
   * Generate indicators for all data sources
   */
  public async generateIndicators(): Promise<DataSourceIndicator[]> {
    const indicators: DataSourceIndicator[] = [];

    // Test each data source
    const sourcesToTest = [
      { id: 'carmen-official', name: 'Carmen de Areco - Portal Oficial' },
      { id: 'carmen-transparency', name: 'Carmen de Areco - Portal de Transparencia' },
      { id: 'rafam', name: 'RAFAM - Datos Económicos BA' },
      { id: 'gba-data', name: 'Datos Abiertos Provincia BA' },
      { id: 'datos-gob-ar', name: 'Datos Argentina' },
      { id: 'contrataciones', name: 'Contrataciones Abiertas' },
      { id: 'boletin-nacional', name: 'Boletín Oficial Nacional' },
      { id: 'aaip', name: 'AAIP - Transparencia' },
    ];

    for (const source of sourcesToTest) {
      const indicator = await this.testDataSource(source.id, source.name);
      indicators.push(indicator);
      this.indicators.set(source.id, indicator);
    }

    this.lastCheck = new Date();
    return indicators;
  }

  /**
   * Test a specific data source
   */
  private async testDataSource(id: string, name: string): Promise<DataSourceIndicator> {
    const startTime = Date.now();
    let status: 'online' | 'offline' | 'slow' | 'error' = 'online';
    let dataPoints = 0;
    let lastUpdated = new Date().toISOString();
    const notes: string[] = [];

    try {
      // Test the data source based on its type
      const testData: any = null;
      let success = false;

      switch (id) {
        case 'carmen-official': {
          const carmenData = await externalAPIsService.getCarmenDeArecoData();
          success = carmenData.success;
          if (success && carmenData.data) {
            // Normalize the data and count data points
            const normalized = await dataNormalizationService.normalizeExternalData(
              carmenData, 'carmen-official'
            );
            dataPoints = normalized.length;
            lastUpdated = carmenData.lastModified || lastUpdated;
          }
          break;
        }

        case 'carmen-transparency': {
          const transparencyData = await externalAPIsService.getBuenosAiresProvincialData();
          success = transparencyData.success;
          if (success && transparencyData.data) {
            const normalized = await dataNormalizationService.normalizeExternalData(
              transparencyData, 'carmen-transparency'
            );
            dataPoints = normalized.length;
            lastUpdated = transparencyData.lastModified || lastUpdated;
          }
          break;
        }

        case 'rafam': {
          const rafamData = await externalAPIsService.getRAFAMData('270');
          success = rafamData.success;
          if (success && rafamData.data) {
            const normalized = await dataNormalizationService.normalizeExternalData(
              rafamData, 'rafam'
            );
            dataPoints = normalized.length;
            lastUpdated = rafamData.lastModified || lastUpdated;
          }
          break;
        }

        case 'gba-data': {
          const gbaData = await externalAPIsService.getBuenosAiresProvincialData();
          success = gbaData.success;
          if (success && gbaData.data) {
            const normalized = await dataNormalizationService.normalizeExternalData(
              gbaData, 'gba-opens-data'
            );
            dataPoints = normalized.length;
            lastUpdated = gbaData.lastModified || lastUpdated;
          }
          break;
        }

        case 'datos-gob-ar': {
          const datosData = await externalAPIsService.getNationalBudgetData();
          success = datosData.success;
          if (success && datosData.data) {
            const normalized = await dataNormalizationService.normalizeExternalData(
              datosData, 'datos-gob-ar'
            );
            dataPoints = normalized.length;
            lastUpdated = datosData.lastModified || lastUpdated;
          }
          break;
        }

        case 'contrataciones': {
          const contratacionesData = await externalAPIsService.getContratacionesData('Carmen de Areco');
          success = contratacionesData.success;
          if (success && contratacionesData.data) {
            const normalized = await dataNormalizationService.normalizeExternalData(
              contratacionesData, 'contrataciones-abiertas'
            );
            dataPoints = normalized.length;
            lastUpdated = contratacionesData.lastModified || lastUpdated;
          }
          break;
        }

        case 'boletin-nacional': {
          const boletinData = await externalAPIsService.getBoletinOficialNacional('Carmen de Areco');
          success = boletinData.success;
          if (success && boletinData.data) {
            const normalized = await dataNormalizationService.normalizeExternalData(
              boletinData, 'boletin-nacional'
            );
            dataPoints = normalized.length;
            lastUpdated = boletinData.lastModified || lastUpdated;
          }
          break;
        }

        case 'aaip': {
          const aaipData = await externalAPIsService.getAAIPData();
          success = aaipData.success;
          if (success && aaipData.data) {
            const normalized = await dataNormalizationService.normalizeExternalData(
              aaipData, 'aaip'
            );
            dataPoints = normalized.length;
            lastUpdated = aaipData.lastModified || lastUpdated;
          }
          break;

        default:
          // For unknown sources, try to get basic info
          success = false;
          notes.push('Fuente desconocida, no se pudo verificar');
      }

      status = success ? 'online' : 'offline';

      // Check response time for slow status
      const responseTime = Date.now() - startTime;
      if (responseTime > 5000 && success) {
        status = 'slow';
        notes.push(`Tiempo de respuesta: ${responseTime}ms`);
      }

    } catch (error) {
      status = 'error';
      notes.push(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    const responseTime = Date.now() - startTime;
    
    // Calculate reliability based on status and other factors
    let reliability = 0.5; // Default
    switch (status) {
      case 'online':
        reliability = 0.9;
        break;
      case 'slow':
        reliability = 0.6;
        break;
      case 'offline':
        reliability = 0.3;
        break;
      case 'error':
        reliability = 0.1;
        break;
    }

    // Calculate coverage (estimated based on data points)
    const coverage = Math.min(1.0, dataPoints / 100); // Assuming 100 is full coverage

    return {
      id,
      name,
      status,
      lastUpdated,
      dataPoints,
      reliability,
      coverage,
      responseTime,
      notes: notes.length > 0 ? notes : undefined
    };
  }

  /**
   * Get indicator for a specific data source
   */
  public async getIndicator(sourceId: string): Promise<DataSourceIndicator | null> {
    // If we have a cached indicator and it's recent, return it
    const cached = this.indicators.get(sourceId);
    if (cached && this.lastCheck && 
        Date.now() - this.lastCheck.getTime() < 5 * 60 * 1000) { // 5 minutes
      return cached;
    }

    // Otherwise, test the source directly
    const indicator = await this.testDataSource(sourceId, this.getSourceName(sourceId));
    this.indicators.set(sourceId, indicator);
    return indicator;
  }

  /**
   * Get all data source health metrics
   */
  public async getHealthMetrics(): Promise<DataSourceHealth> {
    const indicators = await this.generateIndicators();
    
    const onlineSources = indicators.filter(i => i.status === 'online').length;
    const offlineSources = indicators.filter(i => i.status === 'offline').length;
    
    const averageReliability = indicators.reduce((sum, i) => sum + i.reliability, 0) / indicators.length;

    return {
      totalSources: indicators.length,
      onlineSources,
      offlineSources,
      averageReliability,
      lastCheck: new Date().toISOString()
    };
  }

  /**
   * Get the name for a source ID
   */
  private getSourceName(sourceId: string): string {
    const names: Record<string, string> = {
      'carmen-official': 'Carmen de Areco - Portal Oficial',
      'carmen-transparency': 'Carmen de Areco - Portal de Transparencia',
      'rafam': 'RAFAM - Datos Económicos BA',
      'gba-data': 'Datos Abiertos Provincia BA',
      'datos-gob-ar': 'Datos Argentina',
      'contrataciones': 'Contrataciones Abiertas',
      'boletin-nacional': 'Boletín Oficial Nacional',
      'aaip': 'AAIP - Transparencia'
    };

    return names[sourceId] || sourceId;
  }

  /**
   * Get indicators by status
   */
  public async getIndicatorsByStatus(status: 'online' | 'offline' | 'slow' | 'error'): Promise<DataSourceIndicator[]> {
    const indicators = await this.generateIndicators();
    return indicators.filter(indicator => indicator.status === status);
  }

  /**
   * Get indicators by reliability threshold
   */
  public async getIndicatorsByReliability(minReliability: number): Promise<DataSourceIndicator[]> {
    const indicators = await this.generateIndicators();
    return indicators.filter(indicator => indicator.reliability >= minReliability);
  }

  /**
   * Refresh indicators
   */
  public async refreshIndicators(): Promise<DataSourceIndicator[]> {
    this.indicators.clear();
    return await this.generateIndicators();
  }

  /**
   * Get summary statistics
   */
  public async getSummaryStats(): Promise<{
    totalSources: number;
    totalDataPoints: number;
    averageReliability: number;
    averageResponseTime: number;
  }> {
    const indicators = await this.generateIndicators();
    
    const totalSources = indicators.length;
    const totalDataPoints = indicators.reduce((sum, i) => sum + i.dataPoints, 0);
    const averageReliability = totalSources > 0 
      ? indicators.reduce((sum, i) => sum + i.reliability, 0) / totalSources 
      : 0;
    const averageResponseTime = totalSources > 0 
      ? indicators.reduce((sum, i) => sum + i.responseTime, 0) / totalSources 
      : 0;

    return {
      totalSources,
      totalDataPoints,
      averageReliability,
      averageResponseTime
    };
  }
}

const dataSourceIndicatorsService = DataSourceIndicatorsService.getInstance();

export { DataSourceIndicatorsService };
export { dataSourceIndicatorsService };
export default dataSourceIndicatorsService;