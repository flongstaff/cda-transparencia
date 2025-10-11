#!/usr/bin/env node

/**
 * AUTOMATED CHART UPDATE SCRIPT
 *
 * Updates chart components to:
 * 1. Add ResponsiveContainer where missing
 * 2. Update to use CloudflareWorkerDataService
 * 3. Add proper error/loading states
 * 4. Add TypeScript types
 */

const fs = require('fs');
const path = require('path');

const CHARTS_DIR = path.join(__dirname, '../frontend/src/components/charts');
const AUDIT_RESULTS = require('../docs/CHART_AUDIT_RESULTS.json');

// Get charts that need updates
const chartsNeedingUpdate = AUDIT_RESULTS.filter(chart => chart.needsUpdate);

console.log(`\n📊 UPDATING ${chartsNeedingUpdate.length} CHART COMPONENTS\n`);
console.log('='.repeat(80));

let updatedCount = 0;
let skippedCount = 0;
const errors = [];

chartsNeedingUpdate.forEach((chartInfo) => {
  const filePath = path.join(CHARTS_DIR, chartInfo.file);

  // Skip if file doesn't exist or is a template/test file
  if (!fs.existsSync(filePath) ||
      chartInfo.file.startsWith('_') ||
      chartInfo.file.startsWith('Test') ||
      chartInfo.file === 'ChartWrapper.tsx' ||
      chartInfo.file === 'BaseChart.tsx') {
    console.log(`⏭️  Skipping: ${chartInfo.file} (template/test/core file)`);
    skippedCount++;
    return;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    const updates = [];

    // 1. Add ResponsiveContainer import if missing
    if (!chartInfo.ui.responsive && chartInfo.chartLibrary === 'recharts') {
      if (!content.includes('ResponsiveContainer')) {
        // Find the recharts import line
        const rechartsImportMatch = content.match(/import\s+{([^}]+)}\s+from\s+['"]recharts['"]/);
        if (rechartsImportMatch) {
          const imports = rechartsImportMatch[1];
          if (!imports.includes('ResponsiveContainer')) {
            const newImports = imports.trim() + ', ResponsiveContainer';
            content = content.replace(
              /import\s+{([^}]+)}\s+from\s+['"]recharts['"]/,
              `import { ${newImports} } from 'recharts'`
            );
            modified = true;
            updates.push('Added ResponsiveContainer import');
          }
        }
      }
    }

    // 2. Add CloudflareWorkerDataService import if missing
    if (chartInfo.dataIntegration === 'unknown' &&
        !content.includes('cloudflareWorkerDataService') &&
        !content.includes('CloudflareWorkerDataService')) {

      // Add import after other imports
      const lastImportMatch = content.match(/import[^;]+;(?=\n\n)/g);
      if (lastImportMatch) {
        const lastImport = lastImportMatch[lastImportMatch.length - 1];
        const importToAdd = `\nimport { cloudflareWorkerDataService } from '../../services/CloudflareWorkerDataService';`;
        content = content.replace(lastImport, lastImport + importToAdd);
        modified = true;
        updates.push('Added CloudflareWorkerDataService import');
      }
    }

    // 3. Add loading/error state interfaces if missing
    if (!chartInfo.ui.hasLoading || !chartInfo.ui.hasError) {
      if (!content.includes('const [loading') && !content.includes('const [isLoading')) {
        // This is more complex - we'll note it for manual review
        updates.push('⚠️  Needs loading state (manual review required)');
      }
      if (!content.includes('const [error') && !content.includes('const [errorMessage')) {
        updates.push('⚠️  Needs error state (manual review required)');
      }
    }

    // 4. Wrap chart output in ResponsiveContainer if needed
    if (!chartInfo.ui.responsive && chartInfo.chartLibrary === 'recharts') {
      // Look for chart components not wrapped in ResponsiveContainer
      const chartTypes = ['BarChart', 'LineChart', 'AreaChart', 'PieChart', 'RadarChart', 'ScatterChart', 'ComposedChart'];
      chartTypes.forEach(chartType => {
        if (content.includes(`<${chartType}`) && !content.includes('ResponsiveContainer')) {
          updates.push(`⚠️  ${chartType} needs ResponsiveContainer wrapper (manual review required)`);
        }
      });
    }

    // Write file if modified
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      updatedCount++;
      console.log(`✅ Updated: ${chartInfo.file}`);
      if (updates.length > 0) {
        updates.forEach(update => console.log(`   - ${update}`));
      }
    } else if (updates.length > 0) {
      console.log(`📋 Review needed: ${chartInfo.file}`);
      updates.forEach(update => console.log(`   - ${update}`));
    }

  } catch (error) {
    errors.push({ file: chartInfo.file, error: error.message });
    console.log(`❌ Error updating ${chartInfo.file}: ${error.message}`);
  }
});

console.log('\n' + '='.repeat(80));
console.log(`\n📊 SUMMARY:`);
console.log(`   ✅ Automatically updated: ${updatedCount} files`);
console.log(`   ⏭️  Skipped: ${skippedCount} files`);
console.log(`   ❌ Errors: ${errors.length} files`);

if (errors.length > 0) {
  console.log('\n❌ Errors encountered:');
  errors.forEach(({ file, error }) => {
    console.log(`   - ${file}: ${error}`);
  });
}

console.log('\n📝 NEXT STEPS:');
console.log('   1. Review files marked with ⚠️  (manual updates needed)');
console.log('   2. Run: node scripts/update-high-priority-charts.js');
console.log('   3. Test updated charts in development');
console.log('   4. Run: npm run typecheck && npm run lint');
console.log('\n');
