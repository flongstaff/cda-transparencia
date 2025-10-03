#!/usr/bin/env node

/**
 * Carmen de Areco Municipal Website Scraper
 * Extracts transparency data from carmendeareco.gob.ar
 *
 * Based on DATA_SOURCES.md resources:
 * - Official municipal website
 * - Transparency portal
 * - Municipal bulletin
 * - Public contracts and tenders
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, '../data/scraped/carmen_municipal');

// Carmen de Areco URLs from DATA_SOURCES.md
const CARMEN_URLS = {
  main: 'https://carmendeareco.gob.ar',
  transparency: 'https://carmendeareco.gob.ar/transparencia',
  budget: 'https://carmendeareco.gob.ar/presupuesto-participativo',
  bulletin: 'https://carmendeareco.gob.ar/boletin-oficial',
  tenders: 'https://carmendeareco.gob.ar/licitaciones',
  declarations: 'https://carmendeareco.gob.ar/declaraciones-juradas',
  council: 'http://hcdcarmendeareco.blogspot.com'
};

// Scraping statistics
const stats = {
  pagesScraped: 0,
  documentsFound: 0,
  errors: [],
  successfulScrapes: 0
};

/**
 * Scrape a URL and extract structured data
 */
async function scrapePage(url, pageType) {
  console.log(`\n📄 Scraping: ${url}`);
  console.log(`   Type: ${pageType}`);

  try {
    const response = await axios.get(url, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Carmen-de-Areco-Transparency-Bot/1.0',
        'Accept': 'text/html,application/xhtml+xml'
      },
      validateStatus: (status) => status < 500
    });

    stats.pagesScraped++;

    if (response.status === 200) {
      const $ = cheerio.load(response.data);

      // Extract based on page type
      const data = extractDataByType($, pageType, url);

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
    } else {
      console.log(`   ❌ Error: ${error.message}`);
    }

    stats.errors.push({ url, error: error.message });
    return null;
  }
}

/**
 * Extract data based on page type
 */
function extractDataByType($, pageType, url) {
  const data = {
    pageType,
    url,
    scrapedAt: new Date().toISOString(),
    documents: []
  };

  switch (pageType) {
    case 'transparency':
      // Extract transparency documents, links, budget info
      $('a[href*="pdf"], a[href*="presupuesto"], a[href*="ejecucion"]').each((i, el) => {
        const link = $(el);
        data.documents.push({
          title: link.text().trim(),
          url: link.attr('href'),
          type: 'transparency_document'
        });
      });
      break;

    case 'tenders':
      // Extract tender/procurement notices
      $('.tender, .licitacion, article').each((i, el) => {
        const item = $(el);
        data.documents.push({
          title: item.find('h2, h3, .title').text().trim(),
          description: item.find('p, .description').first().text().trim(),
          date: item.find('.date, time').text().trim(),
          url: item.find('a').attr('href'),
          type: 'tender'
        });
      });
      break;

    case 'bulletin':
      // Extract bulletin/ordinance documents
      $('article, .post, .ordinance').each((i, el) => {
        const item = $(el);
        data.documents.push({
          number: item.find('.number').text().trim(),
          title: item.find('h2, h3').text().trim(),
          date: item.find('.date, time').text().trim(),
          pdf_url: item.find('a[href*="pdf"]').attr('href'),
          type: 'ordinance'
        });
      });
      break;

    case 'declarations':
      // Extract public official declarations
      $('.declaration, .funcionario').each((i, el) => {
        const item = $(el);
        data.documents.push({
          official_name: item.find('.name, h3').text().trim(),
          position: item.find('.position, .cargo').text().trim(),
          year: item.find('.year').text().trim(),
          pdf_url: item.find('a[href*="pdf"]').attr('href'),
          type: 'declaration'
        });
      });
      break;

    case 'council':
      // Extract municipal council blog posts (Blogspot)
      $('.post, article').each((i, el) => {
        const post = $(el);
        data.documents.push({
          title: post.find('.post-title, h2, h3').first().text().trim(),
          date: post.find('.published, .date, time').first().text().trim(),
          content: post.find('.post-body, .content').first().text().trim().substring(0, 500),
          url: post.find('.post-title a, h2 a, h3 a').first().attr('href'),
          type: 'council_post'
        });
      });
      break;

    case 'main':
      // Extract general links and news
      $('a').each((i, el) => {
        const link = $(el);
        const href = link.attr('href');

        if (href && (
          href.includes('transparencia') ||
          href.includes('presupuesto') ||
          href.includes('licitacion') ||
          href.includes('ordenanza') ||
          href.includes('.pdf')
        )) {
          data.documents.push({
            text: link.text().trim(),
            url: href,
            type: 'link'
          });
        }
      });
      break;
  }

  // Filter out empty documents
  data.documents = data.documents.filter(doc =>
    doc.title || doc.text || doc.official_name
  );

  return data;
}

/**
 * Generate mock municipal data when scraping unavailable
 */
async function generateMockMunicipalData() {
  console.log('\n🧪 Generating mock municipal data...');

  const mockData = {
    metadata: {
      municipality: 'Carmen de Areco',
      province: 'Buenos Aires',
      generated_at: new Date().toISOString(),
      data_quality: 'MOCK_FOR_DEVELOPMENT'
    },
    transparency_documents: [
      {
        id: 'DOC-001',
        type: 'presupuesto',
        title: 'Presupuesto Municipal 2025',
        description: 'Ordenanza de Presupuesto Año 2025',
        ordinance_number: '1234/2024',
        date: '2024-12-15',
        pdf_url: '/transparencia/presupuesto-2025.pdf',
        categories: ['presupuesto', 'finanzas']
      },
      {
        id: 'DOC-002',
        type: 'ejecucion_presupuestaria',
        title: 'Ejecución Presupuestaria - Enero 2025',
        description: 'Informe mensual de ejecución presupuestaria',
        date: '2025-02-01',
        pdf_url: '/transparencia/ejecucion-enero-2025.pdf',
        categories: ['presupuesto', 'transparencia']
      }
    ],
    ordinances: [
      {
        number: '1234/2024',
        title: 'Presupuesto General de Gastos y Recursos Año 2025',
        date: '2024-12-15',
        type: 'presupuesto',
        status: 'vigente'
      },
      {
        number: '1235/2025',
        title: 'Modificación Ordenanza Fiscal y Tributaria',
        date: '2025-01-10',
        type: 'fiscal',
        status: 'vigente'
      }
    ],
    tenders: [
      {
        id: 'LIC-2025-001',
        title: 'Provisión de Combustible - Año 2025',
        type: 'licitacion_publica',
        opening_date: '2025-02-15',
        budget: 5000000,
        status: 'abierta'
      },
      {
        id: 'LIC-2025-002',
        title: 'Construcción Cordón Cuneta - Barrio Centro',
        type: 'licitacion_publica',
        opening_date: '2025-03-01',
        budget: 12000000,
        status: 'en_evaluacion'
      }
    ],
    declarations: [
      {
        official: 'Intendente Municipal',
        year: 2024,
        status: 'presentada',
        presentation_date: '2024-06-30'
      },
      {
        official: 'Secretario de Hacienda',
        year: 2024,
        status: 'presentada',
        presentation_date: '2024-06-30'
      }
    ]
  };

  // Save mock data
  const outputPath = path.join(OUTPUT_DIR, 'carmen_municipal_mock_data.json');
  await fs.mkdir(OUTPUT_DIR, { recursive: true});
  await fs.writeFile(
    outputPath,
    JSON.stringify(mockData, null, 2),
    'utf-8'
  );

  console.log(`   ✅ Generated mock municipal data`);
  console.log(`   💾 Saved to: carmen_municipal_mock_data.json`);

  return mockData;
}

/**
 * Main scraping process
 */
async function main() {
  console.log('🌐 CARMEN DE ARECO MUNICIPAL WEBSITE SCRAPER');
  console.log('='.repeat(80));
  console.log('Output Directory:', OUTPUT_DIR);
  console.log();

  // Ensure output directory exists
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  // Try scraping each URL
  const scrapePromises = Object.entries(CARMEN_URLS).map(async ([type, url]) => {
    await scrapePage(url, type);
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  await Promise.allSettled(scrapePromises);

  // If scraping failed or returned minimal data, generate mock data
  if (stats.documentsFound < 10) {
    console.log('\n⚠️  Limited data from scraping, generating mock data...');
    await generateMockMunicipalData();
  }

  // Print statistics
  console.log('\n' + '='.repeat(80));
  console.log('📊 SCRAPING SUMMARY');
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

  console.log('✅ MUNICIPAL SCRAPING COMPLETE!');
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

export { main, scrapePage, generateMockMunicipalData };
