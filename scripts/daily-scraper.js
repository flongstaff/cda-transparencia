#!/usr/bin/env node
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');

const SOURCES = [
  {
    name: 'Carmen de Areco Transparency',
    url: 'https://carmendeareco.gob.ar/transparencia',
    selector: 'a[href*=".pdf"]',
    type: 'transparency'
  },
  {
    name: 'Carmen de Areco Licitaciones',
    url: 'https://carmendeareco.gob.ar/transparencia/licitaciones',
    selector: '.licitacion, .tender',
    type: 'contracts'
  },
  {
    name: 'Carmen de Areco Boletín',
    url: 'https://carmendeareco.gob.ar/boletin-oficial/',
    selector: 'article, .post',
    type: 'bulletin'
  }
];

async function scrapeSource(source) {
  try {
    console.log(`\n🔍 Scraping: ${source.name}`);
    const response = await axios.get(source.url, {
      timeout: 15000,
      headers: { 'User-Agent': 'Carmen-Transparency-Bot/1.0' }
    });
    
    const $ = cheerio.load(response.data);
    const items = [];
    
    $(source.selector).each((i, elem) => {
      const item = {
        text: $(elem).text().trim(),
        href: $(elem).attr('href') || $(elem).find('a').attr('href'),
        date: new Date().toISOString()
      };
      if (item.text || item.href) {
        items.push(item);
      }
    });
    
    console.log(`   Found ${items.length} items`);
    return { source: source.name, items, timestamp: new Date().toISOString() };
    
  } catch (error) {
    console.error(`   Error: ${error.message}`);
    return { source: source.name, error: error.message, timestamp: new Date().toISOString() };
  }
}

async function main() {
  console.log('🤖 Daily Automated Scraper');
  console.log('=========================');
  
  const results = [];
  for (const source of SOURCES) {
    const result = await scrapeSource(source);
    results.push(result);
    await new Promise(r => setTimeout(r, 2000)); // 2s delay
  }
  
  // Save results
  const date = new Date().toISOString().split('T')[0];
  const outputDir = path.join(__dirname, '../data/scraped');
  await fs.mkdir(outputDir, { recursive: true });
  
  const outputFile = path.join(outputDir, `scrape_${date}.json`);
  await fs.writeFile(outputFile, JSON.stringify(results, null, 2));
  
  console.log(`\n💾 Results saved: ${outputFile}`);
}

main().catch(console.error);
