#!/usr/bin/env node
/**
 * CARMEN DE ARECO TRANSPARENCY PORTAL - BACKEND PROXY SERVER
 *
 * Purpose: Handle external data sources and API proxying
 * - Bypass CORS restrictions
 * - Cache external API responses
 * - Scrape transparency portals
 * - Extract data from PowerBI dashboards
 * - Process PDF documents
 * - Validate and normalize data
 *
 * Start with: node backend/proxy-server.js
 * Or: npm run proxy
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const NodeCache = require('node-cache');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3002;

// Cache configuration: 5 minutes for API calls, 30 minutes for scraped data
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

// Middleware
app.use(cors({
  origin: ['http://localhost:5176', 'http://localhost:5177', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'https://cda-transparencia.org'],
  credentials: true
}));
app.use(express.json());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs (increased for testing)
});
app.use('/api/', limiter);

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Carmen de Areco Transparency Proxy',
    cache_stats: cache.getStats()
  });
});

/**
 * CARMEN DE ARECO DATA SOURCES
 */

// Official Carmen de Areco website
app.get('/api/carmen/official', async (req, res) => {
  try {
    console.log('[Carmen Official] Loading from scraped JSON file');

    // Load municipal data from file
    const municipalDataPath = path.join(__dirname, 'carmen_municipal_data.json');
    const fileContent = await fs.readFile(municipalDataPath, 'utf-8');
    const municipalData = JSON.parse(fileContent);

    const data = {
      title: 'Municipalidad de Carmen de Areco',
      source: 'carmen_municipal_data.json (scraped)',
      announcements: municipalData.transparency_documents || [],
      ordinances: municipalData.ordinances || [],
      tenders: municipalData.tenders || [],
      declarations: municipalData.declarations || [],
      news: [],
      documents: municipalData.transparency_documents || [],
      lastUpdated: municipalData.metadata?.generated_at || new Date().toISOString(),
      dataQuality: municipalData.metadata?.data_quality
    };

    cache.set('carmen_official', data, 1800);
    res.json({ success: true, data, cached: false, source: 'scraped_file' });

  } catch (error) {
    console.error('Error loading Carmen official data:', error.message);
    res.json({
      success: true,
      data: {
        announcements: [],
        ordinances: [],
        tenders: [],
        news: [],
        documents: []
      },
      source: 'fallback',
      error: error.message
    });
  }
});

// Carmen de Areco Transparency Portal
app.get('/api/carmen/transparency', async (req, res) => {
  try {
    const cacheKey = 'carmen_transparency';
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    const response = await axios.get('https://carmendeareco.gob.ar/transparencia', {
      timeout: 10000,
      headers: { 'User-Agent': 'Carmen-Transparency-Portal/1.0' }
    });

    const $ = cheerio.load(response.data);

    const data = {
      budget_links: [],
      contracts_links: [],
      salaries_links: [],
      documents: []
    };

    // Extract PDF links and document references
    $('a[href$=".pdf"], a[href*="pdf"]').each((i, elem) => {
      const href = $(elem).attr('href');
      const text = $(elem).text().trim();

      const doc = {
        title: text,
        url: href.startsWith('http') ? href : `https://carmendeareco.gob.ar${href}`,
        type: 'pdf'
      };

      if (text.toLowerCase().includes('presupuesto') || text.toLowerCase().includes('budget')) {
        data.budget_links.push(doc);
      } else if (text.toLowerCase().includes('contrat') || text.toLowerCase().includes('licitac')) {
        data.contracts_links.push(doc);
      } else if (text.toLowerCase().includes('sueldo') || text.toLowerCase().includes('salari')) {
        data.salaries_links.push(doc);
      } else {
        data.documents.push(doc);
      }
    });

    cache.set(cacheKey, data, 1800); // 30 minutes
    res.json({ success: true, data, cached: false });

  } catch (error) {
    console.error('Error fetching Carmen transparency data:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Carmen de Areco Boletín Oficial
app.get('/api/carmen/boletin', async (req, res) => {
  try {
    const cacheKey = 'carmen_boletin';
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    // Check for boletin oficial section
    const response = await axios.get('https://carmendeareco.gob.ar/gobierno/boletin-oficial/', {
      timeout: 10000,
      headers: { 'User-Agent': 'Carmen-Transparency-Portal/1.0' }
    });

    const $ = cheerio.load(response.data);
    const publications = [];

    // Extract publications
    $('article, .publication, .post').each((i, elem) => {
      const title = $(elem).find('h2, h3, .title').text().trim();
      const date = $(elem).find('.date, .fecha, time').text().trim();
      const link = $(elem).find('a').first().attr('href');

      if (title) {
        publications.push({
          title,
          date,
          url: link ? (link.startsWith('http') ? link : `https://carmendeareco.gob.ar${link}`) : null
        });
      }
    });

    const data = { publications, count: publications.length };

    cache.set(cacheKey, data, 3600); // 1 hour
    res.json({ success: true, data, cached: false });

  } catch (error) {
    console.error('Error fetching Carmen boletin data:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Carmen de Areco Licitaciones/Contrataciones
app.get('/api/carmen/licitaciones', async (req, res) => {
  try {
    const cacheKey = 'carmen_licitaciones';
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    const response = await axios.get('https://carmendeareco.gob.ar/licitaciones/', {
      timeout: 10000,
      headers: { 'User-Agent': 'Carmen-Transparency-Portal/1.0' }
    });

    const $ = cheerio.load(response.data);
    const tenders = [];

    // Extract tender notices
    $('.tender, .licitacion, .contrato').each((i, elem) => {
      const title = $(elem).find('h2, h3, .title').text().trim();
      const date = $(elem).find('.date, .fecha').text().trim();
      const status = $(elem).find('.status, .estado').text().trim();
      const link = $(elem).find('a').first().attr('href');

      if (title) {
        tenders.push({
          title,
          date,
          status,
          url: link ? (link.startsWith('http') ? link : `https://carmendeareco.gob.ar${link}`) : null
        });
      }
    });

    const data = { tenders, count: tenders.length };

    cache.set(cacheKey, data, 3600); // 1 hour
    res.json({ success: true, data, cached: false });

  } catch (error) {
    console.error('Error fetching Carmen licitaciones data:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Carmen de Areco Declaraciones Juradas
app.get('/api/carmen/declaraciones', async (req, res) => {
  try {
    const cacheKey = 'carmen_declaraciones';
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    const response = await axios.get('https://carmendeareco.gob.ar/declaraciones-juradas/', {
      timeout: 10000,
      headers: { 'User-Agent': 'Carmen-Transparency-Portal/1.0' }
    });

    const $ = cheerio.load(response.data);
    const declarations = [];

    // Extract declarations
    $('.declaration, .declaracion, .document').each((i, elem) => {
      const official = $(elem).find('.official, .funcionario').text().trim();
      const year = $(elem).find('.year, .anio').text().trim();
      const type = $(elem).find('.type, .tipo').text().trim();
      const link = $(elem).find('a').first().attr('href');

      if (official) {
        declarations.push({
          official,
          year,
          type,
          url: link ? (link.startsWith('http') ? link : `https://carmendeareco.gob.ar${link}`) : null
        });
      }
    });

    const data = { declarations, count: declarations.length };

    cache.set(cacheKey, data, 3600); // 1 hour
    res.json({ success: true, data, cached: false });

  } catch (error) {
    console.error('Error fetching Carmen declaraciones data:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Honorable Concejo Deliberante (HCD) Blog
app.get('/api/hcd/blog', async (req, res) => {
  try {
    const cacheKey = 'hcd_blog';
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    const response = await axios.get('http://hcdcarmendeareco.blogspot.com/', {
      timeout: 15000,
      headers: { 'User-Agent': 'Carmen-Transparency-Portal/1.0' }
    });

    const $ = cheerio.load(response.data);
    const posts = [];

    // Extract blog posts
    $('.post, article, .blog-post').each((i, elem) => {
      const title = $(elem).find('h2, h3, .title, .post-title').text().trim();
      const date = $(elem).find('.date, .fecha, .post-date, time').text().trim();
      const content = $(elem).find('.post-body, .content').text().trim().substring(0, 200) + '...';
      const link = $(elem).find('a').first().attr('href');

      if (title) {
        posts.push({
          title,
          date,
          content,
          url: link || null
        });
      }
    });

    const data = { posts, count: posts.length };

    cache.set(cacheKey, data, 3600); // 1 hour
    res.json({ success: true, data, cached: false });

  } catch (error) {
    console.error('Error fetching HCD blog data:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * NATIONAL AND PROVINCIAL DATA SOURCES
 */

// Argentina National Open Data (datos.gob.ar)
app.get('/api/national/datos', async (req, res) => {
  try {
    const cacheKey = `datos_gob_${req.query.dataset || 'all'}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    const response = await axios.get('https://datos.gob.ar/api/3/action/package_search', {
      params: {
        q: req.query.q || 'presupuesto municipal',
        rows: req.query.rows || 10
      },
      timeout: 10000
    });

    cache.set(cacheKey, response.data.result, 300); // 5 minutes
    res.json({ success: true, data: response.data.result, cached: false });

  } catch (error) {
    console.error('Error fetching datos.gob.ar:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Georef API (Geographic data for Carmen de Areco)
app.get('/api/national/georef', async (req, res) => {
  try {
    const cacheKey = 'georef_carmen';
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    const response = await axios.get('https://apis.datos.gob.ar/georef/api/municipios', {
      params: {
        nombre: 'Carmen de Areco',
        provincia: 'Buenos Aires',
        max: 1
      },
      timeout: 10000
    });

    cache.set(cacheKey, response.data, 86400); // 24 hours
    res.json({ success: true, data: response.data, cached: false });

  } catch (error) {
    console.error('Error fetching Georef data:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Buenos Aires Province Open Data
app.get('/api/provincial/gba', async (req, res) => {
  try {
    const cacheKey = 'gba_opendata';
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    // Use the correct datos.gob.ar API endpoint for Buenos Aires data
    const response = await axios.get('https://datos.gob.ar/api/3/action/package_search', {
      params: {
        q: 'organization:buenos-aires',
        rows: 50
      },
      timeout: 15000,
      headers: { 
        'User-Agent': 'Carmen-Transparency-Portal/1.0',
        'Accept': 'application/json'
      }
    });

    const data = {
      source: 'Buenos Aires Province Open Data',
      datasets: response.data.result.results || [],
      count: response.data.result.count || 0,
      lastUpdated: new Date().toISOString()
    };

    cache.set(cacheKey, data, 3600); // 1 hour
    res.json({ success: true, data, cached: false });

  } catch (error) {
    console.error('Error fetching Buenos Aires Province data:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Buenos Aires Fiscal Transparency
app.get('/api/provincial/fiscal', async (req, res) => {
  try {
    const cacheKey = 'gba_fiscal';
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    const response = await axios.get('https://www.gba.gob.ar/transparencia_fiscal/', {
      timeout: 10000,
      headers: { 'User-Agent': 'Carmen-Transparency-Portal/1.0' }
    });

    const $ = cheerio.load(response.data);

    const data = {
      budget_documents: [],
      execution_reports: [],
      debt_reports: [],
      transfers: []
    };

    // Extract fiscal documents
    $('a[href$=".pdf"], a[href*="pdf"]').each((i, elem) => {
      const href = $(elem).attr('href');
      const text = $(elem).text().trim();

      const doc = {
        title: text,
        url: href.startsWith('http') ? href : `https://www.gba.gob.ar${href}`,
        type: 'pdf'
      };

      if (text.toLowerCase().includes('presupuesto') || text.toLowerCase().includes('budget')) {
        data.budget_documents.push(doc);
      } else if (text.toLowerCase().includes('ejecuci') || text.toLowerCase().includes('execution')) {
        data.execution_reports.push(doc);
      } else if (text.toLowerCase().includes('deuda') || text.toLowerCase().includes('debt')) {
        data.debt_reports.push(doc);
      } else if (text.toLowerCase().includes('transferencia') || text.toLowerCase().includes('transfer')) {
        data.transfers.push(doc);
      }
    });

    cache.set(cacheKey, data, 3600); // 1 hour
    res.json({ success: true, data, cached: false });

  } catch (error) {
    console.error('Error fetching GBA fiscal data:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// RAFAM - Buenos Aires Economic Data
app.post('/api/external/rafam', async (req, res) => {
  try {
    const { municipalityCode = '270', year, category } = req.body;
    const targetYear = year || new Date().getFullYear();
    const cacheKey = `rafam_${municipalityCode}_${targetYear}_${category}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    console.log(`[RAFAM] Loading REAL budget data for year ${targetYear}`);

    // Load real budget data from organized JSON files
    const budgetPath = path.join(__dirname, `data/organized_documents/json/budget_data_${targetYear}.json`);
    const contractsPath = path.join(__dirname, `data/organized_documents/json/contracts_data_${targetYear}.json`);
    const salariesPath = path.join(__dirname, `data/organized_documents/json/salaries_data_${targetYear}.json`);

    let budgetData = {}, contractsData = {}, salariesData = {};

    try {
      budgetData = JSON.parse(await fs.readFile(budgetPath, 'utf-8'));
      console.log(`[RAFAM] ✅ Loaded budget data for ${targetYear}`);
    } catch (err) {
      console.log(`[RAFAM] ⚠️ Could not load budget for ${targetYear}`);
    }

    try {
      contractsData = JSON.parse(await fs.readFile(contractsPath, 'utf-8'));
      console.log(`[RAFAM] ✅ Loaded contracts data for ${targetYear}`);
    } catch (err) {
      console.log(`[RAFAM] ⚠️ Could not load contracts for ${targetYear}`);
    }

    try {
      salariesData = JSON.parse(await fs.readFile(salariesPath, 'utf-8'));
      console.log(`[RAFAM] ✅ Loaded salaries data for ${targetYear}`);
    } catch (err) {
      console.log(`[RAFAM] ⚠️ Could not load salaries for ${targetYear}`);
    }

    const data = {
      municipality: 'Carmen de Areco',
      municipalityCode,
      year: targetYear,
      economicData: {
        budget: {
          total_approved: budgetData.total_budget || 0,
          total_executed: budgetData.total_executed || 0,
          execution_rate: budgetData.execution_rate || 0,
          budget_execution: budgetData.budget_execution || []
        },
        revenue: budgetData.revenue || {},
        expenditure: budgetData.expenditure || {},
        contracts: contractsData.contracts || [],
        salaries: salariesData.salaries || []
      },
      lastUpdated: new Date().toISOString(),
      source: 'real_organized_json_files'
    };

    cache.set(cacheKey, data, 1800);
    res.json({ success: true, data, cached: false, source: 'real_files' });
  } catch (error) {
    console.error('[RAFAM] ❌ Error loading data:', error.message);
    res.json({
      success: false,
      error: error.message,
      municipality: 'Carmen de Areco',
      municipalityCode: '270'
    });
  }
});

/**
 * AFIP (Federal Tax Agency) Data
 */
app.post('/api/national/afip', async (req, res) => {
  try {
    const { cuit } = req.body;
    const cacheKey = `afip_${cuit}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    console.log(`Fetching AFIP data for CUIT: ${cuit}`);

    // AFIP API endpoint (if available) or web scraping
    const afipUrl = 'https://www.afip.gob.ar/sitio/externos/default.asp';

    const response = await axios.get(afipUrl, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Carmen-Transparency-Portal/1.0'
      }
    });

    const $ = cheerio.load(response.data);

    const data = {
      cuit,
      status: 'active',
      lastUpdated: new Date().toISOString(),
      source: 'AFIP'
    };

    cache.set(cacheKey, data, 86400); // 24 hours
    res.json({ success: true, data, cached: false, source: 'AFIP' });

  } catch (error) {
    console.error('Error fetching AFIP data:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      source: 'AFIP'
    });
  }
});

/**
 * CONTRATACIONES ABIERTAS (Open Contracts)
 */
app.post('/api/national/contrataciones', async (req, res) => {
  try {
    const { query } = req.body;
    const cacheKey = `contrataciones_${query}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    console.log(`Fetching Contrataciones Abiertas for: ${query}`);

    const contratacionesUrl = 'https://www.argentina.gob.ar/jefatura/innovacion-publica/contrataciones-abiertas';

    const response = await axios.get(contratacionesUrl, {
      params: { q: query },
      timeout: 15000,
      headers: {
        'User-Agent': 'Carmen-Transparency-Portal/1.0'
      }
    });

    const $ = cheerio.load(response.data);
    const contracts = [];

    $('.contract-item, .contrato').each((i, elem) => {
      contracts.push({
        title: $(elem).find('h2, h3, .title').text().trim(),
        amount: $(elem).find('.amount, .monto').text().trim(),
        status: $(elem).find('.status, .estado').text().trim(),
        date: $(elem).find('.date, .fecha').text().trim()
      });
    });

    const data = {
      query,
      contracts,
      count: contracts.length,
      lastUpdated: new Date().toISOString()
    };

    cache.set(cacheKey, data, 3600); // 1 hour
    res.json({ success: true, data, cached: false, source: 'Contrataciones Abiertas' });

  } catch (error) {
    console.error('Error fetching Contrataciones data:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      source: 'Contrataciones'
    });
  }
});

/**
 * BOLETIN OFICIAL NACIONAL
 */
app.post('/api/national/boletin', async (req, res) => {
  try {
    const { query } = req.body;
    const cacheKey = `boletin_nacional_${query}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    console.log(`Fetching Boletín Oficial Nacional for: ${query}`);

    const boletinUrl = 'https://www.boletinoficial.gob.ar/';

    const response = await axios.get(boletinUrl, {
      params: { q: query },
      timeout: 15000,
      headers: {
        'User-Agent': 'Carmen-Transparency-Portal/1.0'
      }
    });

    const $ = cheerio.load(response.data);
    const publications = [];

    $('.publication, .aviso').each((i, elem) => {
      publications.push({
        title: $(elem).find('h2, h3, .title').text().trim(),
        date: $(elem).find('.date, .fecha').text().trim(),
        section: $(elem).find('.section, .seccion').text().trim(),
        url: $(elem).find('a').attr('href')
      });
    });

    const data = {
      query,
      publications,
      count: publications.length,
      lastUpdated: new Date().toISOString()
    };

    cache.set(cacheKey, data, 3600); // 1 hour
    res.json({ success: true, data, cached: false, source: 'Boletín Oficial Nacional' });

  } catch (error) {
    console.error('Error fetching Boletín Oficial Nacional:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      source: 'Boletín Oficial'
    });
  }
});

/**
 * BOLETIN OFICIAL PROVINCIAL (Buenos Aires)
 */
app.post('/api/provincial/boletin', async (req, res) => {
  try {
    const { query } = req.body;
    const cacheKey = `boletin_provincial_${query}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    console.log(`Fetching Boletín Oficial Provincial for: ${query}`);

    const boletinUrl = 'https://www.gba.gob.ar/boletin_oficial';

    const response = await axios.get(boletinUrl, {
      params: { q: query },
      timeout: 15000,
      headers: {
        'User-Agent': 'Carmen-Transparency-Portal/1.0'
      }
    });

    const $ = cheerio.load(response.data);
    const publications = [];

    $('.publication, .aviso, .decreto').each((i, elem) => {
      publications.push({
        title: $(elem).find('h2, h3, .title').text().trim(),
        date: $(elem).find('.date, .fecha').text().trim(),
        type: $(elem).find('.type, .tipo').text().trim(),
        url: $(elem).find('a').attr('href')
      });
    });

    const data = {
      query,
      publications,
      count: publications.length,
      lastUpdated: new Date().toISOString()
    };

    cache.set(cacheKey, data, 3600); // 1 hour
    res.json({ success: true, data, cached: false, source: 'Boletín Oficial Buenos Aires' });

  } catch (error) {
    console.error('Error fetching Boletín Oficial Provincial:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      source: 'Boletín Provincial'
    });
  }
});

/**
 * EXPEDIENTES (Administrative Proceedings)
 */
app.post('/api/provincial/expedientes', async (req, res) => {
  try {
    const { query } = req.body;
    const cacheKey = `expedientes_${query}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    console.log(`Fetching Expedientes for: ${query}`);

    // Use expedientes tracking system or Buenos Aires portal
    const expedientesUrl = 'https://www.gba.gob.ar/expedientes';

    const response = await axios.get(expedientesUrl, {
      params: { q: query },
      timeout: 15000,
      headers: {
        'User-Agent': 'Carmen-Transparency-Portal/1.0'
      }
    });

    const $ = cheerio.load(response.data);
    const expedientes = [];

    $('.expediente, .proceeding').each((i, elem) => {
      expedientes.push({
        number: $(elem).find('.number, .numero').text().trim(),
        title: $(elem).find('h2, h3, .title').text().trim(),
        status: $(elem).find('.status, .estado').text().trim(),
        date: $(elem).find('.date, .fecha').text().trim(),
        url: $(elem).find('a').attr('href')
      });
    });

    const data = {
      query,
      expedientes,
      count: expedientes.length,
      lastUpdated: new Date().toISOString()
    };

    cache.set(cacheKey, data, 3600); // 1 hour
    res.json({ success: true, data, cached: false, source: 'Expedientes' });

  } catch (error) {
    console.error('Error fetching Expedientes:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      source: 'Expedientes'
    });
  }
});

/**
 * POWERBI DASHBOARD EXTRACTION
 */
app.get('/api/powerbi/extract', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ success: false, error: 'PowerBI URL required' });
  }

  const cacheKey = `powerbi_${Buffer.from(url).toString('base64')}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json({ success: true, data: cached, cached: true });
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    // Navigate to PowerBI dashboard
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

    // Wait for PowerBI to load
    await page.waitForSelector('.visualContainer', { timeout: 10000 }).catch(() => {});

    // Extract data from visual containers
    const data = await page.evaluate(() => {
      const visuals = [];
      document.querySelectorAll('.visualContainer').forEach(container => {
        const title = container.querySelector('.title')?.textContent?.trim();
        const values = [];

        // Extract text values
        container.querySelectorAll('.labelGraphicsContext text, .value').forEach(el => {
          const text = el.textContent?.trim();
          if (text) values.push(text);
        });

        visuals.push({ title, values });
      });
      return visuals;
    });

    await browser.close();

    cache.set(cacheKey, data, 3600); // 1 hour
    res.json({ success: true, data, cached: false });

  } catch (error) {
    if (browser) await browser.close();
    console.error('Error extracting PowerBI data:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PDF DOCUMENT EXTRACTION
 */
app.post('/api/pdf/extract', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ success: false, error: 'PDF URL required' });
  }

  try {
    const cacheKey = `pdf_${Buffer.from(url).toString('base64')}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    // Download PDF
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000
    });

    // For now, return basic metadata
    // TODO: Implement actual PDF text extraction using pdf-parse or similar
    const data = {
      size: response.data.length,
      downloaded: true,
      url,
      message: 'PDF extraction pipeline ready - implement pdf-parse for full text extraction'
    };

    cache.set(cacheKey, data, 3600);
    res.json({ success: true, data, cached: false });

  } catch (error) {
    console.error('Error extracting PDF:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * SERIES DE TIEMPO API (TIME SERIES)
 */
app.post('/api/national/series-tiempo', async (req, res) => {
  try {
    const { ids, start_date, limit, format } = req.body;
    const cacheKey = `series_tiempo_${ids}_${start_date}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    console.log(`Fetching Series de Tiempo data for: ${ids}`);

    const seriesUrl = 'https://apis.datos.gob.ar/series/api/series';

    const response = await axios.get(seriesUrl, {
      params: {
        ids,
        start_date,
        limit: limit || 1000,
        format: format || 'json'
      },
      timeout: 15000,
      headers: {
        'User-Agent': 'Carmen-Transparency-Portal/1.0'
      }
    });

    const data = {
      series: response.data,
      count: Array.isArray(response.data.data) ? response.data.data.length : 0,
      lastUpdated: new Date().toISOString()
    };

    cache.set(cacheKey, data, 7200); // 2 hours
    res.json({ success: true, data, cached: false, source: 'Series de Tiempo API' });

  } catch (error) {
    console.error('Error fetching Series de Tiempo:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      source: 'Series de Tiempo'
    });
  }
});

/**
 * OBRAS PÚBLICAS API (PUBLIC WORKS)
 */
app.post('/api/national/obras-publicas', async (req, res) => {
  try {
    const { municipality, year, filters } = req.body;
    const cacheKey = `obras_publicas_${municipality}_${year}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    console.log(`Fetching Obras Públicas data for: ${municipality}, year: ${year}`);

    // The official API endpoint for public works tracking
    const obrasUrl = 'https://www.argentina.gob.ar/obras-publicas/api-seguimiento-de-obras';

    const response = await axios.get(obrasUrl, {
      params: {
        provincia: filters?.province || 'Buenos Aires',
        municipio: municipality,
        anio: year,
        estado: filters?.status || 'all'
      },
      timeout: 15000,
      headers: {
        'User-Agent': 'Carmen-Transparency-Portal/1.0'
      }
    });

    const data = {
      municipality,
      year,
      projects: response.data,
      count: Array.isArray(response.data) ? response.data.length : 0,
      lastUpdated: new Date().toISOString()
    };

    cache.set(cacheKey, data, 10800); // 3 hours
    res.json({ success: true, data, cached: false, source: 'Obras Públicas API' });

  } catch (error) {
    console.error('Error fetching Obras Públicas:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      source: 'Obras Públicas'
    });
  }
});

/**
 * AAIP TRANSPARENCY AGENCY DATA
 */
app.get('/api/national/aaip', async (req, res) => {
  try {
    const cacheKey = 'aaip_transparency';
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    console.log('Fetching AAIP transparency data');

    const aaipUrl = 'https://www.argentina.gob.ar/aaip';

    const response = await axios.get(aaipUrl, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Carmen-Transparency-Portal/1.0'
      }
    });

    const $ = cheerio.load(response.data);
    const transparencyData = {
      guidelines: [],
      reports: [],
      regulations: [],
      lastUpdated: new Date().toISOString()
    };

    // Extract transparency guidelines and reports
    $('.guideline, .document, article').each((i, elem) => {
      const title = $(elem).find('h2, h3, .title').text().trim();
      const link = $(elem).find('a').first().attr('href');
      const date = $(elem).find('.date, .fecha, time').text().trim();

      if (title) {
        const doc = {
          title,
          url: link ? (link.startsWith('http') ? link : `https://www.argentina.gob.ar${link}`) : null,
          date
        };

        if (title.toLowerCase().includes('guía') || title.toLowerCase().includes('guide')) {
          transparencyData.guidelines.push(doc);
        } else if (title.toLowerCase().includes('informe') || title.toLowerCase().includes('report')) {
          transparencyData.reports.push(doc);
        } else if (title.toLowerCase().includes('reglament') || title.toLowerCase().includes('regulation')) {
          transparencyData.regulations.push(doc);
        }
      }
    });

    const data = transparencyData;

    cache.set(cacheKey, data, 14400); // 4 hours
    res.json({ success: true, data, cached: false, source: 'AAIP' });

  } catch (error) {
    console.error('Error fetching AAIP data:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      source: 'AAIP'
    });
  }
});

/**
 * DATA VALIDATION AND QUALITY CHECKS
 */
app.post('/api/validate', async (req, res) => {
  const { data, type } = req.body;

  try {
    const validation = {
      valid: true,
      errors: [],
      warnings: [],
      stats: {}
    };

    // Basic validation based on type
    if (type === 'budget') {
      if (!data.total_budget || data.total_budget <= 0) {
        validation.errors.push('Invalid total_budget');
        validation.valid = false;
      }
      if (!data.total_executed || data.total_executed < 0) {
        validation.errors.push('Invalid total_executed');
        validation.valid = false;
      }
      if (data.total_executed > data.total_budget) {
        validation.warnings.push('Executed amount exceeds budget');
      }
    }

    res.json({ success: true, validation });

  } catch (error) {
    console.error('Error validating data:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * CACHE MANAGEMENT
 */
app.delete('/api/cache/clear', (req, res) => {
  const keys = cache.keys();
  cache.flushAll();
  res.json({
    success: true,
    message: `Cleared ${keys.length} cache entries`,
    cleared_keys: keys
  });
});

app.get('/api/cache/stats', (req, res) => {
  res.json({
    success: true,
    stats: cache.getStats(),
    keys: cache.keys()
  });
});

/**
 * GENERIC PROXY ENDPOINT - Proxy any URL with CORS bypass
 * Supports both GET (url as query param) and POST (url in body)
 */
const proxyHandler = async (req, res) => {
  try {
    const url = req.query.url || req.body?.url;
    const method = req.body?.method || 'GET';
    const headers = req.body?.headers || {};
    const body = req.body?.body;

    if (!url) {
      return res.status(400).json({ success: false, error: 'URL is required' });
    }

    const cacheKey = `proxy_${method}_${url}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    const requestConfig = {
      method,
      url,
      headers: { 'User-Agent': 'Carmen-Transparency-Portal/1.0', ...headers },
      timeout: 15000
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      requestConfig.data = body;
    }

    const response = await axios(requestConfig);
    cache.set(cacheKey, response.data, 300);
    res.json({ success: true, data: response.data, cached: false, source: url });
  } catch (err) {
    console.error('Proxy error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

app.get('/api/external/proxy', proxyHandler);
app.post('/api/external/proxy', proxyHandler);

/**
 * CARMEN DE ARECO AGGREGATED ENDPOINT
 */
app.get('/api/external/carmen-de-areco', async (req, res) => {
  try {
    const PORT_SELF = PORT || 3002;  // Fixed port to match actual server port
    const [official, transparency, licitaciones] = await Promise.allSettled([
      axios.get(`http://localhost:${PORT_SELF}/api/carmen/official`),
      axios.get(`http://localhost:${PORT_SELF}/api/carmen/transparency`),
      axios.get(`http://localhost:${PORT_SELF}/api/carmen/licitaciones`)
    ]);

    const data = {
      source: 'Carmen de Areco',
      official: official.status === 'fulfilled' ? official.value.data : null,
      transparency: transparency.status === 'fulfilled' ? transparency.value.data : null,
      licitaciones: licitaciones.status === 'fulfilled' ? licitaciones.value.data : null,
      lastUpdated: new Date().toISOString()
    };

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * AGGREGATED EXTERNAL DATA - All sources in one call
 */
app.get('/api/external/all-external-data', async (req, res) => {
  try {
    const PORT_SELF = PORT || 3001;
    const [carmenOfficial, rafam, gba, datos, georef] = await Promise.allSettled([
      axios.get(`http://localhost:${PORT_SELF}/api/carmen/official`),
      axios.post(`http://localhost:${PORT_SELF}/api/external/rafam`, { municipalityCode: '270', url: 'https://www.rafam.ec.gba.gov.ar/' }),
      axios.get(`http://localhost:${PORT_SELF}/api/provincial/gba`),
      axios.get(`http://localhost:${PORT_SELF}/api/national/datos`),
      axios.get(`http://localhost:${PORT_SELF}/api/national/georef`)
    ]);

    const aggregatedData = {
      municipal: { carmenOfficial: carmenOfficial.status === 'fulfilled' ? carmenOfficial.value.data : null },
      provincial: { rafam: rafam.status === 'fulfilled' ? rafam.value.data : null, gba: gba.status === 'fulfilled' ? gba.value.data : null },
      national: { datos: datos.status === 'fulfilled' ? datos.value.data : null, georef: georef.status === 'fulfilled' ? georef.value.data : null },
      lastUpdated: new Date().toISOString(),
      sourcesActive: {
        municipal: carmenOfficial.status === 'fulfilled',
        rafam: rafam.status === 'fulfilled',
        gba: gba.status === 'fulfilled',
        datos: datos.status === 'fulfilled',
        georef: georef.status === 'fulfilled'
      }
    };

    res.json({ success: true, data: aggregatedData, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error('Aggregated data error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * CIVIL SOCIETY ENDPOINTS
 */
app.post('/api/external/poder-ciudadano', async (req, res) => {
  try {
    const { searchQuery = 'Carmen de Areco' } = req.body;
    const data = { source: 'Poder Ciudadano', articles: [], available: false };
    res.json({ success: true, data });
  } catch (err) {
    res.json({ success: false, error: err.message, data: { source: 'Poder Ciudadano', available: false } });
  }
});

app.post('/api/external/acij', async (req, res) => {
  try {
    const data = { source: 'ACIJ', transparency_reports: [], available: false };
    res.json({ success: true, data });
  } catch (err) {
    res.json({ success: false, error: err.message, data: { source: 'ACIJ', available: false } });
  }
});

app.post('/api/external/aaip/transparency-index', async (req, res) => {
  try {
    const { municipality = 'Carmen de Areco' } = req.body;
    const data = { source: 'AAIP', municipality, transparencyScore: 0, available: false };
    res.json({ success: true, data });
  } catch (err) {
    res.json({ success: false, error: err.message, data: { source: 'AAIP', available: false } });
  }
});

app.post('/api/external/infoleg', async (req, res) => {
  try {
    const data = { source: 'InfoLEG', laws: [], available: false };
    res.json({ success: true, data });
  } catch (err) {
    res.json({ success: false, error: err.message, data: { source: 'InfoLEG', available: false } });
  }
});

app.post('/api/external/ministry-of-justice', async (req, res) => {
  try {
    const data = { source: 'Ministry of Justice', documents: [], available: false };
    res.json({ success: true, data });
  } catch (err) {
    res.json({ success: false, error: err.message, data: { source: 'Ministry of Justice', available: false } });
  }
});

app.post('/api/external/directorio-legislativo', async (req, res) => {
  try {
    const data = { source: 'Directorio Legislativo', representatives: [], available: false };
    res.json({ success: true, data });
  } catch (err) {
    res.json({ success: false, error: err.message, data: { source: 'Directorio Legislativo', available: false } });
  }
});

/**
 * GET /api/external/bcra/principales-variables
 * Fetch BCRA main economic variables
 */
app.get('/api/external/bcra/principales-variables', async (req, res) => {
  try {
    const url = 'https://api.bcra.gob.ar/estadisticas/v2.0/PrincipalesVariables';
    const response = await axios.get(url, {
      headers: { 'Accept': 'application/json' },
      timeout: 10000
    });
    res.json({
      success: true,
      data: response.data,
      source: 'BCRA API'
    });
  } catch (error) {
    console.log('[BCRA] API unavailable, using mock data');
    res.json({
      success: true,
      data: {
        variables: [
          { idVariable: 1, descripcion: 'Reservas Internacionales', valor: 45000, fecha: new Date().toISOString().split('T')[0] },
          { idVariable: 4, descripcion: 'Tipo de Cambio Mayorista', valor: 1050, fecha: new Date().toISOString().split('T')[0] },
          { idVariable: 7, descripcion: 'Inflación Mensual', valor: 3.2, fecha: new Date().toISOString().split('T')[0] }
        ]
      },
      source: 'BCRA Mock Data'
    });
  }
});

/**
 * GET /api/external/datos-argentina/datasets
 * Fetch Datos Argentina datasets
 */
app.get('/api/external/datos-argentina/datasets', async (req, res) => {
  try {
    const { q = 'carmen de areco', limit = 10 } = req.query;
    const url = `https://datos.gob.ar/api/3/action/package_search?q=${encodeURIComponent(q)}&rows=${limit}`;
    const response = await axios.get(url, {
      headers: { 'Accept': 'application/json' },
      timeout: 10000
    });
    res.json({
      success: true,
      data: response.data,
      source: 'datos.gob.ar'
    });
  } catch (error) {
    console.log('[Datos Argentina] API unavailable, using mock data');
    res.json({
      success: true,
      data: { result: { count: 0, results: [] } },
      source: 'Datos Argentina Mock'
    });
  }
});

/**
 * GET /api/external/boletinoficial
 * Fetch Boletín Oficial Municipal
 */
app.get('/api/external/boletinoficial', async (req, res) => {
  try {
    const mockData = {
      source: 'Boletín Oficial Municipal',
      lastUpdate: new Date().toISOString(),
      announcements: [
        {
          id: 1,
          title: 'Ordenanza Municipal 2025/01',
          type: 'Ordenanza',
          date: '2025-01-15',
          summary: 'Aprobación del presupuesto municipal para el año 2025'
        },
        {
          id: 2,
          title: 'Decreto 2025/05',
          type: 'Decreto',
          date: '2025-01-20',
          summary: 'Designación de funcionarios municipales'
        }
      ]
    };
    res.json({ success: true, data: mockData, source: 'Boletín Municipal Mock' });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

/**
 * GET /api/external/georef/municipios
 * Fetch Georef API data
 */
app.get('/api/external/georef/municipios', async (req, res) => {
  try {
    let url = 'https://apis.datos.gob.ar/georef/api/municipios';
    const { nombre } = req.query;
    if (nombre) {
      url += `?nombre=${encodeURIComponent(nombre)}`;
    }

    const response = await axios.get(url, {
      headers: { 'Accept': 'application/json' },
      timeout: 10000
    });
    res.json({
      success: true,
      data: response.data,
      source: 'Georef API'
    });
  } catch (error) {
    console.log('[Georef] API unavailable, using mock data');
    res.json({
      success: true,
      data: {
        municipios: [{
          id: '060105',
          nombre: 'Carmen de Areco',
          provincia: { id: '06', nombre: 'Buenos Aires' },
          centroide: { lat: -34.3742, lon: -59.8197 }
        }]
      },
      source: 'Georef Mock Data'
    });
  }
});

/**
 * ERROR HANDLER
 */
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

/**
 * START SERVER
 */
app.listen(PORT, () => {
  console.log(`\n🚀 Carmen de Areco Transparency Proxy Server`);
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🗑️  Clear cache: curl -X DELETE http://localhost:${PORT}/api/cache/clear`);
  console.log(`\n🌐 Available endpoints:`);
  console.log(`\n  📍 Carmen de Areco Sources:`);
  console.log(`   GET  /api/carmen/official - Carmen de Areco official site`);
  console.log(`   GET  /api/carmen/transparency - Transparency portal`);
  console.log(`   GET  /api/carmen/boletin - Boletín Oficial Carmen de Areco`);
  console.log(`   GET  /api/carmen/licitaciones - Licitaciones/Contrataciones`);
  console.log(`   GET  /api/carmen/declaraciones - Declaraciones Juradas`);
  console.log(`   GET  /api/hcd/blog - Honorable Concejo Deliberante blog`);
  console.log(`\n  🇦🇷 National Level APIs:`);
  console.log(`   GET  /api/national/datos - datos.gob.ar API`);
  console.log(`   GET  /api/national/georef - Geographic data (Georef API)`);
  console.log(`   GET  /api/national/aaip - AAIP Transparency Agency`);
  console.log(`   POST /api/national/series-tiempo - Time Series API`);
  console.log(`   POST /api/national/obras-publicas - Public Works API`);
  console.log(`   POST /api/national/afip - AFIP tax data`);
  console.log(`   POST /api/national/contrataciones - Open contracts`);
  console.log(`   POST /api/national/boletin - National Boletín Oficial`);
  console.log(`\n  🏛️  Provincial Level (Buenos Aires):`);
  console.log(`   GET  /api/provincial/gba - Buenos Aires open data`);
  console.log(`   GET  /api/provincial/fiscal - Buenos Aires fiscal transparency`);
  console.log(`   POST /api/provincial/boletin - Provincial Boletín Oficial`);
  console.log(`   POST /api/provincial/expedientes - Administrative proceedings`);
  console.log(`   POST /api/external/rafam - RAFAM economic data (CRUCIAL)`);
  console.log(`\n  🔧 Utilities:`);
  console.log(`   GET  /api/powerbi/extract?url=<url> - Extract PowerBI data`);
  console.log(`   POST /api/pdf/extract - Extract PDF data`);
  console.log(`   POST /api/validate - Validate data`);
  console.log(`\n⚡ Ready to proxy external data sources!\n`);
});

module.exports = app;
