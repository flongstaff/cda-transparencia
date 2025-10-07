#!/usr/bin/env node

/**
 * Comprehensive Pages and Components Audit
 *
 * Analyzes:
 * - All pages and their data fetching methods
 * - All chart components and their usage
 * - Integration status
 * - Unused components
 * - Data flow issues
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FRONTEND_DIR = path.join(__dirname, '../frontend/src');
const PAGES_DIR = path.join(FRONTEND_DIR, 'pages');
const CHARTS_DIR = path.join(FRONTEND_DIR, 'components/charts');
const OUTPUT_DIR = path.join(__dirname, '../docs');

// Audit results
const audit = {
  timestamp: new Date().toISOString(),
  pages: {
    total: 0,
    with_data_hooks: 0,
    with_external_apis: 0,
    with_charts: 0,
    details: []
  },
  charts: {
    total: 0,
    used_in_pages: 0,
    unused: [],
    details: []
  },
  hooks: {
    useMasterData: [],
    useUnifiedData: [],
    useMultiYearData: [],
    useSmartData: [],
    custom: []
  },
  services: {
    externalAPIsService: [],
    unifiedDataService: [],
    productionDataManager: [],
    smartDataLoader: []
  },
  issues: [],
  recommendations: []
};

/**
 * Analyze a single file for patterns
 */
async function analyzeFile(filePath, type) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const fileName = path.basename(filePath);

    const analysis = {
      name: fileName,
      path: filePath,
      type,
      hooks: [],
      services: [],
      charts: [],
      hasErrorBoundary: content.includes('ErrorBoundary'),
      hasExternalData: false,
      hasLocalData: false,
      issues: []
    };

    // Check for data hooks
    if (content.includes('useMasterData')) {
      analysis.hooks.push('useMasterData');
      analysis.hasLocalData = true;
    }
    if (content.includes('useUnifiedData')) {
      analysis.hooks.push('useUnifiedData');
      analysis.hasLocalData = true;
    }
    if (content.includes('useMultiYearData')) {
      analysis.hooks.push('useMultiYearData');
      analysis.hasLocalData = true;
    }
    if (content.includes('useSmartData')) {
      analysis.hooks.push('useSmartData');
      analysis.hasLocalData = true;
    }
    if (content.includes('useSalariesData')) {
      analysis.hooks.push('useSalariesData');
      analysis.hasLocalData = true;
    }
    if (content.includes('useBudgetData')) {
      analysis.hooks.push('useBudgetData');
      analysis.hasLocalData = true;
    }

    // Check for services
    if (content.includes('externalAPIsService')) {
      analysis.services.push('externalAPIsService');
      analysis.hasExternalData = true;
    }
    if (content.includes('unifiedDataService')) {
      analysis.services.push('unifiedDataService');
      analysis.hasLocalData = true;
    }
    if (content.includes('productionDataManager')) {
      analysis.services.push('productionDataManager');
      analysis.hasExternalData = true;
    }
    if (content.includes('smartDataLoader')) {
      analysis.services.push('smartDataLoader');
      analysis.hasLocalData = true;
    }

    // Check for chart imports
    const chartImports = content.match(/import.*from.*charts\/.+/g) || [];
    chartImports.forEach(imp => {
      const match = imp.match(/['"].*charts\/(.+)['"]/);
      if (match) {
        analysis.charts.push(match[1].replace('.tsx', '').replace('.ts', ''));
      }
    });

    // Identify issues
    if (type === 'page') {
      if (!analysis.hasErrorBoundary) {
        analysis.issues.push('Missing ErrorBoundary');
      }
      if (analysis.hooks.length === 0 && analysis.services.length === 0) {
        analysis.issues.push('No data fetching mechanism detected');
      }
      if (content.includes('TODO') || content.includes('FIXME')) {
        analysis.issues.push('Contains TODO/FIXME comments');
      }
    }

    return analysis;
  } catch (error) {
    console.error(`Error analyzing ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Analyze all pages
 */
async function analyzePages() {
  console.log('\n📄 Analyzing pages...');

  const files = await fs.readdir(PAGES_DIR);
  const tsxFiles = files.filter(f => f.endsWith('.tsx'));

  audit.pages.total = tsxFiles.length;

  for (const file of tsxFiles) {
    const filePath = path.join(PAGES_DIR, file);
    const analysis = await analyzeFile(filePath, 'page');

    if (analysis) {
      audit.pages.details.push(analysis);

      if (analysis.hooks.length > 0) {
        audit.pages.with_data_hooks++;
        analysis.hooks.forEach(hook => {
          if (audit.hooks[hook]) {
            audit.hooks[hook].push(file);
          } else {
            audit.hooks.custom.push({ file, hook });
          }
        });
      }

      if (analysis.hasExternalData) {
        audit.pages.with_external_apis++;
      }

      if (analysis.charts.length > 0) {
        audit.pages.with_charts++;
      }

      if (analysis.services.length > 0) {
        analysis.services.forEach(service => {
          if (audit.services[service]) {
            audit.services[service].push(file);
          }
        });
      }

      if (analysis.issues.length > 0) {
        audit.issues.push({
          file,
          type: 'page',
          issues: analysis.issues
        });
      }
    }
  }

  console.log(`✅ Analyzed ${audit.pages.total} pages`);
  console.log(`   - With data hooks: ${audit.pages.with_data_hooks}`);
  console.log(`   - With external APIs: ${audit.pages.with_external_apis}`);
  console.log(`   - With charts: ${audit.pages.with_charts}`);
}

/**
 * Analyze all charts
 */
async function analyzeCharts() {
  console.log('\n📊 Analyzing charts...');

  const files = await fs.readdir(CHARTS_DIR);
  const tsxFiles = files.filter(f => f.endsWith('.tsx'));

  audit.charts.total = tsxFiles.length;

  // Find which charts are used in pages
  const usedCharts = new Set();
  audit.pages.details.forEach(page => {
    page.charts.forEach(chart => usedCharts.add(chart));
  });

  for (const file of tsxFiles) {
    const filePath = path.join(CHARTS_DIR, file);
    const chartName = file.replace('.tsx', '');
    const isUsed = usedCharts.has(chartName);

    if (isUsed) {
      audit.charts.used_in_pages++;
    } else {
      audit.charts.unused.push(chartName);
    }

    const analysis = await analyzeFile(filePath, 'chart');
    if (analysis) {
      analysis.usedInPages = isUsed;
      analysis.usageCount = audit.pages.details.filter(p => p.charts.includes(chartName)).length;
      audit.charts.details.push(analysis);
    }
  }

  console.log(`✅ Analyzed ${audit.charts.total} charts`);
  console.log(`   - Used in pages: ${audit.charts.used_in_pages}`);
  console.log(`   - Unused: ${audit.charts.unused.length}`);
}

/**
 * Generate recommendations
 */
function generateRecommendations() {
  console.log('\n💡 Generating recommendations...');

  // Pages without data hooks
  const pagesWithoutData = audit.pages.details.filter(p => p.hooks.length === 0 && p.services.length === 0);
  if (pagesWithoutData.length > 0) {
    audit.recommendations.push({
      priority: 'HIGH',
      category: 'Data Integration',
      message: `${pagesWithoutData.length} pages have no data fetching mechanism`,
      pages: pagesWithoutData.map(p => p.name),
      action: 'Add useUnifiedData or useMasterData hook to fetch data'
    });
  }

  // Pages without error boundaries
  const pagesWithoutErrorBoundary = audit.pages.details.filter(p => !p.hasErrorBoundary);
  if (pagesWithoutErrorBoundary.length > 0) {
    audit.recommendations.push({
      priority: 'MEDIUM',
      category: 'Error Handling',
      message: `${pagesWithoutErrorBoundary.length} pages missing ErrorBoundary`,
      pages: pagesWithoutErrorBoundary.map(p => p.name),
      action: 'Wrap component with ErrorBoundary for production safety'
    });
  }

  // Unused charts
  if (audit.charts.unused.length > 0) {
    audit.recommendations.push({
      priority: 'LOW',
      category: 'Code Cleanup',
      message: `${audit.charts.unused.length} chart components are unused`,
      charts: audit.charts.unused,
      action: 'Consider removing or consolidating unused chart components'
    });
  }

  // Pages using old hooks
  const pagesWithOldHooks = audit.pages.details.filter(p =>
    p.hooks.includes('useMasterData') && !p.hooks.includes('useSmartData')
  );
  if (pagesWithOldHooks.length > 0) {
    audit.recommendations.push({
      priority: 'MEDIUM',
      category: 'Performance',
      message: `${pagesWithOldHooks.length} pages could benefit from new caching hooks`,
      pages: pagesWithOldHooks.map(p => p.name),
      action: 'Consider migrating to useSmartData for better caching'
    });
  }

  // Duplicate chart functionality
  const chartGroups = {};
  audit.charts.details.forEach(chart => {
    const baseName = chart.name.replace(/Enhanced|Improved|Standardized|Unified|Wrapper/g, '');
    if (!chartGroups[baseName]) {
      chartGroups[baseName] = [];
    }
    chartGroups[baseName].push(chart.name);
  });

  const duplicates = Object.entries(chartGroups).filter(([_, charts]) => charts.length > 2);
  if (duplicates.length > 0) {
    audit.recommendations.push({
      priority: 'MEDIUM',
      category: 'Code Consolidation',
      message: `${duplicates.length} chart types have multiple similar implementations`,
      duplicates: Object.fromEntries(duplicates),
      action: 'Consider consolidating similar chart components into one unified version'
    });
  }

  console.log(`✅ Generated ${audit.recommendations.length} recommendations`);
}

/**
 * Save audit results
 */
async function saveAuditResults() {
  console.log('\n💾 Saving audit results...');

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  // Save complete audit
  const auditFile = path.join(OUTPUT_DIR, 'PAGES_AND_COMPONENTS_AUDIT.json');
  await fs.writeFile(auditFile, JSON.stringify(audit, null, 2));
  console.log(`✅ Saved audit to: ${auditFile}`);

  // Generate markdown report
  const report = generateMarkdownReport();
  const reportFile = path.join(OUTPUT_DIR, 'PAGES_AND_COMPONENTS_AUDIT.md');
  await fs.writeFile(reportFile, report);
  console.log(`✅ Saved report to: ${reportFile}`);
}

/**
 * Generate markdown report
 */
function generateMarkdownReport() {
  let md = `# Pages and Components Audit Report
## Carmen de Areco Transparency Portal

**Generated**: ${audit.timestamp}

---

## 📊 Summary

### Pages
- **Total Pages**: ${audit.pages.total}
- **Pages with Data Hooks**: ${audit.pages.with_data_hooks}
- **Pages with External APIs**: ${audit.pages.with_external_apis}
- **Pages with Charts**: ${audit.pages.with_charts}

### Charts
- **Total Charts**: ${audit.charts.total}
- **Used in Pages**: ${audit.charts.used_in_pages}
- **Unused Charts**: ${audit.charts.unused.length}

### Data Hooks Usage
`;

  Object.entries(audit.hooks).forEach(([hook, pages]) => {
    if (Array.isArray(pages) && pages.length > 0) {
      md += `- **${hook}**: ${pages.length} pages\n`;
    }
  });

  md += `\n### Services Usage\n`;

  Object.entries(audit.services).forEach(([service, pages]) => {
    if (pages.length > 0) {
      md += `- **${service}**: ${pages.length} pages\n`;
    }
  });

  md += `\n---

## 🚨 Issues Found (${audit.issues.length})

`;

  if (audit.issues.length > 0) {
    audit.issues.forEach(issue => {
      md += `### ${issue.file}
`;
      issue.issues.forEach(i => {
        md += `- ⚠️  ${i}\n`;
      });
      md += `\n`;
    });
  } else {
    md += `✅ No issues found!\n\n`;
  }

  md += `---

## 💡 Recommendations (${audit.recommendations.length})

`;

  audit.recommendations.forEach((rec, idx) => {
    md += `### ${idx + 1}. ${rec.message} [${rec.priority}]

**Category**: ${rec.category}

**Action**: ${rec.action}

`;
    if (rec.pages) {
      md += `**Affected Pages** (${rec.pages.length}):\n`;
      rec.pages.slice(0, 10).forEach(p => {
        md += `- ${p}\n`;
      });
      if (rec.pages.length > 10) {
        md += `... and ${rec.pages.length - 10} more\n`;
      }
    }

    if (rec.charts) {
      md += `**Unused Charts** (${rec.charts.length}):\n`;
      rec.charts.slice(0, 10).forEach(c => {
        md += `- ${c}\n`;
      });
      if (rec.charts.length > 10) {
        md += `... and ${rec.charts.length - 10} more\n`;
      }
    }

    if (rec.duplicates) {
      md += `**Duplicate Groups**:\n`;
      Object.entries(rec.duplicates).forEach(([base, variants]) => {
        md += `- **${base}**: ${variants.join(', ')}\n`;
      });
    }

    md += `\n`;
  });

  md += `---

## 📄 Page Details

`;

  // Group pages by category
  const pageCategories = {
    'Main Pages': [],
    'Dashboards': [],
    'Financial': [],
    'Data & Analytics': [],
    'Other': []
  };

  audit.pages.details.forEach(page => {
    const name = page.name.replace('.tsx', '');
    if (['Home', 'About', 'Contact', 'NotFoundPage'].includes(name)) {
      pageCategories['Main Pages'].push(page);
    } else if (name.includes('Dashboard')) {
      pageCategories['Dashboards'].push(page);
    } else if (['Budget', 'Treasury', 'Debt', 'Expenses', 'Salaries', 'Contracts'].some(k => name.includes(k))) {
      pageCategories['Financial'].push(page);
    } else if (name.includes('Data') || name.includes('Analytics')) {
      pageCategories['Data & Analytics'].push(page);
    } else {
      pageCategories['Other'].push(page);
    }
  });

  Object.entries(pageCategories).forEach(([category, pages]) => {
    if (pages.length > 0) {
      md += `### ${category} (${pages.length})\n\n`;
      md += `| Page | Data Hooks | Services | Charts | Error Boundary | Issues |\n`;
      md += `|------|-----------|----------|--------|----------------|--------|\n`;

      pages.forEach(page => {
        const name = page.name.replace('.tsx', '');
        const hooks = page.hooks.length > 0 ? page.hooks.join(', ') : '-';
        const services = page.services.length > 0 ? page.services.join(', ') : '-';
        const charts = page.charts.length;
        const errorBoundary = page.hasErrorBoundary ? '✅' : '❌';
        const issues = page.issues.length;

        md += `| ${name} | ${hooks} | ${services} | ${charts} | ${errorBoundary} | ${issues} |\n`;
      });

      md += `\n`;
    }
  });

  md += `---

## 📊 Chart Details

### Used Charts (${audit.charts.used_in_pages})

| Chart | Usage Count | Has Issues |
|-------|-------------|------------|
`;

  audit.charts.details
    .filter(c => c.usedInPages)
    .sort((a, b) => b.usageCount - a.usageCount)
    .forEach(chart => {
      const name = chart.name.replace('.tsx', '');
      const hasIssues = chart.issues.length > 0 ? '⚠️' : '✅';
      md += `| ${name} | ${chart.usageCount} | ${hasIssues} |\n`;
    });

  if (audit.charts.unused.length > 0) {
    md += `\n### Unused Charts (${audit.charts.unused.length})\n\n`;
    audit.charts.unused.forEach(chart => {
      md += `- ${chart}\n`;
    });
  }

  md += `\n---

**Audit completed**: ${audit.timestamp}
`;

  return md;
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 Starting Comprehensive Audit');
  console.log('='.repeat(60));

  try {
    await analyzePages();
    await analyzeCharts();
    generateRecommendations();
    await saveAuditResults();

    console.log('\n✅ Audit completed successfully!');
    console.log(`\n📋 Summary:`);
    console.log(`   Pages: ${audit.pages.total} (${audit.pages.with_data_hooks} with data hooks)`);
    console.log(`   Charts: ${audit.charts.total} (${audit.charts.used_in_pages} used, ${audit.charts.unused.length} unused)`);
    console.log(`   Issues: ${audit.issues.length}`);
    console.log(`   Recommendations: ${audit.recommendations.length}`);

  } catch (error) {
    console.error('\n❌ Fatal error during audit:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main, analyzePages, analyzeCharts };
