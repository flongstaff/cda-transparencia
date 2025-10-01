/**
 * EXTERNAL APIS SERVICE
 *
 * Integrates with Carmen de Areco official sites and external data sources
 * Based on DATA_SOURCES.md comprehensive list of APIs and endpoints
 *
 * This service handles:
 * - Carmen de Areco official website data
 * - Buenos Aires Province transparency data
 * - National APIs (datos.gob.ar, presupuesto abierto, etc.)
 * - Municipal and regional data sources
 * - Civil society oversight organizations
 */

import { buildApiUrl } from '../config/apiConfig';

export interface ExternalDataResponse {
  success: boolean;
  data: any;
  source: string;
  lastModified?: string;
  error?: string;
  responseTime?: number;
}

export interface DataSource {
  name: string;
  url: string;
  type: 'api' | 'scraping' | 'rss';
  format: 'json' | 'xml' | 'html' | 'csv';
  enabled: boolean;
  priority: number;
  cacheMinutes: number;
}

class ExternalAPIsService {
  private static instance: ExternalAPIsService;
  private cache = new Map<string, { data: any; timestamp: number; source: string }>();
  private readonly USER_AGENT = 'Carmen-de-Areco-Transparency-Portal/1.0';

  // Data sources from DATA_SOURCES.md
  private dataSources: DataSource[] = [
    // Carmen de Areco Official Sources
    {
      name: 'Carmen de Areco Official Portal',
      url: 'https://carmendeareco.gob.ar',
      type: 'scraping',
      format: 'html',
      enabled: true,
      priority: 1,
      cacheMinutes: 60
    },
    {
      name: 'Carmen de Areco Transparency Portal',
      url: 'https://carmendeareco.gob.ar/transparencia',
      type: 'scraping',
      format: 'html',
      enabled: true,
      priority: 1,
      cacheMinutes: 30
    },
    {
      name: 'Carmen de Areco Official Bulletin',
      url: 'https://carmendeareco.gob.ar/gobierno/boletin-oficial/',
      type: 'scraping',
      format: 'html',
      enabled: true,
      priority: 2,
      cacheMinutes: 1440 // 24 hours
    },
    {
      name: 'Concejo Deliberante de Carmen de Areco',
      url: 'http://hcdcarmendeareco.blogspot.com/',
      type: 'scraping',
      format: 'html',
      enabled: true,
      priority: 3,
      cacheMinutes: 1440 // 24 hours
    },

    // National Level APIs
    {
      name: 'Datos Argentina',
      url: 'https://datos.gob.ar/api/3/',
      type: 'api',
      format: 'json',
      enabled: true,
      priority: 1,
      cacheMinutes: 60
    },
    {
      name: 'Presupuesto Abierto Nacional',
      url: 'https://www.presupuestoabierto.gob.ar/sici/api',
      type: 'api',
      format: 'json',
      enabled: true,
      priority: 2,
      cacheMinutes: 120
    },
    {
      name: 'API Georef Argentina',
      url: 'https://apis.datos.gob.ar/georef/api',
      type: 'api',
      format: 'json',
      enabled: true,
      priority: 1,
      cacheMinutes: 1440 // 24 hours for geographic data
    },
    {
      name: 'Ministry of Justice Open Data',
      url: 'https://datos.jus.gob.ar/',
      type: 'api',
      format: 'json',
      enabled: true,
      priority: 2,
      cacheMinutes: 180
    },

    // Provincial Level
    {
      name: 'RAFAM - Buenos Aires Economic Data',
      url: 'https://www.rafam.ec.gba.gov.ar/',
      type: 'scraping',
      format: 'html',
      enabled: true,
      priority: 1,
      cacheMinutes: 180
    },
    {
      name: 'Buenos Aires Provincial Open Data',
      url: 'https://www.gba.gob.ar/datos_abiertos',
      type: 'api',
      format: 'json',
      enabled: true,
      priority: 1,
      cacheMinutes: 180
    },
    {
      name: 'Buenos Aires Fiscal Transparency',
      url: 'https://www.gba.gob.ar/transparencia_fiscal/',
      type: 'scraping',
      format: 'html',
      enabled: true,
      priority: 2,
      cacheMinutes: 180
    },
    {
      name: 'Portal de Municipios BA',
      url: 'https://www.gba.gob.ar/municipios',
      type: 'scraping',
      format: 'html',
      enabled: true,
      priority: 3,
      cacheMinutes: 360
    },

    // Civil Society Organizations
    {
      name: 'Poder Ciudadano',
      url: 'https://poderciudadano.org/',
      type: 'scraping',
      format: 'html',
      enabled: true,
      priority: 3,
      cacheMinutes: 1440
    },
    {
      name: 'ACIJ',
      url: 'https://acij.org.ar/',
      type: 'scraping',
      format: 'html',
      enabled: true,
      priority: 3,
      cacheMinutes: 1440
    },
    {
      name: 'Directorio Legislativo',
      url: 'https://directoriolegislativo.org/',
      type: 'scraping',
      format: 'html',
      enabled: true,
      priority: 3,
      cacheMinutes: 1440
    }
  ];

  private constructor() {}

  public static getInstance(): ExternalAPIsService {
    if (!ExternalAPIsService.instance) {
      ExternalAPIsService.instance = new ExternalAPIsService();
    }
    return ExternalAPIsService.instance;
  }

  /***
   * Fetch data from external API with error handling and caching
   */
  private async fetchWithCache(
    url: string,
    source: string,
    cacheMinutes: number = 60,
    options: RequestInit = {}
  ): Promise<ExternalDataResponse> {
    const cacheKey = `ext:${source}:${url}`;
    const cached = this.cache.get(cacheKey);
    const cacheDuration = cacheMinutes * 60 * 1000;

    if (cached && (Date.now() - cached.timestamp) < cacheDuration) {
      return {
        success: true,
        data: cached.data,
        source: `${source} (cached)`,
        lastModified: new Date(cached.timestamp).toISOString()
      };
    }

    const startTime = Date.now();

    try {
      console.log(`🌐 Fetching from external source via proxy: ${source} - ${url}`);

      // Use the backend proxy to bypass CORS issues
      const proxyUrl = buildApiUrl(`external/proxy?url=${encodeURIComponent(url)}&source=${encodeURIComponent(source)}`);
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const proxyData = await response.json();

      if (!proxyData.success) {
        throw new Error(proxyData.error || 'External API request failed via proxy');
      }

      const responseTime = Date.now() - startTime;

      this.cache.set(cacheKey, {
        data: proxyData.data,
        timestamp: Date.now(),
        source
      });

      return {
        success: true,
        data: proxyData.data,
        source,
        lastModified: proxyData.lastModified || new Date().toISOString(),
        responseTime
      };

    } catch (error) {
      console.error(`❌ External API error for ${source}:`, error);

      // Return cached data if available, even if expired
      if (cached) {
        console.log(`📦 Using expired cache for ${source}`);
        return {
          success: true,
          data: cached.data,
          source: `${source} (expired cache)`,
          lastModified: new Date(cached.timestamp).toISOString(),
          responseTime: Date.now() - startTime
        };
      }

      return {
        success: false,
        data: null,
        source,
        error: (error as Error).message,
        responseTime: Date.now() - startTime
      };
    }
  }

    /***
   * Get Carmen de Areco municipal data with multiple attempts
   */
  async getCarmenDeArecoData(): Promise<ExternalDataResponse> {
    try {
      console.log('🌐 Fetching Carmen de Areco data via backend proxy...');
      
      // Use the backend endpoint specifically for Carmen de Areco data
      const proxyUrl = buildApiUrl('external/carmen-de-areco');
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const proxyData = await response.json();

      if (!proxyData.summary || proxyData.summary.successful_sources === 0) {
        throw new Error('No successful sources for Carmen de Areco data');
      }

      // Return the first successful result
      const successfulResult = proxyData.results.find((r: any) => r.success);
      if (successfulResult) {
        return {
          success: true,
          data: successfulResult,
          source: 'Carmen de Areco (via proxy)',
          lastModified: new Date().toISOString()
        };
      }

      return {
        success: false,
        data: null,
        source: 'Carmen de Areco',
        error: 'No successful sources from backend proxy'
      };

    } catch (error) {
      console.error('❌ Carmen de Areco data fetch error:', error);

      // If the new endpoint fails, fall back to the original method
      const sources = [
        { name: 'Transparency Portal', url: 'https://carmendeareco.gob.ar/transparencia' },
        { name: 'Main Site', url: 'https://carmendeareco.gob.ar' },
        { name: 'Council Blog', url: 'http://hcdcarmendeareco.blogspot.com/' },
        { name: 'Official Gazette', url: 'https://carmendeareco.gob.ar/gobierno/boletin-oficial/' }
      ];

      for (const source of sources) {
        try {
          const data = await this.fetchWithCache(
            source.url,
            `Carmen de Areco - ${source.name}`,
            30
          );
          
          if (data.success) {
            return data;
          }
        } catch (error) {
          console.warn(`Failed to fetch from ${source.name}:`, error);
          continue; // Try next source
        }
      }

      return {
        success: false,
        data: null,
        source: 'Carmen de Areco',
        error: 'Failed to fetch from all Carmen de Areco sources'
      };
    }
  }

  /***
   * Get Buenos Aires Province transparency data
   */
  async getBuenosAiresTransparencyData(): Promise<ExternalDataResponse> {
    try {
      console.log('🌐 Fetching Buenos Aires Province data via backend proxy...');
      
      // Use the backend endpoint specifically for Buenos Aires data
      const proxyUrl = buildApiUrl('external/buenos-aires');
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const proxyData = await response.json();

      if (!proxyData.summary || proxyData.summary.successful_sources === 0) {
        throw new Error('No successful sources for Buenos Aires data');
      }

      // Return the first successful result
      const successfulResult = proxyData.results.find((r: any) => r.success);
      if (successfulResult) {
        return {
          success: true,
          data: successfulResult,
          source: 'Buenos Aires Province (via proxy)',
          lastModified: new Date().toISOString()
        };
      }

      return {
        success: false,
        data: null,
        source: 'Buenos Aires Province',
        error: 'No successful sources from backend proxy'
      };

    } catch (error) {
      console.error('❌ Buenos Aires data fetch error:', error);

      // If the new endpoint fails, fall back to the original method
      const sources = [
        { name: 'Fiscal Transparency', url: 'https://www.gba.gob.ar/transparencia_fiscal/' },
        { name: 'Open Data', url: 'https://www.gba.gob.ar/datos_abiertos' },
        { name: 'Municipalities Portal', url: 'https://www.gba.gob.ar/municipios' }
      ];

      for (const source of sources) {
        try {
          const data = await this.fetchWithCache(
            source.url,
            `Buenos Aires Province - ${source.name}`,
            180
          );
          
          if (data.success) {
            return data;
          }
        } catch (error) {
          console.warn(`Failed to fetch from ${source.name}:`, error);
          continue; // Try next source
        }
      }

      return {
        success: false,
        data: null,
        source: 'Buenos Aires Province',
        error: 'Failed to fetch from all Buenos Aires Province sources'
      };
    }
  }

  /**
   * Get Buenos Aires Provincial Open Data
   */
  async getBuenosAiresProvincialData(): Promise<ExternalDataResponse> {
    try {
      console.log('Fetching Buenos Aires provincial open data...');

      const proxyUrl = buildApiUrl('provincial/gba');

      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: data,
        source: 'Buenos Aires Provincial Open Data',
        lastModified: new Date().toISOString()
      };

    } catch (error) {
      console.error('Buenos Aires provincial data fetch error:', error);

      return {
        success: false,
        data: null,
        source: 'GBA Open Data',
        error: `Failed to fetch Buenos Aires data: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get Buenos Aires Fiscal Transparency Data
   */
  async getBuenosAiresFiscalData(): Promise<ExternalDataResponse> {
    try {
      console.log('Fetching Buenos Aires fiscal transparency data...');

      const proxyUrl = buildApiUrl('provincial/fiscal');

      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: data,
        source: 'Buenos Aires Fiscal Transparency',
        lastModified: new Date().toISOString()
      };

    } catch (error) {
      console.error('Buenos Aires fiscal data fetch error:', error);

      return {
        success: false,
        data: null,
        source: 'GBA Fiscal',
        error: `Failed to fetch fiscal data: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get RAFAM (Buenos Aires Economic Data) for Carmen de Areco
   * RAFAM is the provincial economic data system crucial for auditing
   */
  async getRAFAMData(municipalityCode: string = '270'): Promise<ExternalDataResponse> {
    try {
      console.log('🌐 Fetching RAFAM economic data for Carmen de Areco...');

      const rafamBaseUrl = 'https://www.rafam.ec.gba.gov.ar/';

      // Use backend proxy to fetch RAFAM data
      const proxyUrl = buildApiUrl('external/rafam');

      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          municipalityCode,
          url: rafamBaseUrl
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const rafamData = await response.json();

      return {
        success: true,
        data: rafamData,
        source: 'RAFAM - Buenos Aires Economic Data',
        lastModified: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ RAFAM data fetch error:', error);

      return {
        success: false,
        data: null,
        source: 'RAFAM',
        error: `Failed to fetch RAFAM data: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get AFIP (Federal Tax Agency) data
   */
  async getAFIPData(cuit?: string): Promise<ExternalDataResponse> {
    try {
      console.log('Fetching AFIP data...');

      const proxyUrl = buildApiUrl('national/afip');

      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cuit: cuit || '30-99914050-5' // Carmen de Areco municipality CUIT
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: data,
        source: 'AFIP',
        lastModified: new Date().toISOString()
      };

    } catch (error) {
      console.error('AFIP data fetch error:', error);

      return {
        success: false,
        data: null,
        source: 'AFIP',
        error: `Failed to fetch AFIP data: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get Contrataciones Abiertas (Open Contracts) data
   */
  async getContratacionesData(query?: string): Promise<ExternalDataResponse> {
    try {
      console.log('Fetching Contrataciones Abiertas data...');

      const proxyUrl = buildApiUrl('national/contrataciones');

      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: query || 'Carmen de Areco'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: data,
        source: 'Contrataciones Abiertas',
        lastModified: new Date().toISOString()
      };

    } catch (error) {
      console.error('Contrataciones data fetch error:', error);

      return {
        success: false,
        data: null,
        source: 'Contrataciones',
        error: `Failed to fetch contracts data: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get National Boletín Oficial data
   */
  async getBoletinOficialNacional(query?: string): Promise<ExternalDataResponse> {
    try {
      console.log('Fetching National Boletín Oficial...');

      const proxyUrl = buildApiUrl('national/boletin');

      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: query || 'Carmen de Areco'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: data,
        source: 'Boletín Oficial Nacional',
        lastModified: new Date().toISOString()
      };

    } catch (error) {
      console.error('Boletín Oficial Nacional fetch error:', error);

      return {
        success: false,
        data: null,
        source: 'Boletín Oficial',
        error: `Failed to fetch Boletín Oficial: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get Provincial Boletín Oficial data (Buenos Aires)
   */
  async getBoletinOficialProvincial(query?: string): Promise<ExternalDataResponse> {
    try {
      console.log('Fetching Provincial Boletín Oficial...');

      const proxyUrl = buildApiUrl('provincial/boletin');

      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: query || 'Carmen de Areco'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: data,
        source: 'Boletín Oficial Buenos Aires',
        lastModified: new Date().toISOString()
      };

    } catch (error) {
      console.error('Boletín Oficial Provincial fetch error:', error);

      return {
        success: false,
        data: null,
        source: 'Boletín Provincial',
        error: `Failed to fetch Provincial Boletín: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get Expedientes (Administrative Proceedings) data
   */
  async getExpedientesData(query?: string): Promise<ExternalDataResponse> {
    try {
      console.log('Fetching Expedientes data...');

      const proxyUrl = buildApiUrl('provincial/expedientes');

      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: query || 'Carmen de Areco'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: data,
        source: 'Expedientes Tracking',
        lastModified: new Date().toISOString()
      };

    } catch (error) {
      console.error('Expedientes data fetch error:', error);

      return {
        success: false,
        data: null,
        source: 'Expedientes',
        error: `Failed to fetch expedientes data: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /***
   * Get national budget data
   */
  async getNationalBudgetData(): Promise<ExternalDataResponse> {
    try {
      console.log('🌐 Fetching National Budget data via backend proxy...');
      
      // Use the backend endpoint specifically for national data
      const proxyUrl = buildApiUrl('external/national');
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const proxyData = await response.json();

      if (!proxyData.summary || proxyData.summary.successful_sources === 0) {
        throw new Error('No successful sources for National Budget data');
      }

      // Return the first successful result
      const successfulResult = proxyData.results.find((r: any) => r.success);
      if (successfulResult) {
        return {
          success: true,
          data: successfulResult,
          source: 'National Budget APIs (via proxy)',
          lastModified: new Date().toISOString()
        };
      }

      return {
        success: false,
        data: null,
        source: 'National Budget APIs',
        error: 'No successful sources from backend proxy'
      };

    } catch (error) {
      console.error('❌ National Budget data fetch error:', error);

      // If the new endpoint fails, fall back to the original method
      const sources = [
        { name: 'Presupuesto Abierto', url: 'https://www.presupuestoabierto.gob.ar/sici/api/v1/entidades' },
        { name: 'Datos Argentina', url: 'https://datos.gob.ar/api/3/action/package_search?q=presupuesto' },
        { name: 'National Budget API', url: 'https://www.presupuestoabierto.gob.ar/sici/api' }
      ];

      for (const source of sources) {
        try {
          const data = await this.fetchWithCache(
            source.url,
            `National Budget - ${source.name}`,
            120
          );
          
          if (data.success) {
            return data;
          }
        } catch (error) {
          console.warn(`Failed to fetch from ${source.name}:`, error);
          continue; // Try next source
        }
      }

      return {
        success: false,
        data: null,
        source: 'National Budget APIs',
        error: 'Failed to fetch from all national budget sources'
      };
    }
  }

  /***
   * Get geographic data for Carmen de Areco
   */
  async getGeographicData(): Promise<ExternalDataResponse> {
    try {
      console.log('🌐 Fetching geographic data via backend proxy...');
      
      // Use the backend endpoint for all external data which includes geographic data
      const proxyUrl = buildApiUrl('external/all-external-data');
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const proxyData = await response.json();

      // Look for geographic data in the results
      const geoResult = proxyData.results.find((r: any) => 
        r.name.includes('GeoRef') || r.name.includes('georef') || r.type === 'national'
      );
      
      if (geoResult && geoResult.success) {
        return {
          success: true,
          data: geoResult.data,
          source: 'GeoRef API (via proxy)',
          lastModified: new Date().toISOString()
        };
      }

      // If not found in the aggregated data, fall back to direct proxy call
      return await this.fetchWithCache(
        'https://apis.datos.gob.ar/georef/api/municipios?provincia=buenos-aires&nombre=carmen-de-areco',
        'GeoRef API',
        1440, // 24 hours cache
        {
          headers: {
            'Accept': 'application/json'
          }
        }
      );

    } catch (error) {
      console.error('❌ Failed to get geographic data:', error);
      
      // Fallback to direct proxy call
      try {
        return await this.fetchWithCache(
          'https://apis.datos.gob.ar/georef/api/municipios?provincia=buenos-aires&nombre=carmen-de-areco',
          'GeoRef API',
          1440, // 24 hours cache
          {
            headers: {
              'Accept': 'application/json'
            }
          }
        );
      } catch (fallbackError) {
        console.error('❌ Fallback geographic data fetch also failed:', fallbackError);
        return {
          success: false,
          data: null,
          source: 'GeoRef API',
          error: (fallbackError as Error).message
        };
      }
    }
  }

  /**
   * Get comparative data from similar municipalities
   */
  async getComparativeMunicipalData(): Promise<ExternalDataResponse[]> {
    const municipalities = [
      { name: 'Bahía Blanca', url: 'https://transparencia.bahia.gob.ar/' },
      { name: 'San Isidro', url: 'https://www.sanisidro.gob.ar/transparencia' },
      { name: 'Pilar', url: 'https://datosabiertos.pilar.gov.ar/' },
      { name: 'Rosario', url: 'https://www.rosario.gob.ar/web/gobierno/gobierno-abierto' },
      { name: 'Chacabuco', url: 'https://chacabuco.gob.ar/' },
      { name: 'Chivilcoy', url: 'https://chivilcoy.gov.ar/' }
    ];

    const results = await Promise.allSettled(
      municipalities.map(municipality =>
        this.fetchWithCache(
          municipality.url,
          `Comparative: ${municipality.name}`,
          360 // 6 hours cache
        )
      )
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          success: false,
          data: null,
          source: `Comparative: ${municipalities[index].name}`,
          error: result.reason?.message || 'Unknown error'
        };
      }
    });
  }

  /**
   * Get data from civil society and oversight organizations
   */
  async getCivilSocietyData(): Promise<ExternalDataResponse[]> {
    const organizations = [
      { name: 'Poder Ciudadano', url: 'https://poderciudadano.org/' },
      { name: 'ACIJ', url: 'https://acij.org.ar/' },
      { name: 'Directorio Legislativo', url: 'https://directoriolegislativo.org/' },
      { name: 'Chequeado', url: 'https://chequeado.com/proyectos/' }
    ];

    const results = await Promise.allSettled(
      organizations.map(org =>
        this.fetchWithCache(
          org.url,
          `Civil Society: ${org.name}`,
          1440 // 24 hours cache
        )
      )
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          success: false,
          data: null,
          source: `Civil Society: ${organizations[index].name}`,
          error: result.reason?.message || 'Unknown error'
        };
      }
    });
  }

  /**
   * Load all external data sources
   */
  async loadAllExternalData(): Promise<{
    carmenDeAreco: ExternalDataResponse;
    buenosAires: ExternalDataResponse;
    nationalBudget: ExternalDataResponse;
    geographic: ExternalDataResponse;
    comparative: ExternalDataResponse[];
    civilSociety: ExternalDataResponse[];
    summary: {
      total_sources: number;
      successful_sources: number;
      failed_sources: number;
      cache_hits: number;
      last_updated: string;
    };
  }> {
    console.log('🌍 Loading all external data sources via backend proxy...');

    try {
      // Try to use the aggregated backend endpoint first
      const proxyUrl = buildApiUrl('external/all-external-data');
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        const proxyData = await response.json();
        
        // Format the response to match the expected structure
        const carmenDeAreco = proxyData.results.find((r: any) => r.type === 'municipal') || {
          success: false,
          data: null,
          source: 'Carmen de Areco (via proxy)',
          error: 'No municipal data available'
        };
        
        const buenosAires = proxyData.results.find((r: any) => r.type === 'provincial') || {
          success: false,
          data: null,
          source: 'Buenos Aires Province (via proxy)',
          error: 'No provincial data available'
        };
        
        const nationalBudget = proxyData.results.find((r: any) => r.type === 'national') || {
          success: false,
          data: null,
          source: 'National Budget APIs (via proxy)',
          error: 'No national data available'
        };
        
        // For geographic data, look specifically for georef
        const geographic = proxyData.results.find((r: any) => 
          r.name.includes('GeoRef') || r.name.includes('georef')
        ) || {
          success: false,
          data: null,
          source: 'GeoRef API (via proxy)',
          error: 'No geographic data available'
        };
        
        // Convert to ExternalDataResponse format
        const formattedCarmenDeAreco = {
          success: carmenDeAreco.success,
          data: carmenDeAreco.data,
          source: carmenDeAreco.name,
          error: carmenDeAreco.error
        };
        
        const formattedBuenosAires = {
          success: buenosAires.success,
          data: buenosAires.data,
          source: buenosAires.name,
          error: buenosAires.error
        };
        
        const formattedNationalBudget = {
          success: nationalBudget.success,
          data: nationalBudget.data,
          source: nationalBudget.name,
          error: nationalBudget.error
        };
        
        const formattedGeographic = {
          success: geographic.success,
          data: geographic.data,
          source: geographic.name,
          error: geographic.error
        };

        // For comparative and civil society data, fallback to individual calls
        const [comparative, civilSociety] = await Promise.all([
          this.getComparativeMunicipalData(),
          this.getCivilSocietyData()
        ]);

        const allSources = [
          formattedCarmenDeAreco, 
          formattedBuenosAires, 
          formattedNationalBudget, 
          formattedGeographic,
          ...comparative,
          ...civilSociety
        ];
        
        const successful = allSources.filter(s => s.success).length;
        const failed = allSources.filter(s => !s.success).length;

        return {
          carmenDeAreco: formattedCarmenDeAreco,
          buenosAires: formattedBuenosAires,
          nationalBudget: formattedNationalBudget,
          geographic: formattedGeographic,
          comparative,
          civilSociety,
          summary: {
            total_sources: allSources.length,
            successful_sources: successful,
            failed_sources: failed,
            cache_hits: 0, // No cache hits when using the proxy directly
            last_updated: new Date().toISOString()
          }
        };
      }
    } catch (error) {
      console.warn('⚠️  Aggregated external data fetch failed, falling back to individual calls:', error);
    }

    // If the aggregated call fails, fallback to individual calls
    console.log('🌍 Loading all external data sources individually (fallback)...');

    const [
      carmenDeAreco, 
      buenosAires, 
      nationalBudget, 
      geographic, 
      comparative,
      civilSociety
    ] = await Promise.all([
      this.getCarmenDeArecoData(),
      this.getBuenosAiresTransparencyData(),
      this.getNationalBudgetData(),
      this.getGeographicData(),
      this.getComparativeMunicipalData(),
      this.getCivilSocietyData()
    ]);

    const allSources = [
      carmenDeAreco, 
      buenosAires, 
      nationalBudget, 
      geographic,
      ...comparative,
      ...civilSociety
    ];
    
    const successful = allSources.filter(s => s.success).length;
    const failed = allSources.filter(s => !s.success).length;
    const cacheHits = allSources.filter(s => s.source.includes('cached')).length;

    return {
      carmenDeAreco,
      buenosAires,
      nationalBudget,
      geographic,
      comparative,
      civilSociety,
      summary: {
        total_sources: allSources.length,
        successful_sources: successful,
        failed_sources: failed,
        cache_hits: cacheHits,
        last_updated: new Date().toISOString()
      }
    };
  }

  /**
   * Fetch Carmen de Areco specific data from various sources
   */
  async getCarmenDeArecoSpecificData(): Promise<{
    budget: ExternalDataResponse;
    contracts: ExternalDataResponse;
    declarations: ExternalDataResponse;
    ordinances: ExternalDataResponse;
    official_bulletin: ExternalDataResponse;
  }> {
    const [budget, contracts, declarations, ordinances, official_bulletin] = await Promise.all([
      this.fetchWithCache(
        'https://datos.gob.ar/dataset?organization=carmen-de-areco&q=budget',
        'Carmen de Areco Budget',
        120
      ),
      this.fetchWithCache(
        'https://datos.gob.ar/dataset?organization=carmen-de-areco&q=contracts',
        'Carmen de Areco Contracts',
        120
      ),
      this.fetchWithCache(
        'https://carmendeareco.gob.ar/declaraciones-juradas/',
        'Carmen de Areco Declarations',
        1440
      ),
      this.fetchWithCache(
        'https://carmendeareco.gob.ar/ordinances/',
        'Carmen de Areco Ordinances',
        360
      ),
      this.fetchWithCache(
        'https://carmendeareco.gob.ar/gobierno/boletin-oficial/',
        'Carmen de Areco Official Bulletin',
        1440
      )
    ]);

    return {
      budget,
      contracts,
      declarations,
      ordinances,
      official_bulletin
    };
  }

  /**
   * Parse HTML content for structured data
   */
  private parseHtmlForData(html: string, source: string): any {
    const data: any = {
      source,
      parsed_at: new Date().toISOString(),
      content_length: html.length,
      links: [],
      tables: [],
      headings: [],
      metadata: {}
    };

    try {
      // Extract links
      const linkRegex = /<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/gi;
      let match;
      while ((match = linkRegex.exec(html)) !== null) {
        data.links.push({
          url: match[1],
          text: match[2].trim()
        });
      }

      // Extract headings
      const headingRegex = /<h([1-6])[^>]*>([^<]+)<\/h[1-6]>/gi;
      while ((match = headingRegex.exec(html)) !== null) {
        data.headings.push({
          level: parseInt(match[1]),
          text: match[2].trim()
        });
      }

      // Extract tables (simple approach by looking for table tags)
      const tableRegex = /<table[^>]*>[\s\S]*?<\/table>/gi;
      let tableMatch;
      while ((tableMatch = tableRegex.exec(html)) !== null) {
        data.tables.push(tableMatch[0]);
      }

      // Extract basic metadata
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch) {
        data.metadata.title = titleMatch[1].trim();
      }

      const descMatch = html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i);
      if (descMatch) {
        data.metadata.description = descMatch[1].trim();
      }

      // Look for specific transparency-related content
      if (source.includes('Carmen de Areco')) {
        data.transparency_indicators = this.extractTransparencyIndicators(html);
      }

    } catch (error) {
      console.warn(`⚠️  HTML parsing error for ${source}:`, error);
      data.parse_error = (error as Error).message;
    }

    return data;
  }

  /**
   * Extract transparency indicators from HTML
   */
  private extractTransparencyIndicators(html: string): any {
    return {
      has_budget_info: /presupuesto|budget|gasto|ingreso|ejecuci[oó]n/i.test(html),
      has_contract_info: /contrato|licitaci[oó]n|procurement|proveedor|adjudicaci[oó]n|compra/i.test(html),
      has_salary_info: /sueldo|salario|empleado|funcionario|remuneraci[oó]n/i.test(html),
      has_transparency_section: /transparencia|transparency|open|datos/i.test(html),
      has_audit_info: /auditor[ií]a|control|interno|externo|fiscalizaci[oó]n/i.test(html),
      has_declarations: /declaraci[oó]n|jurada|patrimonio|intereses/i.test(html),
      has_ordnances: /ordenanza|resoluci[oó]n|normativa|legal/i.test(html),
      last_checked: new Date().toISOString()
    };
  }

  /**
   * Get service health status
   */
  async getServiceHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'down';
    sources: Array<{ name: string; status: 'up' | 'down'; responseTime?: number }>;
    cache_size: number;
    last_check: string;
  }> {
    const healthChecks = await Promise.allSettled(
      this.dataSources
        .filter(source => source.enabled)
        .slice(0, 5) // Test first 5 sources only for health check
        .map(async source => {
          const startTime = Date.now();
          try {
            const response = await fetch(source.url, {
              method: 'HEAD',
              headers: { 'User-Agent': this.USER_AGENT },
              signal: AbortSignal.timeout(5000) // 5 second timeout
            });
            return {
              name: source.name,
              status: response.ok ? 'up' as const : 'down' as const,
              responseTime: Date.now() - startTime
            };
          } catch (error) {
            return {
              name: source.name,
              status: 'down' as const,
              responseTime: Date.now() - startTime
            };
          }
        })
    );

    const sourceStatuses = healthChecks.map(result =>
      result.status === 'fulfilled' ? result.value : {
        name: 'Unknown',
        status: 'down' as const,
        responseTime: 0
      }
    );

    const upCount = sourceStatuses.filter(s => s.status === 'up').length;
    const totalCount = sourceStatuses.length;

    let overallStatus: 'healthy' | 'degraded' | 'down';
    if (upCount === totalCount) {
      overallStatus = 'healthy';
    } else if (upCount > 0) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'down';
    }

    return {
      status: overallStatus,
      sources: sourceStatuses,
      cache_size: this.cache.size,
      last_check: new Date().toISOString()
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🧹 External APIs service cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
      oldest_entry: Math.min(...Array.from(this.cache.values()).map(v => v.timestamp)),
      newest_entry: Math.max(...Array.from(this.cache.values()).map(v => v.timestamp))
    };
  }
}

const externalAPIsService = ExternalAPIsService.getInstance();

export { ExternalAPIsService };
export { externalAPIsService };
export default externalAPIsService;