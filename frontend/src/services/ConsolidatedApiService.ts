/**
 * ConsolidatedApiService - Works with our consolidated backend APIs
 * Uses only the endpoints that actually exist and work with real data
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface BudgetData {
  total_budgeted: number;
  total_executed: number;
  execution_rate: string;
  categories: Record<string, {
    budgeted: number;
    executed: number;
    execution_rate: string;
  }>;
}

interface Document {
  id: string;
  title: string;
  filename: string;
  year: number;
  category: string;
  type: string;
  size_mb: string;
  url: string;
  official_url: string;
  verification_status: string;
  processing_date: string;
}

interface MunicipalData {
  year: number;
  documents: Document[];
  budget: BudgetData;
  summary: {
    total_documents: number;
    total_categories: number;
    total_size_mb: string;
    verified_documents: number;
    transparency_score: number;
  };
  categories: Record<string, Document[]>;
  total_documents: number;
  verified_documents: number;
}

class ConsolidatedApiService {
  private async fetchApi<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle different response formats
      if (data.success !== undefined) {
        if (data.success) {
          return data.data;
        } else {
          throw new Error(data.error || 'API request failed');
        }
      }
      
      // Handle direct data responses
      return data;
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Get available years
  async getAvailableYears(): Promise<number[]> {
    try {
      const response = await this.fetchApi<{ years: number[] }>('/years');
      return response.years;
    } catch (error) {
      console.error('Error getting available years:', error);
      // Return fallback years
      const currentYear = new Date().getFullYear();
      return [currentYear, currentYear - 1, currentYear - 2, currentYear - 3, currentYear - 4, currentYear - 5];
    }
  }

  // Get yearly data
  async getYearlyData(year: number): Promise<MunicipalData> {
    try {
      const data = await this.fetchApi<MunicipalData>(`/years/${year}`);
      return data;
    } catch (error) {
      console.error(`Error getting data for year ${year}:`, error);
      throw error;
    }
  }

  // Get documents with optional filters
  async getDocuments(year?: number, category?: string): Promise<Document[]> {
    try {
      let endpoint = '/documents';
      const params = new URLSearchParams();
      
      if (year) params.set('year', year.toString());
      if (category) params.set('category', category);
      
      if (params.toString()) {
        endpoint += `?${params.toString()}`;
      }
      
      const response = await this.fetchApi<{ documents: Document[] }>(endpoint);
      return response.documents;
    } catch (error) {
      console.error('Error getting documents:', error);
      return [];
    }
  }

  // Get budget data for a specific year
  async getBudgetData(year: number): Promise<BudgetData> {
    try {
      const data = await this.fetchApi<MunicipalData>(`/years/${year}`);
      return data.budget;
    } catch (error) {
      console.error(`Error getting budget data for year ${year}:`, error);
      // Return fallback data
      return {
        total_budgeted: 0,
        total_executed: 0,
        execution_rate: '0',
        categories: {}
      };
    }
  }

  // Get salary data
  async getSalaryData(year: number) {
    try {
      const data = await this.fetchApi<any>(`/salaries/${year}`);
      return data;
    } catch (error) {
      console.error(`Error getting salary data for year ${year}:`, error);
      return [];
    }
  }

  // Get contracts data
  async getPublicTenders(year: number) {
    try {
      const data = await this.fetchApi<any>(`/tenders/${year}`);
      return data;
    } catch (error) {
      console.error(`Error getting tenders data for year ${year}:`, error);
      return [];
    }
  }

  // Get property declarations
  async getPropertyDeclarations() {
    try {
      const data = await this.fetchApi<any>('/declarations');
      return data;
    } catch (error) {
      console.error('Error getting property declarations:', error);
      return [];
    }
  }

  // Get financial reports
  async getFinancialReports() {
    try {
      const data = await this.fetchApi<any>('/reports');
      return data;
    } catch (error) {
      console.error('Error getting financial reports:', error);
      return [];
    }
  }

  // Get treasury movements
  async getTreasuryMovements() {
    try {
      const data = await this.fetchApi<any>('/treasury');
      return data;
    } catch (error) {
      console.error('Error getting treasury movements:', error);
      return [];
    }
  }

  // System health check
  async getSystemHealth() {
    try {
      const data = await this.fetchApi<any>('/health');
      return data;
    } catch (error) {
      console.error('Error getting system health:', error);
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  // Transparency dashboard
  async getTransparencyDashboard() {
    try {
      const data = await this.fetchApi<any>('/transparency/dashboard');
      return data;
    } catch (error) {
      console.error('Error getting transparency dashboard:', error);
      return {};
    }
  }

  // Anti-corruption dashboard
  async getAntiCorruptionDashboard() {
    try {
      const data = await this.fetchApi<any>('/anti-corruption/dashboard');
      return data;
    } catch (error) {
      console.error('Error getting anti-corruption dashboard:', error);
      return {};
    }
  }

  // Document search
  async searchDocuments(query: string) {
    try {
      const data = await this.fetchApi<any>(`/documents/search/query?q=${encodeURIComponent(query)}`);
      return data;
    } catch (error) {
      console.error('Error searching documents:', error);
      return { results: [] };
    }
  }

  // Get municipal data (consolidated view)
  async getMunicipalData(year: number): Promise<MunicipalData> {
    return this.getYearlyData(year);
  }

  // Get salaries
  async getSalaries(year: number) {
    return this.getSalaryData(year);
  }

  // Get statistics
  async getStatistics() {
    try {
      const [health, documents] = await Promise.all([
        this.getSystemHealth(),
        this.getDocuments()
      ]);

      return {
        system: {
          status: health.status === 'success' ? 'operational' : 'degraded',
          services: health.services || {}
        },
        documents: {
          total: documents.length,
          status: documents.length > 0 ? 'available' : 'unavailable'
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return {
        system: { status: 'error', error: error.message },
        documents: { status: 'error', error: error.message },
        timestamp: new Date().toISOString()
      };
    }
  }

  // Get transparency score
  async getTransparencyScore(year: number) {
    try {
      const data = await this.getYearlyData(year);
      return {
        score: data.summary.transparency_score,
        overall: data.summary.transparency_score,
        execution: Math.round(parseFloat(data.budget.execution_rate) || 0)
      };
    } catch (error) {
      console.error(`Error getting transparency score for year ${year}:`, error);
      return {
        score: 0,
        overall: 0,
        execution: 0
      };
    }
  }
}

// Export singleton instance
export const consolidatedApiService = new ConsolidatedApiService();
export default consolidatedApiService;