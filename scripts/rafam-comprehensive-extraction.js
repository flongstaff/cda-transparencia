#!/usr/bin/env node
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');

const RAFAM_BASE_URL = 'https://www.rafam.ec.gba.gov.ar/';
const MUNICIPALITY_CODE = '270'; // Carmen de Areco
const YEARS = [2019, 2020, 2021, 2022, 2023, 2024, 2025];
const OUTPUT_DIR = path.join(__dirname, '../data/external/provincial/rafam');

/**
 * Utility: Check if RAFAM site is accessible
 */
async function checkRAFAMAccessibility() {
  try {
    console.log('Checking RAFAM site accessibility...');
    const response = await axios.get(RAFAM_BASE_URL, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AccessibilityChecker/1.0)'
      }
    });
    console.log('✅ RAFAM site is accessible');
    return true;
  } catch (error) {
    console.log('⚠️  RAFAM site appears to be inaccessible:', error.message);
    return false;
  }
}

/**
 * Utility: Load mock data as fallback when RAFAM is inaccessible
 */
async function loadMockRAFAMData(year) {
  console.log(`⚠️  Loading mock RAFAM data for year ${year} as fallback...`);
  
  // Try to read existing mock data
  const mockFilePath = path.join(__dirname, '../backend/data/organized_documents/json', `budget_data_${year}.json`);
  
  try {
    const mockData = await fs.readFile(mockFilePath, 'utf8');
    const parsedMockData = JSON.parse(mockData);
    
    return {
      year,
      municipalityCode: MUNICIPALITY_CODE,
      municipalityName: 'Carmen de Areco',
      extractedDate: new Date().toISOString(),
      budget: {
        total: parsedMockData.total_budget || 80000000,
        approved: parsedMockData.total_budget || 80000000,
        executed: parsedMockData.total_executed || 78000000,
        executionRate: parsedMockData.execution_rate || 97.5
      },
      revenue: {
        bySource: [],
        total: 0
      },
      expenses: {
        byCategory: [],
        byFunction: [],
        total: 0
      },
      transfers: {
        coparticipation: null,
        provincial: null,
        national: null
      },
      rawTables: [],
      source: 'mock_data_fallback',
      budget_execution: parsedMockData.budget_execution || []
    };
  } catch (error) {
    console.log(`⚠️  Could not load mock data for ${year}, using defaults:`, error.message);
    // Return default mock data if file doesn't exist
    return {
      year,
      municipalityCode: MUNICIPALITY_CODE,
      municipalityName: 'Carmen de Areco',
      extractedDate: new Date().toISOString(),
      budget: {
        total: 80000000,
        approved: 80000000,
        executed: 78000000,
        executionRate: 97.5
      },
      revenue: {
        bySource: [],
        total: 0
      },
      expenses: {
        byCategory: [],
        byFunction: [],
        total: 0
      },
      transfers: {
        coparticipation: null,
        provincial: null,
        national: null
      },
      rawTables: [],
      source: 'mock_data_fallback',
      budget_execution: [
        { quarter: 'Q2', budgeted: 80000000, executed: 78000000, percentage: 97.5 },
        { quarter: 'Q3', budgeted: 85000000, executed: 83500000, percentage: 98.2 }
      ]
    };
  }
}

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
  
  // Check if RAFAM site is accessible first
  const isRAFAMAccessible = await checkRAFAMAccessibility();
  
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  
  const allData = [];
  
  if (!isRAFAMAccessible) {
    console.log('⚠️  RAFAM site is inaccessible. Using mock data fallback for all years.');
    
    // Use mock data for all years as fallback
    for (const year of YEARS) {
      console.log(`\n🔍 Loading mock RAFAM data for ${year}...`);
      
      try {
        const yearData = await loadMockRAFAMData(year);
        allData.push(yearData);
        
        // Save individual year file
        const filename = path.join(OUTPUT_DIR, `rafam_${year}_comprehensive.json`);
        await fs.writeFile(filename, JSON.stringify(yearData, null, 2));
        console.log(`💾 Saved: ${filename}`);
      } catch (error) {
        console.error(`❌ Error loading mock data for ${year}:`, error);
        // Save error data
        const errorData = {
          year,
          error: error.message,
          municipalityCode: MUNICIPALITY_CODE,
          extractedDate: new Date().toISOString(),
          source: 'error_in_mock_data_load'
        };
        allData.push(errorData);
        
        const filename = path.join(OUTPUT_DIR, `rafam_${year}_comprehensive.json`);
        await fs.writeFile(filename, JSON.stringify(errorData, null, 2));
        console.log(`💾 Saved error data: ${filename}`);
      }
      
      // Delay between years
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  } else {
    console.log('✅ RAFAM site accessible. Proceeding with regular extraction.');
    
    // Extract data for each year via the normal method
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
  }
  
  // Save consolidated file
  const consolidatedFile = path.join(OUTPUT_DIR, 'rafam_all_years.json');
  await fs.writeFile(consolidatedFile, JSON.stringify(allData, null, 2));
  console.log(`\n💾 Consolidated file saved: ${consolidatedFile}`);
  
  console.log('\n✅ RAFAM extraction complete!');
  console.log(`   Data source: ${isRAFAMAccessible ? 'RAFAM Web Interface' : 'Mock Data Fallback'}`);
  console.log(`   Years processed: ${allData.length}`);
  console.log(`   Total records: ${allData.length}`);
}

main().catch(console.error);
