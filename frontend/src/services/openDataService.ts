/**
 * Open Data Service
 * Service for retrieving and managing open data in compliance with AAIP standards
 */

import { buildApiUrl } from '../config/apiConfig';

// Define types for our data structures
export interface OpenDataCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  itemsCount: number;
  lastUpdated: string;
  updateFrequency: string;
  dataTypes: string[];
  datasets: OpenDataItem[];
}

export interface OpenDataItem {
  id: string;
  title: string;
  description: string;
  formats: string[];
  size: string;
  lastUpdated: string;
  accessibility: {
    compliant: boolean;
    standards: string[];
  };
}

export interface DataMetadata {
  title: string;
  description: string;
  publisher: {
    name: string;
    email: string;
    url: string;
  };
  issued: string;
  modified: string;
  identifier: string;
  theme: string;
  accessLevel: string;
  keyword: string[];
  landingPage: string;
  license: string;
  rights: string;
  spatial: string;
  temporal: string;
  distribution: DataDistribution[];
  contactPoint: ContactPoint;
  dataQuality: boolean;
  describedBy?: string;
  describedByType?: string;
  accrualPeriodicity: string;
  language: string[];
  accessibility: {
    compliant: boolean;
    standards: string[];
    evaluationMethod: string;
  };
}

export interface DataDistribution {
  title: string;
  description: string;
  downloadURL: string;
  mediaType: string;
  format: string;
  byteSize?: number;
  accessibilityCompliant: boolean;
}

export interface ContactPoint {
  fn: string;
  hasEmail: string;
  telephone: string;
}

export interface OpenDataResponse {
  categories: OpenDataCategory[];
  compliance: {
    aaipStandards: boolean;
    itaMethodology: boolean;
    wcagCompliance: string;
    updatePolicy: string;
    accessibilityPolicy: string;
  };
}

export interface MetadataResponse {
  schema: any; // The full JSON Schema
  compliance: {
    follows: string[];
    aaipAlignment: {
      transparencyIndex: boolean;
      publicationStandards: boolean;
      accessibilityGuidelines: boolean;
    };
  };
}

class OpenDataService {
  private static instance: OpenDataService;

  static getInstance(): OpenDataService {
    if (!OpenDataService.instance) {
      OpenDataService.instance = new OpenDataService();
    }
    return OpenDataService.instance;
  }

  /**
   * Fetch open data categories from the backend
   */
  async getOpenDataCategories(): Promise<OpenDataResponse> {
    try {
      const response = await fetch('/data/categories-structure.json');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching open data categories:', error);
      // In case of error, return a basic structure
      return {
        categories: [],
        compliance: {
          aaipStandards: true,
          itaMethodology: true,
          wcagCompliance: '2.1 AA',
          updatePolicy: 'Proactive publication following AAIP guidelines',
          accessibilityPolicy: 'All content meets WCAG 2.1 AA standards'
        }
      };
    }
  }

  /**
   * Fetch metadata schema from the backend
   */
  async getMetadataSchema(): Promise<MetadataResponse> {
    try {
      const response = await fetch('/data/metadata-standards.json');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching metadata schema:', error);
      // In case of error, return a basic schema
      return {
        schema: {},
        compliance: {
          follows: [],
          aaipAlignment: {
            transparencyIndex: true,
            publicationStandards: true,
            accessibilityGuidelines: true
          }
        }
      };
    }
  }

  /**
   * Fetch a specific dataset by ID
   */
  async getDatasetById(datasetId: string): Promise<OpenDataItem | null> {
    try {
      const dataResponse = await this.getOpenDataCategories();
      for (const category of dataResponse.categories) {
        const dataset = category.datasets.find(d => d.id === datasetId);
        if (dataset) {
          return dataset;
        }
      }
      return null;
    } catch (error) {
      console.error('Error fetching dataset:', error);
      return null;
    }
  }

  /**
   * Search datasets by query
   */
  async searchDatasets(query: string): Promise<OpenDataItem[]> {
    try {
      const dataResponse = await this.getOpenDataCategories();
      const results: OpenDataItem[] = [];

      for (const category of dataResponse.categories) {
        for (const dataset of category.datasets) {
          if (
            dataset.title.toLowerCase().includes(query.toLowerCase()) ||
            dataset.description.toLowerCase().includes(query.toLowerCase())
          ) {
            results.push(dataset);
          }
        }
      }

      return results;
    } catch (error) {
      console.error('Error searching datasets:', error);
      return [];
    }
  }

  /**
   * Get datasets by category
   */
  async getDatasetsByCategory(categoryId: string): Promise<OpenDataItem[]> {
    try {
      const dataResponse = await this.getOpenDataCategories();
      const category = dataResponse.categories.find(c => c.id === categoryId);
      return category ? category.datasets : [];
    } catch (error) {
      console.error('Error fetching datasets by category:', error);
      return [];
    }
  }

  /**
   * Get all available formats across all datasets
   */
  async getAvailableFormats(): Promise<string[]> {
    try {
      const dataResponse = await this.getOpenDataCategories();
      const formats = new Set<string>();

      for (const category of dataResponse.categories) {
        for (const dataset of category.datasets) {
          for (const format of dataset.formats) {
            formats.add(format);
          }
        }
      }

      return Array.from(formats);
    } catch (error) {
      console.error('Error fetching available formats:', error);
      return [];
    }
  }

  /**
   * Validate metadata against AAIP standards
   */
  validateMetadata(metadata: any): { valid: boolean; errors: string[] } {
    try {
      // This is a simplified validation - in a real implementation, 
      // we would use a proper JSON Schema validator
      const errors: string[] = [];

      // Required fields according to our schema
      if (!metadata.title) errors.push('Title is required');
      if (!metadata.description) errors.push('Description is required');
      if (!metadata.publisher) errors.push('Publisher information is required');
      if (!metadata.issued) errors.push('Issued date is required');
      if (!metadata.modified) errors.push('Modified date is required');
      if (!metadata.identifier) errors.push('Identifier is required');
      if (!metadata.theme) errors.push('Theme is required');
      if (!metadata.accessLevel) errors.push('Access level is required');

      return {
        valid: errors.length === 0,
        errors
      };
    } catch (error) {
      console.error('Error validating metadata:', error);
      return {
        valid: false,
        errors: ['Error validating metadata']
      };
    }
  }

  /**
   * Get accessibility compliance information
   */
  async getAccessibilityStandards(): Promise<any> {
    try {
      const response = await fetch('/data/accessibility-standards.json');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching accessibility standards:', error);
      return {};
    }
  }
}

export const openDataService = OpenDataService.getInstance();