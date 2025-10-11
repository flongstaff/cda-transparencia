#!/usr/bin/env node
/**
 * GENERATE ALL EXTERNAL DATA AGGREGATION
 *
 * Creates an aggregated data file combining all external data sources
 * for the frontend to consume through the API proxy.
 */

const fs = require('fs').promises;
const path = require('path');

async function generateAllExternalData() {
  console.log('🔄 Generating aggregated external data file...');
  
  const externalDir = path.join(__dirname, '../frontend/public/data/external');
  const outputFile = path.join(externalDir, 'all-external-data.json');
  
  try {
    // Read all JSON files in the external directory
    const files = await fs.readdir(externalDir);
    const jsonData = {};
    
    for (const file of files) {
      if (file.endsWith('.json') && file !== 'all-external-data.json' && file !== 'cache_manifest.json') {
        try {
          const filePath = path.join(externalDir, file);
          const fileContent = await fs.readFile(filePath, 'utf8');
          const fileData = JSON.parse(fileContent);
          
          // Use filename without extension as key
          const key = path.basename(file, '.json');
          jsonData[key] = fileData;
        } catch (error) {
          console.warn(`⚠️  Warning: Could not read or parse ${file}`, error.message);
        }
      }
    }
    
    // Add provincial data if it exists
    try {
      const provincialDir = path.join(externalDir, 'provincial');
      if (await fs.access(provincialDir).then(() => true).catch(() => false)) {
        const provincialFiles = await fs.readdir(provincialDir);
        jsonData.provincial = {};
        
        for (const file of provincialFiles) {
          if (file.endsWith('.json')) {
            try {
              const filePath = path.join(provincialDir, file);
              const fileContent = await fs.readFile(filePath, 'utf8');
              const fileData = JSON.parse(fileContent);
              
              // Use filename without extension as key
              const key = path.basename(file, '.json');
              jsonData.provincial[key] = fileData;
            } catch (error) {
              console.warn(`⚠️  Warning: Could not read or parse provincial/${file}`, error.message);
            }
          }
        }
      }
    } catch (error) {
      console.warn('⚠️  Warning: Could not process provincial data directory', error.message);
    }
    
    // Add RAFAM data if it exists
    try {
      const rafamDir = path.join(externalDir, 'rafam');
      if (await fs.access(rafamDir).then(() => true).catch(() => false)) {
        const rafamFiles = await fs.readdir(rafamDir);
        jsonData.rafam = {};
        
        for (const file of rafamFiles) {
          if (file.endsWith('.json')) {
            try {
              const filePath = path.join(rafamDir, file);
              const fileContent = await fs.readFile(filePath, 'utf8');
              const fileData = JSON.parse(fileContent);
              
              // Use filename without extension as key
              const key = path.basename(file, '.json');
              jsonData.rafam[key] = fileData;
            } catch (error) {
              console.warn(`⚠️  Warning: Could not read or parse rafam/${file}`, error.message);
            }
          }
        }
      }
    } catch (error) {
      console.warn('⚠️  Warning: Could not process RAFAM data directory', error.message);
    }
    
    // Create the aggregated data object
    const aggregatedData = {
      generated_at: new Date().toISOString(),
      sources: jsonData,
      summary: {
        total_sources: Object.keys(jsonData).length,
        last_updated: new Date().toISOString()
      }
    };
    
    // Write the aggregated data file
    await fs.writeFile(outputFile, JSON.stringify(aggregatedData, null, 2));
    
    console.log(`✅ Aggregated external data generated with ${Object.keys(jsonData).length} sources`);
    console.log(`📊 File written to: ${outputFile}`);
    
  } catch (error) {
    console.error('❌ Error generating aggregated external data:', error);
    process.exit(1);
  }
}

// Run the generation
generateAllExternalData();