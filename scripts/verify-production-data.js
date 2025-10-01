#!/usr/bin/env node
/**
 * PRODUCTION DATA VERIFICATION SCRIPT
 *
 * Verifies that all data files are in place and accessible for production deployment
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../frontend/public/data');
const CONSOLIDATED_DIR = path.join(DATA_DIR, 'consolidated');
const CSV_DIR = path.join(DATA_DIR, 'csv');
const CHARTS_DIR = path.join(DATA_DIR, 'charts');

console.log('🔍 PRODUCTION DATA VERIFICATION\n');
console.log('=' .repeat(70));

const results = {
  consolidated: {},
  csv: {},
  charts: {},
  errors: []
};

// Years to check
const YEARS = [2019, 2020, 2021, 2022, 2023, 2024, 2025];

// Expected JSON files per year
const EXPECTED_JSON_FILES = [
  'budget.json',
  'contracts.json',
  'salaries.json',
  'documents.json',
  'treasury.json',
  'debt.json',
  'summary.json'
];

// Expected consolidated CSV files
const EXPECTED_CSV_FILES = [
  'Budget_Execution_consolidated_2019-2025.csv',
  'Revenue_consolidated_2019-2025.csv',
  'Expenses_consolidated_2019-2025.csv'
];

console.log('\n📊 CHECKING CONSOLIDATED JSON FILES\n');

YEARS.forEach(year => {
  const yearDir = path.join(CONSOLIDATED_DIR, year.toString());
  results.consolidated[year] = {
    exists: fs.existsSync(yearDir),
    files: {},
    totalSize: 0
  };

  if (results.consolidated[year].exists) {
    EXPECTED_JSON_FILES.forEach(file => {
      const filePath = path.join(yearDir, file);
      const exists = fs.existsSync(filePath);

      if (exists) {
        const stats = fs.statSync(filePath);
        const content = fs.readFileSync(filePath, 'utf8');
        let isValid = false;
        let hasData = false;

        try {
          const json = JSON.parse(content);
          isValid = true;

          // Check if it has actual data (not empty object)
          if (file === 'budget.json') {
            hasData = json.total_budget > 0;
          } else if (file === 'contracts.json') {
            hasData = Array.isArray(json.contracts) && json.contracts.length > 0;
          } else if (file === 'salaries.json') {
            hasData = json.totalPayroll > 0 || json.total_payroll > 0;
          } else {
            hasData = Object.keys(json).length > 0;
          }
        } catch (e) {
          results.errors.push(`Invalid JSON in ${year}/${file}: ${e.message}`);
        }

        results.consolidated[year].files[file] = {
          exists: true,
          size: stats.size,
          valid: isValid,
          hasData
        };
        results.consolidated[year].totalSize += stats.size;
      } else {
        results.consolidated[year].files[file] = { exists: false };
        results.errors.push(`Missing file: ${year}/${file}`);
      }
    });

    const filesCount = Object.values(results.consolidated[year].files).filter(f => f.exists).length;
    const dataCount = Object.values(results.consolidated[year].files).filter(f => f.hasData).length;

    console.log(`${year}: ${filesCount}/${EXPECTED_JSON_FILES.length} files, ${dataCount} with data (${(results.consolidated[year].totalSize / 1024).toFixed(1)} KB)`);
  } else {
    console.log(`${year}: ❌ Directory missing`);
    results.errors.push(`Missing directory: ${year}`);
  }
});

console.log('\n📈 CHECKING CSV FILES\n');

// Check charts directory
if (fs.existsSync(CHARTS_DIR)) {
  const files = fs.readdirSync(CHARTS_DIR).filter(f => f.endsWith('.csv'));
  results.csv.consolidatedCount = files.filter(f => f.includes('consolidated')).length;
  results.csv.totalFiles = files.length;
  results.csv.totalSize = files.reduce((sum, f) => {
    const stats = fs.statSync(path.join(CHARTS_DIR, f));
    return sum + stats.size;
  }, 0);

  console.log(`✅ Found ${results.csv.totalFiles} CSV files (${results.csv.consolidatedCount} consolidated)`);
  console.log(`   Total size: ${(results.csv.totalSize / 1024 / 1024).toFixed(2)} MB`);
} else {
  console.log('❌ Charts directory missing');
  results.errors.push('Missing charts directory');
}

// Check organized CSV subdirectories
const csvSubdirs = [
  'budget/execution',
  'treasury/execution',
  'contracts/execution',
  'salaries/execution',
  'education/execution',
  'health/execution',
  'infrastructure/execution'
];

console.log('\n📁 CHECKING ORGANIZED CSV DIRECTORIES\n');

csvSubdirs.forEach(subdir => {
  const dirPath = path.join(CSV_DIR, subdir);
  if (fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.csv'));
    console.log(`✅ ${subdir}: ${files.length} files`);
  } else {
    console.log(`⚠️  ${subdir}: not found`);
  }
});

console.log('\n🎯 SUMMARY\n');
console.log('=' .repeat(70));

const totalYears = YEARS.length;
const completedYears = YEARS.filter(y => results.consolidated[y]?.exists).length;
const yearsWithData = YEARS.filter(y => {
  const files = results.consolidated[y]?.files || {};
  return Object.values(files).some(f => f.hasData);
}).length;

console.log(`\n✅ Consolidated Data:`);
console.log(`   Years: ${completedYears}/${totalYears} directories`);
console.log(`   Years with data: ${yearsWithData}/${totalYears}`);

console.log(`\n✅ CSV Data:`);
console.log(`   Total files: ${results.csv.totalFiles || 0}`);
console.log(`   Consolidated files: ${results.csv.consolidatedCount || 0}`);

if (results.errors.length > 0) {
  console.log(`\n❌ ERRORS (${results.errors.length}):\n`);
  results.errors.slice(0, 10).forEach(error => {
    console.log(`   - ${error}`);
  });
  if (results.errors.length > 10) {
    console.log(`   ... and ${results.errors.length - 10} more errors`);
  }
} else {
  console.log(`\n✅ No errors found!`);
}

console.log('\n📦 PRODUCTION READINESS:\n');

if (completedYears === totalYears && yearsWithData >= 7 && results.csv.totalFiles > 50) {
  console.log('✅ ✅ ✅ READY FOR PRODUCTION DEPLOYMENT\n');
  console.log('All data files are in place and accessible.');
  console.log('The application should work correctly in production.');
} else if (yearsWithData >= 5) {
  console.log('⚠️  ⚠️  MOSTLY READY\n');
  console.log('Most data is in place, but some files may be missing.');
  console.log('The application will work but may show incomplete data for some years.');
} else {
  console.log('❌ ❌ ❌ NOT READY FOR PRODUCTION\n');
  console.log('Critical data files are missing.');
  console.log('The application may not work correctly.');
}

console.log('\n🚀 DEPLOYMENT CHECKLIST:\n');
console.log('   [' + (completedYears === totalYears ? '✓' : ' ') + '] All year directories exist');
console.log('   [' + (yearsWithData >= 7 ? '✓' : ' ') + '] All years have valid data');
console.log('   [' + (results.csv.totalFiles > 50 ? '✓' : ' ') + '] CSV files present');
console.log('   [' + (results.errors.length === 0 ? '✓' : ' ') + '] No critical errors');

process.exit(results.errors.length === 0 ? 0 : 1);
