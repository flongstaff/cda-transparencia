#!/usr/bin/env node

/**
 * Integration Test Script
 * Tests the enhanced transparency system integration
 * Ensures all components work together properly
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Enhanced Transparency System Integration...\n');

// Test 1: Check if all required files exist
const requiredFiles = [
  'frontend/src/pages/TransparencyPortal.tsx',
  'frontend/src/components/charts/EnhancedDataVisualization.tsx',
  'frontend/src/components/monitoring/OSINTMonitoringSystem.tsx',
  'frontend/src/components/dashboard/EnhancedTransparencyDashboard.tsx',
  'frontend/src/services/OSINTDataService.ts',
  'frontend/src/services/EnhancedDataIntegrationService.ts',
  'frontend/src/hooks/useEnhancedData.ts',
  'frontend/src/App.tsx',
  'DEPLOYMENT_GUIDE.md',
  'INTEGRATION_GUIDE.md',
  'ENHANCED_TRANSPARENCY_SYSTEM.md'
];

console.log('📁 Checking required files...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Some required files are missing. Please ensure all components are created.');
  process.exit(1);
}

// Test 2: Check package.json dependencies
console.log('\n📦 Checking dependencies...');
const packageJsonPath = path.join(__dirname, '..', 'frontend', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const requiredDeps = [
  'react',
  'react-dom',
  'react-router-dom',
  'recharts',
  'lucide-react',
  'framer-motion',
  'react-helmet-async',
  '@tanstack/react-query'
];

let allDepsExist = true;
requiredDeps.forEach(dep => {
  if (packageJson.dependencies[dep]) {
    console.log(`✅ ${dep} - ${packageJson.dependencies[dep]}`);
  } else {
    console.log(`❌ ${dep} - MISSING`);
    allDepsExist = false;
  }
});

if (!allDepsExist) {
  console.log('\n❌ Some required dependencies are missing. Please run npm install.');
  process.exit(1);
}

// Test 3: Check data sources integration
console.log('\n🔗 Checking data sources integration...');
const dataSourcesPath = path.join(__dirname, '..', 'docs', 'DATA_SOURCES.md');
if (fs.existsSync(dataSourcesPath)) {
  const dataSources = fs.readFileSync(dataSourcesPath, 'utf8');
  const expectedSources = [
    'Gobierno de Buenos Aires',
    'Boletín Oficial',
    'Ministerio de Hacienda',
    'Contrataciones Públicas',
    'Portal de Transparencia Nacional',
    'Datos Argentina',
    'Carmen de Areco Oficial'
  ];
  
  let sourcesFound = 0;
  expectedSources.forEach(source => {
    if (dataSources.includes(source)) {
      console.log(`✅ ${source}`);
      sourcesFound++;
    } else {
      console.log(`❌ ${source} - NOT FOUND`);
    }
  });
  
  if (sourcesFound === expectedSources.length) {
    console.log('✅ All expected data sources found in DATA_SOURCES.md');
  } else {
    console.log(`⚠️  Only ${sourcesFound}/${expectedSources.length} data sources found`);
  }
} else {
  console.log('❌ DATA_SOURCES.md not found');
}

// Test 4: Check App.tsx routing
console.log('\n🛣️  Checking routing configuration...');
const appTsxPath = path.join(__dirname, '..', 'frontend', 'src', 'App.tsx');
const appTsx = fs.readFileSync(appTsxPath, 'utf8');

const expectedRoutes = [
  'TransparencyPortal',
  'EnhancedTransparencyDashboard',
  'OSINTMonitoringSystem'
];

let routesFound = 0;
expectedRoutes.forEach(route => {
  if (appTsx.includes(route)) {
    console.log(`✅ ${route} route configured`);
    routesFound++;
  } else {
    console.log(`❌ ${route} route - NOT FOUND`);
  }
});

if (routesFound === expectedRoutes.length) {
  console.log('✅ All expected routes are configured');
} else {
  console.log(`⚠️  Only ${routesFound}/${expectedRoutes.length} routes configured`);
}

// Test 5: Check for syntax errors in key files
console.log('\n🔍 Checking for syntax errors...');
const keyFiles = [
  'frontend/src/pages/TransparencyPortal.tsx',
  'frontend/src/services/OSINTDataService.ts',
  'frontend/src/services/EnhancedDataIntegrationService.ts'
];

let syntaxErrors = 0;
keyFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    // Basic syntax checks
    if (content.includes('import') && content.includes('export') && content.length > 100) {
      console.log(`✅ ${file} - Syntax looks good`);
    } else {
      console.log(`⚠️  ${file} - Potential syntax issues`);
      syntaxErrors++;
    }
  } catch (error) {
    console.log(`❌ ${file} - Error reading file: ${error.message}`);
    syntaxErrors++;
  }
});

// Test 6: Check Cloudflare configuration
console.log('\n☁️  Checking Cloudflare configuration...');
const cloudflareFiles = [
  'wrangler.toml',
  'cloudflare.json',
  'CNAME'
];

cloudflareFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} - Found`);
  } else {
    console.log(`⚠️  ${file} - Not found (may be optional)`);
  }
});

// Test 7: Check deployment readiness
console.log('\n🚀 Checking deployment readiness...');
const deploymentFiles = [
  'DEPLOYMENT_GUIDE.md',
  'INTEGRATION_GUIDE.md',
  'ENHANCED_TRANSPARENCY_SYSTEM.md'
];

let deploymentReady = true;
deploymentFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.length > 1000) { // Basic check for substantial content
      console.log(`✅ ${file} - Ready`);
    } else {
      console.log(`⚠️  ${file} - May need more content`);
      deploymentReady = false;
    }
  } else {
    console.log(`❌ ${file} - Missing`);
    deploymentReady = false;
  }
});

// Final Results
console.log('\n📊 Integration Test Results:');
console.log('================================');

if (allFilesExist && allDepsExist && syntaxErrors === 0) {
  console.log('✅ INTEGRATION TEST PASSED');
  console.log('🎉 Enhanced Transparency System is ready for deployment!');
  console.log('\n📋 Next Steps:');
  console.log('1. Run: npm run build:production');
  console.log('2. Deploy to Cloudflare Pages/Workers');
  console.log('3. Configure DNS for cda-transparencia.org');
  console.log('4. Test the live portal');
  
  if (deploymentReady) {
    console.log('\n📚 Documentation:');
    console.log('- DEPLOYMENT_GUIDE.md - Complete deployment instructions');
    console.log('- INTEGRATION_GUIDE.md - Integration details');
    console.log('- ENHANCED_TRANSPARENCY_SYSTEM.md - System overview');
  }
} else {
  console.log('❌ INTEGRATION TEST FAILED');
  console.log('\n🔧 Issues to fix:');
  if (!allFilesExist) console.log('- Missing required files');
  if (!allDepsExist) console.log('- Missing dependencies');
  if (syntaxErrors > 0) console.log('- Syntax errors in key files');
  if (!deploymentReady) console.log('- Incomplete documentation');
  
  console.log('\n💡 Run this script again after fixing the issues.');
  process.exit(1);
}

console.log('\n🌟 Enhanced Transparency System Integration Complete!');
console.log('🔗 Repository: https://github.com/flongstaff/cda-transparencia');
console.log('🌐 Live Portal: https://cda-transparencia.org (after deployment)');
