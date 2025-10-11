#!/usr/bin/env node
/**
 * Final verification script to ensure all data is properly organized for GitHub Pages/CloudFlare deployment
 * Checks that all required files and directories are in place for successful deployment
 */

const fs = require('fs');
const path = require('path');

/**
 * Verify deployment readiness for GitHub Pages and CloudFlare
 */
async function verifyDeploymentReadiness() {
  console.log('✅ Verifying deployment readiness for GitHub Pages and CloudFlare...');

  // Define paths
  const projectRoot = path.join(__dirname, '..');
  const frontendDir = path.join(projectRoot, 'frontend');
  const frontendPublicDir = path.join(frontendDir, 'public');
  const frontendDataDir = path.join(frontendPublicDir, 'data');
  const frontendDistDir = path.join(frontendDir, 'dist');

  console.log(`\n📁 Checking project structure...`);
  console.log(`   Project root: ${projectRoot}`);
  console.log(`   Frontend directory: ${frontendDir}`);
  console.log(`   Frontend public directory: ${frontendPublicDir}`);
  console.log(`   Frontend data directory: ${frontendDataDir}`);
  console.log(`   Frontend dist directory: ${frontendDistDir}`);

  // Check if frontend directory exists
  if (!fs.existsSync(frontendDir)) {
    console.error('❌ Frontend directory does not exist');
    return false;
  }
  console.log('   ✅ Frontend directory exists');

  // Check if frontend public directory exists
  if (!fs.existsSync(frontendPublicDir)) {
    console.error('❌ Frontend public directory does not exist');
    return false;
  }
  console.log('   ✅ Frontend public directory exists');

  // Check if frontend data directory exists
  if (!fs.existsSync(frontendDataDir)) {
    console.error('❌ Frontend data directory does not exist');
    return false;
  }
  console.log('   ✅ Frontend data directory exists');

  // Check for required data files
  console.log('\n📄 Checking required data files...');
  const requiredDataFiles = [
    'data.json',
    'main-data.json',
    'main.json'
  ];

  let allDataFilesExist = true;
  for (const file of requiredDataFiles) {
    const filePath = path.join(frontendDataDir, file);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log(`   ✅ ${file} exists (${stats.size} bytes)`);
    } else {
      console.log(`   ❌ ${file} missing`);
      allDataFilesExist = false;
    }
  }

  if (!allDataFilesExist) {
    console.error('❌ Required data files are missing');
    return false;
  }

  // Check for required data directories
  console.log('\n📂 Checking required data directories...');
  const requiredDataDirs = [
    'processed_pdfs',
    'processed_csvs',
    'pdf_ocr_results',
    'dataset_metadata',
    'consolidated',
    'enhanced_audit',
    'charts',
    'api'
  ];

  let allDataDirsExist = true;
  for (const dir of requiredDataDirs) {
    const dirPath = path.join(frontendDataDir, dir);
    if (fs.existsSync(dirPath)) {
      const items = fs.readdirSync(dirPath);
      console.log(`   ✅ ${dir} exists (${items.length} items)`);
    } else {
      console.log(`   ❌ ${dir} missing`);
      allDataDirsExist = false;
    }
  }

  if (!allDataDirsExist) {
    console.error('❌ Required data directories are missing');
    return false;
  }

  // Check for API endpoints
  console.log('\n🔌 Checking API endpoints...');
  const apiDir = path.join(frontendDataDir, 'api');
  if (fs.existsSync(apiDir)) {
    const apiEndpoints = [
      'index.json',
      'datasets/index.json',
      'pdfs/index.json',
      'csvs/index.json',
      'ocr/index.json',
      'consolidated/index.json'
    ];

    let allEndpointsExist = true;
    for (const endpoint of apiEndpoints) {
      const endpointPath = path.join(apiDir, endpoint);
      if (fs.existsSync(endpointPath)) {
        const stats = fs.statSync(endpointPath);
        console.log(`   ✅ ${endpoint} exists (${stats.size} bytes)`);
      } else {
        console.log(`   ❌ ${endpoint} missing`);
        allEndpointsExist = false;
      }
    }

    if (!allEndpointsExist) {
      console.error('❌ Some API endpoints are missing');
      return false;
    }
  } else {
    console.error('❌ API directory missing');
    return false;
  }

  // Check for deployment manifest
  console.log('\n📝 Checking deployment manifest...');
  const manifestPath = path.join(frontendDataDir, 'deployment_manifest.json');
  if (fs.existsSync(manifestPath)) {
    const stats = fs.statSync(manifestPath);
    console.log(`   ✅ deployment_manifest.json exists (${stats.size} bytes)`);
  } else {
    console.log(`   ⚠️  deployment_manifest.json missing`);
  }

  // Check for processed PDFs and OCR results
  console.log('\n🔍 Checking processed PDFs and OCR results...');
  const processedPdfsDir = path.join(frontendDataDir, 'processed_pdfs');
  if (fs.existsSync(processedPdfsDir)) {
    const pdfDirs = fs.readdirSync(processedPdfsDir).filter(item => 
      fs.statSync(path.join(processedPdfsDir, item)).isDirectory()
    );
    
    console.log(`   ✅ Found ${pdfDirs.length} PDF dataset directories`);
    
    if (pdfDirs.length > 0) {
      // Show first few directories as examples
      const sampleDirs = pdfDirs.slice(0, 3);
      for (const dir of sampleDirs) {
        const dirPath = path.join(processedPdfsDir, dir);
        const files = fs.readdirSync(dirPath);
        console.log(`      - ${dir}: ${files.length} files`);
      }
      
      if (pdfDirs.length > 3) {
        console.log(`      ... and ${pdfDirs.length - 3} more directories`);
      }
    }
  } else {
    console.log('   ⚠️  processed_pdfs directory not yet populated');
  }

  // Check for processed CSVs
  console.log('\n📊 Checking processed CSVs...');
  const processedCsvsDir = path.join(frontendDataDir, 'processed_csvs');
  if (fs.existsSync(processedCsvsDir)) {
    const csvDirs = fs.readdirSync(processedCsvsDir).filter(item => 
      fs.statSync(path.join(processedCsvsDir, item)).isDirectory()
    );
    
    console.log(`   ✅ Found ${csvDirs.length} CSV dataset directories`);
    
    if (csvDirs.length > 0) {
      // Show first few directories as examples
      const sampleDirs = csvDirs.slice(0, 3);
      for (const dir of sampleDirs) {
        const dirPath = path.join(processedCsvsDir, dir);
        const files = fs.readdirSync(dirPath);
        console.log(`      - ${dir}: ${files.length} files`);
      }
      
      if (csvDirs.length > 3) {
        console.log(`      ... and ${csvDirs.length - 3} more directories`);
      }
    }
  } else {
    console.log('   ⚠️  processed_csvs directory not yet populated');
  }

  // Check for OCR results
  console.log('\n🔍 Checking OCR results...');
  const ocrResultsDir = path.join(frontendDataDir, 'pdf_ocr_results');
  if (fs.existsSync(ocrResultsDir)) {
    const ocrDirs = fs.readdirSync(ocrResultsDir).filter(item => 
      fs.statSync(path.join(ocrResultsDir, item)).isDirectory()
    );
    
    console.log(`   ✅ Found ${ocrDirs.length} OCR result directories`);
    
    if (ocrDirs.length > 0) {
      // Show first few directories as examples
      const sampleDirs = ocrDirs.slice(0, 3);
      for (const dir of sampleDirs) {
        const dirPath = path.join(ocrResultsDir, dir);
        if (fs.existsSync(dirPath)) {
          const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));
          console.log(`      - ${dir}: ${files.length} OCR result files`);
        }
      }
      
      if (ocrDirs.length > 3) {
        console.log(`      ... and ${ocrDirs.length - 3} more directories`);
      }
    }
  } else {
    console.log('   ⚠️  pdf_ocr_results directory not yet populated');
  }

  // Check for consolidated indexes
  console.log('\n📊 Checking consolidated indexes...');
  const consolidatedDir = path.join(frontendDataDir, 'consolidated');
  if (fs.existsSync(consolidatedDir)) {
    const consolidatedFiles = fs.readdirSync(consolidatedDir).filter(f => f.endsWith('.json'));
    console.log(`   ✅ Found ${consolidatedFiles.length} consolidated index files`);
    
    // Show first few files as examples
    const sampleFiles = consolidatedFiles.slice(0, 3);
    for (const file of sampleFiles) {
      const filePath = path.join(consolidatedDir, file);
      const stats = fs.statSync(filePath);
      console.log(`      - ${file}: ${stats.size} bytes`);
    }
    
    if (consolidatedFiles.length > 3) {
      console.log(`      ... and ${consolidatedFiles.length - 3} more files`);
    }
  } else {
    console.log('   ⚠️  consolidated directory not yet populated');
  }

  // Check for chart-ready data
  console.log('\n📈 Checking chart-ready data...');
  const chartsDir = path.join(frontendDataDir, 'charts');
  if (fs.existsSync(chartsDir)) {
    const chartFiles = fs.readdirSync(chartsDir).filter(f => f.endsWith('.json'));
    console.log(`   ✅ Found ${chartFiles.length} chart-ready data files`);
    
    // Show first few files as examples
    const sampleFiles = chartFiles.slice(0, 3);
    for (const file of sampleFiles) {
      const filePath = path.join(chartsDir, file);
      const stats = fs.statSync(filePath);
      console.log(`      - ${file}: ${stats.size} bytes`);
    }
    
    if (chartFiles.length > 3) {
      console.log(`      ... and ${chartFiles.length - 3} more files`);
    }
  } else {
    console.log('   ⚠️  charts directory not yet populated');
  }

  // Check for enhanced audit data
  console.log('\n🔍 Checking enhanced audit data...');
  const enhancedAuditDir = path.join(frontendDataDir, 'enhanced_audit');
  if (fs.existsSync(enhancedAuditDir)) {
    const enhancedAuditFiles = fs.readdirSync(enhancedAuditDir).filter(f => f.endsWith('.json'));
    console.log(`   ✅ Found ${enhancedAuditFiles.length} enhanced audit files`);
    
    // Show first few files as examples
    const sampleFiles = enhancedAuditFiles.slice(0, 3);
    for (const file of sampleFiles) {
      const filePath = path.join(enhancedAuditDir, file);
      const stats = fs.statSync(filePath);
      console.log(`      - ${file}: ${stats.size} bytes`);
    }
    
    if (enhancedAuditFiles.length > 3) {
      console.log(`      ... and ${enhancedAuditFiles.length - 3} more files`);
    }
  } else {
    console.log('   ⚠️  enhanced_audit directory not yet populated');
  }

  // Summary
  console.log('\n📋 Deployment Readiness Summary:');
  console.log('   ✅ Project structure is correct');
  console.log('   ✅ Required data files are in place');
  console.log('   ✅ Required data directories exist');
  console.log('   ✅ API endpoints are properly structured');
  console.log('   ✅ Data is organized for GitHub Pages/CloudFlare deployment');
  console.log('   ℹ️  Some processed data files will be populated during runtime');
  
  console.log('\n✅ Deployment readiness verification completed!');
  console.log('🎉 The project is ready for GitHub Pages and CloudFlare deployment!');
  
  return true;
}

// Run the verification if this script is executed directly
if (require.main === module) {
  verifyDeploymentReadiness()
    .then(success => {
      if (success) {
        console.log('\n🚀 Ready for deployment to GitHub Pages and CloudFlare!');
      } else {
        console.log('\n❌ Issues found with deployment readiness. Please check the output above.');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n❌ Error during deployment readiness verification:', error);
      process.exit(1);
    });
}

module.exports = {
  verifyDeploymentReadiness
};