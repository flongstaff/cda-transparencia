#!/usr/bin/env node
/**
 * Script to prepare data for CloudFlare and GitHub Pages deployment
 * Ensures all processed data is properly organized for frontend consumption
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

/**
 * Prepare data directories for CloudFlare/GitHub Pages deployment
 * Organizes processed PDFs, CSVs, and OCR results for frontend consumption
 */
async function prepareDataForDeployment() {
  console.log('🔧 Preparing data for CloudFlare/GitHub Pages deployment...');

  // Define base directories
  const projectRoot = path.join(__dirname, '..', '..');
  const frontendPublicDir = path.join(projectRoot, 'frontend', 'public');
  const dataDir = path.join(projectRoot, 'data');
  const processedDataDir = path.join(frontendPublicDir, 'data');
  const backendDataDir = path.join(projectRoot, 'backend', 'data');

  // Create required directory structure
  const requiredDirs = [
    path.join(processedDataDir, 'processed_pdfs'),
    path.join(processedDataDir, 'processed_csvs'),
    path.join(processedDataDir, 'pdf_ocr_results'),
    path.join(processedDataDir, 'dataset_metadata'),
    path.join(processedDataDir, 'consolidated'),
    path.join(processedDataDir, 'enhanced_audit'),
    path.join(processedDataDir, 'charts'),
    path.join(processedDataDir, 'api')
  ];

  console.log('📁 Creating required directory structure...');
  for (const dir of requiredDirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`   Created: ${dir}`);
    } else {
      console.log(`   Exists: ${dir}`);
    }
  }

  // Copy main data files to processed data directory
  console.log('\n📋 Copying main data files...');
  const mainDataFiles = [
    'data.json',
    'main-data.json',
    'main.json'
  ];

  for (const file of mainDataFiles) {
    const srcPath = path.join(dataDir, file);
    const destPath = path.join(processedDataDir, file);
    
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`   Copied: ${file}`);
    } else {
      console.log(`   Missing: ${file}`);
    }
  }

  // Copy processed files from backend to frontend
  console.log('\n📂 Copying processed files from backend...');
  const backendProcessedDirs = [
    'processed_pdfs',
    'processed_csvs',
    'pdf_ocr_results'
  ];

  for (const dir of backendProcessedDirs) {
    const srcDir = path.join(backendDataDir, dir);
    const destDir = path.join(processedDataDir, dir);
    
    if (fs.existsSync(srcDir)) {
      copyDirectoryRecursive(srcDir, destDir);
      console.log(`   Copied: ${dir}`);
    } else {
      console.log(`   Missing: ${dir}`);
    }
  }

  // Create consolidated indexes for frontend consumption
  console.log('\n📊 Creating consolidated indexes...');
  await createConsolidatedIndexes(processedDataDir);

  // Create API endpoints structure
  console.log('\n🔌 Creating API endpoints structure...');
  await createAPIEndpoints(processedDataDir);

  console.log('\n✅ Data preparation for deployment completed!');
  console.log(`📍 Processed data is available at: ${processedDataDir}`);
}

/**
 * Copy directory recursively
 */
function copyDirectoryRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const items = fs.readdirSync(src);
  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    
    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      copyDirectoryRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Create consolidated indexes for frontend consumption
 */
async function createConsolidatedIndexes(processedDataDir) {
  try {
    // Create a master index of all datasets
    const masterIndex = {
      timestamp: new Date().toISOString(),
      datasets: [],
      statistics: {
        totalDatasets: 0,
        totalFiles: 0,
        fileTypeBreakdown: {},
        themeBreakdown: {}
      }
    };

    // Scan dataset metadata directory
    const metadataDir = path.join(processedDataDir, 'dataset_metadata');
    if (fs.existsSync(metadataDir)) {
      const metadataFiles = fs.readdirSync(metadataDir).filter(f => f.endsWith('.json'));
      
      for (const file of metadataFiles) {
        try {
          const metadataPath = path.join(metadataDir, file);
          const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
          
          if (metadata.info) {
            const datasetEntry = {
              identifier: metadata.info.identifier,
              title: metadata.info.title,
              description: metadata.info.description,
              theme: metadata.info.theme,
              modified: metadata.info.modified,
              fileCount: Object.keys(metadata.files || {}).length,
              files: metadata.files || {}
            };
            
            masterIndex.datasets.push(datasetEntry);
            
            // Update statistics
            masterIndex.statistics.totalDatasets++;
            masterIndex.statistics.totalFiles += datasetEntry.fileCount;
            
            // Update theme breakdown
            const theme = metadata.info.theme || 'unknown';
            masterIndex.statistics.themeBreakdown[theme] = (masterIndex.statistics.themeBreakdown[theme] || 0) + 1;
            
            // Update file type breakdown
            if (metadata.files) {
              for (const fileName in metadata.files) {
                const fileInfo = metadata.files[fileName];
                const format = fileInfo.format || 'unknown';
                masterIndex.statistics.fileTypeBreakdown[format] = (masterIndex.statistics.fileTypeBreakdown[format] || 0) + 1;
              }
            }
          }
        } catch (error) {
          console.error(`   Error processing metadata file ${file}:`, error.message);
        }
      }
    }

    // Save master index
    const masterIndexPath = path.join(processedDataDir, 'consolidated', 'master_index.json');
    fs.writeFileSync(masterIndexPath, JSON.stringify(masterIndex, null, 2));
    console.log(`   Created master index: ${masterIndexPath}`);

    // Create a simplified index for quick loading
    const quickIndex = {
      lastUpdated: masterIndex.timestamp,
      datasetCount: masterIndex.statistics.totalDatasets,
      fileCount: masterIndex.statistics.totalFiles,
      themes: Object.keys(masterIndex.statistics.themeBreakdown),
      fileTypes: Object.keys(masterIndex.statistics.fileTypeBreakdown),
      recentDatasets: masterIndex.datasets
        .sort((a, b) => new Date(b.modified) - new Date(a.modified))
        .slice(0, 10)
        .map(ds => ({
          identifier: ds.identifier,
          title: ds.title,
          modified: ds.modified
        }))
    };

    const quickIndexPath = path.join(processedDataDir, 'consolidated', 'quick_index.json');
    fs.writeFileSync(quickIndexPath, JSON.stringify(quickIndex, null, 2));
    console.log(`   Created quick index: ${quickIndexPath}`);

  } catch (error) {
    console.error('   Error creating consolidated indexes:', error.message);
  }
}

/**
 * Create API endpoints structure for GitHub Pages
 */
async function createAPIEndpoints(processedDataDir) {
  try {
    // Create a simple API structure that mimics the backend endpoints
    const apiDir = path.join(processedDataDir, 'api');
    
    // Create endpoints for different data types
    const endpoints = [
      { name: 'datasets', path: 'dataset_metadata' },
      { name: 'pdfs', path: 'processed_pdfs' },
      { name: 'csvs', path: 'processed_csvs' },
      { name: 'ocr', path: 'pdf_ocr_results' },
      { name: 'consolidated', path: 'consolidated' }
    ];

    for (const endpoint of endpoints) {
      const endpointDir = path.join(apiDir, endpoint.name);
      if (!fs.existsSync(endpointDir)) {
        fs.mkdirSync(endpointDir, { recursive: true });
      }

      // Create an index file for the endpoint
      const indexPath = path.join(endpointDir, 'index.json');
      const indexData = {
        endpoint: endpoint.name,
        basePath: `/data/${endpoint.path}`,
        lastUpdated: new Date().toISOString(),
        itemCount: 0,
        items: []
      };

      // Count items in the corresponding data directory
      const dataPath = path.join(processedDataDir, endpoint.path);
      if (fs.existsSync(dataPath)) {
        const items = fs.readdirSync(dataPath);
        indexData.itemCount = items.length;
        indexData.items = items.slice(0, 100); // Limit to first 100 items
      }

      fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2));
      console.log(`   Created API endpoint: /data/api/${endpoint.name}/index.json`);
    }

    // Create a main API index
    const mainApiIndex = {
      version: '1.0',
      endpoints: endpoints.map(ep => `/data/api/${ep.name}`),
      lastUpdated: new Date().toISOString(),
      description: 'Carmen de Areco Transparency Portal API for GitHub Pages'
    };

    const mainApiIndexPath = path.join(apiDir, 'index.json');
    fs.writeFileSync(mainApiIndexPath, JSON.stringify(mainApiIndex, null, 2));
    console.log(`   Created main API index: ${mainApiIndexPath}`);

  } catch (error) {
    console.error('   Error creating API endpoints:', error.message);
  }
}

// Run the preparation if this script is executed directly
if (require.main === module) {
  prepareDataForDeployment()
    .then(() => {
      console.log('\n🎉 Data preparation for CloudFlare/GitHub Pages deployment completed successfully!');
    })
    .catch(error => {
      console.error('\n❌ Error during data preparation:', error);
      process.exit(1);
    });
}

module.exports = {
  prepareDataForDeployment,
  createConsolidatedIndexes,
  createAPIEndpoints
};