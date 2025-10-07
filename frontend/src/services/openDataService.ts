/**
 * Open Data Service for Carmen de Areco Transparency Portal
 * Provides access to open data catalog and datasets with AAIP compliance
 * Implements accessibility features and data protection measures
 */

import { buildApiUrl } from '../config/apiConfig';

interface DataCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  itemsCount: number;
  lastUpdated: string;
  updateFrequency: string;
  dataTypes: string[];
  datasets: Dataset[];
}

interface Dataset {
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
  metadata: {
    publisher: string;
    issued: string;
    modified: string;
    theme: string;
    accessLevel: string;
    keyword: string[];
    landingPage: string;
    license: string;
    rights: string;
  };
}

interface OpenDataResponse {
  categories: DataCategory[];
  metadata: {
    lastUpdated: string;
    version: string;
    totalCategories: number;
    totalDatasets: number;
  };
  compliance: {
    aaipGuidelines: boolean;
    itaMethodology: boolean;
    wcagCompliance: string;
    dataProtection: boolean;
  };
}

interface DatasetResponse {
  dataset: Dataset;
  metadata: {
    lastUpdated: string;
    version: string;
    category: string;
    categoryId: string;
  };
  compliance: {
    aaipGuidelines: boolean;
    itaMethodology: boolean;
    wcagCompliance: string;
    dataProtection: boolean;
  };
}

interface SearchResponse {
  results: {
    category: string;
    categoryId: string;
    datasets: Dataset[];
  }[];
  metadata: {
    lastUpdated: string;
    version: string;
    query: string;
    totalResults: number;
  };
  compliance: {
    aaipGuidelines: boolean;
    itaMethodology: boolean;
    wcagCompliance: string;
    dataProtection: boolean;
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
   * Get all open data categories
   */
  async getCategories(): Promise<OpenDataResponse> {
    try {
      const response = await fetch(buildApiUrl('/open-data/catalog'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Categories request failed: ${response.status} ${response.statusText}`);
      }

      const data: OpenDataResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Open data categories error:', error);
      throw error;
    }
  }

  /**
   * Get a specific category by ID
   */
  async getCategoryById(categoryId: string): Promise<DataCategory> {
    try {
      const response = await fetch(buildApiUrl(`/open-data/catalog/${categoryId}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Category request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.category;
    } catch (error) {
      console.error(`Open data category error for ${categoryId}:`, error);
      throw error;
    }
  }

  /**
   * Get datasets for a specific category
   */
  async getDatasetsByCategory(categoryId: string): Promise<Dataset[]> {
    try {
      const response = await fetch(buildApiUrl(`/open-data/catalog/${categoryId}/datasets`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Datasets request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.datasets;
    } catch (error) {
      console.error(`Open data datasets error for ${categoryId}:`, error);
      throw error;
    }
  }

  /**
   * Get a specific dataset by ID
   */
  async getDatasetById(datasetId: string): Promise<DatasetResponse> {
    try {
      const response = await fetch(buildApiUrl(`/open-data/dataset/${datasetId}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Dataset request failed: ${response.status} ${response.statusText}`);
      }

      const data: DatasetResponse = await response.json();
      return data;
    } catch (error) {
      console.error(`Dataset error for ${datasetId}:`, error);
      throw error;
    }
  }

  /**
   * Search datasets by query
   */
  async searchDatasets(query: string): Promise<SearchResponse> {
    try {
      const response = await fetch(buildApiUrl(`/open-data/search?q=${encodeURIComponent(query)}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Search request failed: ${response.status} ${response.statusText}`);
      }

      const data: SearchResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  /**
   * Get metadata standards
   */
  async getMetadataStandards(): Promise<any> {
    try {
      const response = await fetch(buildApiUrl('/open-data/metadata-standards'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Metadata standards request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Metadata standards error:', error);
      throw error;
    }
  }

  /**
   * Get accessibility standards
   */
  async getAccessibilityStandards(): Promise<any> {
    try {
      const response = await fetch(buildApiUrl('/open-data/accessibility-standards'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Accessibility standards request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Accessibility standards error:', error);
      throw error;
    }
  }

  /**
   * Get compliance status
   */
  async getComplianceStatus(): Promise<any> {
    try {
      const response = await fetch(buildApiUrl('/open-data/compliance'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Compliance status request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Compliance status error:', error);
      throw error;
    }
  }

  /**
   * Get open data statistics
   */
  async getOpenDataStatistics(): Promise<any> {
    try {
      const response = await fetch(buildApiUrl('/open-data/statistics'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Open data statistics request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Open data statistics error:', error);
      throw error;
    }
  }

  /**
   * Get recent updates
   */
  async getRecentUpdates(limit: number = 10): Promise<any> {
    try {
      const response = await fetch(buildApiUrl(`/open-data/recent-updates?limit=${limit}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Recent updates request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Recent updates error:', error);
      throw error;
    }
  }

  /**
   * Validate dataset metadata
   */
  async validateDatasetMetadata(dataset: any): Promise<any> {
    try {
      const response = await fetch(buildApiUrl('/open-data/validate-metadata'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dataset })
      });

      if (!response.ok) {
        throw new Error(`Metadata validation request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Metadata validation error:', error);
      throw error;
    }
  }

  /**
   * Generate dataset citation
   */
  async generateDatasetCitation(datasetId: string): Promise<any> {
    try {
      const response = await fetch(buildApiUrl(`/open-data/dataset/${datasetId}/citation`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Dataset citation request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Dataset citation error for ${datasetId}:`, error);
      throw error;
    }
  }

  /**
   * Get dataset quality report
   */
  async getDatasetQualityReport(datasetId: string): Promise<any> {
    try {
      const response = await fetch(buildApiUrl(`/open-data/dataset/${datasetId}/quality-report`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Dataset quality report request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Dataset quality report error for ${datasetId}:`, error);
      throw error;
    }
  }

  /**
   * Health check for open data service
   */
  async healthCheck(): Promise<any> {
    try {
      const response = await fetch(buildApiUrl('/open-data/health'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Health check request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Open data health check error:', error);
      throw error;
    }
  }
}

export const openDataService = OpenDataService.getInstance();
export default OpenDataService;