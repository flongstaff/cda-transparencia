/**
 * External Data Service
 * Service to fetch data from external APIs and government data sources
 */

// Type definitions for external data
export interface ExternalBudgetData {
  year: number;
  totalBudget: number;
  totalExecuted: number;
  executionPercentage: number;
  categories: Array<{
    name: string;
    budgeted: number;
    executed: number;
    percentage: number;
  }>;
}

export interface ExternalContractData {
  id: string;
  title: string;
  description: string;
  amount: number;
  startDate: string;
  endDate: string;
  status: string;
  contractor: string;
  url: string;
}

export interface ExternalGeographicData {
  municipality: string;
  province: string;
  population: number;
  area: number;
  coordinates: {
    lat: number;
    lon: number;
  };
}

export interface ExternalOfficialData {
  id: string;
  title: string;
  type: string;
  publicationDate: string;
  url: string;
  content: string;
}

class ExternalDataService {
  private cache: Map<string, any> = new Map();
  private cacheTimeout = 10 * 60 * 1000; // 10 minutes

  // External API endpoints
  private readonly API_ENDPOINTS = {
    datosArgentina: 'https://datos.gob.ar/api',
    presupuestoAbierto: 'https://www.presupuestoabierto.gob.ar/sici/api',
    georef: 'https://apis.datos.gob.ar/georef/api',
    municipalWebsite: 'https://carmendeareco.gob.ar'
  };

  /**
   * Fetch budget data from GitHub repository or external APIs
   */
  async getBudgetData(year: number): Promise<ExternalBudgetData | null> {
    try {
      const cacheKey = `budget_${year}`;
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      // Try to fetch from GitHub repository first
      try {
        const githubUrl = `https://raw.githubusercontent.com/flongstaff/cda-transparencia/main/data/organized_analysis/financial_oversight/budget_analysis/budget_data_${year}.json`;
        const response = await fetch(githubUrl);
        if (response.ok) {
          const githubData = await response.json();
          if (githubData && githubData.categories) {
            const budgetData: ExternalBudgetData = {
              year,
              totalBudget: githubData.totalBudget || 5000000000,
              totalExecuted: githubData.totalExecuted || 3750000000,
              executionPercentage: githubData.executionPercentage || 75,
              categories: githubData.categories
            };

            this.cache.set(cacheKey, {
              data: budgetData,
              timestamp: Date.now()
            });

            return budgetData;
          }
        }
      } catch (githubError) {
        console.warn(`GitHub API fetch failed for year ${year}:`, githubError);
      }

      // Fallback to mock data with realistic values based on Carmen de Areco's size
      const budgetData: ExternalBudgetData = {
        year,
        totalBudget: year >= 2024 ? 8000000000 : 5000000000, // Adjusted for inflation
        totalExecuted: year >= 2024 ? 6400000000 : 3750000000, // 80% execution rate
        executionPercentage: 80,
        categories: [
          {
            name: "Gastos Corrientes",
            budgeted: year >= 2024 ? 4800000000 : 3000000000,
            executed: year >= 2024 ? 3840000000 : 2250000000,
            percentage: 80
          },
          {
            name: "Gastos de Capital",
            budgeted: year >= 2024 ? 2000000000 : 1250000000,
            executed: year >= 2024 ? 1600000000 : 937500000,
            percentage: 80
          },
          {
            name: "Servicio de Deuda",
            budgeted: year >= 2024 ? 800000000 : 500000000,
            executed: year >= 2024 ? 640000000 : 375000000,
            percentage: 80
          },
          {
            name: "Transferencias",
            budgeted: year >= 2024 ? 400000000 : 250000000,
            executed: year >= 2024 ? 320000000 : 187500000,
            percentage: 80
          }
        ]
      };

      this.cache.set(cacheKey, {
        data: budgetData,
        timestamp: Date.now()
      });

      return budgetData;
    } catch (error) {
      console.error(`Error fetching budget data for year ${year}:`, error);
      return null;
    }
  }

  /**
   * Fetch contract data from GitHub repository or official sources
   */
  async getContractData(): Promise<ExternalContractData[] | null> {
    try {
      const cacheKey = 'contracts';
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      // Try to fetch from GitHub repository first
      try {
        const githubUrl = `${this.endpoints.github}/data/organized_analysis/procurement_monitoring/contracts_data.json`;
        const response = await fetch(githubUrl);
        if (response.ok) {
          const githubData = await response.json();
          if (githubData && Array.isArray(githubData.contracts)) {
            const contractData: ExternalContractData[] = githubData.contracts.map((contract: any) => ({
              id: contract.id || `contract-${Date.now()}`,
              title: contract.title || contract.name,
              description: contract.description || contract.objeto,
              amount: contract.amount || contract.monto_adjudicado,
              startDate: contract.startDate || contract.fecha_inicio,
              endDate: contract.endDate || contract.fecha_fin,
              status: contract.status || contract.estado,
              contractor: contract.contractor || contract.proveedor,
              url: contract.url || `https://carmendeareco.gob.ar/contrataciones/${contract.id}`
            }));

            this.cache.set(cacheKey, {
              data: contractData,
              timestamp: Date.now()
            });

            return contractData;
          }
        }
      } catch (githubError) {
        console.warn('GitHub contract data fetch failed:', githubError);
      }

      // Fallback to mock data with realistic municipal contracts
      const contractData: ExternalContractData[] = [
        {
          id: "contract-001",
          title: "Construcción de nuevas veredas",
          description: "Contratación para la construcción de veredas en distintos barrios",
          amount: 15000000, // 15 million ARS
          startDate: "2024-03-01",
          endDate: "2024-12-31",
          status: "en ejecución",
          contractor: "Constructora XYZ S.A.",
          url: "https://carmendeareco.gob.ar/contrataciones/contrato-001"
        },
        {
          id: "contract-002",
          title: "Mantenimiento de espacios verdes",
          description: "Servicio de mantenimiento de plazas y parques municipales",
          amount: 8000000, // 8 million ARS
          startDate: "2024-01-15",
          endDate: "2024-12-15",
          status: "en ejecución",
          contractor: "Servicios Verdes S.R.L.",
          url: "https://carmendeareco.gob.ar/contrataciones/contrato-002"
        }
      ];

      this.cache.set(cacheKey, {
        data: contractData,
        timestamp: Date.now()
      });

      return contractData;
    } catch (error) {
      console.error("Error fetching contract data:", error);
      return null;
    }
  }

  /**
   * Fetch geographic data for Carmen de Areco
   */
  async getGeographicData(): Promise<ExternalGeographicData | null> {
    try {
      const cacheKey = 'geographic';
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      // In a real implementation, we would fetch from Georef API
      // For now, we'll return mock data
      const geoData: ExternalGeographicData = {
        municipality: "Carmen de Areco",
        province: "Buenos Aires",
        population: 15000, // Approximate
        area: 420, // Square kilometers
        coordinates: {
          lat: -34.2167,
          lon: -59.7167
        }
      };

      this.cache.set(cacheKey, {
        data: geoData,
        timestamp: Date.now()
      });

      return geoData;
    } catch (error) {
      console.error("Error fetching geographic data:", error);
      return null;
    }
  }

  /**
   * Fetch official documents from municipal website
   */
  async getOfficialDocuments(): Promise<ExternalOfficialData[] | null> {
    try {
      const cacheKey = 'official_documents';
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      // In a real implementation, we would scrape the municipal website
      // For now, we'll return mock data
      const officialData: ExternalOfficialData[] = [
        {
          id: "ordinance-3200-24",
          title: "Ordenanza 3200/24 - Presupuesto 2024",
          type: "ordinance",
          publicationDate: "2024-01-01",
          url: "https://carmendeareco.gob.ar/ordenanzas/3200-24",
          content: "Texto completo de la ordenanza de presupuesto para el año 2024"
        },
        {
          id: "resolution-466-2024",
          title: "Resolución 466/2024 - Ministerio de Justicia",
          type: "resolution",
          publicationDate: "2024-02-15",
          url: "https://carmendeareco.gob.ar/resoluciones/466-2024",
          content: "Resolución del Ministerio de Justicia y Derechos Humanos"
        }
      ];

      this.cache.set(cacheKey, {
        data: officialData,
        timestamp: Date.now()
      });

      return officialData;
    } catch (error) {
      console.error("Error fetching official documents:", error);
      return null;
    }
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const externalDataService = new ExternalDataService();
export default externalDataService;