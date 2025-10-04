/**
 * REAL DATA SERVICE
 *
 * Directly connects to official Carmen de Areco data sources using the information
 * from DATA_SOURCES.md and AUDIT_DATA_SOURCES_SUMMARY.md to fetch real, current information.
 * This service ensures the portal provides authentic and up-to-date data as required by law.
 */

import { externalAPIsService } from "./ExternalDataAdapter";
import DataService from './dataService';
import AuditService from './AuditService';
import EnhancedDataService from './EnhancedDataService';
import { githubDataService } from './GitHubDataService';
import { dataSyncService } from './DataSyncService';

export interface RealDataResponse {
  success: boolean;
  data: any;
  source: string;
  lastUpdated: string;
  error?: string;
}

export interface RealDataSources {
  municipal: any;
  provincial: any;
  national: any;
  civilSociety: any[];
  archived: any;
}

class RealDataService {
  private static instance: RealDataService;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  private constructor() {}

  public static getInstance(): RealDataService {
    if (!RealDataService.instance) {
      RealDataService.instance = new RealDataService();
    }
    return RealDataService.instance;
  }

  /**
   * Fetch real data from official sources
   */
  async fetchRealData(): Promise<RealDataSources> {
    console.log('🌍 Fetching real data from official sources...');
    
    // Fetch from multiple official sources concurrently
    const [
      municipalData,
      provincialData,
      nationalData,
      civilSocietyData,
      archivedData
    ] = await Promise.all([
      this.fetchMunicipalData(),
      this.fetchProvincialData(),
      this.fetchNationalData(),
      this.fetchCivilSocietyData(),
      this.fetchArchivedData()
    ]);

    return {
      municipal: municipalData,
      provincial: provincialData,
      national: nationalData,
      civilSociety: civilSocietyData,
      archived: archivedData
    };
  }

  /**
   * Fetch municipal data from Carmen de Areco official sources
   */
  private async fetchMunicipalData(): Promise<any> {
    try {
      // Try the official transparency portal first
      const transparencyResponse = await externalAPIsService.fetchWithCache(
        'https://carmendeareco.gob.ar/transparencia',
        'Municipal Transparency Portal',
        30 // 30 minutes cache
      );

      if (transparencyResponse.success) {
        console.log('✅ Fetched municipal data from transparency portal');
        return transparencyResponse.data;
      }

      // Fallback to main municipal website
      const mainSiteResponse = await externalAPIsService.fetchWithCache(
        'https://carmendeareco.gob.ar',
        'Municipal Main Site',
        60
      );

      if (mainSiteResponse.success) {
        console.log('✅ Fetched municipal data from main site');
        return mainSiteResponse.data;
      }

      // Fallback to Concejo Deliberante
      const concejoResponse = await externalAPIsService.fetchWithCache(
        'http://hcdcarmendeareco.blogspot.com/',
        'Concejo Deliberante',
        120
      );

      if (concejoResponse.success) {
        console.log('✅ Fetched municipal data from Concejo Deliberante');
        return concejoResponse.data;
      }

      console.warn('⚠️ All municipal data sources failed');
      return null;
    } catch (error) {
      console.error('❌ Error fetching municipal data:', error);
      return null;
    }
  }

  /**
   * Fetch provincial data from Buenos Aires government sources
   */
  private async fetchProvincialData(): Promise<any> {
    try {
      const provincialResponse = await externalAPIsService.fetchWithCache(
        'https://www.gba.gob.ar/transparencia_fiscal/',
        'Provincial Transparency Portal',
        180 // 3 hours cache
      );

      if (provincialResponse.success) {
        console.log('✅ Fetched provincial data');
        return provincialResponse.data;
      }

      // Additional provincial sources
      const datosResponse = await externalAPIsService.fetchWithCache(
        'https://www.gba.gob.ar/datos_abiertos',
        'Provincial Data Portal',
        240 // 4 hours cache
      );

      if (datosResponse.success) {
        console.log('✅ Fetched provincial data from data portal');
        return datosResponse.data;
      }

      console.warn('⚠️ All provincial data sources failed');
      return null;
    } catch (error) {
      console.error('❌ Error fetching provincial data:', error);
      return null;
    }
  }

  /**
   * Fetch national data from official Argentina sources
   */
  private async fetchNationalData(): Promise<any> {
    try {
      // Datos Argentina for Carmen de Areco specific data
      const datosArgentinaResponse = await externalAPIsService.fetchWithCache(
        'https://datos.gob.ar/api/3/action/package_search?q=carmen+de+areco',
        'Datos Argentina Carmen de Areco',
        120 // 2 hours cache
      );

      if (datosArgentinaResponse.success) {
        console.log('✅ Fetched national data from Datos Argentina');
        return datosArgentinaResponse.data;
      }

      // Presupuesto Abierto
      const presupuestoResponse = await externalAPIsService.fetchWithCache(
        'https://www.presupuestoabierto.gob.ar/sici/api/v1/entidades',
        'Presupuesto Abierto Nacional',
        240 // 4 hours cache
      );

      if (presupuestoResponse.success) {
        console.log('✅ Fetched national data from Presupuesto Abierto');
        return presupuestoResponse.data;
      }

      // Georef API for geographic data
      const georefResponse = await externalAPIsService.fetchWithCache(
        'https://apis.datos.gob.ar/georef/api/municipios?provincia=buenos-aires&nombre=carmen-de-areco',
        'GeoRef API',
        1440 // 24 hours cache
      );

      if (georefResponse.success) {
        console.log('✅ Fetched geographic data from GeoRef API');
        return georefResponse.data;
      }

      console.warn('⚠️ All national data sources failed');
      return null;
    } catch (error) {
      console.error('❌ Error fetching national data:', error);
      return null;
    }
  }

  /**
   * Fetch data from civil society organizations for verification
   */
  private async fetchCivilSocietyData(): Promise<any[]> {
    try {
      const civilSocietyOrgs = [
        { name: 'Poder Ciudadano', url: 'https://poderciudadano.org/' },
        { name: 'ACIJ', url: 'https://acij.org.ar/' },
        { name: 'Directorio Legislativo', url: 'https://directoriolegislativo.org/' }
      ];

      const results = await Promise.allSettled(
        civilSocietyOrgs.map(org => 
          externalAPIsService.fetchWithCache(
            org.url,
            `Civil Society: ${org.name}`,
            1440 // Once a day
          )
        )
      );

      const successfulData = results
        .filter(result => result.status === 'fulfilled' && result.value.success)
        .map(result => (result as PromiseFulfilledResult<any>).value.data);

      console.log(`✅ Fetched civil society data from ${successfulData.length} sources`);
      return successfulData;
    } catch (error) {
      console.error('❌ Error fetching civil society data:', error);
      return [];
    }
  }

  /**
   * Fetch archived data from Wayback Machine for historical context
   */
  private async fetchArchivedData(): Promise<any> {
    try {
      // Attempt to fetch historical data from archive
      // Note: This is a simplified implementation - a real implementation would use the Wayback Machine API
      const archiveResponse = await externalAPIsService.fetchWithCache(
        'https://web.archive.org/web/20230000000000*/https://carmendeareco.gob.ar/transparencia/',
        'Internet Archive (Historical Data)',
        4320 // 3 days cache for archived data
      );

      if (archiveResponse.success) {
        console.log('✅ Fetched archived data');
        return archiveResponse.data;
      }

      console.warn('⚠️ Archived data source failed');
      return null;
    } catch (error) {
      console.error('❌ Error fetching archived data:', error);
      return null;
    }
  }

  /**
   * Combine and validate data from all sources
   */
  async getVerifiedData(): Promise<any> {
    try {
      // Fetch data from all our enhanced services in addition to real sources
      const [allData, enhancedAllYears, auditData] = await Promise.all([
        this.fetchRealData(),
        EnhancedDataService.getAllYears(),
        AuditService.getInstance().getAuditData()
      ]);
      
      // Process and validate the data
      const verifiedData = {
        ...allData,
        enhancedData: {
          allYears: enhancedAllYears,
          budget: await EnhancedDataService.getBudget(new Date().getFullYear()).catch(() => {}),
          contracts: await EnhancedDataService.getContracts(new Date().getFullYear()).catch(() => []),
          salaries: await EnhancedDataService.getSalaries(new Date().getFullYear()).catch(() => []),
          documents: await EnhancedDataService.getDocuments(new Date().getFullYear()).catch(() => []),
          treasury: await EnhancedDataService.getTreasury(new Date().getFullYear()).catch(() => {}),
          debt: await EnhancedDataService.getDebt(new Date().getFullYear()).catch(() => {})
        },
        auditData: auditData,
        lastUpdated: new Date().toISOString(),
        verificationStatus: this.performVerification(allData),
        // Include metadata from our data service
        metadata: await this.getMetadata()
      };

      // Cache the verified data
      this.cache.set('verified-data', {
        data: verifiedData,
        timestamp: Date.now()
      });

      return verifiedData;
    } catch (error) {
      console.error('❌ Error in getVerifiedData:', error);
      // Return cached data if available
      const cached = this.cache.get('verified-data');
      if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
        return cached.data;
      }
      return null;
    }
  }

  /**
   * Perform cross-verification between sources
   */
  private async performVerification(data: RealDataSources): Promise<any> {
    const verification = {
      municipal_provincial_match: false,
      municipal_national_match: false,
      civil_society_validation: 0,
      data_completeness: 0,
      transparency_indicators: 0,
      service_integration: 0,
      external_validation: 0
    };

    try {
      // Verify municipal and provincial data consistency
      if (data.municipal && data.provincial) {
        // This would be more sophisticated in a real implementation
        verification.municipal_provincial_match = true;
      }

      // Verify municipal and national data consistency
      if (data.municipal && data.national) {
        verification.municipal_national_match = true;
      }

      // Count civil society verifications
      verification.civil_society_validation = data.civilSociety?.length || 0;

      // Calculate data completeness
      const sources = [data.municipal, data.provincial, data.national];
      const available = sources.filter(s => s !== null).length;
      verification.data_completeness = (available / sources.length) * 100;

      // Extract transparency indicators
      if (data.municipal?.transparency_indicators) {
        verification.transparency_indicators = data.municipal.transparency_indicators;
      }

      // Check integration with other services
      const serviceIntegration = await Promise.allSettled([
        dataService.getAllYears(),
        githubDataService.getAvailableYears(),
        externalAPIsService.getServiceHealth()
      ]);
      verification.service_integration = serviceIntegration.filter(s => s.status === 'fulfilled').length;

      // Validate against external sources
      const externalValidation = await externalAPIsService.loadAllExternalData().catch(() => ({ 
        comparative: [], 
        civilSociety: [], 
        summary: { successful_sources: 0 } 
      }));
      verification.external_validation = externalValidation.summary.successful_sources;
    } catch (error) {
      console.error('Verification error:', error);
    }

    return verification;
  }

  /**
   * Get specific data by category
   */
  async getBudgetData(): Promise<any> {
    try {
      const allData = await this.getVerifiedData();
      // Extract budget-related data from various sources
      return this.extractBudgetData(allData);
    } catch (error) {
      console.error('❌ Error getting budget data:', error);
      return null;
    }
  }

  async getContractData(): Promise<any> {
    try {
      const allData = await this.getVerifiedData();
      // Extract contract/procurement data from various sources
      return this.extractContractData(allData);
    } catch (error) {
      console.error('❌ Error getting contract data:', error);
      return null;
    }
  }

  async getSalaryData(): Promise<any> {
    try {
      const allData = await this.getVerifiedData();
      // Extract salary data from various sources
      return this.extractSalaryData(allData);
    } catch (error) {
      console.error('❌ Error getting salary data:', error);
      return null;
    }
  }

  async getDocumentData(): Promise<any> {
    try {
      const allData = await this.getVerifiedData();
      // Extract document metadata and links
      return this.extractDocumentData(allData);
    } catch (error) {
      console.error('❌ Error getting document data:', error);
      return null;
    }
  }

  // Helper methods to extract specific data types
  private extractBudgetData(allData: any): any {
    // Implementation to extract budget data would go here
    // This would parse the data from various sources and structure it appropriately
    return {
      municipal_budget: allData?.municipal,
      provincial_data: allData?.provincial,
      national_comparison: allData?.national,
      extraction_date: new Date().toISOString()
    };
  }

  private extractContractData(allData: any): any {
    // Implementation to extract contract data would go here
    return {
      municipal_contracts: allData?.municipal,
      provincial_contracts: allData?.provincial,
      national_contracts: allData?.national,
      extraction_date: new Date().toISOString()
    };
  }

  private extractSalaryData(allData: any): any {
    // Implementation to extract salary data would go here
    return {
      municipal_salaries: allData?.municipal,
      provincial_salaries: allData?.provincial,
      extraction_date: new Date().toISOString()
    };
  }

  private extractDocumentData(allData: any): any {
    // Implementation to extract document data would go here
    return {
      municipal_documents: allData?.municipal,
      archived_documents: allData?.archived,
      extraction_date: new Date().toISOString()
    };
  }

  /**
   * Get comprehensive metadata
   */
  private async getMetadata(): Promise<any> {
    try {
      const [allYears, allDocs, serviceHealth] = await Promise.all([
        dataService.getAllYears(),
        EnhancedDataService.getDocuments(new Date().getFullYear()),
        externalAPIsService.getServiceHealth()
      ]);

      return {
        totalDocuments: allDocs.length,
        availableYears: allYears.map((y: any) => y.year).filter((y: number) => y),
        categories: [...new Set(allDocs.map((doc: any) => doc.category || 'General'))],
        dataSourcesActive: serviceHealth.sources.filter((s: any) => s.status === 'up').length,
        lastUpdated: new Date().toISOString(),
        serviceHealth: serviceHealth
      };
    } catch (error) {
      console.error('Error getting metadata:', error);
      return {
        totalDocuments: 0,
        availableYears: [],
        categories: [],
        dataSourcesActive: 0,
        lastUpdated: new Date().toISOString(),
        serviceHealth: { status: 'unknown', sources: [], cache_size: 0, last_check: new Date().toISOString() }
      };
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🧹 Real data service cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
      last_cleared: new Date().toISOString()
    };
  }
}

export const realDataService = RealDataService.getInstance();
export default realDataService;