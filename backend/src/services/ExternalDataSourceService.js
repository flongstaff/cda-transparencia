const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

/**
 * External Data Source Service
 * Handles connections to various external data sources and APIs
 */
class ExternalDataSourceService {
    constructor() {
        this.cache = new Map();
        this.cacheExpiry = 15 * 60 * 1000; // 15 minutes
        this.externalApis = {
            // National APIs
            datos_gob_ar: 'https://datos.gob.ar/api/3/action',
            georef_api: 'https://apis.datos.gob.ar/georef/api',
            presupuesto_abierto: 'https://www.presupuestoabierto.gob.ar/sici/api',
            contrataciones_abiertas: 'https://www.argentina.gob.ar/contratacionesabiertas/api',
            infoleg_api: 'http://www.infoleg.gob.ar/',
            anticorrupcion_api: 'https://www.argentina.gob.ar/anticorrupcion',
            ministry_justice_data: 'https://datos.jus.gob.ar/',
            
            // Provincial APIs
            gba_datos_abiertos: 'https://www.gba.gob.ar/municipios',
            gba_contrataciones: 'https://sistemas.gba.gob.ar/consulta/contrataciones',
            
            // Municipal URLs
            carmen_areco_official: 'https://carmendeareco.gob.ar',
            carmen_areco_transparency: 'https://carmendeareco.gob.ar/transparencia',
            carmen_areco_official_bulletin: 'https://carmendeareco.gob.ar/gobierno/boletin-oficial/',
            
            // Organization APIs
            poder_ciudadano: 'https://poderciudadano.org/',
            acij: 'https://acij.org.ar/',
            directorio_legislativo: 'https://directoriolegislativo.org/',
            
            // Transparency tools
            chequeado_data: 'https://chequeado.com/proyectos/',
            lanacion_data: 'https://www.lanacion.com.ar/data/'
        };
    }

    /**
     * Get comprehensive data from all working external sources
     */
    async getComprehensiveExternalData() {
        try {
            const cacheKey = 'comprehensive_external_data';
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheExpiry) {
                    return cached.data;
                }
            }

            const results = {
                national: await this.getNationalData(),
                provincial: await this.getProvincialData(),
                municipal: await this.getMunicipalData(),
                organizations: await this.getOrganizationData(),
                api_endpoints: await this.getApiEndpoints(),
                metadata: {
                    last_updated: new Date().toISOString(),
                    data_sources: 0
                }
            };

            // Calculate how many data sources are available
            results.metadata.data_sources = this.countAvailableDataSources(results);

            // Cache the results
            this.cache.set(cacheKey, {
                data: results,
                timestamp: Date.now()
            });

            return results;
        } catch (error) {
            console.error('Error getting comprehensive external data:', error);
            throw error;
        }
    }

    /**
     * Get national-level data
     */
    async getNationalData() {
        const nationalData = {};

        // Get national datasets from datos.gob.ar
        try {
            const nationalResponse = await axios.get(
                `${this.externalApis.datos_gob_ar}/package_search`,
                { 
                    params: { 
                        q: 'carmen de areco',
                        rows: 10 
                    },
                    timeout: 10000
                }
            );
            nationalData.datasets = nationalResponse.data;
        } catch (error) {
            console.warn('Could not fetch national datasets:', error.message);
            nationalData.datasets = {
                success: false,
                result: { count: 0, results: [] },
                error: 'Could not fetch from national datasets API'
            };
        }

        // Get geographic data from GeoRef
        try {
            const georefResponse = await axios.get(
                `${this.externalApis.georef_api}/provincias`,
                {
                    timeout: 10000
                }
            );
            nationalData.geographic = georefResponse.data;
        } catch (error) {
            console.warn('Could not fetch geographic data:', error.message);
            nationalData.geographic = {
                success: false,
                error: 'Could not fetch from geographic API'
            };
        }

        // Get InfoLEG data
        try {
            const infolegResponse = await axios.get(
                this.externalApis.infoleg_api,
                {
                    timeout: 10000
                }
            );
            nationalData.infoleg = {
                success: infolegResponse.status === 200,
                status: infolegResponse.status
            };
        } catch (error) {
            console.warn('Could not fetch InfoLEG data:', error.message);
            nationalData.infoleg = {
                success: false,
                error: 'Could not fetch from InfoLEG'
            };
        }

        return nationalData;
    }

    /**
     * Get provincial-level data
     */
    async getProvincialData() {
        const provincialData = {};

        // Get Buenos Aires provincial data
        try {
            const gbaResponse = await axios.get(
                this.externalApis.gba_datos_abiertos,
                {
                    timeout: 10000
                }
            );
            provincialData.municipalities_portal = {
                success: gbaResponse.status === 200,
                status: gbaResponse.status
            };
        } catch (error) {
            console.warn('Could not fetch provincial municipalities data:', error.message);
            provincialData.municipalities_portal = {
                success: false,
                error: 'Could not fetch from provincial municipalities portal'
            };
        }

        // Get provincial contracts data
        try {
            const contractsResponse = await axios.get(
                this.externalApis.gba_contrataciones,
                {
                    timeout: 10000
                }
            );
            provincialData.contracts = {
                success: contractsResponse.status === 200,
                status: contractsResponse.status
            };
        } catch (error) {
            console.warn('Could not fetch provincial contracts data:', error.message);
            provincialData.contracts = {
                success: false,
                error: 'Could not fetch from provincial contracts portal'
            };
        }

        return provincialData;
    }

    /**
     * Get municipal-level data
     */
    async getMunicipalData() {
        const municipalData = {};

        // Get Carmen de Areco official site
        try {
            const officialResponse = await axios.get(
                this.externalApis.carmen_areco_official,
                {
                    timeout: 10000
                }
            );
            municipalData.official_site = {
                success: officialResponse.status === 200,
                status: officialResponse.status,
                content_type: officialResponse.headers['content-type']
            };
        } catch (error) {
            console.warn('Could not fetch Carmen de Areco official site:', error.message);
            municipalData.official_site = {
                success: false,
                error: 'Could not fetch from Carmen de Areco official site'
            };
        }

        // Get Carmen de Areco transparency portal
        try {
            const transparencyResponse = await axios.get(
                this.externalApis.carmen_areco_transparency,
                {
                    timeout: 10000
                }
            );
            municipalData.transparency_portal = {
                success: transparencyResponse.status === 200,
                status: transparencyResponse.status,
                content_type: transparencyResponse.headers['content-type']
            };
        } catch (error) {
            console.warn('Could not fetch Carmen de Areco transparency portal:', error.message);
            municipalData.transparency_portal = {
                success: false,
                error: 'Could not fetch from Carmen de Areco transparency portal'
            };
        }

        // Get Carmen de Areco official bulletin
        try {
            const bulletinResponse = await axios.get(
                this.externalApis.carmen_areco_official_bulletin,
                {
                    timeout: 10000
                }
            );
            municipalData.official_bulletin = {
                success: bulletinResponse.status === 200,
                status: bulletinResponse.status,
                content_type: bulletinResponse.headers['content-type']
            };
        } catch (error) {
            console.warn('Could not fetch Carmen de Areco official bulletin:', error.message);
            municipalData.official_bulletin = {
                success: false,
                error: 'Could not fetch from Carmen de Areco official bulletin'
            };
        }

        return municipalData;
    }

    /**
     * Get data from transparency organizations
     */
    async getOrganizationData() {
        const organizationData = {};

        // Get data from Poder Ciudadano
        try {
            const poderCiudadanoResponse = await axios.get(
                this.externalApis.poder_ciudadano,
                {
                    timeout: 10000
                }
            );
            organizationData.poder_ciudadano = {
                success: poderCiudadanoResponse.status === 200,
                status: poderCiudadanoResponse.status,
                content_type: poderCiudadanoResponse.headers['content-type']
            };
        } catch (error) {
            console.warn('Could not fetch Poder Ciudadano data:', error.message);
            organizationData.poder_ciudadano = {
                success: false,
                error: 'Could not fetch from Poder Ciudadano'
            };
        }

        // Get data from ACIJ
        try {
            const acijResponse = await axios.get(
                this.externalApis.acij,
                {
                    timeout: 10000
                }
            );
            organizationData.acij = {
                success: acijResponse.status === 200,
                status: acijResponse.status,
                content_type: acijResponse.headers['content-type']
            };
        } catch (error) {
            console.warn('Could not fetch ACIJ data:', error.message);
            organizationData.acij = {
                success: false,
                error: 'Could not fetch from ACIJ'
            };
        }

        // Get data from Directorio Legislativo
        try {
            const directorioResponse = await axios.get(
                this.externalApis.directorio_legislativo,
                {
                    timeout: 10000
                }
            );
            organizationData.directorio_legislativo = {
                success: directorioResponse.status === 200,
                status: directorioResponse.status,
                content_type: directorioResponse.headers['content-type']
            };
        } catch (error) {
            console.warn('Could not fetch Directorio Legislativo data:', error.message);
            organizationData.directorio_legislativo = {
                success: false,
                error: 'Could not fetch from Directorio Legislativo'
            };
        }

        return organizationData;
    }

    /**
     * Get data from various API endpoints
     */
    async getApiEndpoints() {
        const endpointData = {};

        // Get GeoRef municipalities specifically for Carmen de Areco
        try {
            const georefResponse = await axios.get(
                `${this.externalApis.georef_api}/municipios`,
                {
                    params: {
                        provincia: 'buenos-aires',
                        nombre: 'carmen de areco'
                    },
                    timeout: 10000
                }
            );
            endpointData.georef_municipios = georefResponse.data;
        } catch (error) {
            console.warn('Could not fetch GeoRef municipalities data:', error.message);
            endpointData.georef_municipios = {
                success: false,
                error: 'Could not fetch from GeoRef municipalities API'
            };
        }

        // Get national search API with Carmen de Areco specific query
        try {
            const searchResponse = await axios.get(
                `${this.externalApis.datos_gob_ar}/package_search`,
                {
                    params: {
                        q: 'carmen de areco',
                        rows: 5
                    },
                    timeout: 10000
                }
            );
            endpointData.national_search = searchResponse.data;
        } catch (error) {
            console.warn('Could not fetch national search data:', error.message);
            endpointData.national_search = {
                success: false,
                result: { count: 0, results: [] },
                error: 'Could not fetch from national search API'
            };
        }

        return endpointData;
    }

    /**
     * Count how many data sources are available
     */
    countAvailableDataSources(data) {
        let count = 0;

        // Count national data sources
        if (data.national.datasets && data.national.datasets.success) count++;
        if (data.national.geographic && data.national.geographic.success) count++;
        if (data.national.infoleg && data.national.infoleg.success) count++;

        // Count provincial data sources
        if (data.provincial.municipalities_portal && data.provincial.municipalities_portal.success) count++;
        if (data.provincial.contracts && data.provincial.contracts.success) count++;

        // Count municipal data sources
        if (data.municipal.official_site && data.municipal.official_site.success) count++;
        if (data.municipal.transparency_portal && data.municipal.transparency_portal.success) count++;
        if (data.municipal.official_bulletin && data.municipal.official_bulletin.success) count++;

        // Count organization data sources
        if (data.organizations.poder_ciudadano && data.organizations.poder_ciudadano.success) count++;
        if (data.organizations.acij && data.organizations.acij.success) count++;
        if (data.organizations.directorio_legislativo && data.organizations.directorio_legislativo.success) count++;

        // Count API endpoint data sources
        if (data.api_endpoints.georef_municipios && data.api_endpoints.georef_municipios.success) count++;
        if (data.api_endpoints.national_search && data.api_endpoints.national_search.success) count++;

        return count;
    }

    /**
     * Get summary statistics
     */
    async getSummaryStats() {
        try {
            const comprehensiveData = await this.getComprehensiveExternalData();
            
            const stats = {
                summary: {
                    total_data_sources: comprehensiveData.metadata.data_sources,
                    last_updated: comprehensiveData.metadata.last_updated,
                    national_sources: this.countSourcesInCategory(comprehensiveData.national),
                    provincial_sources: this.countSourcesInCategory(comprehensiveData.provincial),
                    municipal_sources: this.countSourcesInCategory(comprehensiveData.municipal),
                    organization_sources: this.countSourcesInCategory(comprehensiveData.organizations),
                    api_sources: this.countSourcesInCategory(comprehensiveData.api_endpoints)
                },
                health: this.calculateHealthScore(comprehensiveData)
            };
            
            return stats;
        } catch (error) {
            console.error('Error getting summary stats:', error);
            throw error;
        }
    }

    /**
     * Count sources in a category
     */
    countSourcesInCategory(category) {
        let count = 0;
        for (const [key, value] of Object.entries(category)) {
            if (value && value.success) {
                count++;
            }
        }
        return count;
    }

    /**
     * Calculate health score for external data sources
     */
    calculateHealthScore(data) {
        const totalPossible = 15; // Total number of data sources we check
        const available = data.metadata.data_sources;
        
        return Math.round((available / totalPossible) * 100);
    }

    /**
     * Clear the cache
     */
    clearCache() {
        this.cache.clear();
        console.log('✅ External Data Source Service cache cleared');
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            cache_size: this.cache.size,
            cache_keys: Array.from(this.cache.keys()),
            cache_expiry: this.cacheExpiry
        };
    }
}

module.exports = ExternalDataSourceService;