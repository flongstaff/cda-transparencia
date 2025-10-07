#!/usr/bin/env node

/**
 * Comprehensive Data Validation Pipeline
 * Validates municipal, provincial, and national data sources for Carmen de Areco
 * Ensures data quality, consistency, and reliability across all sources
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, '../data/validation');
const LOG_FILE = path.join(OUTPUT_DIR, 'validation_report.json');

// Validation rules configuration
const VALIDATION_RULES = {
  budget: {
    required_fields: ['total_budget', 'total_executed', 'year'],
    numeric_fields: ['total_budget', 'total_executed'],
    positive_fields: ['total_budget', 'total_executed'],
    max_execution_rate: 1.1 // 110% max execution rate
  },
  contracts: {
    required_fields: ['id', 'title', 'amount', 'status', 'date'],
    numeric_fields: ['amount'],
    positive_fields: ['amount']
  },
  documents: {
    required_fields: ['title', 'url', 'type'],
    valid_url_fields: ['url']
  },
  rafam: {
    required_fields: ['municipalityCode', 'year', 'data'],
    numeric_fields: ['municipalityCode'],
    valid_municipality_codes: ['270'] // Carmen de Areco
  }
};

// Validation statistics
const validationStats = {
  totalValidated: 0,
  passed: 0,
  failed: 0,
  errors: [],
  warnings: [],
  validatedSources: {}
};

/**
 * Validate a single data record based on its type
 */
function validateRecord(record, type = 'generic') {
  const rule = VALIDATION_RULES[type] || VALIDATION_RULES.generic || {};
  const result = {
    valid: true,
    record_id: record.id || record.title || 'unknown',
    errors: [],
    warnings: []
  };

  // Check required fields
  if (rule.required_fields) {
    for (const field of rule.required_fields) {
      if (!record.hasOwnProperty(field) || record[field] === undefined || record[field] === null || record[field] === '') {
        result.errors.push(`Missing required field: ${field}`);
        result.valid = false;
      }
    }
  }

  // Check numeric fields
  if (rule.numeric_fields) {
    for (const field of rule.numeric_fields) {
      if (record[field] !== undefined && record[field] !== null) {
        if (isNaN(Number(record[field]))) {
          result.errors.push(`${field} must be numeric, got: ${record[field]}`);
          result.valid = false;
        }
      }
    }
  }

  // Check positive values
  if (rule.positive_fields) {
    for (const field of rule.positive_fields) {
      if (record[field] !== undefined && record[field] !== null) {
        if (Number(record[field]) < 0) {
          result.errors.push(`${field} must be positive, got: ${record[field]}`);
          result.valid = false;
        }
      }
    }
  }

  // Check valid URLs
  if (rule.valid_url_fields) {
    for (const field of rule.valid_url_fields) {
      if (record[field]) {
        try {
          new URL(record[field]);
        } catch (e) {
          result.errors.push(`${field} must be a valid URL, got: ${record[field]}`);
          result.valid = false;
        }
      }
    }
  }

  // Specific validation rules
  if (type === 'budget' && record.total_budget && record.total_executed) {
    const executionRate = record.total_executed / record.total_budget;
    if (executionRate > (rule.max_execution_rate || 1.5)) {
      result.warnings.push(`Execution rate (${(executionRate * 100).toFixed(2)}%) is unusually high`);
    }
  }

  if (type === 'rafam' && record.municipalityCode && rule.valid_municipality_codes) {
    if (!rule.valid_municipality_codes.includes(record.municipalityCode.toString())) {
      result.errors.push(`Invalid municipality code: ${record.municipalityCode}`);
      result.valid = false;
    }
  }

  return result;
}

/**
 * Validate an entire data source
 */
async function validateDataSource(sourceName, data, type = 'generic') {
  console.log(`\n🔍 Validating ${sourceName} (${type})...`);
  
  const validationResults = {
    source: sourceName,
    type,
    total_records: Array.isArray(data) ? data.length : 1,
    valid_records: 0,
    invalid_records: 0,
    errors: [],
    warnings: [],
    records: []
  };

  if (Array.isArray(data)) {
    for (const record of data) {
      const result = validateRecord(record, type);
      validationResults.records.push(result);
      
      if (result.valid) {
        validationResults.valid_records++;
      } else {
        validationResults.invalid_records++;
        result.errors.forEach(error => validationResults.errors.push(`${result.record_id}: ${error}`));
      }
      
      result.warnings.forEach(warning => validationResults.warnings.push(`${result.record_id}: ${warning}`));
      
      validationStats.totalValidated++;
      validationStats.passed += result.valid ? 1 : 0;
      validationStats.failed += result.valid ? 0 : 1;
    }
  } else {
    // Single record
    const result = validateRecord(data, type);
    validationResults.records.push(result);
    
    if (result.valid) {
      validationResults.valid_records++;
    } else {
      validationResults.invalid_records++;
      result.errors.forEach(error => validationResults.errors.push(`${result.record_id}: ${error}`));
    }
    
    result.warnings.forEach(warning => validationResults.warnings.push(`${result.record_id}: ${warning}`));
    
    validationStats.totalValidated++;
    validationStats.passed += result.valid ? 1 : 0;
    validationStats.failed += result.valid ? 0 : 1;
  }

  validationStats.validatedSources[sourceName] = validationResults;
  
  console.log(`   ✅ ${validationResults.valid_records} valid records`);
  console.log(`   ❌ ${validationResults.invalid_records} invalid records`);
  
  if (validationResults.invalid_records > 0) {
    console.log(`   🚨 ${validationResults.errors.length} errors found`);
  }
  
  if (validationResults.warnings.length > 0) {
    console.log(`   ⚠️  ${validationResults.warnings.length} warnings found`);
  }

  return validationResults;
}

/**
 * Validate local data files
 */
async function validateLocalDataFiles() {
  console.log('\n📁 Validating local data files...');
  
  try {
    const dataDir = path.join(__dirname, '../data/consolidated');
    const years = await fs.readdir(dataDir);
    
    for (const year of years) {
      const yearPath = path.join(dataDir, year);
      const stat = await fs.stat(yearPath);
      
      if (stat.isDirectory()) {
        const files = await fs.readdir(yearPath);
        
        for (const file of files) {
          if (file.endsWith('.json')) {
            const filePath = path.join(yearPath, file);
            const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));
            const dataType = file.replace('.json', '');
            
            await validateDataSource(`${year}/${file}`, data, dataType);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error validating local data files:', error.message);
    validationStats.errors.push({ source: 'local_data', error: error.message });
  }
}

/**
 * Validate data from external APIs
 */
async function validateExternalData() {
  console.log('\n🌐 Validating external API data...');
  
  // Test the proxy server endpoints
  const endpoints = [
    { name: 'RAFAM Mock Data', url: 'http://localhost:3002/api/external/rafam', type: 'rafam', method: 'POST', data: { municipalityCode: '270' } },
    { name: 'Carmen Transparency Data', url: 'http://localhost:3002/api/carmen/transparency', type: 'documents', method: 'GET' },
    { name: 'Carmen Licitaciones', url: 'http://localhost:3002/api/carmen/licitaciones', type: 'contracts', method: 'GET' },
    { name: 'Datos Argentina', url: 'http://localhost:3002/api/national/datos-argentina?q=carmen de areco', type: 'documents', method: 'GET' },
    { name: 'Provincial GBA Data', url: 'http://localhost:3002/api/provincial/gba', type: 'budget', method: 'GET' }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`   Testing ${endpoint.name}...`);
      
      let response;
      if (endpoint.method === 'POST') {
        response = await axios.post(endpoint.url, endpoint.data, { timeout: 15000 });
      } else {
        response = await axios.get(endpoint.url, { timeout: 15000 });
      }

      if (response.data && response.data.success !== false) {
        // Extract the relevant data portion for validation
        let dataToValidate = response.data;
        
        if (response.data.data) {
          dataToValidate = response.data.data;
        } else if (response.data.budget_execution) {
          dataToValidate = response.data.budget_execution;
        } else if (response.data.datasets) {
          dataToValidate = response.data.datasets;
        } else if (Array.isArray(response.data)) {
          dataToValidate = response.data;
        }
        
        await validateDataSource(endpoint.name, dataToValidate, endpoint.type);
      } else {
        console.log(`   ❌ ${endpoint.name} returned error response`);
        validationStats.errors.push({ source: endpoint.name, error: 'API returned error response' });
      }
    } catch (error) {
      console.log(`   ❌ Error validating ${endpoint.name}: ${error.message}`);
      validationStats.errors.push({ source: endpoint.name, error: error.message });
    }
  }
}

/**
 * Run cross-validation between different data sources
 */
async function runCrossValidation() {
  console.log('\n🔄 Running cross-validation between data sources...');
  
  // Compare budget data consistency across sources
  const sources = validationStats.validatedSources;
  
  for (const [sourceName, sourceData] of Object.entries(sources)) {
    // Look for budget records in each source
    if (sourceData.type === 'budget' || sourceName.toLowerCase().includes('budget')) {
      // Check for consistency between different budget records
      console.log(`   Checking budget consistency in ${sourceName}...`);
      
      // Add cross-validation logic here as needed
      if (Array.isArray(sourceData.records)) {
        sourceData.records.forEach((record, idx) => {
          if (record.data && record.data.total_budget && record.data.total_executed) {
            const executionRate = record.data.total_executed / record.data.total_budget;
            // Add any cross-validation rules here
            if (executionRate > 1.2) {
              validationStats.warnings.push(`High execution rate in ${sourceName} record ${idx}: ${executionRate * 100}%`);
            }
          }
        });
      }
    }
  }
}

/**
 * Generate validation report
 */
async function generateReport() {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalValidated: validationStats.totalValidated,
      passed: validationStats.passed,
      failed: validationStats.failed,
      passRate: validationStats.totalValidated > 0 ? (validationStats.passed / validationStats.totalValidated * 100).toFixed(2) + '%' : '0%'
    },
    errors: validationStats.errors,
    warnings: validationStats.warnings,
    sources: validationStats.validatedSources,
    config: VALIDATION_RULES
  };

  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.writeFile(LOG_FILE, JSON.stringify(report, null, 2));
  
  console.log(`\n📊 Validation Report Generated:`);
  console.log(`   Total Records: ${validationStats.totalValidated}`);
  console.log(`   Passed: ${validationStats.passed}`);
  console.log(`   Failed: ${validationStats.failed}`);
  console.log(`   Pass Rate: ${report.summary.passRate}`);
  console.log(`   Report saved to: ${LOG_FILE}`);
  
  return report;
}

/**
 * Main validation pipeline
 */
async function main() {
  console.log('🔍 CARMEN DE ARECO DATA VALIDATION PIPELINE');
  console.log('='.repeat(80));
  console.log('Validating data quality and consistency across all sources');
  console.log();

  // Ensure output directory exists
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  // Validate local data files
  await validateLocalDataFiles();

  // Validate external API data
  await validateExternalData();

  // Run cross-validation
  await runCrossValidation();

  // Generate final report
  const report = await generateReport();

  console.log('\n✅ DATA VALIDATION PIPELINE COMPLETE!');
  console.log();
  console.log('📁 Next Steps:');
  console.log('   1. Review validation report:', LOG_FILE);
  console.log('   2. Address failed validations');
  console.log('   3. Run validation regularly as part of data pipeline');
  console.log('   4. Set up alerts for validation failures');
  console.log();

  return report;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('\n❌ Validation pipeline error:', error);
    process.exit(1);
  });
}

export { main, validateRecord, validateDataSource, VALIDATION_RULES };