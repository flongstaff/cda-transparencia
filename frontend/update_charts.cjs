#!/usr/bin/env node

/**
 * Quick script to update chart components to use ChartDataIntegrationService
 */

const fs = require('fs');
const path = require('path');

const chartFiles = [
  '/Users/flong/Developer/cda-transparencia/frontend/src/components/charts/InvestmentAnalysisChart.tsx',
  '/Users/flong/Developer/cda-transparencia/frontend/src/components/charts/SalaryAnalysisChart.tsx',
  '/Users/flong/Developer/cda-transparencia/frontend/src/components/charts/TreasuryAnalysisChart.tsx',
  '/Users/flong/Developer/cda-transparencia/frontend/src/components/charts/DebtAnalysisChart.tsx',
];

const replacements = [
  {
    search: /import ApiService from '..\/..\/services\/ApiService';/g,
    replace: "import { chartDataIntegrationService } from '../../services/ChartDataIntegrationService';"
  },
  {
    search: /ApiService\.get(\w+)\(year\)/g,
    replace: "chartDataIntegrationService.getChartData({ year, type: '$1', includeComparisons: true, includePowerBI: true, includeDocuments: true })"
  }
];

async function updateFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Apply replacements
    for (const replacement of replacements) {
      content = content.replace(replacement.search, replacement.replace);
    }

    // Add integrated service import if ApiService was found
    if (content.includes('ApiService')) {
      console.log(`🔧 Updating ${path.basename(filePath)}...`);
      
      // Add integrated service import
      if (!content.includes('chartDataIntegrationService')) {
        content = content.replace(
          /from '..\/..\/services\/ApiService';/,
          "from '../../services/ChartDataIntegrationService';"
        );
      }

      // Add Database and Layers icons if not present
      if (!content.includes('Database, Layers')) {
        content = content.replace(
          /from 'lucide-react';/,
          (match) => {
            if (content.includes('Database') && content.includes('Layers')) return match;
            return match.replace('} from \'lucide-react\';', ', Database, Layers } from \'lucide-react\';');
          }
        );
      }

      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated ${path.basename(filePath)}`);
    } else {
      console.log(`ℹ️  ${path.basename(filePath)} - no ApiService usage found`);
    }

  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

async function main() {
  console.log('🚀 Starting chart update process...');
  
  for (const filePath of chartFiles) {
    await updateFile(filePath);
  }
  
  console.log('✨ Chart update process completed!');
}

main().catch(console.error);