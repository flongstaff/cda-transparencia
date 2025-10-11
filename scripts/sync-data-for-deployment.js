#!/usr/bin/env node
/**
 * Script to synchronize data between main data directory and frontend for GitHub Pages/CloudFlare deployment
 * Ensures all processed data is available in the frontend public directory
 */

const fs = require('fs');
const path = require('path');

/**
 * Synchronize data between main data directory and frontend directories
 */
async function syncDataForDeployment() {
  console.log('🔄 Synchronizing data for GitHub Pages/CloudFlare deployment...');

  // Define paths
  const projectRoot = path.join(__dirname, '..');
  const mainDataDir = path.join(projectRoot, 'data');
  const frontendPublicDir = path.join(projectRoot, 'frontend', 'public');
  const frontendDataDir = path.join(frontendPublicDir, 'data');

  console.log(`📁 Project root: ${projectRoot}`);
  console.log(`📁 Main data directory: ${mainDataDir}`);
  console.log(`📁 Frontend public directory: ${frontendPublicDir}`);
  console.log(`📁 Frontend data directory: ${frontendDataDir}`);

  // Ensure frontend data directory exists
  if (!fs.existsSync(frontendDataDir)) {
    fs.mkdirSync(frontendDataDir, { recursive: true });
    console.log(`📁 Created frontend data directory: ${frontendDataDir}`);
  }

  // Sync main data files
  console.log('\n📋 Syncing main data files...');
  const mainDataFiles = [
    'data.json',
    'main-data.json',
    'main.json'
  ];

  for (const file of mainDataFiles) {
    const mainPath = path.join(mainDataDir, file);
    const frontendPath = path.join(frontendDataDir, file);
    
    if (fs.existsSync(mainPath)) {
      fs.copyFileSync(mainPath, frontendPath);
      console.log(`   ✅ Synced: ${file}`);
    } else {
      console.log(`   ⚠️  Missing: ${file} at ${mainPath}`);
    }
  }

  // Sync processed data directories
  console.log('\n📂 Syncing processed data directories...');
  const processedDirs = [
    'processed',
    'consolidated',
    'metadata',
    'historical',
    'external'
  ];

  for (const dir of processedDirs) {
    const mainDir = path.join(mainDataDir, dir);
    const frontendDir = path.join(frontendDataDir, dir);
    
    if (fs.existsSync(mainDir)) {
      syncDirectory(mainDir, frontendDir);
      console.log(`   ✅ Synced: ${dir}`);
    } else {
      console.log(`   ⚠️  Missing: ${dir} at ${mainDir}`);
    }
  }

  // Sync OCR extracted data
  console.log('\n🔍 Syncing OCR extracted data...');
  const ocrDir = path.join(mainDataDir, 'ocr_extracted');
  const frontendOcrDir = path.join(frontendDataDir, 'ocr_extracted');
  
  if (fs.existsSync(ocrDir)) {
    syncDirectory(ocrDir, frontendOcrDir);
    console.log(`   ✅ Synced: ocr_extracted`);
  } else {
    console.log(`   ⚠️  Missing: ocr_extracted at ${ocrDir}`);
  }

  // Sync processed PDFs and CSVs
  console.log('\n📄 Syncing processed PDFs and CSVs...');
  const processedPdfsDir = path.join(mainDataDir, 'processed_pdfs');
  const frontendProcessedPdfsDir = path.join(frontendDataDir, 'processed_pdfs');
  
  if (fs.existsSync(processedPdfsDir)) {
    syncDirectory(processedPdfsDir, frontendProcessedPdfsDir);
    console.log(`   ✅ Synced: processed_pdfs`);
  } else {
    console.log(`   ⚠️  Missing: processed_pdfs at ${processedPdfsDir}`);
  }

  const processedCsvsDir = path.join(mainDataDir, 'processed_csvs');
  const frontendProcessedCsvsDir = path.join(frontendDataDir, 'processed_csvs');
  
  if (fs.existsSync(processedCsvsDir)) {
    syncDirectory(processedCsvsDir, frontendProcessedCsvsDir);
    console.log(`   ✅ Synced: processed_csvs`);
  } else {
    console.log(`   ⚠️  Missing: processed_csvs at ${processedCsvsDir}`);
  }

  // Create deployment manifest
  console.log('\n📝 Creating deployment manifest...');
  const manifest = {
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    directories: processedDirs,
    files: mainDataFiles,
    source: 'main_data_directory',
    destination: 'frontend/public/data'
  };

  const manifestPath = path.join(frontendDataDir, 'deployment_manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`   ✅ Created manifest: ${manifestPath}`);

  console.log('\n✅ Data synchronization for deployment completed!');
  console.log(`📍 Deployable data is available at: ${frontendDataDir}`);
}

/**
 * Synchronize directory contents recursively
 */
function syncDirectory(src, dest) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // Read source directory
  const items = fs.readdirSync(src);
  
  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    
    const stat = fs.statSync(srcPath);
    
    if (stat.isDirectory()) {
      // Recursively sync subdirectories
      syncDirectory(srcPath, destPath);
    } else {
      // Copy files
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Run the synchronization if this script is executed directly
if (require.main === module) {
  syncDataForDeployment()
    .then(() => {
      console.log('\n🎉 Data synchronization for CloudFlare/GitHub Pages deployment completed successfully!');
    })
    .catch(error => {
      console.error('\n❌ Error during data synchronization:', error);
      process.exit(1);
    });
}

module.exports = {
  syncDataForDeployment,
  syncDirectory
};