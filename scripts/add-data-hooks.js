#!/usr/bin/env node

/**
 * Add appropriate data fetching hooks to pages that need them
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PAGES_DIR = path.join(__dirname, '../frontend/src/pages');

// Pages that need data hooks and what hook they should use
const PAGES_TO_FIX = [
  { file: 'FinancialDashboard.tsx', hook: 'useUnifiedData', reason: 'Displays financial charts' },
  { file: 'Home.tsx', hook: 'useMasterData', reason: 'Shows dashboard statistics' },
  { file: 'MonitoringDashboard.tsx', hook: 'useMasterData', reason: 'Monitoring dashboard' },
  { file: 'StandardizedDashboard.tsx', hook: 'useMasterData', reason: 'Standardized dashboard' },
  { file: 'CorruptionMonitoringDashboard.tsx', hook: 'useMasterData', reason: 'Monitoring corruption data' },
  { file: 'MetaTransparencyDashboard.tsx', hook: 'useMasterData', reason: 'Transparency metrics' },
  { file: 'EnhancedTransparencyPage.tsx', hook: 'useMasterData', reason: 'Transparency indicators' },
  { file: 'DataSourceMonitoringDashboard.tsx', hook: 'useMasterData', reason: 'Data source monitoring' },
  { file: 'AuditAnomaliesExplainer.tsx', hook: 'useMasterData', reason: 'Audit data display' },
  { file: 'DocumentAnalysisPage.tsx', hook: 'useMasterData', reason: 'Document analysis' },
  { file: 'FlaggedAnalysisPage.tsx', hook: 'useMasterData', reason: 'Flagged items analysis' },
  { file: 'TestAllChartsPage.tsx', hook: 'useMasterData', reason: 'Chart testing with real data' }
];

// Informational pages that don't need data hooks
const SKIP_PAGES = [
  'SearchPage.tsx',  // Gets data via SearchWithAI component
  'PrivacyPolicyPage.tsx',  // Static legal content
  'DataRightsPage.tsx',  // Static legal content
  'OpenDataPage.tsx',  // Static informational page
  'OpenDataCatalogPage.tsx',  // May need custom implementation
  'MonitoringPage.tsx',  // May need custom implementation
  'TransparencyPage.tsx'  // May need custom implementation
];

let filesModified = 0;
let filesSkipped = 0;
const errors = [];

/**
 * Add data hook import and usage to a page file
 */
async function addDataHook(filePath, hookName, reason) {
  const fileName = path.basename(filePath);

  try {
    let content = await fs.readFile(filePath, 'utf-8');

    // Skip if already has this hook
    if (content.includes(hookName)) {
      console.log(`⏭️  Skipping ${fileName} (already has ${hookName})`);
      filesSkipped++;
      return;
    }

    // Add hook import if not present
    const hookImportLine = `import { ${hookName} } from '../hooks/${hookName}';`;

    if (!content.includes(hookImportLine)) {
      // Find the last import statement
      const lines = content.split('\n');
      let lastImportIndex = -1;

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('import ')) {
          lastImportIndex = i;
        }
      }

      if (lastImportIndex === -1) {
        console.log(`⚠️  Could not find import statements in ${fileName}`);
        errors.push({ file: fileName, error: 'No import statements found' });
        return;
      }

      // Insert the new import after the last import
      lines.splice(lastImportIndex + 1, 0, hookImportLine);
      content = lines.join('\n');
    }

    // Find the component function
    const componentMatch = content.match(/const (\w+):\s*React\.FC/);
    if (!componentMatch) {
      console.log(`⚠️  Could not find component in ${fileName}`);
      errors.push({ file: fileName, error: 'Component pattern not found' });
      return;
    }

    const componentName = componentMatch[1];

    // Check if this is the wrapped component (not the ErrorBoundary wrapper)
    const isWrappedComponent = componentName.endsWith('WithErrorBoundary');

    if (isWrappedComponent) {
      // Find the original component (without WithErrorBoundary suffix)
      const originalComponentName = componentName.replace('WithErrorBoundary', '');
      const originalComponentPattern = new RegExp(`const ${originalComponentName}:\\s*React\\.FC.*?=.*?\\{`);
      const match = content.match(originalComponentPattern);

      if (!match) {
        console.log(`⚠️  Could not find original component ${originalComponentName} in ${fileName}`);
        errors.push({ file: fileName, error: 'Original component not found' });
        return;
      }

      // Add hook call right after the component function declaration
      const hookCall = `\n  const { data, loading, error } = ${hookName}();\n`;
      content = content.replace(
        originalComponentPattern,
        match[0] + hookCall
      );
    } else {
      // Add hook call right after the component function declaration
      const componentPattern = new RegExp(`const ${componentName}:\\s*React\\.FC.*?=.*?\\{`);
      const match = content.match(componentPattern);

      if (!match) {
        console.log(`⚠️  Could not find component declaration in ${fileName}`);
        errors.push({ file: fileName, error: 'Component declaration not found' });
        return;
      }

      const hookCall = `\n  const { data, loading, error } = ${hookName}();\n`;
      content = content.replace(
        componentPattern,
        match[0] + hookCall
      );
    }

    // Write back to file
    await fs.writeFile(filePath, content);

    console.log(`✅ Added ${hookName} to ${fileName} (${reason})`);
    filesModified++;

  } catch (error) {
    console.error(`❌ Error processing ${fileName}:`, error.message);
    errors.push({ file: fileName, error: error.message });
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Adding data fetching hooks to pages');
  console.log('='.repeat(60));

  try {
    for (const { file: fileName, hook, reason } of PAGES_TO_FIX) {
      const filePath = path.join(PAGES_DIR, fileName);

      try {
        await fs.access(filePath);
        await addDataHook(filePath, hook, reason);
      } catch (error) {
        if (error.code === 'ENOENT') {
          console.log(`⏭️  Skipping ${fileName} (file not found)`);
          filesSkipped++;
        } else {
          throw error;
        }
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   Files modified: ${filesModified}`);
    console.log(`   Files skipped: ${filesSkipped}`);
    console.log(`   Errors: ${errors.length}`);
    console.log(`   Informational pages (no hooks needed): ${SKIP_PAGES.length}`);

    if (errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      errors.forEach(({ file, error }) => {
        console.log(`   ${file}: ${error}`);
      });
    }

    console.log('\n✅ Data hooks addition completed!');

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main, addDataHook };
