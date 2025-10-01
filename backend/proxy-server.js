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
const PORT = process.env.PORT || 3001;

// Cache configuration: 5 minutes for API calls, 30 minutes for scraped data
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

// Middleware
app.use(cors({
  origin: ['http://localhost:5176', 'http://localhost:5173', 'https://cda-transparencia.org'],
  credentials: true
}));
app.use(express.json());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
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
    const cacheKey = 'carmen_official';
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    const response = await axios.get('https://carmendeareco.gob.ar', {
      timeout: 10000,
      headers: { 'User-Agent': 'Carmen-Transparency-Portal/1.0' }
    });

    const $ = cheerio.load(response.data);

    // Extract relevant data
    const data = {
      title: $('title').text(),
      announcements: [],
      news: [],
      documents: []
    };

    // Extract announcements
    $('.announcement, .notice, .comunicado').each((i, elem) => {
      data.announcements.push({
        title: $(elem).find('h2, h3, .title').text().trim(),
        content: $(elem).find('p, .content').text().trim(),
        date: $(elem).find('.date, time').text().trim()
      });
    });

    cache.set(cacheKey, data, 1800); // 30 minutes
    res.json({ success: true, data, cached: false });

  } catch (error) {
    console.error('Error fetching Carmen official data:', error.message);
    res.status(500).json({ success: false, error: error.message });
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

    const response = await axios.get('https://www.gba.gob.ar/datos_abiertos', {
      timeout: 10000,
      headers: { 'User-Agent': 'Carmen-Transparency-Portal/1.0' }
    });

    const $ = cheerio.load(response.data);
    const datasets = [];

    $('.dataset, .data-item').each((i, elem) => {
      datasets.push({
        title: $(elem).find('h2, h3, .title').text().trim(),
        description: $(elem).find('p, .description').text().trim(),
        url: $(elem).find('a').attr('href')
      });
    });

    const data = { datasets };
    cache.set(cacheKey, data, 3600); // 1 hour
    res.json({ success: true, data, cached: false });

  } catch (error) {
    console.error('Error fetching GBA data:', error.message);
    res.status(500).json({ success: false, error: error.message });
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
  console.log(`   GET  /api/carmen/official - Carmen de Areco official site`);
  console.log(`   GET  /api/carmen/transparency - Transparency portal`);
  console.log(`   GET  /api/national/datos - datos.gob.ar API`);
  console.log(`   GET  /api/national/georef - Geographic data`);
  console.log(`   GET  /api/provincial/gba - Buenos Aires open data`);
  console.log(`   GET  /api/powerbi/extract?url=<url> - Extract PowerBI data`);
  console.log(`   POST /api/pdf/extract - Extract PDF data`);
  console.log(`   POST /api/validate - Validate data`);
  console.log(`\n⚡ Ready to proxy external data sources!\n`);
});

module.exports = app;
