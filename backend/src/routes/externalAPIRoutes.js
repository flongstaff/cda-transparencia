const express = require('express');
const axios = require('axios');
const router = express.Router();

/**
 * GET /api/external/georef/municipios
 * Fetch municipality data from Georef API for Buenos Aires province
 */
router.get('/georef/municipios', async (req, res) => {
  try {
    const { nombre, max = 100 } = req.query;
    
    // Base query for Carmen de Areco in Buenos Aires province (ID 6)
    let url = 'https://apis.datos.gob.ar/georef/api/municipios';
    url += `?provincia=6&max=${max}`;
    
    if (nombre) {
      url += `&nombre=${encodeURIComponent(nombre)}`;
    }
    
    const response = await axios.get(url);
    
    // Filter specifically for Carmen de Areco if no specific name was requested
    let municipios = response.data.municipios;
    if (!nombre) {
      municipios = municipios.filter(m => 
        m.nombre.toLowerCase().includes('carmen') && 
        m.nombre.toLowerCase().includes('areco')
      );
    }
    
    res.json({
      success: true,
      count: municipios.length,
      municipios: municipios
    });
  } catch (error) {
    console.error('Georef API error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error fetching municipality data from Georef API',
      details: error.message
    });
  }
});

/**
 * GET /api/external/georef/provincias
 * Fetch provinces data from Georef API
 */
router.get('/georef/provincias', async (req, res) => {
  try {
    const { nombre } = req.query;
    
    let url = 'https://apis.datos.gob.ar/georef/api/provincias';
    if (nombre) {
      url += `?nombre=${encodeURIComponent(nombre)}`;
    }
    
    const response = await axios.get(url);
    
    res.json({
      success: true,
      count: response.data.provincias.length,
      provincias: response.data.provincias
    });
  } catch (error) {
    console.error('Georef Provincias API error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error fetching provinces data from Georef API',
      details: error.message
    });
  }
});

/**
 * GET /api/external/presupuesto/nacional
 * Fetch national budget data from Presupuesto Abierto API
 */
router.get('/presupuesto/nacional', async (req, res) => {
  try {
    const { jurisdiccion, periodo, provincia, max = 50 } = req.query;
    
    let url = 'https://www.presupuestoabierto.gob.ar/api/ejecucion-presupuestaria';
    
    // Build query parameters
    const params = new URLSearchParams();
    if (jurisdiccion) params.append('jurisdiccion', jurisdiccion);
    if (periodo) params.append('periodo', periodo);
    if (provincia) params.append('provincia', provincia);
    params.append('max', max);
    
    url += '?' + params.toString();
    
    // Add sample parameters if none provided to demonstrate the API
    if (!jurisdiccion && !periodo) {
      // Default to national level for current period
      url = 'https://www.presupuestoabierto.gob.ar/api/ejecucion-presupuestaria?jurisdiccion=nacion&periodo=2025&max=50';
    }
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CarmenDeArecoTransparencyBot/1.0)'
      }
    });
    
    res.json({
      success: true,
      data: response.data,
      source: 'Presupuesto Abierto API - Argentina'
    });
  } catch (error) {
    console.error('Presupuesto Abierto API error:', error.message);
    
    // Return mock data for development purposes
    if (process.env.NODE_ENV !== 'production') {
      res.json({
        success: true,
        data: {
          message: 'Using mock data for development',
          mockData: {
            total_presupuestado: 5000000000000, // 5 trillion ARS
            total_ejecutado: 4500000000000, // 4.5 trillion ARS
            porcentaje_ejecucion: 90.0,
            periodo: '2025',
            jurisdiccion: 'nacion'
          }
        },
        source: 'Development Mock Data',
        api_status: 'unavailable for testing'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Error fetching budget data from Presupuesto Abierto API',
        details: error.message
      });
    }
  }
});

/**
 * GET /api/external/presupuesto/provincial
 * Fetch provincial budget data for Buenos Aires
 */
router.get('/presupuesto/provincial', async (req, res) => {
  try {
    const { periodo, max = 50 } = req.query;

    let url = 'https://www.presupuestoabierto.gob.ar/api/ejecucion-presupuestaria';

    // Build query parameters for Buenos Aires province
    const params = new URLSearchParams();
    params.append('jurisdiccion', 'provincia');
    params.append('provincia', '6'); // Buenos Aires province code
    if (periodo) params.append('periodo', periodo);
    params.append('max', max);

    url += '?' + params.toString();

    // If no periodo specified, default to 2025
    if (!periodo) {
      url = 'https://www.presupuestoabierto.gob.ar/api/ejecucion-presupuestaria?jurisdiccion=provincia&provincia=6&periodo=2025&max=50';
    }

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CarmenDeArecoTransparencyBot/1.0)'
      }
    });

    res.json({
      success: true,
      data: response.data,
      source: 'Presupuesto Abierto API - Buenos Aires Province'
    });
  } catch (error) {
    console.error('Presupuesto Abierto Provincial API error:', error.message);

    // Return mock data for development purposes
    if (process.env.NODE_ENV !== 'production') {
      res.json({
        success: true,
        data: {
          message: 'Using mock data for development',
          mockData: {
            total_presupuestado: 1000000000000, // 1 trillion ARS
            total_ejecutado: 900000000000, // 900 billion ARS
            porcentaje_ejecucion: 90.0,
            periodo: '2025',
            jurisdiccion: 'provincia',
            provincia: 'Buenos Aires'
          }
        },
        source: 'Development Mock Data',
        api_status: 'unavailable for testing'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Error fetching provincial budget data from Presupuesto Abierto API',
        details: error.message
      });
    }
  }
});

/**
 * POST /api/external/rafam
 * Fetch RAFAM data for Carmen de Areco (jurisdiction 270)
 * RAFAM = Sistema de Registro y Administración Financiera de los Asuntos Municipales
 */
router.post('/rafam', async (req, res) => {
  try {
    const { municipalityCode = '270', year, category } = req.body;

    console.log(`[RAFAM] Fetching data for municipality ${municipalityCode}, year: ${year || 'all'}, category: ${category || 'all'}`);

    // RAFAM doesn't have a public API, so we return mock/scraped data
    // In production, this would scrape or use credentials-based access
    const mockRAFAMData = {
      municipalityCode,
      municipalityName: 'Carmen de Areco',
      province: 'Buenos Aires',
      year: year || new Date().getFullYear(),
      category: category || 'all',
      lastUpdate: new Date().toISOString(),
      data: {
        budget: {
          total_approved: 15000000,
          total_executed: 13500000,
          execution_rate: 90.0
        },
        revenue: {
          total_estimated: 15000000,
          total_collected: 14250000,
          collection_rate: 95.0
        },
        expenses_by_category: [
          { category: 'Personal', budgeted: 6000000, executed: 5850000, rate: 97.5 },
          { category: 'Bienes y Servicios', budgeted: 4500000, executed: 4050000, rate: 90.0 },
          { category: 'Transferencias', budgeted: 2500000, executed: 2250000, rate: 90.0 },
          { category: 'Inversión', budgeted: 2000000, executed: 1350000, rate: 67.5 }
        ]
      }
    };

    res.json({
      success: true,
      data: mockRAFAMData,
      source: 'RAFAM Mock Data (Development)',
      message: 'RAFAM requires credentials - using mock data for development'
    });

  } catch (error) {
    console.error('RAFAM API error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error fetching RAFAM data',
      details: error.message
    });
  }
});

/**
 * GET /api/external/bcra/principales-variables
 * Fetch main economic variables from BCRA (Banco Central de la República Argentina)
 */
router.get('/bcra/principales-variables', async (req, res) => {
  try {
    // BCRA API endpoint for main economic variables
    const url = 'https://api.bcra.gob.ar/estadisticas/v2.0/PrincipalesVariables';

    const response = await axios.get(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; CarmenDeArecoTransparencyBot/1.0)'
      },
      timeout: 10000
    });

    res.json({
      success: true,
      data: response.data,
      source: 'BCRA API - Banco Central de la República Argentina'
    });
  } catch (error) {
    console.error('BCRA API error:', error.message);

    // Return mock data
    res.json({
      success: true,
      data: {
        message: 'Using mock BCRA data',
        variables: [
          { idVariable: 1, descripcion: 'Reservas Internacionales', valor: 45000, fecha: new Date().toISOString().split('T')[0] },
          { idVariable: 4, descripcion: 'Tipo de Cambio Mayorista', valor: 1050, fecha: new Date().toISOString().split('T')[0] },
          { idVariable: 7, descripcion: 'Inflación Mensual', valor: 3.2, fecha: new Date().toISOString().split('T')[0] }
        ]
      },
      source: 'Development Mock Data',
      api_status: 'using_mock_data'
    });
  }
});

/**
 * GET /api/external/datos-argentina/datasets
 * Fetch datasets from datos.gob.ar for Carmen de Areco
 */
router.get('/datos-argentina/datasets', async (req, res) => {
  try {
    const { q = 'carmen de areco', limit = 10 } = req.query;

    const url = `https://datos.gob.ar/api/3/action/package_search?q=${encodeURIComponent(q)}&rows=${limit}`;

    const response = await axios.get(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; CarmenDeArecoTransparencyBot/1.0)'
      },
      timeout: 10000
    });

    res.json({
      success: true,
      data: response.data,
      source: 'datos.gob.ar - Portal Nacional de Datos Abiertos'
    });
  } catch (error) {
    console.error('Datos Argentina API error:', error.message);

    // Return mock data
    res.json({
      success: true,
      data: {
        result: {
          count: 0,
          results: []
        }
      },
      source: 'Development Mock Data',
      message: 'No datasets found for Carmen de Areco - using mock response'
    });
  }
});

/**
 * GET /api/external/boletinoficial
 * Fetch recent ordinances and resolutions from Boletín Oficial
 */
router.get('/boletinoficial', async (req, res) => {
  try {
    // Boletín Oficial doesn't have a public API
    // Return mock data for development
    const mockBoletinData = {
      jurisdiction: 'Carmen de Areco',
      lastUpdate: new Date().toISOString(),
      ordinances: [
        {
          number: '1234/2024',
          title: 'Presupuesto General de Gastos y Recursos - Año 2025',
          date: '2024-12-15',
          type: 'Ordenanza',
          status: 'Vigente'
        },
        {
          number: '1235/2025',
          title: 'Modificación Ordenanza Fiscal y Tributaria',
          date: '2025-01-20',
          type: 'Ordenanza',
          status: 'Vigente'
        }
      ]
    };

    res.json({
      success: true,
      data: mockBoletinData,
      source: 'Mock Boletín Oficial Data',
      message: 'Boletín Oficial requires web scraping - using mock data'
    });
  } catch (error) {
    console.error('Boletín Oficial error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error fetching Boletín Oficial data',
      details: error.message
    });
  }
});

module.exports = router;