#!/usr/bin/env node
/**
 * FIX TREASURY DATA FIELDS
 * Updates treasury.json files to match expected field names
 */

const fs = require('fs');
const path = require('path');

const CONSOLIDATED_DIR = path.join(__dirname, '../frontend/public/data/consolidated');
const YEARS = [2019, 2020, 2021, 2022, 2023, 2024, 2025];

console.log('🔧 Fixing treasury.json field names...\n');

YEARS.forEach(year => {
  const treasuryFile = path.join(CONSOLIDATED_DIR, year.toString(), 'treasury.json');

  if (fs.existsSync(treasuryFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(treasuryFile, 'utf8'));

      // Fix field names
      const fixed = {
        year: data.year || year,
        total_revenue: data.income || data.total_revenue || 0,
        total_expenses: data.expenses || data.total_expenses || 0,
        balance: data.balance || 0,
        treasury_movements: data.treasury_movements || []
      };

      // Write back
      fs.writeFileSync(treasuryFile, JSON.stringify(fixed, null, 2));
      console.log(`✅ Fixed ${year}/treasury.json`);
    } catch (error) {
      console.error(`❌ Error fixing ${year}/treasury.json:`, error.message);
    }
  } else {
    console.warn(`⚠️  Missing ${year}/treasury.json`);
  }
});

console.log('\n✅ Treasury data fields fixed!');
