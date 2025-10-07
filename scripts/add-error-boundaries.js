#!/usr/bin/env node

/**
 * Automatically add ErrorBoundary to pages that are missing it
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PAGES_DIR = path.join(__dirname, '../frontend/src/pages');

// Pages that need ErrorBoundary (from audit)
const PAGES_TO_FIX = [
  'About.tsx',
  'AllChartsDashboard.tsx',
  'AnalyticsDashboard.tsx',
  'AnomalyDashboard.tsx',
  'AntiCorruptionDashboard.tsx',
  'AuditAnomaliesExplainer.tsx',
  'AuditsAndDiscrepanciesPage.tsx',
  'Contact.tsx',
  'CorruptionMonitoringDashboard.tsx',
  'DashboardCompleto.tsx',
  'DataConnectivityTest.tsx',
  'DataRightsPage.tsx',
  'DataSourceMonitoringDashboard.tsx',
  'DataVerificationPage.tsx',
  'Database.tsx',
  'DebtPage.tsx',
  'DocumentAnalysisPage.tsx',
  'DocumentsUnified.tsx',
  'EnhancedTransparencyDashboard.tsx',
  'EnhancedTransparencyPage.tsx',
  'FinancialDashboard.tsx',
  'FlaggedAnalysisPage.tsx',
  'Home.tsx',
  'InfrastructureTracker.tsx',
  'InvestmentsPage.tsx',
  'MetaTransparencyDashboard.tsx',
  'MonitoringPage.tsx',
  'NotFoundPage.tsx',
  'OpenDataCatalogPage.tsx',
  'OpenDataPage.tsx',
  'PrivacyPolicyPage.tsx',
  'PropertyDeclarations.tsx',
  'Reports.tsx',
  'Salaries.tsx',
  'SearchPage.tsx',
  'TestAllChartsPage.tsx',
  'TransparencyPage.tsx',
  'TransparencyPortal.tsx',
  'Treasury.tsx'
];

let filesModified = 0;
let filesSkipped = 0;
const errors = [];

/**
 * Add ErrorBoundary to a page file
 */
async function addErrorBoundary(filePath) {
  const fileName = path.basename(filePath);

  try {
    let content = await fs.readFile(filePath, 'utf-8');

    // Skip if already has ErrorBoundary
    if (content.includes('ErrorBoundary')) {
      console.log(`⏭️  Skipping ${fileName} (already has ErrorBoundary)`);
      filesSkipped++;
      return;
    }

    // Add ErrorBoundary import if not present
    if (!content.includes("from '../components/common/ErrorBoundary'")) {
      // Find the last import statement
      const importLines = content.split('\n').filter(line => line.trim().startsWith('import'));
      if (importLines.length > 0) {
        const lastImportLine = importLines[importLines.length - 1];
        content = content.replace(
          lastImportLine,
          `${lastImportLine}\nimport ErrorBoundary from '../components/common/ErrorBoundary';`
        );
      }
    }

    // Find the component name and export
    const componentMatch = content.match(/const (\w+):\s*React\.FC/);
    if (!componentMatch) {
      console.log(`⚠️  Could not find component in ${fileName}`);
      errors.push({ file: fileName, error: 'Component pattern not found' });
      return;
    }

    const componentName = componentMatch[1];

    // Check if already wrapped
    if (content.includes(`${componentName}WithErrorBoundary`)) {
      console.log(`⏭️  Skipping ${fileName} (already wrapped)`);
      filesSkipped++;
      return;
    }

    // Find export statement
    const exportPattern = new RegExp(`export default ${componentName};`);
    if (!exportPattern.test(content)) {
      console.log(`⚠️  Could not find export in ${fileName}`);
      errors.push({ file: fileName, error: 'Export pattern not found' });
      return;
    }

    // Add ErrorBoundary wrapper before export
    const errorBoundaryWrapper = `
// Wrap with error boundary for production safety
const ${componentName}WithErrorBoundary: React.FC = () => {
  return (
    <ErrorBoundary
      fallback={(error) => (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-6 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200">
                  Error al Cargar Página
                </h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <p>Ocurrió un error al cargar esta página. Por favor, intente más tarde.</p>
                  {error && (
                    <p className="mt-2 text-xs font-mono bg-yellow-100 dark:bg-yellow-900/40 p-2 rounded">
                      {error.message}
                    </p>
                  )}
                </div>
                <div className="mt-4 space-x-2">
                  <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-md"
                  >
                    Recargar
                  </button>
                  <a
                    href="/"
                    className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-md"
                  >
                    Volver al Inicio
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    >
      <${componentName} />
    </ErrorBoundary>
  );
};
`;

    // Replace export
    content = content.replace(
      `export default ${componentName};`,
      `${errorBoundaryWrapper}\nexport default ${componentName}WithErrorBoundary;`
    );

    // Write back to file
    await fs.writeFile(filePath, content);

    console.log(`✅ Added ErrorBoundary to ${fileName}`);
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
  console.log('🚀 Adding ErrorBoundary to pages');
  console.log('='.repeat(60));

  try {
    for (const fileName of PAGES_TO_FIX) {
      const filePath = path.join(PAGES_DIR, fileName);

      try {
        await fs.access(filePath);
        await addErrorBoundary(filePath);
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

    if (errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      errors.forEach(({ file, error }) => {
        console.log(`   ${file}: ${error}`);
      });
    }

    console.log('\n✅ ErrorBoundary addition completed!');

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main, addErrorBoundary };
