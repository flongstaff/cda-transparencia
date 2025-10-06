const express = require('express');
const router = express.Router();
const axios = require('axios');
const ExternalDataSourceService = require('../services/ExternalDataSourceService');

// Initialize the external data source service
const externalDataService = new ExternalDataSourceService();

// Get comprehensive external data from all sources
router.get('/comprehensive', async (req, res) => {
  try {
    const data = await externalDataService.getComprehensiveExternalData();
    
    res.json({
      success: true,
      data: data,
      responseTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ External data comprehensive fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      responseTime: new Date().toISOString()
    });
  }
});

// Get national-level data
router.get('/national', async (req, res) => {
  try {
    const nationalData = await externalDataService.getNationalData();
    
    res.json({
      success: true,
      data: nationalData,
      source: 'national',
      responseTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ External data national fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      source: 'national',
      responseTime: new Date().toISOString()
    });
  }
});

// Get provincial-level data
router.get('/provincial', async (req, res) => {
  try {
    const provincialData = await externalDataService.getProvincialData();
    
    res.json({
      success: true,
      data: provincialData,
      source: 'provincial',
      responseTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ External data provincial fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      source: 'provincial',
      responseTime: new Date().toISOString()
    });
  }
});

// Get municipal-level data
router.get('/municipal', async (req, res) => {
  try {
    const municipalData = await externalDataService.getMunicipalData();
    
    res.json({
      success: true,
      data: municipalData,
      source: 'municipal',
      responseTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ External data municipal fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      source: 'municipal',
      responseTime: new Date().toISOString()
    });
  }
});

// Get organization-level data
router.get('/organizations', async (req, res) => {
  try {
    const organizationData = await externalDataService.getOrganizationData();
    
    res.json({
      success: true,
      data: organizationData,
      source: 'organizations',
      responseTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ External data organizations fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      source: 'organizations',
      responseTime: new Date().toISOString()
    });
  }
});

// Get API endpoints data
router.get('/api-endpoints', async (req, res) => {
  try {
    const endpointData = await externalDataService.getApiEndpoints();
    
    res.json({
      success: true,
      data: endpointData,
      source: 'api-endpoints',
      responseTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ External data API endpoints fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      source: 'api-endpoints',
      responseTime: new Date().toISOString()
    });
  }
});

// Get SSPRE Presupuesto Administración Pública Nacional dataset
router.get('/sspre-presupuesto', async (req, res) => {
  try {
    const endpointData = await externalDataService.getApiEndpoints();
    const sspreData = endpointData.sspre_presupuesto;
    
    res.json({
      success: true,
      data: sspreData,
      source: 'sspre-presupuesto',
      responseTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ SSPRE Presupuesto fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      source: 'sspre-presupuesto',
      responseTime: new Date().toISOString()
    });
  }
});

// Get specific national datasets
router.get('/national-datasets', async (req, res) => {
  try {
    const endpointData = await externalDataService.getApiEndpoints();
    const nationalData = endpointData.national_datasets;
    
    res.json({
      success: true,
      data: nationalData,
      source: 'national-datasets',
      responseTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ National datasets fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      source: 'national-datasets',
      responseTime: new Date().toISOString()
    });
  }
});

// Get specific dataset by ID
router.get('/dataset/:datasetId', async (req, res) => {
  try {
    const { datasetId } = req.params;
    
    // Fetch specific dataset from datos.gob.ar
    const datasetResponse = await axios.get(
      `https://datos.gob.ar/api/3/action/package_show`,
      {
        params: { id: datasetId },
        timeout: 15000,
        headers: {
          'User-Agent': 'Carmen-Transparency-Portal/1.0',
          'Accept': 'application/json'
        }
      }
    );
    
    const dataset = datasetResponse.data.result;
    
    // Process the dataset to make it more accessible
    const processedDataset = {
      id: dataset.id,
      title: dataset.title,
      name: dataset.name,
      description: dataset.notes,
      organization: dataset.organization,
      license_title: dataset.license_title,
      metadata_created: dataset.metadata_created,
      metadata_modified: dataset.metadata_modified,
      tags: dataset.tags?.map(tag => tag.name) || [],
      groups: dataset.groups?.map(group => group.name) || [],
      resources: (dataset.resources || []).map(resource => ({
        id: resource.id,
        name: resource.name,
        title: resource.name,
        description: resource.description,
        format: resource.format,
        url: resource.url,
        created: resource.created,
        last_modified: resource.last_modified,
        size: resource.size,
        resource_type: resource.resource_type
      })),
      total_resources: dataset.resources?.length || 0,
      url: dataset.url,
      extras: dataset.extras
    };

    res.json({
      success: true,
      data: {
        dataset: processedDataset,
        last_updated: new Date().toISOString(),
        source: 'datos.gob.ar'
      },
      source: `dataset-${datasetId}`,
      responseTime: new Date().toISOString()
    });
  } catch (error) {
    console.error(`❌ Dataset ${req.params.datasetId} fetch error:`, error);
    
    // Return mock dataset data for development
    const mockDataset = {
      dataset: {
        id: req.params.datasetId,
        title: `Dataset: ${req.params.datasetId}`,
        name: req.params.datasetId,
        description: 'Mock dataset data for development',
        organization: { title: 'Mock Organization', name: 'mock-org' },
        license_title: 'Creative Commons Attribution 4.0',
        metadata_created: new Date().toISOString(),
        metadata_modified: new Date().toISOString(),
        tags: [],
        groups: [],
        resources: [],
        total_resources: 0,
        url: `https://datos.gob.ar/dataset/${req.params.datasetId}`,
        extras: []
      },
      last_updated: new Date().toISOString(),
      source: 'datos.gob.ar (Mock)'
    };
    
    res.json({
      success: true,
      data: mockDataset,
      source: `dataset-${datasetId}-mock`,
      responseTime: new Date().toISOString()
    });
  }
});

// Search datasets by query
router.get('/search-datasets', async (req, res) => {
  try {
    const { q = '', limit = 20, organization } = req.query;
    
    // Search datasets on datos.gob.ar
    const searchUrl = 'https://datos.gob.ar/api/3/action/package_search';
    const params = new URLSearchParams();
    
    if (q) params.append('q', q);
    params.append('rows', limit);
    
    if (organization) {
      params.append('fq', `organization:${organization}`);
    }
    
    const response = await axios.get(`${searchUrl}?${params.toString()}`, {
      timeout: 20000,
      headers: {
        'User-Agent': 'Carmen-Transparency-Portal/1.0',
        'Accept': 'application/json'
      }
    });

    // Process the response to extract relevant information
    const datasets = response.data.result?.results || [];
    const processedDatasets = datasets.map(dataset => ({
      id: dataset.id,
      title: dataset.title,
      name: dataset.name,
      description: dataset.notes,
      organization: dataset.organization?.name,
      tags: dataset.tags?.map(tag => tag.name) || [],
      resources: (dataset.resources || []).map(resource => ({
        name: resource.name,
        format: resource.format,
        url: resource.url
      })) || [],
      last_updated: dataset.metadata_modified,
      created: dataset.metadata_created
    }));

    const data = {
      query: q,
      organization: organization || 'all',
      total_count: response.data.result?.count || 0,
      datasets: processedDatasets,
      limit: parseInt(limit),
      last_updated: new Date().toISOString()
    };

    res.json({
      success: true,
      data,
      source: 'datos-gob-ar-search',
      responseTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Dataset search error:', error.message);
    
    // Return mock search results
    const mockData = {
      query: req.query.q || '',
      organization: req.query.organization || 'all',
      total_count: 0,
      datasets: [],
      limit: parseInt(req.query.limit) || 20,
      message: 'API temporarily unavailable, serving mock data for development',
      last_updated: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: mockData,
      source: 'datos-gob-ar-search-mock',
      responseTime: new Date().toISOString()
    });
  }
});

// Get summary statistics
router.get('/summary', async (req, res) => {
  try {
    const stats = await externalDataService.getSummaryStats();
    
    res.json({
      success: true,
      data: stats,
      responseTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ External data summary fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      responseTime: new Date().toISOString()
    });
  }
});

// Health check for external data sources
router.get('/health', async (req, res) => {
  try {
    const stats = await externalDataService.getSummaryStats();
    
    res.json({
      success: true,
      health: {
        status: stats.health >= 70 ? 'good' : stats.health >= 40 ? 'fair' : 'poor',
        score: stats.health,
        available_sources: stats.summary.total_data_sources,
        total_possible_sources: 15
      },
      responseTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ External data health check error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      responseTime: new Date().toISOString()
    });
  }
});

// Clear cache endpoint
router.post('/clear-cache', (req, res) => {
  try {
    externalDataService.clearCache();
    
    res.json({
      success: true,
      message: 'External data service cache cleared',
      responseTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ External data cache clear error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      responseTime: new Date().toISOString()
    });
  }
});

// Get cache statistics
router.get('/cache-stats', (req, res) => {
  try {
    const cacheStats = externalDataService.getCacheStats();
    
    res.json({
      success: true,
      data: cacheStats,
      responseTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ External data cache stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      responseTime: new Date().toISOString()
    });
  }
});

module.exports = router;