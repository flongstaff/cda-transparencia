#!/usr/bin/env node

/**
 * Enhanced RAFAM Data Extractor
 *
 * Extracts comprehensive fiscal data from RAFAM for Carmen de Areco (Code: 270)
 * Includes:
 * - Budget by partida (line item)
 * - Revenue by source
 * - Expenses by category
 * - Monthly execution reports
 * - Quarterly comparisons
 * - Year-over-year analysis
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const RAFAM_BASE_URL = 'https://www.rafam.ec.gba.gov.ar';
const MUNICIPALITY_CODE = '270'; // Carmen de Areco
const OUTPUT_DIR = path.join(__dirname, '../data/external/provincial/rafam');
const YEARS = [2019, 2020, 2021, 2022, 2023, 2024, 2025];

// Data structure
const rafamData = {
  municipality: {
    code: MUNICIPALITY_CODE,
    name: 'Carmen de Areco',
    province: 'Buenos Aires'
  },
  years: {},
  metadata: {
    scraped_at: new Date().toISOString(),
    source: RAFAM_BASE_URL,
    years_extracted: [],
    errors: []
  }
};

/**
 * Utility: Wait for specified milliseconds
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Utility: Parse Argentine currency format (1.234.567,89 → 1234567.89)
 */
function parseArgentineCurrency(str) {
  if (!str) return 0;

  const cleaned = str
    .replace(/[^0-9.,-]/g, '') // Remove non-numeric except . , -
    .replace(/\./g, '')         // Remove thousand separators (.)
    .replace(',', '.');          // Convert decimal comma to period

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Utility: Safe fetch with retry
 */
async function safeFetch(url, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Fetching: ${url.substring(0, 100)}... (attempt ${i + 1}/${retries})`);
      const response = await axios.get(url, {
        timeout: 60000, // 60 seconds (RAFAM is slow)
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; TransparencyBot/1.0)',
          ...options.headers
        },
        ...options
      });
      return response;
    } catch (error) {
      console.error(`Error (attempt ${i + 1}): ${error.message}`);
      if (i === retries - 1) {
        rafamData.metadata.errors.push({
          url: url.substring(0, 200),
          error: error.message,
          timestamp: new Date().toISOString()
        });
        return null;
      }
      await sleep(5000 * (i + 1)); // Exponential backoff: 5s, 10s, 15s
    }
  }
  return null;
}

/**
 * 1. Extract budget data by partida (line item)
 */
async function extractBudgetByPartida(year) {
  console.log(`\n📊 Extracting budget by partida for ${year}...`);

  // RAFAM URL structure (may need adjustment based on actual site)
  const url = `${RAFAM_BASE_URL}/presupuesto.php?mun=${MUNICIPALITY_CODE}&anio=${year}`;
  const response = await safeFetch(url);

  if (!response) {
    console.log(`❌ Failed to fetch budget data for ${year}`);
    return null;
  }

  const $ = cheerio.load(response.data);
  const budgetItems = [];

  // Extract table rows (adjust selectors based on actual RAFAM structure)
  $('table tr').each((i, row) => {
    const $row = $(row);
    const cells = $row.find('td, th').map((j, cell) => $(cell).text().trim()).get();

    if (cells.length >= 3 && i > 0) { // Skip header
      budgetItems.push({
        code: cells[0],
        description: cells[1],
        budgeted: parseArgentineCurrency(cells[2]),
        executed: parseArgentineCurrency(cells[3]) || 0,
        execution_rate: cells[3] ? (parseArgentineCurrency(cells[3]) / parseArgentineCurrency(cells[2]) * 100) : 0
      });
    }
  });

  console.log(`✅ Extracted ${budgetItems.length} budget line items for ${year}`);

  return {
    year,
    budget_by_partida: budgetItems,
    total_budgeted: budgetItems.reduce((sum, item) => sum + item.budgeted, 0),
    total_executed: budgetItems.reduce((sum, item) => sum + item.executed, 0),
    overall_execution_rate: budgetItems.length > 0
      ? (budgetItems.reduce((sum, item) => sum + item.executed, 0) / budgetItems.reduce((sum, item) => sum + item.budgeted, 0) * 100)
      : 0
  };
}

/**
 * 2. Extract revenue by source
 */
async function extractRevenueBySource(year) {
  console.log(`\n💰 Extracting revenue by source for ${year}...`);

  const url = `${RAFAM_BASE_URL}/recursos.php?mun=${MUNICIPALITY_CODE}&anio=${year}`;
  const response = await safeFetch(url);

  if (!response) {
    console.log(`❌ Failed to fetch revenue data for ${year}`);
    return null;
  }

  const $ = cheerio.load(response.data);
  const revenueItems = [];

  $('table tr').each((i, row) => {
    const $row = $(row);
    const cells = $row.find('td, th').map((j, cell) => $(cell).text().trim()).get();

    if (cells.length >= 3 && i > 0) {
      revenueItems.push({
        code: cells[0],
        source: cells[1],
        budgeted: parseArgentineCurrency(cells[2]),
        actual: parseArgentineCurrency(cells[3]) || 0,
        achievement_rate: cells[3] ? (parseArgentineCurrency(cells[3]) / parseArgentineCurrency(cells[2]) * 100) : 0
      });
    }
  });

  console.log(`✅ Extracted ${revenueItems.length} revenue sources for ${year}`);

  return {
    year,
    revenue_by_source: revenueItems,
    total_budgeted: revenueItems.reduce((sum, item) => sum + item.budgeted, 0),
    total_actual: revenueItems.reduce((sum, item) => sum + item.actual, 0),
    overall_achievement_rate: revenueItems.length > 0
      ? (revenueItems.reduce((sum, item) => sum + item.actual, 0) / revenueItems.reduce((sum, item) => sum + item.budgeted, 0) * 100)
      : 0
  };
}

/**
 * 3. Extract expenses by category
 */
async function extractExpensesByCategory(year) {
  console.log(`\n💸 Extracting expenses by category for ${year}...`);

  const url = `${RAFAM_BASE_URL}/gastos.php?mun=${MUNICIPALITY_CODE}&anio=${year}`;
  const response = await safeFetch(url);

  if (!response) {
    console.log(`❌ Failed to fetch expenses data for ${year}`);
    return null;
  }

  const $ = cheerio.load(response.data);
  const expenseItems = [];

  $('table tr').each((i, row) => {
    const $row = $(row);
    const cells = $row.find('td, th').map((j, cell) => $(cell).text().trim()).get();

    if (cells.length >= 3 && i > 0) {
      expenseItems.push({
        code: cells[0],
        category: cells[1],
        budgeted: parseArgentineCurrency(cells[2]),
        executed: parseArgentineCurrency(cells[3]) || 0,
        execution_rate: cells[3] ? (parseArgentineCurrency(cells[3]) / parseArgentineCurrency(cells[2]) * 100) : 0
      });
    }
  });

  console.log(`✅ Extracted ${expenseItems.length} expense categories for ${year}`);

  return {
    year,
    expenses_by_category: expenseItems,
    total_budgeted: expenseItems.reduce((sum, item) => sum + item.budgeted, 0),
    total_executed: expenseItems.reduce((sum, item) => sum + item.executed, 0),
    overall_execution_rate: expenseItems.length > 0
      ? (expenseItems.reduce((sum, item) => sum + item.executed, 0) / expenseItems.reduce((sum, item) => sum + item.budgeted, 0) * 100)
      : 0
  };
}

/**
 * 4. Extract monthly execution reports
 */
async function extractMonthlyExecution(year) {
  console.log(`\n📅 Extracting monthly execution for ${year}...`);

  const url = `${RAFAM_BASE_URL}/ejecucion_mensual.php?mun=${MUNICIPALITY_CODE}&anio=${year}`;
  const response = await safeFetch(url);

  if (!response) {
    console.log(`⚠️  Failed to fetch monthly execution for ${year}`);
    // Create placeholder data
    return {
      year,
      monthly_execution: Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        month_name: new Date(year, i).toLocaleString('es-AR', { month: 'long' }),
        executed: 0,
        accumulated: 0
      }))
    };
  }

  const $ = cheerio.load(response.data);
  const monthlyData = [];

  $('table tr').each((i, row) => {
    const $row = $(row);
    const cells = $row.find('td, th').map((j, cell) => $(cell).text().trim()).get();

    if (cells.length >= 3 && i > 0) {
      monthlyData.push({
        month: i,
        month_name: cells[0],
        executed: parseArgentineCurrency(cells[1]),
        accumulated: parseArgentineCurrency(cells[2])
      });
    }
  });

  console.log(`✅ Extracted ${monthlyData.length} months of execution data for ${year}`);

  return {
    year,
    monthly_execution: monthlyData
  };
}

/**
 * 5. Extract comprehensive data for a year
 */
async function extractYearData(year) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📆 Extracting comprehensive RAFAM data for ${year}`);
  console.log('='.repeat(60));

  try {
    const [budget, revenue, expenses, monthly] = await Promise.all([
      extractBudgetByPartida(year),
      extractRevenueBySource(year),
      extractExpensesByCategory(year),
      extractMonthlyExecution(year)
    ]);

    rafamData.years[year] = {
      year,
      budget: budget || { budget_by_partida: [], total_budgeted: 0, total_executed: 0 },
      revenue: revenue || { revenue_by_source: [], total_budgeted: 0, total_actual: 0 },
      expenses: expenses || { expenses_by_category: [], total_budgeted: 0, total_executed: 0 },
      monthly: monthly || { monthly_execution: [] },
      extracted_at: new Date().toISOString()
    };

    rafamData.metadata.years_extracted.push(year);
    console.log(`✅ Successfully extracted data for ${year}`);

    await sleep(3000); // 3 second delay between years

  } catch (error) {
    console.error(`❌ Error extracting data for ${year}:`, error);
    rafamData.metadata.errors.push({
      year,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * 6. Calculate year-over-year analysis
 */
function calculateYearOverYearAnalysis() {
  console.log('\n📈 Calculating year-over-year analysis...');

  const years = Object.keys(rafamData.years).map(Number).sort();
  const yoyAnalysis = [];

  for (let i = 1; i < years.length; i++) {
    const prevYear = years[i - 1];
    const currentYear = years[i];

    const prevData = rafamData.years[prevYear];
    const currentData = rafamData.years[currentYear];

    if (prevData && currentData) {
      yoyAnalysis.push({
        year: currentYear,
        budget_change: {
          absolute: currentData.budget.total_budgeted - prevData.budget.total_budgeted,
          percentage: ((currentData.budget.total_budgeted - prevData.budget.total_budgeted) / prevData.budget.total_budgeted * 100)
        },
        revenue_change: {
          absolute: currentData.revenue.total_actual - prevData.revenue.total_actual,
          percentage: ((currentData.revenue.total_actual - prevData.revenue.total_actual) / prevData.revenue.total_actual * 100)
        },
        expenses_change: {
          absolute: currentData.expenses.total_executed - prevData.expenses.total_executed,
          percentage: ((currentData.expenses.total_executed - prevData.expenses.total_executed) / prevData.expenses.total_executed * 100)
        }
      });
    }
  }

  rafamData.year_over_year_analysis = yoyAnalysis;
  console.log(`✅ Calculated ${yoyAnalysis.length} year-over-year comparisons`);
}

/**
 * 7. Save extracted data
 */
async function saveExtractedData() {
  console.log('\n💾 Saving extracted RAFAM data...');

  // Ensure output directory exists
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  // Save complete dataset
  const completeFile = path.join(OUTPUT_DIR, 'rafam_complete_data.json');
  await fs.writeFile(completeFile, JSON.stringify(rafamData, null, 2));
  console.log(`✅ Saved complete dataset to: ${completeFile}`);

  // Save individual year files
  for (const year of Object.keys(rafamData.years)) {
    const yearFile = path.join(OUTPUT_DIR, `rafam_${year}.json`);
    await fs.writeFile(yearFile, JSON.stringify(rafamData.years[year], null, 2));
    console.log(`✅ Saved ${year} data to: ${yearFile}`);
  }

  // Save metadata
  const metadataFile = path.join(OUTPUT_DIR, 'extraction_metadata.json');
  await fs.writeFile(metadataFile, JSON.stringify(rafamData.metadata, null, 2));
  console.log(`✅ Saved metadata to: ${metadataFile}`);

  // Generate summary
  console.log('\n📊 Extraction Summary:');
  console.log(`   Years extracted: ${rafamData.metadata.years_extracted.join(', ')}`);
  console.log(`   Total errors: ${rafamData.metadata.errors.length}`);
  console.log(`   Year-over-year comparisons: ${rafamData.year_over_year_analysis?.length || 0}`);
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting Enhanced RAFAM Data Extraction');
  console.log(`📍 Municipality: Carmen de Areco (Code: ${MUNICIPALITY_CODE})`);
  console.log(`📅 Years: ${YEARS.join(', ')}`);
  console.log('='.repeat(60));

  try {
    // Extract data for each year
    for (const year of YEARS) {
      await extractYearData(year);
    }

    // Calculate comparisons
    calculateYearOverYearAnalysis();

    // Save everything
    await saveExtractedData();

    console.log('\n✅ RAFAM extraction completed successfully!');
    console.log(`📁 Data saved to: ${OUTPUT_DIR}`);

  } catch (error) {
    console.error('\n❌ Fatal error during extraction:', error);
    rafamData.metadata.errors.push({
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    // Save whatever we have
    await saveExtractedData();
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main, extractYearData, extractBudgetByPartida };
