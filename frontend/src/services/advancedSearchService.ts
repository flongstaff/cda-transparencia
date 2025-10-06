/**
 * Advanced Search Service for Carmen de Areco Transparency Portal
 * Frontend interface for enhanced search capabilities including faceted filtering,
 * advanced search options, and document clustering
 * Follows AAIP guidelines for transparency and data protection
 */

import { buildApiUrl } from '../config/apiConfig';
import { SearchResponse, SearchResult } from './semanticSearchService';

interface AdvancedSearchOptions {
  filters?: {
    category?: string;
    year?: number;
    type?: string;
    source?: string;
    tags?: string[];
  };
  aggregations?: {
    categories?: boolean;
    years?: boolean;
  };
  sortBy?: 'relevance' | 'date' | 'title';
  sortOrder?: 'asc' | 'desc';
  size?: number;
  from?: number;
  highlight?: boolean;
  explain?: boolean;
}

interface FacetFilters {
  facets: {
    categories: Record<string, number>;
    years: Record<string, number>;
    sources: Record<string, number>;
    types: Record<string, number>;
    tags: Record<string, number>;
  };
  totalDocuments: number;
}

interface DocumentCluster {
  id: string;
  name: string;
  documents: any[];
  size: number;
}

interface ClusteringResult {
  clusters: DocumentCluster[];
  clusteredDocuments: any[];
  totalClusters: number;
}

export class AdvancedSearchService {
  private static instance: AdvancedSearchService;
  private readonly ADVANCED_SEARCH_ENDPOINT = '/search/advanced';
  private readonly FACETS_ENDPOINT = '/search/facets';
  private readonly CLUSTERING_ENDPOINT = '/search/clusters';
  private readonly CLUSTER_DOCUMENTS_ENDPOINT = '/search/cluster-documents';

  static getInstance(): AdvancedSearchService {
    if (!AdvancedSearchService.instance) {
      AdvancedSearchService.instance = new AdvancedSearchService();
    }
    return AdvancedSearchService.instance;
  }

  /**
   * Perform advanced search with multiple filters and options
   */
  async advancedSearch(query: string, options: AdvancedSearchOptions = {}): Promise<SearchResponse> {
    try {
      const response = await fetch(buildApiUrl(`${this.ADVANCED_SEARCH_ENDPOINT}`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          options
        })
      });

      if (!response.ok) {
        throw new Error(`Advanced search request failed: ${response.status} ${response.statusText}`);
      }

      const data: SearchResponse = await response.json();
      
      // Add transparency information to results
      return {
        ...data,
        results: data.results.map(result => ({
          ...result,
          // Ensure transparency about AI usage
          aiProcessed: true,
          aiMethod: data.aiUsage?.method || 'advanced search with filters',
          aiModel: data.aiUsage?.model
        }))
      };
    } catch (error) {
      console.error('Advanced search error:', error);
      throw error;
    }
  }

  /**
   * Get faceted filtering options
   */
  async getFacetFilters(query = '', category?: string, year?: number, type?: string, source?: string): Promise<FacetFilters> {
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (category) params.append('category', category);
      if (year) params.append('year', year.toString());
      if (type) params.append('type', type);
      if (source) params.append('source', source);

      const response = await fetch(buildApiUrl(`${this.FACETS_ENDPOINT}?${params.toString()}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Facet filters request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Facet filters error:', error);
      throw error;
    }
  }

  /**
   * Get document clusters for search results
   */
  async getDocumentClusters(query?: string, filters = {}): Promise<ClusteringResult> {
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      
      // Add filters to query string if they exist
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(`filters[${key}]`, value.toString());
        }
      });

      const response = await fetch(buildApiUrl(`${this.CLUSTERING_ENDPOINT}?${params.toString()}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Document clustering request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Document clustering error:', error);
      throw error;
    }
  }

  /**
   * Cluster specific documents
   */
  async clusterDocuments(documents: any[], maxClusters = 5): Promise<ClusteringResult> {
    try {
      const response = await fetch(buildApiUrl(`${this.CLUSTER_DOCUMENTS_ENDPOINT}`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documents,
          maxClusters
        })
      });

      if (!response.ok) {
        throw new Error(`Document clustering request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Document clustering error:', error);
      throw error;
    }
  }

  /**
   * Format faceted filter data for display
   */
  formatFacetFilters(facetFilters: FacetFilters): any {
    const { facets } = facetFilters;
    
    // Convert facet objects to arrays with counts
    const formattedFacets = {
      categories: Object.entries(facets.categories)
        .map(([category, count]) => ({ id: category, label: category, count }))
        .sort((a, b) => b.count - a.count),
      years: Object.entries(facets.years)
        .map(([year, count]) => ({ id: year, label: year, count }))
        .sort((a, b) => parseInt(b.id) - parseInt(a.id)), // Sort years descending
      sources: Object.entries(facets.sources)
        .map(([source, count]) => ({ id: source, label: source, count }))
        .sort((a, b) => b.count - a.count),
      types: Object.entries(facets.types)
        .map(([type, count]) => ({ id: type, label: this.getTypeDisplay(type), count }))
        .sort((a, b) => b.count - a.count),
      tags: Object.entries(facets.tags)
        .map(([tag, count]) => ({ id: tag, label: tag, count }))
        .sort((a, b) => b.count - a.count)
    };

    return {
      ...facetFilters,
      formattedFacets
    };
  }

  /**
   * Get display text for document types
   */
  private getTypeDisplay(type: string): string {
    const typeMap: Record<string, string> = {
      'pdf': 'PDF',
      'document': 'Documento',
      'spreadsheet': 'Hoja de cálculo',
      'csv': 'CSV',
      'json': 'JSON',
      'xml': 'XML',
      'webpage': 'Página web',
      'contract': 'Contrato',
      'budget': 'Presupuesto',
      'expense': 'Gasto',
      'ordinance': 'Ordenanza',
      'decree': 'Decreto',
      'default': type
    };

    return typeMap[type] || typeMap['default'];
  }

  /**
   * Format clusters for display
   */
  formatClusters(clusters: ClusteringResult): any {
    return {
      ...clusters,
      clusters: clusters.clusters.map(cluster => ({
        ...cluster,
        documents: cluster.documents.map(doc => ({
          ...doc,
          formattedDate: new Date(doc.lastModified || doc.indexedAt).toLocaleDateString('es-AR'),
          highlightedContent: doc.content ? doc.content.substring(0, 200) + '...' : '',
          highlightedTitle: doc.title || 'Documento sin título'
        }))
      }))
    };
  }
}

export const advancedSearchService = AdvancedSearchService.getInstance();