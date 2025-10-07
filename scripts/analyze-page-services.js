#!/usr/bin/env node

/**
 * ANALYZE PAGE SERVICE USAGE
 *
 * Analyzes all pages to see which data services they use
 */

const fs = require('fs');
const path = require('path');

const PAGES_DIR = path.join(__dirname, '../frontend/src/pages');

const SERVICES_TO_CHECK = [
  'UnifiedDataService',
  'dataService',
  'externalAPIsService',
  'ExternalDataAdapter',
  'UnifiedTransparencyService',
  'ComprehensiveDataService',
  'MasterDataService',
  'RealDataService',
  'cachedExternalDataService'
];

function analyzePage(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);

  const result = {
    file: fileName,
    services: [],
    hasServiceImport: false,
    usesLocalData: false,
    needsUpdate: false
  };

  // Check for service imports
  SERVICES_TO_CHECK.forEach(service => {
    if (content.includes(service)) {
      result.services.push(service);
      result.hasServiceImport = true;
    }
  });

  // Check for local data usage patterns
  const localDataPatterns = [
    /useState.*\[\]/,
    /const data = \[/,
    /mockData/i,
    /dummyData/i,
    /sampleData/i
  ];

  localDataPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      result.usesLocalData = true;
    }
  });

  // Determine if needs update
  if (!result.hasServiceImport || result.usesLocalData) {
    result.needsUpdate = true;
  }

  return result;
}

// Main
const files = fs.readdirSync(PAGES_DIR).filter(f => f.endsWith('.tsx'));

console.log(`\n📊 ANALYZING ${files.length} PAGES FOR SERVICE USAGE\n`);
console.log('='.repeat(80));

const results = files.map(file => analyzePage(path.join(PAGES_DIR, file)));

// Summary by category
const withServices = results.filter(r => r.hasServiceImport);
const withoutServices = results.filter(r => !r.hasServiceImport);
const needsUpdate = results.filter(r => r.needsUpdate);

console.log('\n📈 SUMMARY:\n');
console.log(`✅ Pages using services: ${withServices.length}/${files.length}`);
console.log(`❌ Pages without services: ${withoutServices.length}/${files.length}`);
console.log(`🔄 Pages needing update: ${needsUpdate.length}/${files.length}`);

console.log('\n\n📝 PAGES WITHOUT SERVICE IMPORTS:\n');
withoutServices.forEach(r => {
  console.log(`  - ${r.file}`);
});

console.log('\n\n🔍 SERVICE USAGE BREAKDOWN:\n');
const serviceUsage = {};
results.forEach(r => {
  r.services.forEach(s => {
    serviceUsage[s] = (serviceUsage[s] || 0) + 1;
  });
});

Object.entries(serviceUsage)
  .sort((a, b) => b[1] - a[1])
  .forEach(([service, count]) => {
    console.log(`  ${service.padEnd(30)} → ${count} pages`);
  });

console.log('\n\n🎯 RECOMMENDATIONS:\n');
console.log('1. Pages without services should use UnifiedDataService');
console.log('2. Pages using externalAPIsService are already updated (via adapter)');
console.log('3. Pages using dataService should be verified for external data integration');
console.log('\n');

// Export results for programmatic use
fs.writeFileSync(
  path.join(__dirname, '../docs/PAGE_SERVICE_ANALYSIS.json'),
  JSON.stringify(results, null, 2)
);

console.log('📄 Detailed analysis saved to: docs/PAGE_SERVICE_ANALYSIS.json\n');
