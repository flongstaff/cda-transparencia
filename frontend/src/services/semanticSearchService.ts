/**
 * Semantic Search Service for Carmen de Areco Transparency Portal
 * Frontend interface for NLP-powered search capabilities
 * Follows AAIP guidelines for transparency and data protection
 */

import { buildApiUrl } from '../config/apiConfig';

interface SearchOptions {
  size?: number;
  from?: number;
  filters?: {
    year?: number;
    category?: string;
    type?: string;
  };
}

interface SearchResult {
  id: string;
  title: string;
  content: string;
  category: string;
  year: number;
  date: string;
  source: string;
  url: string;
  type: string;
  tags: string[];
  score: number;
  highlight?: any;
  searchMethod: string;
  processingTime: number;
}

interface SearchResponse {
  results: SearchResult[];
  total: number;
  took: number;
  aiUsage: {
    method: string;
    model: string;
    vectorDimensions: number;
    explained: boolean;
  };
}

export class SemanticSearchService {
  private static instance: SemanticSearchService;
  private readonly SEARCH_ENDPOINT = '/search/semantic';

  static getInstance(): SemanticSearchService {
    if (!SemanticSearchService.instance) {
      SemanticSearchService.instance = new SemanticSearchService();
    }
    return SemanticSearchService.instance;
  }

  /**
   * Perform semantic search with transparency indicators
   */
  async semanticSearch(query: string, options: SearchOptions = {}): Promise<SearchResponse> {
    try {
      const response = await fetch(buildApiUrl(`${this.SEARCH_ENDPOINT}`), {
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
        throw new Error(`Search request failed: ${response.status} ${response.statusText}`);
      }

      const data: SearchResponse = await response.json();
      
      // Add transparency information to results
      return {
        ...data,
        results: data.results.map(result => ({
          ...result,
          // Ensure transparency about AI usage
          aiProcessed: true,
          aiMethod: data.aiUsage.method,
          aiModel: data.aiUsage.model
        }))
      };
    } catch (error) {
      console.error('Semantic search error:', error);
      throw error;
    }
  }

  /**
   * Get search suggestions based on query
   */
  async getSuggestions(query: string): Promise<string[]> {
    try {
      const response = await fetch(buildApiUrl(`/search/suggestions?q=${encodeURIComponent(query)}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Suggestions request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.suggestions || [];
    } catch (error) {
      console.error('Suggestions error:', error);
      return [];
    }
  }

  /**
   * Get search statistics for transparency reporting
   */
  async getSearchStats(): Promise<any> {
    try {
      const response = await fetch(buildApiUrl('/search/stats'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Stats request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Search stats error:', error);
      return {};
    }
  }

  /**
   * Format search results for display
   */
  formatResults(results: SearchResult[]): any[] {
    return results.map(result => ({
      ...result,
      // Format date for display
      formattedDate: new Date(result.date).toLocaleDateString('es-AR'),
      // Process highlights if available
      highlightedContent: result.highlight?.content ? result.highlight.content.join(' ... ') : result.content.substring(0, 200) + '...',
      highlightedTitle: result.highlight?.title ? result.highlight.title[0] : result.title,
      // Add transparency indicators
      aiExplanation: this.getAIExplanation(result.searchMethod)
    }));
  }

  /**
   * Get explanation for AI processing method
   */
  private getAIExplanation(method: string): string {
    const explanations: Record<string, string> = {
      'hybrid-semantic-traditional': 'Esta búsqueda combina análisis semántico (entendimiento del significado) con búsqueda tradicional de palabras clave para ofrecer resultados más relevantes.',
      'semantic-only': 'Esta búsqueda utiliza análisis semántico para entender el significado detrás de las palabras y encontrar contenidos relevantes incluso si no contienen las mismas palabras exactas.',
      'traditional': 'Esta búsqueda utiliza métodos tradicionales de búsqueda de palabras clave.'
    };

    return explanations[method] || 'Este resultado fue procesado con técnicas avanzadas de búsqueda para mejorar la relevancia.';
  }
}

export const semanticSearchService = SemanticSearchService.getInstance();