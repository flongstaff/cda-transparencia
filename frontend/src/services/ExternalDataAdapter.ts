/**
 * EXTERNAL DATA ADAPTER
 *
 * Routes all external API calls to use cached data files.
 * This eliminates 500/404 errors and makes the app work offline.
 */

import cachedExternalDataService from './CachedExternalDataService';

// Re-export the cached service with all the same method names
export const externalAPIsService = {
  // RAFAM Data
  getRAFAMData: (code: string = '270', year?: number) =>
    cachedExternalDataService.getRAFAMData(code, year),

  // Carmen de Areco
  getCarmenDeArecoData: () =>
    cachedExternalDataService.getCarmenDeArecoData(),

  // Geographic Data
  getGeorefData: (name: string = 'Carmen de Areco') =>
    cachedExternalDataService.getGeorefData(name),

  getGeographicData: (name: string = 'Carmen de Areco') =>
    cachedExternalDataService.getGeorefData(name),

  // Economic Data
  getBCRAData: () =>
    cachedExternalDataService.getBCRAData(),

  // National Datasets
  getDatosArgentinaDatasets: (query: string = 'carmen de areco') =>
    cachedExternalDataService.getDatosArgentinaDatasets(query),

  // Municipal Bulletin
  getBoletinOficialMunicipal: () =>
    cachedExternalDataService.getBoletinOficialMunicipal(),

  // Fallback methods for compatibility - return empty/mock data
  getBuenosAiresProvincialData: async () => ({
    success: true,
    data: { datasets: [], available: false },
    source: 'gba_provincial',
    timestamp: new Date().toISOString(),
    cached: true
  }),

  getAFIPData: async (cuit: string) => ({
    success: true,
    data: { cuit, status: 'not_available' },
    source: 'afip',
    timestamp: new Date().toISOString(),
    cached: true
  }),

  getContratacionesData: async (query: string) => ({
    success: true,
    data: { contracts: [], available: false },
    source: 'contrataciones',
    timestamp: new Date().toISOString(),
    cached: true
  }),

  getBoletinOficialNacional: async (query: string) => ({
    success: true,
    data: { publications: [], available: false },
    source: 'boletin_nacional',
    timestamp: new Date().toISOString(),
    cached: true
  }),

  getBoletinOficialProvincial: async (query: string) => ({
    success: true,
    data: { publications: [], available: false },
    source: 'boletin_provincial',
    timestamp: new Date().toISOString(),
    cached: true
  }),

  getNationalBudgetData: async () => ({
    success: true,
    data: { budget: [], available: false },
    source: 'national_budget',
    timestamp: new Date().toISOString(),
    cached: true
  }),

  getAAIPTransparencyIndex: async (municipality: string) => ({
    success: true,
    data: { index: 0, available: false },
    source: 'aaip',
    timestamp: new Date().toISOString(),
    cached: true
  }),

  getInfoLEGData: async (query: string) => ({
    success: true,
    data: { legislation: [], available: false },
    source: 'infoleg',
    timestamp: new Date().toISOString(),
    cached: true
  }),

  getMinistryOfJusticeData: async (query: string) => ({
    success: true,
    data: { data: [], available: false },
    source: 'ministry_justice',
    timestamp: new Date().toISOString(),
    cached: true
  }),

  getPoderCiudadanoData: async (query: string) => ({
    success: true,
    data: { data: [], available: false },
    source: 'poder_ciudadano',
    timestamp: new Date().toISOString(),
    cached: true
  }),

  getACIJData: async (query: string) => ({
    success: true,
    data: { data: [], available: false },
    source: 'acij',
    timestamp: new Date().toISOString(),
    cached: true
  }),

  getDirectorioLegislativoData: async (query: string) => ({
    success: true,
    data: { representatives: [], available: false },
    source: 'directorio_legislativo',
    timestamp: new Date().toISOString(),
    cached: true
  })
};

export default externalAPIsService;
