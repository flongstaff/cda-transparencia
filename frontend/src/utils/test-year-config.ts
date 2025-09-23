// Test script to verify year data configuration
import { hasDataType, getYearConfig } from './yearConfig';

console.log('Testing year data configuration...');

// Test years 2022-2025
const testYears = [2022, 2023, 2024, 2025];

for (const year of testYears) {
  console.log(`\nYear ${year}:`);
  const config = getYearConfig(year);
  console.log(`  Config:`, config);
  console.log(`  Has detailed budget: ${hasDataType(year, 'budget')}`);
  console.log(`  Has salary data: ${hasDataType(year, 'salary')}`);
  console.log(`  Has debt data: ${hasDataType(year, 'debt')}`);
  console.log(`  Has documents: ${hasDataType(year, 'documents')}`);
}

console.log('\nTest completed.');