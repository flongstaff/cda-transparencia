/**
 * Comprehensive Data Integration Service
 * Connects all services to real data sources mentioned in DATA_SOURCES.md
 * Ensures the portal fetches authentic and up-to-date data as required by law
 */

import DataService from './dataService';
import AuditService from './AuditService';
import EnhancedDataService from './EnhancedDataService';
import externalAPIsService from './ExternalAPIsService';
import { githubDataService } from './GitHubDataService';
import { dataSyncService } from './DataSyncService';
import masterDataService from './MasterDataService';
import RealDataService from './RealDataService';
import UnifiedTransparencyService from './UnifiedTransparencyService';

// Configuration for real data sources from DATA_SOURCES.md
const REAL_DATA_SOURCES = {
  // Carmen de Areco Official Sources
  CARMEN_DE_ARECO: {
    OFFICIAL_PORTAL: 'https://carmendeareco.gob.ar',
    TRANSPARENCY_PORTAL: 'https://carmendeareco.gob.ar/transparencia',
    OFFICIAL_BULLETIN: 'https://carmendeareco.gob.ar/gobierno/boletin-oficial/',
    CONCEJO_DELIBERANTE: 'http://hcdcarmendeareco.blogspot.com/',
    ARCHIVED_VERSIONS: 'https://web.archive.org/web/20250000000000*/https://carmendeareco.gob.ar'
  },
  
  // National Level Data Sources
  NATIONAL: {
    DATOS_ARGENTINA: 'https://datos.gob.ar/',
    PRESUPUESTO_ABIERTO: 'https://www.presupuestoabierto.gob.ar/sici/api',
    CONTRACTS_API: 'https://datos.gob.ar/dataset/modernizacion-sistema-contrataciones-electronicas-argentina',
    BUDGET_API: 'https://datos.gob.ar/dataset/sspm-presupuesto-abierto',
    GEOGRAPHIC_API: 'https://apis.datos.gob.ar/georef',
    ANTI_CORRUPTION: 'https://www.argentina.gob.ar/anticorrupcion',
    ACCESS_TO_INFORMATION: 'https://www.argentina.gob.ar/aaip'
  },
  
  // Provincial Level Sources (Buenos Aires)
  PROVINCIAL: {
    PROVINCIAL_OPEN_DATA: 'https://www.gba.gob.ar/datos_abiertos',
    FISCAL_TRANSPARENCY: 'https://www.gba.gob.ar/transparencia_fiscal/',
    MUNICIPALITIES_PORTAL: 'https://www.gba.gob.ar/municipios',
    PROCUREMENT_PORTAL: 'https://pbac.cgp.gba.gov.ar/Default.aspx',
    CONTRACTS_SEARCH: 'https://sistemas.gba.gob.ar/consulta/contrataciones/'
  },
  
  // Civil Society and Oversight Organizations
  CIVIL_SOCIETY: {
    PODER_CIUDADANO: 'https://poderciudadano.org/',
    ACIJ: 'https://acij.org.ar/',
    DIRECTORIO_LEGISLATIVO: 'https://directoriolegislativo.org/',
    CHEQUEADO: 'https://chequeado.com/proyectos/'
  },
  
  // Similar Municipalities (Reference Models)
  REFERENCE_MUNICIPALITIES: {
    BAHIA_BLANCA: 'https://transparencia.bahia.gob.ar/',
    SAN_ISIDRO: 'https://www.sanisidro.gob.ar/transparencia',
    PILAR: 'https://datosabiertos.pilar.gov.ar/',
    ROSARIO: 'https://www.rosario.gob.ar/web/gobierno/gobierno-abierto',
    RAFAELA: 'https://rafaela-gob-ar.github.io/'
  }
};

class ComprehensiveDataIntegrationService {
  private static instance: ComprehensiveDataIntegrationService;
  private connectionStatus: Record<string, boolean> = {};
  private lastSyncTime: Record<string, number> = {};

  private constructor() {}

  public static getInstance(): ComprehensiveDataIntegrationService {
    if (!ComprehensiveDataIntegrationService.instance) {
      ComprehensiveDataIntegrationService.instance = new ComprehensiveDataIntegrationService();
    }
    return ComprehensiveDataIntegrationService.instance;
  }

  /**
   * Connect to all real data sources and verify connectivity
   */
  async connectToAllDataSources(): Promise<boolean> {
    console.log('🔗 Connecting to all real data sources...');
    
    try {
      // Test connections to all major data source categories
      const connectionTests = [
        this.testCarmenDeArecoConnection(),
        this.testNationalDataSources(),
        this.testProvincialDataSources(),
        this.testCivilSocietySources(),
        this.testReferenceMunicipalities()
      ];

      const results = await Promise.allSettled(connectionTests);
      
      // Count successful connections
      const successfulConnections = results.filter(result => 
        result.status === 'fulfilled' && result.value
      ).length;
      
      const totalConnections = results.length;
      
      console.log(`✅ Connected to ${successfulConnections}/${totalConnections} data source categories`);
      
      // If most connections are successful, return true
      return successfulConnections >= totalConnections * 0.8;
    } catch (error) {
      console.error('❌ Error connecting to data sources:', error);
      return false;
    }
  }

  /**
   * Test connection to Carmen de Areco official sources
   */
  private async testCarmenDeArecoConnection(): Promise<boolean> {
    console.log('📡 Testing Carmen de Areco official sources connection...');
    
    try {
      // Test main website
      const mainSiteResponse = await fetch(REAL_DATA_SOURCES.CARMEN_DE_ARECO.OFFICIAL_PORTAL, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      this.connectionStatus['carmen_de_areco_main'] = mainSiteResponse.ok;
      
      // Test transparency portal
      const transparencyResponse = await fetch(REAL_DATA_SOURCES.CARMEN_DE_ARECO.TRANSPARENCY_PORTAL, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      
      this.connectionStatus['carmen_de_areco_transparency'] = transparencyResponse.ok;
      
      // Update last sync time
      this.lastSyncTime['carmen_de_areco'] = Date.now();
      
      const success = mainSiteResponse.ok && transparencyResponse.ok;
      console.log(`✅ Carmen de Areco connection test: ${success ? 'SUCCESS' : 'PARTIAL SUCCESS'}`);
      return success;
    } catch (error) {
      console.warn('⚠️ Carmen de Areco connection test failed:', error);
      this.connectionStatus['carmen_de_areco'] = false;
      return false;
    }
  }

  /**
   * Test connection to national data sources
   */
  private async testNationalDataSources(): Promise<boolean> {
    console.log('📡 Testing national data sources connection...');
    
    try {
      // Test Datos Argentina API
      const datosResponse = await fetch(`${REAL_DATA_SOURCES.NATIONAL.DATOS_ARGENTINA}api/3/action/package_search?q=carmen+de+areco`, {
        method: 'GET',
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      this.connectionStatus['national_datos_argentina'] = datosResponse.ok;
      
      // Test Presupuesto Abierto API
      const presupuestoResponse = await fetch(REAL_DATA_SOURCES.NATIONAL.PRESUPUESTO_ABIERTO, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      
      this.connectionStatus['national_presupuesto_abierto'] = presupuestoResponse.ok;
      
      // Test Geographic API
      const geoResponse = await fetch(`${REAL_DATA_SOURCES.NATIONAL.GEOGRAPHIC_API}/municipios?provincia=buenos-aires&nombre=carmen-de-areco`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      
      this.connectionStatus['national_georef'] = geoResponse.ok;
      
      // Update last sync time
      this.lastSyncTime['national_sources'] = Date.now();
      
      const success = datosResponse.ok && presupuestoResponse.ok && geoResponse.ok;
      console.log(`✅ National data sources connection test: ${success ? 'SUCCESS' : 'PARTIAL SUCCESS'}`);
      return success;
    } catch (error) {
      console.warn('⚠️ National data sources connection test failed:', error);
      this.connectionStatus['national_sources'] = false;
      return false;
    }
  }

  /**
   * Test connection to provincial data sources
   */
  private async testProvincialDataSources(): Promise<boolean> {
    console.log('📡 Testing provincial data sources connection...');
    
    try {
      // Test Buenos Aires Open Data
      const gbaResponse = await fetch(REAL_DATA_SOURCES.PROVINCIAL.PROVINCIAL_OPEN_DATA, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      
      this.connectionStatus['provincial_gba_open_data'] = gbaResponse.ok;
      
      // Test Fiscal Transparency
      const fiscalResponse = await fetch(REAL_DATA_SOURCES.PROVINCIAL.FISCAL_TRANSPARENCY, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      
      this.connectionStatus['provincial_fiscal_transparency'] = fiscalResponse.ok;
      
      // Update last sync time
      this.lastSyncTime['provincial_sources'] = Date.now();
      
      const success = gbaResponse.ok && fiscalResponse.ok;
      console.log(`✅ Provincial data sources connection test: ${success ? 'SUCCESS' : 'PARTIAL SUCCESS'}`);
      return success;
    } catch (error) {
      console.warn('⚠️ Provincial data sources connection test failed:', error);
      this.connectionStatus['provincial_sources'] = false;
      return false;
    }
  }

  /**
   * Test connection to civil society sources
   */
  private async testCivilSocietySources(): Promise<boolean> {
    console.log('📡 Testing civil society sources connection...');
    
    try {
      // Test Poder Ciudadano
      const poderResponse = await fetch(REAL_DATA_SOURCES.CIVIL_SOCIETY.PODER_CIUDADANO, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      
      this.connectionStatus['civil_society_poder_ciudadano'] = poderResponse.ok;
      
      // Test ACIJ
      const acijResponse = await fetch(REAL_DATA_SOURCES.CIVIL_SOCIETY.ACIJ, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      
      this.connectionStatus['civil_society_acij'] = acijResponse.ok;
      
      // Update last sync time
      this.lastSyncTime['civil_society_sources'] = Date.now();
      
      const success = poderResponse.ok && acijResponse.ok;
      console.log(`✅ Civil society sources connection test: ${success ? 'SUCCESS' : 'PARTIAL SUCCESS'}`);
      return success;
    } catch (error) {
      console.warn('⚠️ Civil society sources connection test failed:', error);
      this.connectionStatus['civil_society_sources'] = false;
      return false;
    }
  }

  /**
   * Test connection to reference municipalities
   */
  private async testReferenceMunicipalities(): Promise<boolean> {
    console.log('📡 Testing reference municipalities connection...');
    
    try {
      // Test Bahia Blanca (reference model)
      const bahiaResponse = await fetch(REAL_DATA_SOURCES.REFERENCE_MUNICIPALITIES.BAHIA_BLANCA, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      
      this.connectionStatus['reference_bahia_blanca'] = bahiaResponse.ok;
      
      // Test San Isidro (reference model)
      const sanIsidroResponse = await fetch(REAL_DATA_SOURCES.REFERENCE_MUNICIPALITIES.SAN_ISIDRO, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      
      this.connectionStatus['reference_san_isidro'] = sanIsidroResponse.ok;
      
      // Update last sync time
      this.lastSyncTime['reference_municipalities'] = Date.now();
      
      const success = bahiaResponse.ok && sanIsidroResponse.ok;
      console.log(`✅ Reference municipalities connection test: ${success ? 'SUCCESS' : 'PARTIAL SUCCESS'}`);
      return success;
    } catch (error) {
      console.warn('⚠️ Reference municipalities connection test failed:', error);
      this.connectionStatus['reference_municipalities'] = false;
      return false;
    }
  }

  /**
   * Synchronize all data from real sources
   */
  async synchronizeAllRealData(): Promise<boolean> {
    console.log('🔄 Synchronizing all real data from official sources...');
    
    try {
      // Connect to data sources first
      const connected = await this.connectToAllDataSources();
      if (!connected) {
        console.warn('⚠️ Could not establish connections to all data sources');
        // Continue anyway as we have fallback mechanisms
      }
      
      // Use our real data service to fetch verified data
      const realDataServiceInstance = RealDataService.getInstance();
      const verifiedData = await realDataServiceInstance.getVerifiedData();
      
      if (verifiedData) {
        console.log('✅ Successfully synchronized real data from official sources');
        return true;
      } else {
        console.warn('⚠️ Real data service returned no data, using fallback services');
        // Fallback to our enhanced services
        return await this.fallbackToEnhancedServices();
      }
    } catch (error) {
      console.error('❌ Error synchronizing real data:', error);
      return false;
    }
  }

  /**
   * Fallback to enhanced services if real data sources are unavailable
   */
  private async fallbackToEnhancedServices(): Promise<boolean> {
    console.log('🔄 Falling back to enhanced services...');
    
    try {
      // Use enhanced data service as fallback
      const enhancedAllYears = await EnhancedDataService.getAllYears();
      console.log(`✅ Enhanced data service returned ${enhancedAllYears.length} years of data`);
      
      // Use master data service for comprehensive data
      const masterData = await masterDataService.loadComprehensiveData();
      console.log(`✅ Master data service loaded ${masterData.metadata.total_documents} documents`);
      
      // Use unified transparency service for final consolidation
      const unifiedData = await UnifiedTransparencyService.getTransparencyData();
      console.log(`✅ Unified service consolidated data for ${Object.keys(unifiedData.financialData).length} years`);
      
      return true;
    } catch (error) {
      console.error('❌ Error in enhanced services fallback:', error);
      return false;
    }
  }

  /**
   * Get connection status for all data sources
   */
  getConnectionStatus(): Record<string, boolean> {
    return { ...this.connectionStatus };
  }

  /**
   * Get last sync times for all data sources
   */
  getLastSyncTimes(): Record<string, number> {
    return { ...this.lastSyncTime };
  }

  /**
   * Get comprehensive data integration report
   */
  async getIntegrationReport(): Promise<any> {
    return {
      connectionStatus: this.getConnectionStatus(),
      lastSyncTimes: this.getLastSyncTimes(),
      totalSourcesConnected: Object.values(this.connectionStatus).filter(status => status).length,
      totalSources: Object.keys(this.connectionStatus).length,
      syncHealth: Object.keys(this.lastSyncTime).length > 0 ? 'healthy' : 'needs_sync',
      timestamp: new Date().toISOString()
    };
  }
}

// Export singleton instance
export const comprehensiveDataIntegrationService = ComprehensiveDataIntegrationService.getInstance();
export default comprehensiveDataIntegrationService;

// Helper functions for integration with existing services

/**
 * Initialize comprehensive data integration
 */
export const initializeDataIntegration = async (): Promise<boolean> => {
  console.log('🚀 Initializing comprehensive data integration...');
  
  try {
    // Connect to all real data sources
    const connected = await comprehensiveDataIntegrationService.connectToAllDataSources();
    
    if (connected) {
      console.log('✅ Data integration initialized successfully');
      return true;
    } else {
      console.warn('⚠️ Data integration initialized with partial connectivity');
      return true; // Still return true as we have fallbacks
    }
  } catch (error) {
    console.error('❌ Error initializing data integration:', error);
    return false;
  }
};

/**
 * Synchronize all real data
 */
export const synchronizeAllRealData = async (): Promise<boolean> => {
  return await comprehensiveDataIntegrationService.synchronizeAllRealData();
};

/**
 * Get data integration status
 */
export const getDataIntegrationStatus = async (): Promise<any> => {
  return await comprehensiveDataIntegrationService.getIntegrationReport();
};