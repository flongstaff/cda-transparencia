#!/usr/bin/env node
/**
 * MASTER DATA INGESTION SCRIPT
 * Carmen de Areco Transparency Portal
 *
 * Fetches ALL external data sources from 2018-2025
 * Integrates: Municipal, Provincial, National sources
 * Uses: Wayback Machine, Web scraping, APIs
 *
 * Run with: node scripts/master-data-ingestion.js
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');
const { parseBudget } = require('../backend/scripts/parse-pdf');
const { scrapeLicitaciones } = require('../backend/scripts/scrape-licitaciones');

// Configuration
const YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
const DATA_DIR = path.join(__dirname, '..', 'data');
const OUTPUT = {
  raw: path.join(DATA_DIR, 'raw'),
  structured: path.join(DATA_DIR, 'structured'),
  historical: path.join(DATA_DIR, 'historical'),
  external: path.join(DATA_DIR, 'external')
};

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}▶${colors.reset} ${msg}\n`)
};

class MasterDataIngestion {
  constructor() {
    this.results = {
      municipal: [],
      provincial: [],
      national: [],
      historical: [],
      errors: []
    };
  }

  /**
   * Initialize directories
   */
  async initDirectories() {
    log.section('Initializing directories...');

    for (const [name, dir] of Object.entries(OUTPUT)) {
      try {
        await fs.mkdir(dir, { recursive: true });
        log.success(`Created ${name} directory: ${dir}`);
      } catch (error) {
        log.error(`Failed to create ${name} directory: ${error.message}`);
      }
    }

    // Create year-based subdirectories
    for (const year of YEARS) {
      const yearDir = path.join(OUTPUT.structured, year.toString());
      await fs.mkdir(yearDir, { recursive: true });
    }
  }

  /**
   * Fetch from Wayback Machine
   */
  async fetchWaybackSnapshot(url, year) {
    try {
      log.info(`Fetching Wayback snapshot: ${url} (${year})`);

      // Wayback Machine API: closest snapshot to January 1st of the year
      const timestamp = `${year}0101000000`;
      const waybackUrl = `https://archive.org/wayback/available?url=${encodeURIComponent(url)}&timestamp=${timestamp}`;

      const response = await axios.get(waybackUrl, { timeout: 15000 });

      if (response.data.archived_snapshots?.closest) {
        const snapshot = response.data.archived_snapshots.closest;
        log.success(`Found snapshot: ${snapshot.url} (${snapshot.timestamp})`);

        return {
          url: snapshot.url,
          timestamp: snapshot.timestamp,
          available: snapshot.available,
          status: snapshot.status
        };
      } else {
        log.warning(`No Wayback snapshot found for ${url} in ${year}`);
        return null;
      }
    } catch (error) {
      log.error(`Wayback fetch failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Scrape Carmen de Areco Historical Data
   */
  async scrapeCarmenHistorical() {
    log.section('Scraping Carmen de Areco Historical Data (2018-2025)');

    const sources = [
      { name: 'Transparency Portal', url: 'https://carmendeareco.gob.ar/transparencia' },
      { name: 'Licitaciones', url: 'https://carmendeareco.gob.ar/transparencia/licitaciones' },
      { name: 'Boletín Oficial', url: 'https://carmendeareco.gob.ar/boletin-oficial/' }
    ];

    for (const source of sources) {
      for (const year of YEARS) {
        const snapshot = await this.fetchWaybackSnapshot(source.url, year);

        if (snapshot && snapshot.available) {
          try {
            // Fetch the archived page
            const response = await axios.get(snapshot.url, { timeout: 20000 });
            const $ = cheerio.load(response.data);

            // Extract all PDFs
            const pdfs = [];
            $('a[href$=".pdf"], a[href*="pdf"]').each((i, elem) => {
              const href = $(elem).attr('href');
              const text = $(elem).text().trim();

              if (href) {
                pdfs.push({
                  title: text,
                  url: href.startsWith('http') ? href : `https://carmendeareco.gob.ar${href}`,
                  year: year,
                  source: source.name,
                  snapshotDate: snapshot.timestamp
                });
              }
            });

            // Save historical data
            const filename = `${source.name.toLowerCase().replace(/ /g, '_')}_${year}.json`;
            const filepath = path.join(OUTPUT.historical, filename);
            await fs.writeFile(filepath, JSON.stringify({
              source: source.name,
              year: year,
              snapshotUrl: snapshot.url,
              snapshotTimestamp: snapshot.timestamp,
              pdfs: pdfs,
              extractedAt: new Date().toISOString()
            }, null, 2));

            log.success(`Saved ${source.name} ${year}: ${pdfs.length} PDFs found`);
            this.results.historical.push({ source: source.name, year, count: pdfs.length });

          } catch (error) {
            log.error(`Failed to process ${source.name} ${year}: ${error.message}`);
            this.results.errors.push({ source: source.name, year, error: error.message });
          }
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  /**
   * Download current 2025 budget
   */
  async download2025Budget() {
    log.section('Downloading 2025 Budget PDF');

    const budgetUrl = 'https://carmendeareco.gob.ar/wp-content/uploads/2025/02/PRESUPUESTO-2025-APROBADO-ORD-3280-24.pdf';
    const outputPath = path.join(OUTPUT.raw, 'budget-2025.pdf');

    try {
      log.info(`Downloading from: ${budgetUrl}`);

      const response = await axios.get(budgetUrl, {
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      await fs.writeFile(outputPath, response.data);
      log.success(`Downloaded budget: ${(response.data.length / 1024 / 1024).toFixed(2)} MB`);

      // Parse it immediately
      log.info('Parsing budget PDF...');
      const parsed = await parseBudget(outputPath);
      log.success(`Parsed budget: ${parsed.numPages} pages, ${parsed.extractedNumbers.length} numbers`);

      this.results.municipal.push({
        type: 'budget',
        year: 2025,
        size: response.data.length,
        parsed: true
      });

      return true;
    } catch (error) {
      log.error(`Budget download failed: ${error.message}`);
      this.results.errors.push({ type: 'budget', error: error.message });
      return false;
    }
  }

  /**
   * Scrape current licitaciones
   */
  async scrapeCurrentLicitaciones() {
    log.section('Scraping Current Licitaciones');

    try {
      const tenders = await scrapeLicitaciones();
      log.success(`Scraped ${tenders.length} licitaciones`);

      this.results.municipal.push({
        type: 'licitaciones',
        year: 2025,
        count: tenders.length
      });

      return tenders;
    } catch (error) {
      log.error(`Licitaciones scraping failed: ${error.message}`);
      this.results.errors.push({ type: 'licitaciones', error: error.message });
      return [];
    }
  }

  /**
   * Fetch RAFAM data for all years
   */
  async fetchRAFAMAllYears() {
    log.section('Fetching RAFAM Data (2018-2025)');

    const municipalityCode = '270'; // Carmen de Areco

    for (const year of YEARS) {
      try {
        log.info(`Fetching RAFAM data for ${year}...`);

        // Note: RAFAM might not have an API, this is a placeholder
        // You would need to scrape or use their actual data access method
        const rafamData = {
          municipality: 'Carmen de Areco',
          code: municipalityCode,
          year: year,
          note: 'RAFAM data requires web scraping or official data request',
          fetchedAt: new Date().toISOString()
        };

        const filename = `rafam_${year}.json`;
        const filepath = path.join(OUTPUT.external, filename);
        await fs.writeFile(filepath, JSON.stringify(rafamData, null, 2));

        log.success(`Saved RAFAM placeholder for ${year}`);
        this.results.provincial.push({ source: 'RAFAM', year });

      } catch (error) {
        log.error(`RAFAM fetch failed for ${year}: ${error.message}`);
        this.results.errors.push({ source: 'RAFAM', year, error: error.message });
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  /**
   * Fetch Georef data
   */
  async fetchGeoref() {
    log.section('Fetching Georef Geographic Data');

    try {
      const response = await axios.get('https://apis.datos.gob.ar/georef/api/municipios', {
        params: {
          provincia: 'Buenos Aires',
          nombre: 'Carmen de Areco',
          max: 1
        },
        timeout: 10000
      });

      if (response.data.municipios && response.data.municipios.length > 0) {
        const municipio = response.data.municipios[0];

        const georefData = {
          id: municipio.id,
          nombre: municipio.nombre,
          provincia: municipio.provincia,
          centroide: municipio.centroide,
          categoria: municipio.categoria,
          fetchedAt: new Date().toISOString()
        };

        const filepath = path.join(OUTPUT.external, 'georef_carmen_de_areco.json');
        await fs.writeFile(filepath, JSON.stringify(georefData, null, 2));

        log.success(`Saved Georef data: ID ${municipio.id}, Coords: ${municipio.centroide.lat}, ${municipio.centroide.lon}`);
        this.results.national.push({ source: 'Georef', data: georefData });

        return georefData;
      } else {
        log.warning('No Georef data found');
        return null;
      }
    } catch (error) {
      log.error(`Georef fetch failed: ${error.message}`);
      this.results.errors.push({ source: 'Georef', error: error.message });
      return null;
    }
  }

  /**
   * Fetch Presupuesto Abierto data
   */
  async fetchPresupuestoAbierto() {
    log.section('Fetching Presupuesto Abierto (Buenos Aires)');

    for (const year of YEARS) {
      try {
        log.info(`Fetching Presupuesto Abierto for ${year}...`);

        const response = await axios.get('https://www.presupuestoabierto.gob.ar/api/ejecucion-presupuestaria', {
          params: {
            jurisdiccion: 'provincia',
            periodo: year,
            provincia: 6 // Buenos Aires
          },
          timeout: 15000
        });

        const filename = `presupuesto_abierto_${year}.json`;
        const filepath = path.join(OUTPUT.external, filename);
        await fs.writeFile(filepath, JSON.stringify({
          year: year,
          provincia: 'Buenos Aires',
          data: response.data,
          fetchedAt: new Date().toISOString()
        }, null, 2));

        log.success(`Saved Presupuesto Abierto for ${year}`);
        this.results.national.push({ source: 'Presupuesto Abierto', year });

      } catch (error) {
        log.warning(`Presupuesto Abierto ${year} not available: ${error.message}`);
        // Don't add to errors as older years might not be available
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  /**
   * Generate summary report
   */
  generateReport() {
    log.section('Data Ingestion Summary Report');

    console.log('📊 Municipal Sources:');
    this.results.municipal.forEach(item => {
      console.log(`   - ${item.type} (${item.year}): ${item.count || 'N/A'} items`);
    });

    console.log('\n🏛️  Provincial Sources:');
    this.results.provincial.forEach(item => {
      console.log(`   - ${item.source} (${item.year})`);
    });

    console.log('\n🇦🇷 National Sources:');
    this.results.national.forEach(item => {
      console.log(`   - ${item.source}`);
    });

    console.log('\n📜 Historical Sources:');
    const historicalSummary = {};
    this.results.historical.forEach(item => {
      if (!historicalSummary[item.source]) historicalSummary[item.source] = [];
      historicalSummary[item.source].push(item.year);
    });
    Object.entries(historicalSummary).forEach(([source, years]) => {
      console.log(`   - ${source}: ${years.join(', ')}`);
    });

    if (this.results.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.results.errors.forEach(err => {
        console.log(`   - ${err.source || err.type} (${err.year || 'N/A'}): ${err.error}`);
      });
    }

    console.log(`\n✅ Total Success: ${this.results.municipal.length + this.results.provincial.length + this.results.national.length + this.results.historical.length}`);
    console.log(`❌ Total Errors: ${this.results.errors.length}`);
  }

  /**
   * Save final report
   */
  async saveReport() {
    const reportPath = path.join(DATA_DIR, 'ingestion_report.json');
    await fs.writeFile(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      results: this.results,
      summary: {
        municipal: this.results.municipal.length,
        provincial: this.results.provincial.length,
        national: this.results.national.length,
        historical: this.results.historical.length,
        errors: this.results.errors.length
      }
    }, null, 2));

    log.success(`Saved report to: ${reportPath}`);
  }

  /**
   * Run complete data ingestion
   */
  async run() {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 CARMEN DE ARECO - MASTER DATA INGESTION');
    console.log('='.repeat(60) + '\n');

    try {
      await this.initDirectories();

      // Current data (2025)
      await this.download2025Budget();
      await this.scrapeCurrentLicitaciones();

      // Geographic data
      await this.fetchGeoref();

      // Provincial and National data
      await this.fetchRAFAMAllYears();
      await this.fetchPresupuestoAbierto();

      // Historical data via Wayback Machine
      await this.scrapeCarmenHistorical();

      // Generate and save report
      this.generateReport();
      await this.saveReport();

      console.log('\n' + '='.repeat(60));
      log.success('DATA INGESTION COMPLETE!');
      console.log('='.repeat(60) + '\n');

    } catch (error) {
      console.error('\n' + '='.repeat(60));
      log.error(`FATAL ERROR: ${error.message}`);
      console.error('='.repeat(60) + '\n');
      process.exit(1);
    }
  }
}

// Run if executed directly
if (require.main === module) {
  const ingestion = new MasterDataIngestion();
  ingestion.run().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = MasterDataIngestion;
