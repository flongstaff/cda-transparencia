#!/usr/bin/env node

/**
 * Consolidate Duplicate Pages
 * Merges duplicate page implementations to keep the best version of each
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PAGES_DIR = path.join(__dirname, '../frontend/src/pages');

// Define which pages to keep and which to remove
const consolidationPlan = [
  {
    keep: 'BudgetUnified.tsx',
    remove: ['Budget.tsx'],
    reason: 'BudgetUnified has more charts and better integration'
  },
  {
    keep: 'TreasuryUnified.tsx',
    remove: ['Treasury.tsx'],
    reason: 'TreasuryUnified has more complete implementation'
  },
  {
    keep: 'DebtUnified.tsx',
    remove: ['DebtPage.tsx'],
    reason: 'DebtUnified has better chart integration'
  },
  {
    keep: 'DocumentsUnified.tsx',
    remove: ['Documents.tsx'],
    reason: 'DocumentsUnified has unified data hooks'
  },
  {
    keep: 'MonitoringDashboard.tsx',
    remove: ['MonitoringPage.tsx'],
    reason: 'MonitoringDashboard has error boundary and more features'
  },
  {
    keep: 'EnhancedTransparencyDashboard.tsx',
    remove: ['EnhancedTransparencyPage.tsx'],
    reason: 'EnhancedTransparencyDashboard has more complete implementation'
  },
  {
    keep: 'AnalyticsDashboard.tsx',
    remove: ['FinancialDashboard.tsx'],
    reason: 'AnalyticsDashboard has more comprehensive charts and data hooks'
  },
  {
    keep: 'MetaTransparencyDashboard.tsx',
    remove: ['DataSourceMonitoringDashboard.tsx'],
    reason: 'MetaTransparencyDashboard has broader scope'
  }
];

console.log('🔄 CONSOLIDATING DUPLICATE PAGES');
console.log('='.repeat(80));
console.log();

let filesRenamed = 0;
let errors = [];

for (const plan of consolidationPlan) {
  console.log(`📋 Keeping: ${plan.keep}`);
  console.log(`   Removing: ${plan.remove.join(', ')}`);
  console.log(`   Reason: ${plan.reason}`);

  for (const fileToRemove of plan.remove) {
    const filePath = path.join(PAGES_DIR, fileToRemove);

    try {
      // Check if file exists
      await fs.access(filePath);

      // Rename to .backup instead of deleting (safer)
      const backupPath = filePath + '.backup';
      await fs.rename(filePath, backupPath);

      console.log(`   ✅ Backed up: ${fileToRemove} → ${fileToRemove}.backup`);
      filesRenamed++;
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log(`   ⏭️  Skipped: ${fileToRemove} (file not found)`);
      } else {
        console.log(`   ❌ Error: ${fileToRemove} - ${error.message}`);
        errors.push({ file: fileToRemove, error: error.message });
      }
    }
  }

  console.log();
}

console.log('📊 SUMMARY');
console.log('-'.repeat(80));
console.log(`Files backed up: ${filesRenamed}`);
console.log(`Errors: ${errors.length}`);
console.log();

if (errors.length > 0) {
  console.log('❌ ERRORS:');
  errors.forEach(e => console.log(`   ${e.file}: ${e.error}`));
  console.log();
}

console.log('✅ NEXT STEPS:');
console.log('1. Update App.tsx to use the consolidated pages');
console.log('2. Test all routes to ensure they work');
console.log('3. Remove .backup files if everything works correctly');
console.log();
