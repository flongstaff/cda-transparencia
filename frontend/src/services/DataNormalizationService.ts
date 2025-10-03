/**
 * Data Normalization and Transformation Service
 * 
 * This service provides comprehensive data normalization and transformation
 * to ensure consistent formats across all external data sources.
 * It handles normalization between different data formats (JSON, CSV, HTML tables, etc.)
 * and standardizes data structures for internal use.
 */

import { ExternalDataResponse, DataSource } from './ExternalAPIsService';

export interface NormalizedDataPoint {
  id: string;
  category: string;
  year: number;
  indicator: string;
  value: number | string;
  source: string;
  unit: string;
  confidence: number; // 0-1 confidence score
  timestamp: string;
  notes?: string[];
  flags?: string[];
}

export interface NormalizationConfig {
  sourceType: 'municipal' | 'provincial' | 'national' | 'civil_society';
  sourceName: string;
  dateFormat?: string;
  valueFormat?: 'currency' | 'percentage' | 'count' | 'amount';
  currency?: string;
  normalizationRules: NormalizationRule[];
}

export interface NormalizationRule {
  field: string;
  operation: 'rename' | 'transform' | 'calculate' | 'filter';
  target?: string;
  condition?: string;
  formula?: (value: any) => any;
}

export interface DataQualityMetrics {
  completeness: number;
  accuracy: number;
  consistency: number;
  timeliness: number;
  validity: number;
  totalScore: number;
}

class DataNormalizationService {
  private static instance: DataNormalizationService;
  private normalizationConfigs: Map<string, NormalizationConfig> = new Map();
  
  private constructor() {
    this.initializeNormalizationConfigs();
  }

  public static getInstance(): DataNormalizationService {
    if (!DataNormalizationService.instance) {
      DataNormalizationService.instance = new DataNormalizationService();
    }
    return DataNormalizationService.instance;
  }

  /**
   * Initialize normalization configurations for all supported data sources
   */
  private initializeNormalizationConfigs(): void {
    // Carmen de Areco Municipal Sources
    this.normalizationConfigs.set('carmen-official', {
      sourceType: 'municipal',
      sourceName: 'Carmen de Areco Official Portal',
      valueFormat: 'currency',
      currency: 'ARS',
      normalizationRules: [
        { 
          field: 'budget', 
          operation: 'rename', 
          target: 'value' 
        },
        { 
          field: 'amount', 
          operation: 'rename', 
          target: 'value' 
        },
        { 
          field: 'total', 
          operation: 'rename', 
          target: 'value' 
        }
      ]
    });

    this.normalizationConfigs.set('carmen-transparency', {
      sourceType: 'municipal',
      sourceName: 'Carmen de Areco Transparency Portal',
      valueFormat: 'currency',
      currency: 'ARS',
      normalizationRules: [
        { 
          field: 'monto', 
          operation: 'rename', 
          target: 'value' 
        },
        { 
          field: 'importe', 
          operation: 'rename', 
          target: 'value' 
        },
        { 
          field: 'amount', 
          operation: 'rename', 
          target: 'value' 
        }
      ]
    });

    // Buenos Aires Provincial Sources
    this.normalizationConfigs.set('rafam', {
      sourceType: 'provincial',
      sourceName: 'RAFAM Economic Data',
      valueFormat: 'currency',
      currency: 'ARS',
      normalizationRules: [
        { 
          field: 'monto', 
          operation: 'rename', 
          target: 'value' 
        },
        { 
          field: 'importe', 
          operation: 'rename', 
          target: 'value' 
        },
        { 
          field: 'valor', 
          operation: 'rename', 
          target: 'value' 
        }
      ]
    });

    this.normalizationConfigs.set('gba-opens-data', {
      sourceType: 'provincial',
      sourceName: 'Buenos Aires Open Data',
      valueFormat: 'count',
      normalizationRules: [
        { 
          field: 'cantidad', 
          operation: 'rename', 
          target: 'value' 
        },
        { 
          field: 'count', 
          operation: 'rename', 
          target: 'value' 
        }
      ]
    });

    // National Sources
    this.normalizationConfigs.set('datos-gob-ar', {
      sourceType: 'national',
      sourceName: 'Datos Argentina',
      valueFormat: 'count',
      normalizationRules: [
        { 
          field: 'value', 
          operation: 'rename', 
          target: 'value' 
        },
        { 
          field: 'cantidad', 
          operation: 'rename', 
          target: 'value' 
        }
      ]
    });

    this.normalizationConfigs.set('contrataciones-abiertas', {
      sourceType: 'national',
      sourceName: 'Contrataciones Abiertas',
      valueFormat: 'currency',
      currency: 'ARS',
      normalizationRules: [
        { 
          field: 'amount', 
          operation: 'transform', 
          formula: (value) => {
            // Standardize format for contract amounts
            if (typeof value === 'string') {
              return parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
            }
            return value;
          }
        },
        { 
          field: 'monto', 
          operation: 'rename', 
          target: 'value' 
        }
      ]
    });

    // Civil Society Organizations
    this.normalizationConfigs.set('poder-ciudadano', {
      sourceType: 'civil_society',
      sourceName: 'Poder Ciudadano',
      valueFormat: 'count',
      normalizationRules: [
        { 
          field: 'score', 
          operation: 'rename', 
          target: 'value' 
        },
        { 
          field: 'transparency_index', 
          operation: 'rename', 
          target: 'value' 
        }
      ]
    });
  }

  /**
   * Normalize external data response to unified format
   */
  public async normalizeExternalData(
    dataResponse: ExternalDataResponse,
    sourceId: string
  ): Promise<NormalizedDataPoint[]> {
    if (!dataResponse.success || !dataResponse.data) {
      return [];
    }

    const config = this.normalizationConfigs.get(sourceId) || 
                  this.getDefaultConfig(dataResponse.source);
    
    let normalizedData: NormalizedDataPoint[] = [];

    try {
      // Handle different data structures
      if (Array.isArray(dataResponse.data)) {
        // Handle array data
        normalizedData = dataResponse.data.map((item, index) => 
          this.normalizeItem(item, config, sourceId, index, dataResponse)
        );
      } else if (typeof dataResponse.data === 'object') {
        // Handle object data
        normalizedData = this.normalizeObject(dataResponse.data, config, sourceId, dataResponse);
      } else {
        // Handle simple value
        normalizedData = [this.normalizeValue(dataResponse.data, config, sourceId, dataResponse)];
      }
    } catch (error) {
      console.error(`Error normalizing data from ${sourceId}:`, error);
      // Return a fallback normalized structure
      return [this.createFallbackDataPoint(dataResponse, sourceId)];
    }

    // Filter out null values
    return normalizedData.filter(Boolean);
  }

  /**
   * Normalize a single data item
   */
  private normalizeItem(
    item: any,
    config: NormalizationConfig,
    sourceId: string,
    index: number,
    originalResponse: ExternalDataResponse
  ): NormalizedDataPoint | null {
    if (!item) return null;

    // Apply normalization rules
    let normalizedItem = { ...item };
    for (const rule of config.normalizationRules) {
      normalizedItem = this.applyNormalizationRule(normalizedItem, rule);
    }

    // Extract values based on common patterns
    const value = this.extractValue(normalizedItem, config);
    if (value === null || value === undefined) return null;

    return {
      id: `${sourceId}-${index}-${Date.now()}`,
      category: this.extractCategory(normalizedItem, config),
      year: this.extractYear(normalizedItem, config),
      indicator: this.extractIndicator(normalizedItem, config),
      value,
      source: config.sourceName,
      unit: this.extractUnit(config),
      confidence: this.calculateConfidence(normalizedItem, config),
      timestamp: originalResponse.lastModified || new Date().toISOString(),
      notes: this.extractNotes(normalizedItem),
      flags: this.extractFlags(normalizedItem)
    };
  }

  /**
   * Normalize object data structure
   */
  private normalizeObject(
    data: any,
    config: NormalizationConfig,
    sourceId: string,
    originalResponse: ExternalDataResponse
  ): NormalizedDataPoint[] {
    const normalizedData: NormalizedDataPoint[] = [];

    // Handle key-value pairs
    for (const [key, value] of Object.entries(data)) {
      const item = { [key]: value };
      const normalized = this.normalizeItem(item, config, sourceId, 
        normalizedData.length, originalResponse);
      if (normalized) {
        normalizedData.push(normalized);
      }
    }

    return normalizedData;
  }

  /**
   * Normalize a simple value
   */
  private normalizeValue(
    value: any,
    config: NormalizationConfig,
    sourceId: string,
    originalResponse: ExternalDataResponse
  ): NormalizedDataPoint {
    return {
      id: `${sourceId}-${Date.now()}`,
      category: 'General',
      year: new Date().getFullYear(),
      indicator: 'Value',
      value: this.formatValue(value, config),
      source: config.sourceName,
      unit: this.extractUnit(config),
      confidence: 0.5, // Lower confidence for simple values
      timestamp: originalResponse.lastModified || new Date().toISOString()
    };
  }

  /**
   * Apply a normalization rule to an item
   */
  private applyNormalizationRule(item: any, rule: NormalizationRule): any {
    switch (rule.operation) {
      case 'rename':
        if (item.hasOwnProperty(rule.field) && rule.target) {
          item[rule.target] = item[rule.field];
          delete item[rule.field];
        }
        break;
      case 'transform':
        if (item.hasOwnProperty(rule.field) && rule.formula) {
          item[rule.field] = rule.formula(item[rule.field]);
        }
        break;
      case 'calculate':
        // For calculation rules, we would need more context
        break;
      case 'filter':
        // For filtering, we would need to return null if condition is met
        break;
    }
    return item;
  }

  /**
   * Extract a value from normalized item based on configuration
   */
  private extractValue(item: any, config: NormalizationConfig): number | string | null {
    const possibleValueFields = [
      'value', 'amount', 'monto', 'importe', 'cantidad', 'count', 
      'total', 'valor', 'sum', 'average', 'score', 'index'
    ];

    for (const field of possibleValueFields) {
      if (item.hasOwnProperty(field)) {
        const rawValue = item[field];
        return this.formatValue(rawValue, config);
      }
    }

    // If no standard field found, try to extract from any field that contains a number
    for (const [key, value] of Object.entries(item)) {
      if (typeof value === 'string' && this.isNumeric(value)) {
        return parseFloat(value);
      }
      if (typeof value === 'number') {
        return value;
      }
    }

    return null;
  }

  /**
   * Extract category from item or config
   */
  private extractCategory(item: any, config: NormalizationConfig): string {
    const possibleCategoryFields = [
      'category', 'type', 'section', 'area', 'materia'
    ];

    for (const field of possibleCategoryFields) {
      if (item.hasOwnProperty(field)) {
        return String(item[field]);
      }
    }

    // Default based on source type
    switch (config.sourceType) {
      case 'municipal': return 'Municipal';
      case 'provincial': return 'Provincial';
      case 'national': return 'Nacional';
      case 'civil_society': return 'Organización Civil';
      default: return 'General';
    }
  }

  /**
   * Extract year from item or use current year
   */
  private extractYear(item: any, config: NormalizationConfig): number {
    const possibleYearFields = [
      'year', 'anio', 'año', 'period', 'ejercicio'
    ];

    for (const field of possibleYearFields) {
      if (item.hasOwnProperty(field)) {
        const yearValue = item[field];
        const year = parseInt(yearValue);
        if (!isNaN(year) && year > 1900 && year < 2100) {
          return year;
        }
      }
    }

    return new Date().getFullYear();
  }

  /**
   * Extract indicator name from item
   */
  private extractIndicator(item: any, config: NormalizationConfig): string {
    const possibleIndicatorFields = [
      'indicator', 'title', 'name', 'concepto', 'concept'
    ];

    for (const field of possibleIndicatorFields) {
      if (item.hasOwnProperty(field)) {
        return String(item[field]);
      }
    }

    // If no specific indicator, use a generic one based on source
    return `${config.sourceName} Data`;
  }

  /**
   * Format value according to configuration
   */
  private formatValue(value: any, config: NormalizationConfig): number | string {
    switch (config.valueFormat) {
      case 'currency':
        // Handle currency formatting
        if (typeof value === 'string') {
          // Remove currency symbols and formatting
          const cleaned = value.replace(/[^\d.-]/g, '');
          return parseFloat(cleaned) || 0;
        }
        return typeof value === 'number' ? value : parseFloat(String(value)) || 0;
      case 'percentage':
        // Handle percentage formatting
        if (typeof value === 'string' && value.includes('%')) {
          return parseFloat(value.replace('%', '')) || 0;
        }
        return typeof value === 'number' ? value : parseFloat(String(value)) || 0;
      case 'count':
      case 'amount':
        // Handle numeric values
        return typeof value === 'number' ? value : parseFloat(String(value)) || 0;
      default:
        // Return as is for other types
        return value;
    }
  }

  /**
   * Extract unit based on configuration
   */
  private extractUnit(config: NormalizationConfig): string {
    switch (config.valueFormat) {
      case 'currency':
        return config.currency || 'ARS';
      case 'percentage':
        return '%';
      case 'count':
        return 'count';
      case 'amount':
        return 'amount';
      default:
        return '';
    }
  }

  /**
   * Calculate confidence score based on data completeness
   */
  private calculateConfidence(item: any, config: NormalizationConfig): number {
    const requiredFields = ['value', 'indicator', 'year', 'category'];
    const presentFields = requiredFields.filter(field => 
      item.hasOwnProperty(field) && item[field] !== null && item[field] !== undefined
    );

    const completenessScore = presentFields.length / requiredFields.length;
    const sourceTypeWeight = config.sourceType === 'municipal' ? 1.0 : 
                             config.sourceType === 'provincial' ? 0.9 : 
                             config.sourceType === 'national' ? 0.85 : 0.75;

    return Math.min(1.0, completenessScore * sourceTypeWeight);
  }

  /**
   * Extract notes from item
   */
  private extractNotes(item: any): string[] {
    const notes: string[] = [];
    
    if (item.notes) {
      notes.push(String(item.notes));
    }
    
    if (item.description) {
      notes.push(String(item.description));
    }
    
    return notes;
  }

  /**
   * Extract flags from item
   */
  private extractFlags(item: any): string[] {
    const flags: string[] = [];
    
    if (item.flag) {
      flags.push(String(item.flag));
    }
    
    if (item.status) {
      flags.push(`status: ${item.status}`);
    }
    
    return flags;
  }

  /**
   * Check if a string represents a numeric value
   */
  private isNumeric(str: string): boolean {
    if (typeof str !== 'string') return false;
    return !isNaN(parseFloat(str)) && !isNaN(Number(str));
  }

  /**
   * Get default configuration for unknown sources
   */
  private getDefaultConfig(source: string): NormalizationConfig {
    return {
      sourceType: 'civil_society', // default to lowest priority
      sourceName: source,
      valueFormat: 'count',
      normalizationRules: [
        { 
          field: 'value', 
          operation: 'rename', 
          target: 'value' 
        }
      ]
    };
  }

  /**
   * Create a fallback data point when normalization fails
   */
  private createFallbackDataPoint(
    dataResponse: ExternalDataResponse,
    sourceId: string
  ): NormalizedDataPoint {
    return {
      id: `${sourceId}-fallback-${Date.now()}`,
      category: 'General',
      year: new Date().getFullYear(),
      indicator: 'Fallback Data',
      value: 'Normalization Failed',
      source: dataResponse.source || sourceId,
      unit: '',
      confidence: 0.1,
      timestamp: new Date().toISOString(),
      notes: ['Data normalization failed, using fallback structure'],
      flags: ['normalization-error']
    };
  }

  /**
   * Transform data for visualization purposes
   */
  public transformForVisualization(
    normalizedData: NormalizedDataPoint[],
    visualizationType: 'time-series' | 'comparison' | 'distribution' | 'hierarchical'
  ): any[] {
    switch (visualizationType) {
      case 'time-series':
        return this.transformToTimeSeries(normalizedData);
      case 'comparison':
        return this.transformToComparison(normalizedData);
      case 'distribution':
        return this.transformToDistribution(normalizedData);
      case 'hierarchical':
        return this.transformToHierarchical(normalizedData);
      default:
        return normalizedData;
    }
  }

  /**
   * Transform data to time series format
   */
  private transformToTimeSeries(data: NormalizedDataPoint[]): any[] {
    const groupedByYear = data.reduce((acc, point) => {
      const year = point.year;
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(point);
      return acc;
    }, {} as Record<number, NormalizedDataPoint[]>);

    return Object.entries(groupedByYear).map(([year, points]) => ({
      year: parseInt(year),
      values: points.map(p => ({
        indicator: p.indicator,
        value: p.value,
        source: p.source,
        confidence: p.confidence
      }))
    }));
  }

  /**
   * Transform data to comparison format
   */
  private transformToComparison(data: NormalizedDataPoint[]): any[] {
    // Group by indicator to compare across sources
    const groupedByIndicator = data.reduce((acc, point) => {
      const indicator = point.indicator;
      if (!acc[indicator]) {
        acc[indicator] = [];
      }
      acc[indicator].push(point);
      return acc;
    }, {} as Record<string, NormalizedDataPoint[]>);

    return Object.entries(groupedByIndicator).map(([indicator, points]) => ({
      indicator,
      values: points.map(p => ({
        source: p.source,
        value: p.value,
        year: p.year,
        confidence: p.confidence
      }))
    }));
  }

  /**
   * Transform data to distribution format
   */
  private transformToDistribution(data: NormalizedDataPoint[]): any[] {
    // Group by category to show distribution
    const groupedByCategory = data.reduce((acc, point) => {
      const category = point.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(point);
      return acc;
    }, {} as Record<string, NormalizedDataPoint[]>);

    return Object.entries(groupedByCategory).map(([category, points]) => ({
      category,
      count: points.length,
      values: points.map(p => ({ value: p.value, source: p.source, year: p.year }))
    }));
  }

  /**
   * Transform data to hierarchical format
   */
  private transformToHierarchical(data: NormalizedDataPoint[]): any[] {
    const hierarchy: any = {
      name: 'Carmen de Areco Transparency Data',
      children: []
    };

    // Group by category first, then by year within each category
    const groupedByCategory = data.reduce((acc, point) => {
      const category = point.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(point);
      return acc;
    }, {} as Record<string, NormalizedDataPoint[]>);

    for (const [category, points] of Object.entries(groupedByCategory)) {
      const categoryNode: any = {
        name: category,
        children: []
      };

      const groupedByYear = points.reduce((acc, point) => {
        const year = point.year;
        if (!acc[year]) {
          acc[year] = [];
        }
        acc[year].push(point);
        return acc;
      }, {} as Record<number, NormalizedDataPoint[]>);

      for (const [year, yearPoints] of Object.entries(groupedByYear)) {
        const yearNode: any = {
          name: `Año ${year}`,
          children: yearPoints.map(p => ({
            name: p.indicator,
            value: typeof p.value === 'number' ? p.value : 1,
            source: p.source,
            confidence: p.confidence
          }))
        };
        categoryNode.children.push(yearNode);
      }

      hierarchy.children.push(categoryNode);
    }

    return [hierarchy];
  }

  /**
   * Calculate data quality metrics
   */
  public calculateQualityMetrics(data: NormalizedDataPoint[]): DataQualityMetrics {
    if (data.length === 0) {
      return {
        completeness: 0,
        accuracy: 0,
        consistency: 0,
        timeliness: 0,
        validity: 0,
        totalScore: 0
      };
    }

    // Completeness: percentage of data points with all required fields
    const completeness = data.filter(p => 
      p.value !== undefined && p.value !== null && 
      p.indicator && p.category
    ).length / data.length;

    // Accuracy: average confidence score
    const accuracy = data.reduce((sum, p) => sum + p.confidence, 0) / data.length;

    // Consistency: measure of how uniform the data format is
    const valueTypes = data.reduce((acc, p) => {
      const type = typeof p.value;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const consistency = Math.max(...Object.values(valueTypes)) / data.length;

    // Timeliness: based on timestamp
    const now = Date.now();
    const avgAge = data.reduce((sum, p) => {
      const age = now - new Date(p.timestamp).getTime();
      return sum + age;
    }, 0) / data.length;

    // Convert age to timeliness score (newer is better)
    const timeliness = Math.max(0, Math.min(1, 1 - (avgAge / (365 * 24 * 60 * 60 * 1000)))); // 1 year max

    // Validity: percentage of data points with valid values
    const validity = data.filter(p => 
      (typeof p.value === 'number' && !isNaN(p.value)) || 
      (typeof p.value === 'string' && p.value.length > 0)
    ).length / data.length;

    const totalScore = (completeness + accuracy + consistency + timeliness + validity) / 5;

    return {
      completeness,
      accuracy,
      consistency,
      timeliness,
      validity,
      totalScore
    };
  }

  /**
   * Get available normalization configurations
   */
  public getAvailableConfigs(): string[] {
    return Array.from(this.normalizationConfigs.keys());
  }

  /**
   * Add a custom normalization configuration
   */
  public addNormalizationConfig(id: string, config: NormalizationConfig): void {
    this.normalizationConfigs.set(id, config);
  }
}

const dataNormalizationService = DataNormalizationService.getInstance();

export { DataNormalizationService };
export { dataNormalizationService };
export default dataNormalizationService;