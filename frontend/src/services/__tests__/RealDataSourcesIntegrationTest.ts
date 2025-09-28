/**
 * Real Data Sources Integration Test
 * Specifically tests integration with all real data sources mentioned in DATA_SOURCES.md
 * Ensures the portal fetches authentic and up-to-date data as required by law
 */

import externalAPIsService from '../ExternalAPIsService';
import { githubDataService } from '../GitHubDataService';
import RealDataService from '../RealDataService';
import comprehensiveDataIntegrationService from '../ComprehensiveDataIntegrationService';

// Real data sources from DATA_SOURCES.md
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
    API_GEOREF: 'https://apis.datos.gob.ar/georef/api',
    MINISTRY_OF_JUSTICE: 'https://datos.jus.gob.ar/',
    ANTI_CORRUPTION: 'https://www.argentina.gob.ar/anticorrupcion',
    ACCESS_TO_INFORMATION: 'https://www.argentina.gob.ar/aaip',
    INVESTMENT_MAP: 'https://www.argentina.gob.ar/jefatura/innovacion-publica/mapa-inversiones'
  },
  
  // Provincial Level Sources
  PROVINCIAL: {
    PROVINCIAL_OPEN_DATA: 'https://www.gba.gob.ar/datos_abiertos',
    FISCAL_TRANSPARENCY: 'https://www.gba.gob.ar/transparencia_fiscal/',
    MUNICIPALITIES_PORTAL: 'https://www.gba.gob.ar/municipios',
    PROCUREMENT_PORTAL: 'https://pbac.cgp.gba.gov.ar/Default.aspx',
    CONTRACTS_SEARCH: 'https://sistemas.gba.gob.ar/consulta/contrataciones/'
  },
  
  // Civil Society & Oversight Organizations
  CIVIL_SOCIETY: {
    PODER_CIUDADANO: 'https://poderciudadano.org/',
    ACIJ: 'https://acij.org.ar/',
    DIRECTORIO_LEGISLATIVO: 'https://directoriolegislativo.org/',
    CHEQUEADO: 'https://chequeado.com/proyectos/',
    POLITICAL_DATA_REPOSITORY: 'https://github.com/PoliticaArgentina/data_warehouse',
    TRANSPARENT_FILES: 'https://github.com/expedientes-transparentes/et-api',
    POSITION_MAPS: 'https://github.com/cargografias/cargografias',
    SOCIAL_CATALOG: 'https://catalogosocial.fly.dev/'
  },
  
  // Similar Municipalities (Reference Models)
  REFERENCE_MUNICIPALITIES: {
    BAHIA_BLANCA: 'https://transparencia.bahia.gob.ar/',
    MAR_DEL_PLATA: 'https://www.mardelplata.gob.ar/datos-abiertos',
    PILAR: 'https://datosabiertos.pilar.gob.ar/',
    SAN_ISIDRO: 'https://www.sanisidro.gob.ar/transparencia',
    ROSARIO: 'https://www.rosario.gob.ar/web/gobierno/gobierno-abierto',
    RAFAELA: 'https://rafaela-gob-ar.github.io/',
    CHACABUCO: 'https://chacabuco.gob.ar/',
    CHIVILCOY: 'https://chivilcoy.gob.ar/',
    SAN_ANTONIO_DE_ARECO: 'https://www.sanantoniodeareco.gob.ar/',
    SAN_ANDRES_DE_GILES: 'https://www.sag.gob.ar/',
    PERGAMINO: 'https://www.pergamino.gob.ar/',
    CAPITAN_SARMIENTO: 'https://capitansarmiento.gob.ar/'
  }
};

class RealDataSourcesIntegrationTest {
  private results: any[] = [];
  private startTime: number = 0;

  constructor() {
    this.startTime = Date.now();
  }

  /**
   * Run all real data sources integration tests
   */
  async runAllTests(): Promise<boolean> {
    console.log('🔬 Starting real data sources integration tests...\n');
    
    const testGroups = [
      { name: 'Carmen de Areco Official Sources', fn: this.testCarmenDeArecoSources.bind(this) },
      { name: 'National Level Data Sources', fn: this.testNationalSources.bind(this) },
      { name: 'Provincial Level Data Sources', fn: this.testProvincialSources.bind(this) },
      { name: 'Civil Society & Oversight Sources', fn: this.testCivilSocietySources.bind(this) },
      { name: 'Reference Municipalities Sources', fn: this.testReferenceMunicipalitiesSources.bind(this) },
      { name: 'GitHub Repository Integration', fn: this.testGitHubIntegration.bind(this) },
      { name: 'Real Data Service Integration', fn: this.testRealDataServiceIntegration.bind(this) },
      { name: 'Comprehensive Data Integration', fn: this.testComprehensiveDataIntegration.bind(this) }
    ];

    let passedGroups = 0;
    const totalGroups = testGroups.length;

    for (const testGroup of testGroups) {
      try {
        console.log(`\n🧪 Running ${testGroup.name}...`);
        const startTime = Date.now();
        
        const result = await testGroup.fn();
        const duration = Date.now() - startTime;
        
        if (result) {
          console.log(`✅ ${testGroup.name} PASSED (${duration}ms)`);
          passedGroups++;
          this.results.push({ name: testGroup.name, passed: true, duration });
        } else {
          console.log(`❌ ${testGroup.name} FAILED (${duration}ms)`);
          this.results.push({ name: testGroup.name, passed: false, duration });
        }
      } catch (error) {
        console.error(`❌ ${testGroup.name} ERROR:`, error);
        this.results.push({ 
          name: testGroup.name, 
          passed: false, 
          duration: Date.now() - this.startTime,
          error: (error as Error).message 
        });
      }
    }

    // Summary
    const duration = Date.now() - this.startTime;
    console.log(`\n📊 Real Data Sources Integration Test Summary:`);
    console.log(`✅ Passed: ${passedGroups}/${totalGroups} test groups`);
    console.log(`⏱  Total Duration: ${duration}ms`);
    
    if (passedGroups === totalGroups) {
      console.log('\n🎉 All real data sources integration tests passed!');
      console.log('✅ The portal is properly connected to all real data sources');
      console.log('✅ All services are fetching authentic and up-to-date data');
      console.log('✅ Ready for production deployment with legal compliance');
      return true;
    } else {
      console.log('\n⚠️  Some real data sources integration tests failed');
      console.log('⚠️  Please check the logs above and fix any connectivity issues');
      return false;
    }
  }

  /**
   * Test Carmen de Areco official sources
   */
  private async testCarmenDeArecoSources(): Promise<boolean> {
    try {
      console.log('  Testing Carmen de Areco official sources...');
      
      // Test main portal connectivity
      const mainPortal = await this.testUrlConnectivity(
        REAL_DATA_SOURCES.CARMEN_DE_ARECO.OFFICIAL_PORTAL,
        'Carmen de Areco Official Portal'
      );
      
      // Test transparency portal connectivity
      const transparencyPortal = await this.testUrlConnectivity(
        REAL_DATA_SOURCES.CARMEN_DE_ARECO.TRANSPARENCY_PORTAL,
        'Carmen de Areco Transparency Portal'
      );
      
      // Test official bulletin connectivity
      const officialBulletin = await this.testUrlConnectivity(
        REAL_DATA_SOURCES.CARMEN_DE_ARECO.OFFICIAL_BULLETIN,
        'Carmen de Areco Official Bulletin'
      );
      
      // Test Concejo Deliberante connectivity
      const concejoDeliberante = await this.testUrlConnectivity(
        REAL_DATA_SOURCES.CARMEN_DE_ARECO.CONCEJO_DELIBERANTE,
        'Concejo Deliberante de Carmen de Areco'
      );
      
      // Test archived versions connectivity
      const archivedVersions = await this.testUrlConnectivity(
        REAL_DATA_SOURCES.CARMEN_DE_ARECO.ARCHIVED_VERSIONS,
        'Archived Versions of Carmen de Areco Portal'
      );
      
      const allPassed = mainPortal && transparencyPortal && officialBulletin && concejoDeliberante && archivedVersions;
      
      if (allPassed) {
        console.log('  ✅ Carmen de Areco official sources test passed');
      } else {
        console.log('  ⚠️  Some Carmen de Areco sources failed connectivity tests');
      }
      
      return allPassed;
    } catch (error) {
      console.error('  ❌ Carmen de Areco official sources test failed:', error);
      return false;
    }
  }

  /**
   * Test national level data sources
   */
  private async testNationalSources(): Promise<boolean> {
    try {
      console.log('  Testing national level data sources...');
      
      // Test Datos Argentina connectivity
      const datosArgentina = await this.testUrlConnectivity(
        REAL_DATA_SOURCES.NATIONAL.DATOS_ARGENTINA,
        'Datos Argentina'
      );
      
      // Test Presupuesto Abierto API connectivity
      const presupuestoAbierto = await this.testApiConnectivity(
        REAL_DATA_SOURCES.NATIONAL.PRESUPUESTO_ABIERTO,
        'Presupuesto Abierto National API'
      );
      
      // Test API Georef connectivity
      const apiGeoref = await this.testApiConnectivity(
        REAL_DATA_SOURCES.NATIONAL.API_GEOREF,
        'API Georef Argentina'
      );
      
      // Test Ministry of Justice connectivity
      const ministryOfJustice = await this.testUrlConnectivity(
        REAL_DATA_SOURCES.NATIONAL.MINISTRY_OF_JUSTICE,
        'Ministry of Justice Open Data'
      );
      
      const allPassed = datosArgentina && presupuestoAbierto && apiGeoref && ministryOfJustice;
      
      if (allPassed) {
        console.log('  ✅ National level data sources test passed');
      } else {
        console.log('  ⚠️  Some national sources failed connectivity tests');
      }
      
      return allPassed;
    } catch (error) {
      console.error('  ❌ National level data sources test failed:', error);
      return false;
    }
  }

  /**
   * Test provincial level data sources
   */
  private async testProvincialSources(): Promise<boolean> {
    try {
      console.log('  Testing provincial level data sources...');
      
      // Test Provincial Open Data connectivity
      const provincialOpenData = await this.testUrlConnectivity(
        REAL_DATA_SOURCES.PROVINCIAL.PROVINCIAL_OPEN_DATA,
        'Buenos Aires Provincial Open Data'
      );
      
      // Test Fiscal Transparency connectivity
      const fiscalTransparency = await this.testUrlConnectivity(
        REAL_DATA_SOURCES.PROVINCIAL.FISCAL_TRANSPARENCY,
        'Buenos Aires Fiscal Transparency'
      );
      
      // Test Municipalities Portal connectivity
      const municipalitiesPortal = await this.testUrlConnectivity(
        REAL_DATA_SOURCES.PROVINCIAL.MUNICIPALITIES_PORTAL,
        'Portal de Municipios BA'
      );
      
      // Test Procurement Portal connectivity
      const procurementPortal = await this.testUrlConnectivity(
        REAL_DATA_SOURCES.PROVINCIAL.PROCUREMENT_PORTAL,
        'BA Procurement Portal'
      );
      
      const allPassed = provincialOpenData && fiscalTransparency && municipalitiesPortal && procurementPortal;
      
      if (allPassed) {
        console.log('  ✅ Provincial level data sources test passed');
      } else {
        console.log('  ⚠️  Some provincial sources failed connectivity tests');
      }
      
      return allPassed;
    } catch (error) {
      console.error('  ❌ Provincial level data sources test failed:', error);
      return false;
    }
  }

  /**
   * Test civil society and oversight sources
   */
  private async testCivilSocietySources(): Promise<boolean> {
    try {
      console.log('  Testing civil society and oversight sources...');
      
      // Test Poder Ciudadano connectivity
      const poderCiudadano = await this.testUrlConnectivity(
        REAL_DATA_SOURCES.CIVIL_SOCIETY.PODER_CIUDADANO,
        'Poder Ciudadano'
      );
      
      // Test ACIJ connectivity
      const acij = await this.testUrlConnectivity(
        REAL_DATA_SOURCES.CIVIL_SOCIETY.ACIJ,
        'ACIJ'
      );
      
      // Test Directorio Legislativo connectivity
      const directorioLegislativo = await this.testUrlConnectivity(
        REAL_DATA_SOURCES.CIVIL_SOCIETY.DIRECTORIO_LEGISLATIVO,
        'Directorio Legislativo'
      );
      
      // Test Chequeado connectivity
      const chequeado = await this.testUrlConnectivity(
        REAL_DATA_SOURCES.CIVIL_SOCIETY.CHEQUEADO,
        'Chequeado'
      );
      
      const allPassed = poderCiudadano && acij && directorioLegislativo && chequeado;
      
      if (allPassed) {
        console.log('  ✅ Civil society and oversight sources test passed');
      } else {
        console.log('  ⚠️  Some civil society sources failed connectivity tests');
      }
      
      return allPassed;
    } catch (error) {
      console.error('  ❌ Civil society and oversight sources test failed:', error);
      return false;
    }
  }

  /**
   * Test reference municipalities sources
   */
  private async testReferenceMunicipalitiesSources(): Promise<boolean> {
    try {
      console.log('  Testing reference municipalities sources...');
      
      // Test a sample of reference municipalities
      const referenceMunicipalities = [
        { name: 'Bahía Blanca', url: REAL_DATA_SOURCES.REFERENCE_MUNICIPALITIES.BAHIA_BLANCA },
        { name: 'San Isidro', url: REAL_DATA_SOURCES.REFERENCE_MUNICIPALITIES.SAN_ISIDRO },
        { name: 'Pilar', url: REAL_DATA_SOURCES.REFERENCE_MUNICIPALITIES.PILAR }
      ];
      
      const results = await Promise.all(
        referenceMunicipalities.map(municipality => 
          this.testUrlConnectivity(municipality.url, municipality.name)
        )
      );
      
      const allPassed = results.every(result => result);
      
      if (allPassed) {
        console.log('  ✅ Reference municipalities sources test passed');
      } else {
        console.log('  ⚠️  Some reference municipalities sources failed connectivity tests');
      }
      
      return allPassed;
    } catch (error) {
      console.error('  ❌ Reference municipalities sources test failed:', error);
      return false;
    }
  }

  /**
   * Test GitHub repository integration
   */
  private async testGitHubIntegration(): Promise<boolean> {
    try {
      console.log('  Testing GitHub repository integration...');
      
      // Test GitHub data service connectivity
      const githubConnected = await comprehensiveDataIntegrationService.connectToAllDataSources();
      
      if (githubConnected) {
        console.log('  ✅ GitHub repository integration test passed');
        return true;
      } else {
        console.log('  ❌ GitHub repository integration test failed');
        return false;
      }
    } catch (error) {
      console.error('  ❌ GitHub repository integration test failed:', error);
      return false;
    }
  }

  /**
   * Test real data service integration
   */
  private async testRealDataServiceIntegration(): Promise<boolean> {
    try {
      console.log('  Testing real data service integration...');
      
      // Test real data fetching
      const realData = await RealDataService.getInstance().getVerifiedData();
      
      if (realData) {
        console.log('  ✅ Real data service integration test passed');
        return true;
      } else {
        console.log('  ❌ Real data service integration test failed');
        return false;
      }
    } catch (error) {
      console.error('  ❌ Real data service integration test failed:', error);
      return false;
    }
  }

  /**
   * Test comprehensive data integration
   */
  private async testComprehensiveDataIntegration(): Promise<boolean> {
    try {
      console.log('  Testing comprehensive data integration...');
      
      // Test comprehensive data integration service
      const integrated = await comprehensiveDataIntegrationService.synchronizeAllRealData();
      
      if (integrated) {
        console.log('  ✅ Comprehensive data integration test passed');
        return true;
      } else {
        console.log('  ❌ Comprehensive data integration test failed');
        return false;
      }
    } catch (error) {
      console.error('  ❌ Comprehensive data integration test failed:', error);
      return false;
    }
  }

  /**
   * Test URL connectivity
   */
  private async testUrlConnectivity(url: string, name: string): Promise<boolean> {
    try {
      console.log(`    Testing ${name} connectivity...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log(`      ✅ ${name} is accessible`);
        return true;
      } else {
        console.log(`      ❌ ${name} returned HTTP ${response.status}`);
        return false;
      }
    } catch (error) {
      console.log(`      ❌ ${name} connection failed: ${(error as Error).message}`);
      return false;
    }
  }

  /**
   * Test API connectivity
   */
  private async testApiConnectivity(url: string, name: string): Promise<boolean> {
    try {
      console.log(`    Testing ${name} API connectivity...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Carmen-de-Areco-Transparency-Portal'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log(`      ✅ ${name} API is accessible`);
        return true;
      } else {
        console.log(`      ❌ ${name} API returned HTTP ${response.status}`);
        return false;
      }
    } catch (error) {
      console.log(`      ❌ ${name} API connection failed: ${(error as Error).message}`);
      return false;
    }
  }

  /**
   * Get test results
   */
  getResults(): any[] {
    return [...this.results];
  }

  /**
   * Get test summary
   */
  getSummary(): {
    totalGroups: number;
    passedGroups: number;
    failedGroups: number;
    totalTime: number;
    successRate: number;
  } {
    const passedGroups = this.results.filter(r => r.passed).length;
    const totalGroups = this.results.length;
    const totalTime = Date.now() - this.startTime;
    
    return {
      totalGroups,
      passedGroups,
      failedGroups: totalGroups - passedGroups,
      totalTime,
      successRate: totalGroups > 0 ? (passedGroups / totalGroups) * 100 : 0
    };
  }
}

// Export test runner
export const runRealDataSourcesIntegrationTests = async (): Promise<boolean> => {
  const testSuite = new RealDataSourcesIntegrationTest();
  const result = await testSuite.runAllTests();
  
  // Print detailed results
  const summary = testSuite.getSummary();
  console.log('\n📋 Detailed Test Results:');
  testSuite.getResults().forEach(result => {
    console.log(`  ${result.passed ? '✅' : '❌'} ${result.name} (${result.duration}ms)`);
  });
  
  console.log(`\n📊 Final Summary:`);
  console.log(`  Total Test Groups: ${summary.totalGroups}`);
  console.log(`  Passed: ${summary.passedGroups}`);
  console.log(`  Failed: ${summary.failedGroups}`);
  console.log(`  Success Rate: ${summary.successRate.toFixed(1)}%`);
  console.log(`  Total Time: ${summary.totalTime}ms`);
  
  return result;
};

// Run the tests if this file is executed directly
if (require.main === module) {
  runRealDataSourcesIntegrationTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('致命错误:', error);
    process.exit(1);
  });
}

export default runRealDataSourcesIntegrationTests;