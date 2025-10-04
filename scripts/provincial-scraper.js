#!/usr/bin/env node

/**
 * Buenos Aires Provincial Data Scraper
 * Extracts transparency data from various provincial sources for Carmen de Areco
 *
 * Based on verified-sources.md resources:
 * - RAFAM - Municipal Financial Data
 * - Presupuesto Abierto (Open Budget) API
 * - Buenos Aires Province Open Data
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, '../data/scraped/provincial');

// Buenos Aires Provincial URLs from verified-sources.md
const PROVINCIAL_URLS = {
  rafam: 'https://www.rafam.ec.gba.gov.ar/', // Main RAFAM portal
  rafam_carmen: 'https://www.rafam.ec.gba.gov.ar/entidad/270', // Carmen de Areco specific (municipality code 270)
  gba_transparency: 'https://datos.gba.gob.ar/', // Buenos Aires province open data
  gba_economy: 'https://economia.gob.gba.gov.ar/', // Ministry of Economy
  gba_budget: 'https://economia.gob.gba.gov.ar/hacienda/transparencia/', // Budget transparency
  gba_reports: 'https://economia.gob.gba.gov.ar/hacienda/informes-economicos/' // Economic reports
};

// Additional API endpoints
const PROVINCIAL_APIS = {
  budget_execution: 'https://economia.gob.gba.gov.ar/hacienda/transparencia/api/ejecucion-presupuestaria',
  financial_data: 'https://www.rafam.ec.gba.gov.ar/api/financial-data',
  municipality_info: 'https://apis.datos.gob.ar/georef/api/municipios?provincia=06&nombre=Carmen%20de%20Areco'
};

// Scraping statistics
const stats = {
  pagesScraped: 0,
  documentsFound: 0,
  errors: [],
  successfulScrapes: 0
};

/**
 * Scrape a provincial URL and extract structured data
 */
async function scrapePage(url, pageType) {
  console.log(`\n🏛️  Scraping Provincial: ${url}`);
  console.log(`   Type: ${pageType}`);

  try {
    const response = await axios.get(url, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Carmen-de-Areco-Transparency-Bot/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/json'
      },
      validateStatus: (status) => status < 500
    });

    stats.pagesScraped++;

    if (response.status === 200) {
      let data;
      
      // Handle different response types
      if (typeof response.data === 'object') {
        // JSON response (API)
        data = {
          pageType,
          url,
          scrapedAt: new Date().toISOString(),
          rawData: response.data,
          documents: extractDataFromJson(response.data, pageType, url)
        };
      } else {
        // HTML response
        const $ = cheerio.load(response.data);
        data = extractDataByType($, pageType, url);
      }

      if (data) {
        stats.successfulScrapes++;
        stats.documentsFound += (data.documents?.length || 0);

        // Save scraped data
        const filename = `${pageType}_${Date.now()}.json`;
        const outputPath = path.join(OUTPUT_DIR, filename);

        await fs.mkdir(OUTPUT_DIR, { recursive: true });
        await fs.writeFile(
          outputPath,
          JSON.stringify(data, null, 2),
          'utf-8'
        );

        console.log(`   ✅ Extracted ${data.documents?.length || 0} items`);
        console.log(`   💾 Saved to: ${filename}`);

        return data;
      } else {
        console.log(`   ⚠️  No data extracted`);
        return null;
      }
    } else if (response.status === 404) {
      console.log(`   ℹ️  Page not found (404) - may not exist yet`);
      stats.errors.push({ url, error: '404 Not Found' });
      return null;
    } else {
      console.log(`   ❌ HTTP ${response.status}`);
      stats.errors.push({ url, error: `HTTP ${response.status}` });
      return null;
    }
  } catch (error) {
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.log(`   ℹ️  Cannot connect (${error.code}) - URL may be incorrect`);
    } else if (error.code === 'ECONNABORTED') {
      console.log(`   ⏰ Request timeout - server not responding`);
    } else {
      console.log(`   ❌ Error: ${error.message}`);
    }

    stats.errors.push({ url, error: error.message });
    return null;
  }
}

/**
 * Extract data from JSON response
 */
function extractDataFromJson(jsonData, pageType, url) {
  const documents = [];
  
  switch (pageType) {
    case 'rafam':
    case 'rafam_carmen':
      // Extract RAFAM financial data
      if (jsonData.entities && Array.isArray(jsonData.entities)) {
        jsonData.entities.forEach(entity => {
          if (entity.code === '270' || entity.name?.includes('Carmen de Areco')) {
            documents.push({
              id: entity.code || entity.id,
              name: entity.name,
              budget: entity.budget || entity.total_budget,
              executed: entity.executed || entity.total_executed,
              execution_rate: entity.execution_rate,
              year: entity.year,
              type: 'rafam_financial_data',
              source: 'rafam'
            });
          }
        });
      }
      break;
      
    case 'municipality_info':
      // Extract geographic and basic municipality info
      if (jsonData.municipios && Array.isArray(jsonData.municipios)) {
        jsonData.municipios.forEach(mun => {
          documents.push({
            id: mun.id,
            name: mun.nombre,
            province: mun.provincia?.nombre,
            department: mun.departamento?.nombre,
            coordinates: mun.centroide || mun.coordinates,
            type: 'municipality_info',
            source: 'georef_api'
          });
        });
      }
      break;
      
    default:
      // Generic JSON data extraction
      documents.push({
        data: jsonData,
        type: 'json_data',
        source: pageType
      });
  }
  
  return documents;
}

/**
 * Extract data based on page type from HTML content
 */
function extractDataByType($, pageType, url) {
  const data = {
    pageType,
    url,
    scrapedAt: new Date().toISOString(),
    documents: []
  };

  switch (pageType) {
    case 'rafam_carmen':
    case 'rafam':
      // Extract financial data from RAFAM interface
      $('.financial-data, .budget-item, .execution-item, tr').each((i, el) => {
        const row = $(el);
        const cells = row.find('td, th');
        
        if (cells.length >= 3) { // Basic table row validation
          data.documents.push({
            period: $(cells[0]).text().trim(),
            budget: $(cells[1]).text().trim(),
            executed: $(cells[2]).text().trim(),
            execution_rate: $(cells[3]) ? $(cells[3]).text().trim() : null,
            type: 'rafam_budget_execution',
            source: 'rafam'
          });
        }
      });
      
      // Also extract any direct links to reports
      $('a[href*="pdf"], a[href*="report"], a[href*="presupuesto"]').each((i, el) => {
        const link = $(el);
        data.documents.push({
          title: link.text().trim(),
          url: link.attr('href'),
          type: 'rafam_document'
        });
      });
      break;

    case 'gba_transparency':
    case 'gba_budget':
      // Extract transparency and budget data
      $('a[href*="pdf"], a[href*="presupuesto"], a[href*="ejecucion"]').each((i, el) => {
        const link = $(el);
        data.documents.push({
          title: link.text().trim(),
          url: link.attr('href'),
          type: 'budget_document'
        });
      });
      
      $('.report, .document, .dataset').each((i, el) => {
        const item = $(el);
        data.documents.push({
          title: item.find('h2, h3, .title').first().text().trim(),
          description: item.find('p, .description').first().text().trim(),
          date: item.find('.date, time').first().text().trim(),
          link: item.find('a').attr('href'),
          type: 'transparency_report'
        });
      });
      break;

    case 'gba_reports':
      // Extract economic reports
      $('.report, .economic-report, article').each((i, el) => {
        const item = $(el);
        data.documents.push({
          title: item.find('h2, h3, .title').first().text().trim(),
          summary: item.find('p, .summary').first().text().trim(),
          date: item.find('.date, time').first().text().trim(),
          url: item.find('a').attr('href'),
          type: 'economic_report'
        });
      });
      break;

    case 'gba_economy':
      // Extract general economic information
      $('.news-item, .announcement, .press-release').each((i, el) => {
        const item = $(el);
        data.documents.push({
          title: item.find('h2, h3, .title').first().text().trim(),
          excerpt: item.find('p, .excerpt').first().text().trim(),
          date: item.find('.date, time').first().text().trim(),
          url: item.find('a').attr('href'),
          type: 'economic_news'
        });
      });
      break;
  }

  // Filter out empty documents
  data.documents = data.documents.filter(doc =>
    doc.title || doc.period || doc.name
  );

  return data;
}

/**
 * Generate mock provincial data when scraping unavailable
 */
async function generateMockProvincialData() {
  console.log('\n🧪 Generating mock provincial data...');

  const mockData = {
    metadata: {
      province: 'Buenos Aires',
      generated_at: new Date().toISOString(),
      data_quality: 'MOCK_FOR_DEVELOPMENT'
    },
    rafam_data: {
      municipality_code: '270',
      municipality: 'Carmen de Areco',
      budget_execution: [
        {
          year: 2024,
          period: 'Q3',
          budget: 150000000, // 150 million ARS
          executed: 135000000, // 135 million ARS
          execution_rate: 0.90,
          category: 'General'
        },
        {
          year: 2024,
          period: 'Q4',
          budget: 200000000, // 200 million ARS
          executed: 175000000, // 175 million ARS
          execution_rate: 0.875,
          category: 'General'
        }
      ],
      revenue: [
        {
          year: 2024,
          source: 'Coparticipación Provincial',
          amount: 80000000,
          percentage: 0.53
        },
        {
          year: 2024,
          source: 'Impuestos Municipales',
          amount: 45000000,
          percentage: 0.30
        }
      ]
    },
    provincial_budget: {
      total_budget_2024: 350000000000, // 350 billion ARS for entire province
      carmen_de_areco_allocation: 120000000, // 120 million ARS allocation
      allocation_percentage: 0.00034
    },
    economic_indicators: {
      inflation_rate: 3.2,
      provincial_gdp: 5000000000000, // 5 trillion ARS
      unemployment_rate: 7.8
    }
  };

  // Save mock data
  const outputPath = path.join(OUTPUT_DIR, 'provincial_mock_data.json');
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.writeFile(
    outputPath,
    JSON.stringify(mockData, null, 2),
    'utf-8'
  );

  console.log(`   ✅ Generated mock provincial data`);
  console.log(`   💾 Saved to: provincial_mock_data.json`);

  return mockData;
}

/**
 * Main scraping process
 */
async function main() {
  console.log('🏛️  BUENOS AIRES PROVINCIAL DATA SCRAPER');
  console.log('='.repeat(80));
  console.log('Output Directory:', OUTPUT_DIR);
  console.log();

  // Ensure output directory exists
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  // Try scraping each URL
  const scrapePromises = Object.entries(PROVINCIAL_URLS).map(async ([type, url]) => {
    await scrapePage(url, type);
    // Small delay between requests to be respectful
    await new Promise(resolve => setTimeout(resolve, 3000));
  });

  await Promise.allSettled(scrapePromises);

  // Try calling APIs as well
  console.log('\n📡 Calling Provincial APIs...');
  for (const [type, url] of Object.entries(PROVINCIAL_APIS)) {
    await scrapePage(url, type);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Smaller delay for APIs
  }

  // If scraping failed or returned minimal data, generate mock data
  if (stats.documentsFound < 10) {
    console.log('\n⚠️  Limited data from scraping, generating mock data...');
    await generateMockProvincialData();
  }

  // Print statistics
  console.log('\n' + '='.repeat(80));
  console.log('📊 PROVINCIAL SCRAPING SUMMARY');
  console.log('='.repeat(80));
  console.log(`Pages Scraped: ${stats.pagesScraped}`);
  console.log(`Successful Scrapes: ${stats.successfulScrapes}`);
  console.log(`Documents Found: ${stats.documentsFound}`);
  console.log(`Errors: ${stats.errors.length}`);
  console.log();

  if (stats.errors.length > 0) {
    console.log('⚠️  ERRORS/WARNINGS:');
    stats.errors.forEach(err => {
      console.log(`   ${err.url}: ${err.error}`);
    });
    console.log();
  }

  console.log('✅ PROVINCIAL SCRAPING COMPLETE!');
  console.log();
  console.log('📁 Next Steps:');
  console.log('   1. Review scraped data in:', OUTPUT_DIR);
  console.log('   2. Verify URLs and page structures');
  console.log('   3. Update scraping selectors based on actual HTML');
  console.log('   4. Set up automated weekly scraping');
  console.log();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
}

export { main, scrapePage, generateMockProvincialData };