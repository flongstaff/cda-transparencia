#!/usr/bin/env node

/**
 * AUDIT CHART COMPONENTS
 *
 * Analyzes all chart components to verify:
 * 1. Data source integration (props vs hooks vs services)
 * 2. Chart library usage (Recharts)
 * 3. Responsive design
 * 4. Error handling
 * 5. Loading states
 */

const fs = require('fs');
const path = require('path');

const CHARTS_DIR = path.join(__dirname, '../frontend/src/components/charts');

const CHART_LIBRARIES = [
  'recharts',
  '@nivo/core',
  'chart.js',
  'd3',
  'victory'
];

const DATA_PATTERNS = {
  propsData: /const.*=.*props\.(data|chartData)/,
  mockData: /(mockData|dummyData|sampleData|staticData)/i,
  useState: /useState.*\[\]/,
  useEffect: /useEffect/,
  serviceImport: /from ['"].*services/,
  hookImport: /from ['"].*hooks/,
  externalAPI: /externalAPIsService/,
  unifiedData: /unifiedDataService/
};

const UI_PATTERNS = {
  responsive: /ResponsiveContainer|className.*responsive/i,
  loading: /loading|isLoading|Loader/i,
  error: /error|Error/,
  tooltip: /Tooltip/,
  legend: /Legend/,
  animation: /animation|Animation/
};

function analyzeChart(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);

  const result = {
    file: fileName,
    lines: content.split('\n').length,

    // Data source analysis
    dataSource: {
      usesProps: DATA_PATTERNS.propsData.test(content),
      usesMockData: DATA_PATTERNS.mockData.test(content),
      usesState: DATA_PATTERNS.useState.test(content),
      usesEffect: DATA_PATTERNS.useEffect.test(content),
      importsService: DATA_PATTERNS.serviceImport.test(content),
      importsHook: DATA_PATTERNS.hookImport.test(content),
      usesExternalAPI: DATA_PATTERNS.externalAPI.test(content),
      usesUnifiedData: DATA_PATTERNS.unifiedData.test(content)
    },

    // Chart library
    chartLibrary: CHART_LIBRARIES.find(lib => content.includes(`from '${lib}'`) || content.includes(`from "${lib}"`)) || 'unknown',

    // UI features
    ui: {
      responsive: UI_PATTERNS.responsive.test(content),
      hasLoading: UI_PATTERNS.loading.test(content),
      hasError: UI_PATTERNS.error.test(content),
      hasTooltip: UI_PATTERNS.tooltip.test(content),
      hasLegend: UI_PATTERNS.legend.test(content),
      hasAnimation: UI_PATTERNS.animation.test(content)
    },

    // Chart types used
    chartTypes: []
  };

  // Detect chart types
  const rechartsCharts = [
    'BarChart', 'LineChart', 'AreaChart', 'PieChart',
    'RadarChart', 'ScatterChart', 'ComposedChart', 'Treemap'
  ];
  rechartsCharts.forEach(chartType => {
    if (content.includes(chartType)) {
      result.chartTypes.push(chartType);
    }
  });

  // Determine data integration status
  result.dataIntegration = 'unknown';
  if (result.dataSource.usesProps) {
    result.dataIntegration = 'props'; // Gets data from parent
  } else if (result.dataSource.importsHook || result.dataSource.usesUnifiedData || result.dataSource.usesExternalAPI) {
    result.dataIntegration = 'integrated'; // Uses services/hooks
  } else if (result.dataSource.usesMockData) {
    result.dataIntegration = 'mock'; // Uses mock data
  } else if (result.dataSource.usesState && !result.dataSource.usesEffect) {
    result.dataIntegration = 'static'; // Static data in state
  }

  // Determine if needs update
  result.needsUpdate =
    result.dataIntegration === 'mock' ||
    result.dataIntegration === 'static' ||
    result.dataIntegration === 'unknown' ||
    !result.ui.responsive ||
    !result.ui.hasLoading ||
    !result.ui.hasError;

  return result;
}

// Main
const files = fs.readdirSync(CHARTS_DIR).filter(f => f.endsWith('.tsx'));

console.log(`\n📊 ANALYZING ${files.length} CHART COMPONENTS\n`);
console.log('='.repeat(80));

const results = files.map(file => analyzeChart(path.join(CHARTS_DIR, file)));

// Summary by data integration
const byIntegration = {
  props: results.filter(r => r.dataIntegration === 'props'),
  integrated: results.filter(r => r.dataIntegration === 'integrated'),
  mock: results.filter(r => r.dataIntegration === 'mock'),
  static: results.filter(r => r.dataIntegration === 'static'),
  unknown: results.filter(r => r.dataIntegration === 'unknown')
};

console.log('\n📈 DATA INTEGRATION STATUS:\n');
console.log(`✅ Props-based (parent provides data):    ${byIntegration.props.length}`);
console.log(`✅ Integrated (uses services/hooks):      ${byIntegration.integrated.length}`);
console.log(`⚠️  Mock data (hardcoded):                ${byIntegration.mock.length}`);
console.log(`⚠️  Static data (state without fetch):    ${byIntegration.static.length}`);
console.log(`❌ Unknown (needs investigation):         ${byIntegration.unknown.length}`);

// Charts needing update
const needsUpdate = results.filter(r => r.needsUpdate);
console.log(`\n🔄 Charts needing update: ${needsUpdate.length}/${files.length}`);

// Chart library usage
console.log('\n\n📚 CHART LIBRARY USAGE:\n');
const libraryUsage = {};
results.forEach(r => {
  libraryUsage[r.chartLibrary] = (libraryUsage[r.chartLibrary] || 0) + 1;
});
Object.entries(libraryUsage)
  .sort((a, b) => b[1] - a[1])
  .forEach(([lib, count]) => {
    console.log(`  ${lib.padEnd(20)} → ${count} charts`);
  });

// UI features summary
console.log('\n\n🎨 UI FEATURES:\n');
const uiFeatures = {
  responsive: results.filter(r => r.ui.responsive).length,
  loading: results.filter(r => r.ui.hasLoading).length,
  error: results.filter(r => r.ui.hasError).length,
  tooltip: results.filter(r => r.ui.hasTooltip).length,
  legend: results.filter(r => r.ui.hasLegend).length,
  animation: results.filter(r => r.ui.hasAnimation).length
};

Object.entries(uiFeatures).forEach(([feature, count]) => {
  const percentage = ((count / files.length) * 100).toFixed(1);
  const status = count > files.length * 0.8 ? '✅' : count > files.length * 0.5 ? '⚠️ ' : '❌';
  console.log(`  ${status} ${feature.padEnd(15)} → ${count}/${files.length} (${percentage}%)`);
});

// Most used chart types
console.log('\n\n📊 MOST USED CHART TYPES:\n');
const chartTypeUsage = {};
results.forEach(r => {
  r.chartTypes.forEach(type => {
    chartTypeUsage[type] = (chartTypeUsage[type] || 0) + 1;
  });
});
Object.entries(chartTypeUsage)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .forEach(([type, count]) => {
    console.log(`  ${type.padEnd(20)} → ${count} charts`);
  });

// Charts with issues
console.log('\n\n⚠️  CHARTS WITH ISSUES:\n');

if (byIntegration.mock.length > 0) {
  console.log('\n📌 Using Mock Data (need real data integration):');
  byIntegration.mock.forEach(r => {
    console.log(`  • ${r.file}`);
  });
}

if (byIntegration.static.length > 0) {
  console.log('\n📌 Using Static Data (need data fetching):');
  byIntegration.static.forEach(r => {
    console.log(`  • ${r.file}`);
  });
}

if (byIntegration.unknown.length > 0) {
  console.log('\n📌 Unknown Data Source (need investigation):');
  byIntegration.unknown.forEach(r => {
    console.log(`  • ${r.file}`);
  });
}

const missingResponsive = results.filter(r => !r.ui.responsive);
if (missingResponsive.length > 0) {
  console.log('\n📌 Missing Responsive Design:');
  missingResponsive.slice(0, 10).forEach(r => {
    console.log(`  • ${r.file}`);
  });
  if (missingResponsive.length > 10) {
    console.log(`  ... and ${missingResponsive.length - 10} more`);
  }
}

const missingError = results.filter(r => !r.ui.hasError);
if (missingError.length > 0) {
  console.log('\n📌 Missing Error Handling:');
  missingError.slice(0, 10).forEach(r => {
    console.log(`  • ${r.file}`);
  });
  if (missingError.length > 10) {
    console.log(`  ... and ${missingError.length - 10} more`);
  }
}

// Export detailed results
fs.writeFileSync(
  path.join(__dirname, '../docs/CHART_AUDIT_RESULTS.json'),
  JSON.stringify(results, null, 2)
);

console.log('\n\n📄 Detailed results saved to: docs/CHART_AUDIT_RESULTS.json');

// Priority recommendations
console.log('\n\n🎯 PRIORITY RECOMMENDATIONS:\n');
console.log('1. Update charts using mock/static data to use props or services');
console.log('2. Add ResponsiveContainer to all charts for mobile support');
console.log('3. Add error boundaries and loading states');
console.log('4. Standardize on Recharts library (currently most used)');
console.log('5. Add tooltips to all charts for better UX');

console.log('\n');
