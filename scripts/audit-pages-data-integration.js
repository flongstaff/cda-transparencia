#!/usr/bin/env node
/**
 * DATA INTEGRATION AUDIT SCRIPT
 *
 * Audits all pages to verify they're using proper data integration:
 * - CSV files from /data/charts/
 * - JSON files from /data/consolidated/{year}/
 * - PDF documents from /data/pdfs/
 * - External APIs (when proxy available)
 *
 * Generates a report showing which pages need updates
 */

const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.join(__dirname, '../frontend/src');
const PAGES_DIR = path.join(FRONTEND_DIR, 'pages');

console.log('🔍 CARMEN DE ARECO - DATA INTEGRATION AUDIT\n');
console.log('=' .repeat(70));

// Data hooks and services to check for
const DATA_PATTERNS = {
  useMultiYearData: {
    pattern: /useMultiYearData/,
    status: '✅ BEST',
    description: 'Multi-year preloading with instant switching'
  },
  useMasterData: {
    pattern: /useMasterData/,
    status: '⚠️  GOOD',
    description: 'Year-specific data loading'
  },
  DataIntegrationService: {
    pattern: /DataIntegrationService/,
    status: '✅ GOOD',
    description: 'Integrated CSV + JSON + PDF + External APIs'
  },
  chartDataService: {
    pattern: /chartDataService/,
    status: '✅ OK',
    description: 'CSV data from charts directory'
  },
  yearSpecificDataService: {
    pattern: /yearSpecificDataService/,
    status: '✅ OK',
    description: 'JSON data from consolidated directory'
  },
  fetch_data: {
    pattern: /fetch\(['"`]\/data\//,
    status: '⚠️  BASIC',
    description: 'Direct file fetch (no integration)'
  },
  hardcoded_data: {
    pattern: /const\s+\w+\s*=\s*\[.*total.*\]/i,
    status: '❌ BAD',
    description: 'Hardcoded mock data'
  }
};

// Get all page files
const pageFiles = fs.readdirSync(PAGES_DIR)
  .filter(f => f.endsWith('.tsx'))
  .sort();

console.log(`\n📄 Found ${pageFiles.length} pages to audit\n`);

const results = [];

pageFiles.forEach(file => {
  const filePath = path.join(PAGES_DIR, file);
  const content = fs.readFileSync(filePath, 'utf8');

  const matches = {};
  let hasYearSelector = /selectedYear|setSelectedYear|onYearChange/.test(content);
  let hasDataLoading = /useQuery|useMemo|useEffect/.test(content);

  for (const [name, config] of Object.entries(DATA_PATTERNS)) {
    if (config.pattern.test(content)) {
      matches[name] = true;
    }
  }

  results.push({
    file,
    matches,
    hasYearSelector,
    hasDataLoading
  });
});

// Generate report
console.log('INTEGRATION AUDIT RESULTS');
console.log('=' .repeat(70));
console.log('\n📊 SUMMARY BY INTEGRATION TYPE:\n');

// Count by integration type
const stats = {
  multiYear: 0,
  master: 0,
  integration: 0,
  basic: 0,
  hardcoded: 0,
  none: 0
};

results.forEach(r => {
  if (r.matches.useMultiYearData) stats.multiYear++;
  else if (r.matches.useMasterData) stats.master++;
  else if (r.matches.DataIntegrationService) stats.integration++;
  else if (r.matches.chartDataService || r.matches.yearSpecificDataService || r.matches.fetch_data) stats.basic++;
  else if (r.matches.hardcoded_data) stats.hardcoded++;
  else stats.none++;
});

console.log(`✅ BEST   - Multi-year preloading:     ${stats.multiYear.toString().padStart(3)} pages`);
console.log(`⚠️  GOOD  - Master data hook:          ${stats.master.toString().padStart(3)} pages`);
console.log(`✅ GOOD   - Data integration service:  ${stats.integration.toString().padStart(3)} pages`);
console.log(`⚠️  BASIC - Basic services/fetch:      ${stats.basic.toString().padStart(3)} pages`);
console.log(`❌ BAD    - Hardcoded data:            ${stats.hardcoded.toString().padStart(3)} pages`);
console.log(`⚠️  WARN  - No data loading:           ${stats.none.toString().padStart(3)} pages`);

console.log('\n\n📋 DETAILED PAGE ANALYSIS:\n');
console.log('=' .repeat(70));

results.forEach(r => {
  const status = r.matches.useMultiYearData ? '✅ BEST  ' :
                 r.matches.useMasterData ? '⚠️  GOOD ' :
                 r.matches.DataIntegrationService ? '✅ GOOD ' :
                 r.matches.fetch_data || r.matches.chartDataService ? '⚠️  BASIC' :
                 r.matches.hardcoded_data ? '❌ BAD  ' :
                 '⚠️  WARN ';

  const yearSelector = r.hasYearSelector ? '📅' : '  ';

  console.log(`${status} ${yearSelector} ${r.file.padEnd(40)}`);

  // Show what it's using
  const using = [];
  if (r.matches.useMultiYearData) using.push('useMultiYearData');
  if (r.matches.useMasterData) using.push('useMasterData');
  if (r.matches.DataIntegrationService) using.push('DataIntegrationService');
  if (r.matches.chartDataService) using.push('chartDataService');
  if (r.matches.yearSpecificDataService) using.push('yearSpecificDataService');
  if (r.matches.fetch_data) using.push('direct fetch()');
  if (r.matches.hardcoded_data) using.push('hardcoded data');

  if (using.length > 0) {
    console.log(`       → Using: ${using.join(', ')}`);
  }

  if (!r.hasDataLoading && !r.file.includes('Contact') && !r.file.includes('About') && !r.file.includes('NotFound')) {
    console.log(`       ⚠️  No data loading detected`);
  }
});

// Recommendations
console.log('\n\n💡 RECOMMENDATIONS:\n');
console.log('=' .repeat(70));

const needsUpdate = results.filter(r =>
  !r.matches.useMultiYearData &&
  (r.matches.fetch_data || r.matches.hardcoded_data || r.hasYearSelector)
);

if (needsUpdate.length > 0) {
  console.log(`\n📝 ${needsUpdate.length} pages should be updated to use useMultiYearData:\n`);
  needsUpdate.forEach(r => {
    console.log(`   - ${r.file}`);
  });
  console.log('\n   Benefits:');
  console.log('   • Instant year switching (no loading)');
  console.log('   • Automatic CSV + JSON + PDF + API integration');
  console.log('   • Consistent data loading across pages');
  console.log('   • Background preloading for all years');
}

// Pages with year selectors but no multi-year data
const hasYearNoMulti = results.filter(r =>
  r.hasYearSelector && !r.matches.useMultiYearData
);

if (hasYearNoMulti.length > 0) {
  console.log(`\n\n📅 ${hasYearNoMulti.length} pages have year selectors but not using useMultiYearData:\n`);
  hasYearNoMulti.forEach(r => {
    console.log(`   - ${r.file}`);
  });
}

// Static pages (no data loading needed)
const staticPages = results.filter(r =>
  !r.hasDataLoading &&
  (r.file.includes('Contact') || r.file.includes('About') || r.file.includes('NotFound'))
);

if (staticPages.length > 0) {
  console.log(`\n\n✅ ${staticPages.length} static pages (no data loading needed):\n`);
  staticPages.forEach(r => {
    console.log(`   - ${r.file}`);
  });
}

console.log('\n\n🎯 PRIORITY ACTIONS:\n');
console.log('=' .repeat(70));
console.log('\n1. Update pages with year selectors to use useMultiYearData');
console.log('2. Replace hardcoded data with data services');
console.log('3. Ensure all data pages use DataIntegrationService');
console.log('4. Test all pages work correctly with production data');
console.log('5. Verify year switching works without page refresh');

console.log('\n\n📦 DATA SOURCES IN USE:\n');
console.log('=' .repeat(70));
console.log('\n✅ CSV Files:      /frontend/public/data/charts/*_consolidated_2019-2025.csv');
console.log('✅ JSON Files:     /frontend/public/data/consolidated/{year}/*.json');
console.log('✅ PDF Files:      /frontend/public/data/pdfs/*.pdf');
console.log('⚠️  External APIs: Requires backend proxy server on http://localhost:3001');
console.log('\n   To enable external APIs:');
console.log('   $ cd backend && npm run proxy');
console.log('   $ cd frontend && npm run dev');

console.log('\n✅ Audit complete!\n');
