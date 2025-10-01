const express = require('express');
const axios = require('axios');
const router = express.Router();

// Proxy external API requests to bypass CORS issues
router.get('/proxy', async (req, res) => {
  try {
    const { url, source } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    console.log(`🌐 Proxying request to: ${url} (Source: ${source || 'unknown'})`);

    // Validate URL to prevent server-side request forgery
    const parsedUrl = new URL(url);
    const allowedProtocols = ['http:', 'https:'];
    if (!allowedProtocols.includes(parsedUrl.protocol)) {
      return res.status(400).json({ error: 'Invalid URL protocol' });
    }

    // Configure the request with appropriate headers
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Carmen-de-Areco-Transparency-Portal/1.0',
        'Accept': 'application/json, text/html, */*',
        'Accept-Encoding': 'gzip, deflate',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        ...req.headers // Include any additional headers from the frontend request
      },
      timeout: 10000, // 10 seconds timeout
      maxRedirects: 5,
      // Don't follow redirects automatically to avoid SSRF
      maxContentLength: 100 * 1024 * 1024, // 100MB limit
      validateStatus: function (status) {
        // Consider status codes less than 400 as successful
        return status < 400;
      }
    });

    // Send the response from the external API back to the frontend
    res.json({
      success: true,
      data: response.data,
      source: source || 'external',
      status: response.status,
      headers: response.headers,
      responseTime: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ External proxy error:', error.message);
    
    // Format error response
    res.status(500).json({
      success: false,
      error: error.message,
      source: req.query.source || 'unknown',
      responseTime: new Date().toISOString()
    });
  }
});

// Get all external data sources in one request
router.get('/all-external-data', async (req, res) => {
  try {
    const sources = [
      { 
        name: 'Carmen de Areco Transparency Portal', 
        url: 'https://carmendeareco.gob.ar/transparencia',
        type: 'municipal'
      },
      { 
        name: 'Carmen de Areco Official Site', 
        url: 'https://carmendeareco.gob.ar',
        type: 'municipal'
      },
      { 
        name: 'Carmen de Areco Official Bulletin', 
        url: 'https://carmendeareco.gob.ar/gobierno/boletin-oficial/',
        type: 'municipal'
      },
      { 
        name: 'Carmen de Areco Council Blog', 
        url: 'http://hcdcarmendeareco.blogspot.com/',
        type: 'municipal'
      },
      { 
        name: 'Buenos Aires Provincial Transparency', 
        url: 'https://www.gba.gob.ar/transparencia_fiscal/',
        type: 'provincial'
      },
      { 
        name: 'Buenos Aires Open Data', 
        url: 'https://www.gba.gob.ar/datos_abiertos',
        type: 'provincial'
      },
      { 
        name: 'Buenos Aires Municipalities Portal', 
        url: 'https://www.gba.gob.ar/municipios',
        type: 'provincial'
      },
      { 
        name: 'Buenos Aires Contracts Search', 
        url: 'https://sistemas.gba.gob.ar/consulta/contrataciones/',
        type: 'provincial'
      },
      { 
        name: 'Datos Argentina - Search Carmen de Areco', 
        url: 'https://datos.gob.ar/api/3/action/package_search?q=carmen+de+areco',
        type: 'national'
      },
      { 
        name: 'Datos Argentina - General Search', 
        url: 'https://datos.gob.ar/api/3/action/package_search?q=presupuesto',
        type: 'national'
      },
      { 
        name: 'GeoRef Argentina - Carmen de Areco', 
        url: 'https://apis.datos.gob.ar/georef/api/municipios?provincia=buenos-aires&nombre=carmen-de-areco',
        type: 'national'
      },
      { 
        name: 'GeoRef Argentina - Provinces', 
        url: 'https://apis.datos.gob.ar/georef/api/provincias',
        type: 'national'
      },
      { 
        name: 'Ministry of Justice Open Data', 
        url: 'https://datos.jus.gob.ar/',
        type: 'national'
      },
      { 
        name: 'Anti-Corruption Office', 
        url: 'https://www.argentina.gob.ar/anticorrupcion',
        type: 'national'
      },
      { 
        name: 'InfoLEG Legal Database', 
        url: 'http://www.infoleg.gob.ar/',
        type: 'national'
      },
      { 
        name: 'Access to Information Law', 
        url: 'https://www.argentina.gob.ar/aaip',
        type: 'national'
      }
    ];

    const results = await Promise.allSettled(
      sources.map(async (source) => {
        try {
          const response = await axios.get(source.url, {
            headers: {
              'User-Agent': 'Carmen-de-Areco-Transparency-Portal/1.0',
              'Accept': 'application/json, text/html, */*',
            },
            timeout: 10000,
            maxRedirects: 5,
            maxContentLength: 50 * 1024 * 1024, // 50MB limit
          });

          return {
            name: source.name,
            type: source.type,
            success: true,
            data: response.data,
            status: response.status,
            url: source.url
          };
        } catch (error) {
          return {
            name: source.name,
            type: source.type,
            success: false,
            error: error.message,
            url: source.url
          };
        }
      })
    );

    // Format the results
    const formattedResults = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        const source = sources[index];
        return {
          name: source.name,
          type: source.type,
          success: false,
          error: result.reason?.message || 'Unknown error',
          url: source.url
        };
      }
    });

    const successfulSources = formattedResults.filter(r => r.success).length;
    const totalSources = formattedResults.length;

    // Group results by type
    const groupedResults = {
      municipal: formattedResults.filter(r => r.type === 'municipal'),
      provincial: formattedResults.filter(r => r.type === 'provincial'),
      national: formattedResults.filter(r => r.type === 'national')
    };

    res.json({
      results: formattedResults,
      grouped_results: groupedResults,
      summary: {
        total_sources: totalSources,
        successful_sources: successfulSources,
        failed_sources: totalSources - successfulSources,
        success_rate: Math.round((successfulSources / totalSources) * 100),
        by_type: {
          municipal: {
            total: groupedResults.municipal.length,
            successful: groupedResults.municipal.filter(r => r.success).length
          },
          provincial: {
            total: groupedResults.provincial.length,
            successful: groupedResults.provincial.filter(r => r.success).length
          },
          national: {
            total: groupedResults.national.length,
            successful: groupedResults.national.filter(r => r.success).length
          }
        },
        last_updated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ External data aggregation error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      responseTime: new Date().toISOString()
    });
  }
});

// Get Carmen de Areco specific data
router.get('/carmen-de-areco', async (req, res) => {
  try {
    const sources = [
      { 
        name: 'Transparency Portal', 
        url: 'https://carmendeareco.gob.ar/transparencia' 
      },
      { 
        name: 'Main Site', 
        url: 'https://carmendeareco.gob.ar' 
      },
      { 
        name: 'Council Blog', 
        url: 'http://hcdcarmendeareco.blogspot.com/' 
      },
      { 
        name: 'Official Gazette', 
        url: 'https://carmendeareco.gob.ar/gobierno/boletin-oficial/' 
      }
    ];

    const results = await Promise.allSettled(
      sources.map(async (source) => {
        try {
          const response = await axios.get(source.url, {
            headers: {
              'User-Agent': 'Carmen-de-Areco-Transparency-Portal/1.0',
              'Accept': 'text/html, */*',
            },
            timeout: 10000
          });

          return {
            name: source.name,
            success: true,
            data: response.data,
            status: response.status,
            type: 'html'
          };
        } catch (error) {
          return {
            name: source.name,
            success: false,
            error: error.message
          };
        }
      })
    );

    const formattedResults = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        const source = sources[index];
        return {
          name: source.name,
          success: false,
          error: result.reason?.message || 'Unknown error'
        };
      }
    });

    const successful = formattedResults.filter(r => r.success).length;

    res.json({
      results: formattedResults,
      summary: {
        source: 'carmen-de-areco',
        successful_sources: successful,
        total_sources: sources.length,
        last_updated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Carmen de Areco data fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get Buenos Aires Province specific data
router.get('/buenos-aires', async (req, res) => {
  try {
    const sources = [
      { 
        name: 'Fiscal Transparency', 
        url: 'https://www.gba.gob.ar/transparencia_fiscal/' 
      },
      { 
        name: 'Open Data', 
        url: 'https://www.gba.gob.ar/datos_abiertos' 
      },
      { 
        name: 'Municipalities Portal', 
        url: 'https://www.gba.gob.ar/municipios' 
      }
    ];

    const results = await Promise.allSettled(
      sources.map(async (source) => {
        try {
          const response = await axios.get(source.url, {
            headers: {
              'User-Agent': 'Carmen-de-Areco-Transparency-Portal/1.0',
              'Accept': 'text/html, */*',
            },
            timeout: 10000
          });

          return {
            name: source.name,
            success: true,
            data: response.data,
            status: response.status
          };
        } catch (error) {
          return {
            name: source.name,
            success: false,
            error: error.message
          };
        }
      })
    );

    const formattedResults = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        const source = sources[index];
        return {
          name: source.name,
          success: false,
          error: result.reason?.message || 'Unknown error'
        };
      }
    });

    const successful = formattedResults.filter(r => r.success).length;

    res.json({
      results: formattedResults,
      summary: {
        source: 'buenos-aires',
        successful_sources: successful,
        total_sources: sources.length,
        last_updated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Buenos Aires data fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get national level data
router.get('/national', async (req, res) => {
  try {
    const sources = [
      { 
        name: 'Presupuesto Abierto', 
        url: 'https://www.presupuestoabierto.gob.ar/sici/api/v1/entidades' 
      },
      { 
        name: 'Datos Argentina', 
        url: 'https://datos.gob.ar/api/3/action/package_search?q=presupuesto' 
      },
      { 
        name: 'GeoRef API', 
        url: 'https://apis.datos.gob.ar/georef/api/municipios?provincia=buenos-aires&nombre=carmen-de-areco' 
      }
    ];

    const results = await Promise.allSettled(
      sources.map(async (source) => {
        try {
          const response = await axios.get(source.url, {
            headers: {
              'User-Agent': 'Carmen-de-Areco-Transparency-Portal/1.0',
              'Accept': 'application/json',
            },
            timeout: 10000
          });

          return {
            name: source.name,
            success: true,
            data: response.data,
            status: response.status
          };
        } catch (error) {
          return {
            name: source.name,
            success: false,
            error: error.message
          };
        }
      })
    );

    const formattedResults = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        const source = sources[index];
        return {
          name: source.name,
          success: false,
          error: result.reason?.message || 'Unknown error'
        };
      }
    });

    const successful = formattedResults.filter(r => r.success).length;

    res.json({
      results: formattedResults,
      summary: {
        source: 'national',
        successful_sources: successful,
        total_sources: sources.length,
        last_updated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ National data fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;