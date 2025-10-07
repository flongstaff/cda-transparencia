#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');

class AuditSystem {
  constructor() {
    this.redFlags = [];
    this.warnings = [];
    this.metrics = {};
  }

  // Red Flag Detection Rules
  async detectBudgetOverruns(budgetData) {
    console.log('🚩 Checking budget overruns...');
    for (const item of budgetData.items || []) {
      const overrun = ((item.executed - item.approved) / item.approved) * 100;
      if (overrun > 20) {
        this.redFlags.push({
          type: 'BUDGET_OVERRUN',
          severity: 'HIGH',
          item: item.name,
          approved: item.approved,
          executed: item.executed,
          overrunPercent: overrun.toFixed(2),
          message: `Budget overrun of ${overrun.toFixed(1)}% detected`
        });
      }
    }
  }

  async detectVendorConcentration(contractsData) {
    console.log('🚩 Checking vendor concentration...');
    const vendorTotals = {};
    let totalContracts = 0;

    for (const contract of contractsData) {
      const vendor = contract.vendor || 'Unknown';
      vendorTotals[vendor] = (vendorTotals[vendor] || 0) + (contract.amount || 0);
      totalContracts += contract.amount || 0;
    }

    for (const [vendor, amount] of Object.entries(vendorTotals)) {
      const concentration = (amount / totalContracts) * 100;
      if (concentration > 60) {
        this.redFlags.push({
          type: 'VENDOR_CONCENTRATION',
          severity: 'HIGH',
          vendor,
          amount,
          concentration: concentration.toFixed(2),
          message: `Single vendor controls ${concentration.toFixed(1)}% of contracts`
        });
      }
    }
  }

  async detectRoundNumbers(data) {
    console.log('🚩 Checking round number syndrome...');
    let roundCount = 0;
    let totalCount = 0;

    for (const item of data) {
      if (item.amount) {
        totalCount++;
        const amount = item.amount;
        if (amount % 10000 === 0 || amount % 5000 === 0) {
          roundCount++;
        }
      }
    }

    const roundPercent = (roundCount / totalCount) * 100;
    if (roundPercent > 40) {
      this.redFlags.push({
        type: 'ROUND_NUMBER_SYNDROME',
        severity: 'MEDIUM',
        roundCount,
        totalCount,
        percentage: roundPercent.toFixed(2),
        message: `${roundPercent.toFixed(1)}% of amounts are suspiciously round numbers`
      });
    }
  }

  async detectYearEndRush(expensesData) {
    console.log('🚩 Checking year-end spending rush...');
    const monthlySpending = Array(12).fill(0);

    for (const expense of expensesData) {
      if (expense.date && expense.amount) {
        const month = new Date(expense.date).getMonth();
        monthlySpending[month] += expense.amount;
      }
    }

    const decemberSpending = monthlySpending[11];
    const avgMonthly = monthlySpending.slice(0, 11).reduce((a,b) => a+b, 0) / 11;
    
    if (decemberSpending > avgMonthly * 2.5) {
      this.redFlags.push({
        type: 'YEAR_END_RUSH',
        severity: 'MEDIUM',
        decemberSpending,
        averageMonthly: avgMonthly,
        ratio: (decemberSpending / avgMonthly).toFixed(2),
        message: `December spending is ${(decemberSpending / avgMonthly).toFixed(1)}x normal`
      });
    }
  }

  async generateReport() {
    return {
      timestamp: new Date().toISOString(),
      summary: {
        totalRedFlags: this.redFlags.length,
        highSeverity: this.redFlags.filter(f => f.severity === 'HIGH').length,
        mediumSeverity: this.redFlags.filter(f => f.severity === 'MEDIUM').length,
        lowSeverity: this.redFlags.filter(f => f.severity === 'LOW').length
      },
      redFlags: this.redFlags,
      warnings: this.warnings,
      metrics: this.metrics,
      recommendations: this.generateRecommendations()
    };
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.redFlags.some(f => f.type === 'BUDGET_OVERRUN')) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Review budget overruns with financial department',
        reason: 'Multiple budget items exceeded approved amounts by >20%'
      });
    }
    
    if (this.redFlags.some(f => f.type === 'VENDOR_CONCENTRATION')) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Investigate vendor concentration and procurement process',
        reason: 'Single vendor has excessive market share'
      });
    }
    
    return recommendations;
  }
}

async function main() {
  console.log('🔍 Carmen de Areco - Comprehensive Audit System');
  console.log('==============================================\n');
  
  const audit = new AuditSystem();
  
  // Load data (mock for now)
  const mockBudgetData = {
    items: [
      { name: 'Obras Públicas', approved: 100000, executed: 150000 },
      { name: 'Salud', approved: 200000, executed: 205000 }
    ]
  };
  
  const mockContracts = [
    { vendor: 'Empresa A', amount: 500000 },
    { vendor: 'Empresa A', amount: 300000 },
    { vendor: 'Empresa B', amount: 100000 }
  ];
  
  await audit.detectBudgetOverruns(mockBudgetData);
  await audit.detectVendorConcentration(mockContracts);
  await audit.detectRoundNumbers(mockContracts);
  
  const report = await audit.generateReport();
  
  // Save report
  const outputDir = path.join(__dirname, '../data/audit_reports');
  await fs.mkdir(outputDir, { recursive: true });
  
  const outputFile = path.join(outputDir, `audit_${new Date().toISOString().split('T')[0]}.json`);
  await fs.writeFile(outputFile, JSON.stringify(report, null, 2));
  
  console.log(`\n📊 Audit Report:`);
  console.log(`   Red Flags: ${report.summary.totalRedFlags}`);
  console.log(`   High Severity: ${report.summary.highSeverity}`);
  console.log(`   Recommendations: ${report.recommendations.length}`);
  console.log(`\n💾 Report saved: ${outputFile}`);
}

main().catch(console.error);
