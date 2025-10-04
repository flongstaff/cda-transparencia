#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const chartsDir = path.join(__dirname, '../frontend/src/components/charts');

// Charts that should accept year prop
const chartsNeedingYear = [
  'BudgetExecutionChart.tsx',
  'PersonnelExpensesChart.tsx',
  'ExpenditureReportChart.tsx',
  'TreasuryAnalysisChart.tsx',
  'FinancialReservesChart.tsx',
  'DebtReportChart.tsx',
  'GenderBudgetingChart.tsx',
  'RevenueSourcesChart.tsx',
  'QuarterlyExecutionChart.tsx',
  'TimeSeriesChart.tsx'
];

console.log('🔧 Fixing year prop interfaces in charts...\n');

chartsNeedingYear.forEach(chartFile => {
  const filePath = path.join(chartsDir, chartFile);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  ${chartFile} - Not found, skipping`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Check if year prop already exists in interface
  if (content.includes('year?:') || content.includes('year:')) {
    console.log(`✅ ${chartFile} - Already has year prop`);
    return;
  }

  // Find the interface definition
  const interfaceMatch = content.match(/interface\s+(\w+Props)\s*{([^}]+)}/);

  if (interfaceMatch) {
    const interfaceName = interfaceMatch[1];
    const interfaceContent = interfaceMatch[2];

    // Add year prop if it doesn't exist
    if (!interfaceContent.includes('year')) {
      const newInterface = interfaceContent.trim() + '\n  year?: number;';
      content = content.replace(
        /interface\s+\w+Props\s*{[^}]+}/,
        `interface ${interfaceName} {\n  ${newInterface}\n}`
      );

      fs.writeFileSync(filePath, content);
      console.log(`✅ ${chartFile} - Added year prop to interface`);
    }
  } else {
    console.log(`⚠️  ${chartFile} - No interface found`);
  }
});

console.log('\n✅ Year prop fixes complete!');
