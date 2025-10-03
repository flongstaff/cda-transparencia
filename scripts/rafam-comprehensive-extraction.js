#!/usr/bin/env node
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');

const RAFAM_BASE_URL = 'https://www.rafam.ec.gba.gov.ar/';
const MUNICIPALITY_CODE = '270'; // Carmen de Areco
const YEARS = [2019, 2020, 2021, 2022, 2023, 2024, 2025];
const OUTPUT_DIR = path.join(__dirname, '../data/external/provincial/rafam');

async function extractRAFAMData(year) {
  console.log(`\n🔍 Extracting RAFAM data for ${year}...`);
  
  try {
    const response = await axios.get(RAFAM_BASE_URL, {
      params: {
        mun: MUNICIPALITY_CODE,
        periodo: year
      },
      timeout: 30000,
      headers: {
        'User-Agent': 'Carmen-Transparency-Portal/1.0'
      }
    });

    const $ = cheerio.load(response.data);
    
    const data = {
      year,
      municipalityCode: MUNICIPALITY_CODE,
      municipalityName: 'Carmen de Areco',
      extractedDate: new Date().toISOString(),
      budget: {
        total: null,
        approved: null,
        executed: null,
        executionRate: null
      },
      revenue: {
        bySource: [],
        total: null
      },
      expenses: {
        byCategory: [],
        byFunction: [],
        total: null
      },
      transfers: {
        coparticipation: null,
        provincial: null,
        national: null
      },
      rawTables: []
    };

    // Extract all tables
    $('table').each((i, table) => {
      const tableData = {
        index: i,
        title: $(table).prev('h2, h3, h4, caption').text().trim(),
        headers: [],
        rows: []
      };

      $(table).find('th').each((j, th) => {
        tableData.headers.push($(th).text().trim());
      });

      $(table).find('tr').each((j, tr) => {
        const row = [];
        $(tr).find('td').each((k, td) => {
          row.push($(td).text().trim());
        });
        if (row.length > 0) {
          tableData.rows.push(row);
        }
      });

      if (tableData.rows.length > 0) {
        data.rawTables.push(tableData);
        
        // Categorize tables
        const title = tableData.title.toLowerCase();
        if (title.includes('presupuesto') || title.includes('budget')) {
          data.budget.tables = data.budget.tables || [];
          data.budget.tables.push(tableData);
        } else if (title.includes('ingreso') || title.includes('recurso') || title.includes('revenue')) {
          data.revenue.tables = data.revenue.tables || [];
          data.revenue.tables.push(tableData);
        } else if (title.includes('gasto') || title.includes('egreso') || title.includes('expense')) {
          data.expenses.tables = data.expenses.tables || [];
          data.expenses.tables.push(tableData);
        }
      }
    });

    console.log(`✓ Extracted ${data.rawTables.length} tables for ${year}`);
    return data;

  } catch (error) {
    console.error(`✗ Failed to extract RAFAM data for ${year}:`, error.message);
    return {
      year,
      error: error.message,
      municipalityCode: MUNICIPALITY_CODE,
      extractedDate: new Date().toISOString()
    };
  }
}

async function main() {
  console.log('🏛️  RAFAM Comprehensive Data Extraction');
  console.log('=====================================\n');
  
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  
  const allData = [];
  
  for (const year of YEARS) {
    const yearData = await extractRAFAMData(year);
    allData.push(yearData);
    
    // Save individual year file
    const filename = path.join(OUTPUT_DIR, `rafam_${year}_comprehensive.json`);
    await fs.writeFile(filename, JSON.stringify(yearData, null, 2));
    console.log(`💾 Saved: ${filename}`);
    
    // Delay between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Save consolidated file
  const consolidatedFile = path.join(OUTPUT_DIR, 'rafam_all_years.json');
  await fs.writeFile(consolidatedFile, JSON.stringify(allData, null, 2));
  console.log(`\n💾 Consolidated file saved: ${consolidatedFile}`);
  
  console.log('\n✅ RAFAM extraction complete!');
  console.log(`   Years processed: ${YEARS.length}`);
  console.log(`   Total tables extracted: ${allData.reduce((sum, d) => sum + (d.rawTables?.length || 0), 0)}`);
}

main().catch(console.error);
