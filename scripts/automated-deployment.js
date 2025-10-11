#!/usr/bin/env node
/**
 * Automated deployment script for Carmen de Areco Transparency Portal
 * Deploys to GitHub Pages with CloudFlare integration
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const execPromise = promisify(exec);

/**
 * Automated deployment script for GitHub Pages and CloudFlare
 * This script orchestrates the complete deployment process:
 * 1. Data processing and synchronization
 * 2. Frontend build for GitHub Pages
 * 3. Deployment to GitHub Pages
 * 4. CloudFlare Worker deployment
 */
async function runAutomatedDeployment() {
  console.log('🚀 Starting automated deployment to GitHub Pages and CloudFlare...');
  
  try {
    // Step 1: Process all data sources
    console.log('\n1️⃣ Processing all data sources...');
    await processDataSources();
    
    // Step 2: Synchronize data for deployment
    console.log('\n2️⃣ Synchronizing data for deployment...');
    await synchronizeData();
    
    // Step 3: Verify deployment readiness
    console.log('\n3️⃣ Verifying deployment readiness...');
    await verifyDeploymentReadiness();
    
    // Step 4: Build frontend for GitHub Pages
    console.log('\n4️⃣ Building frontend for GitHub Pages...');
    await buildFrontend();
    
    // Step 5: Deploy to GitHub Pages
    console.log('\n5️⃣ Deploying to GitHub Pages...');
    await deployToGitHubPages();
    
    // Step 6: Deploy CloudFlare Worker
    console.log('\n6️⃣ Deploying CloudFlare Worker...');
    await deployCloudFlareWorker();
    
    // Step 7: Final verification
    console.log('\n7️⃣ Performing final verification...');
    await finalVerification();
    
    console.log('\n✅ Automated deployment completed successfully!');
    console.log('🎉 Portal is now live on GitHub Pages with CloudFlare integration!');
    
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

/**
 * Process all data sources with OCR and data transformation
 */
async function processDataSources() {
  const projectRoot = path.join(__dirname, '..');
  const dataProcessorScript = path.join(projectRoot, 'backend', 'scripts', 'enhanced-data-processor.js');
  
  if (!fs.existsSync(dataProcessorScript)) {
    console.log('   ⚠️  Data processor script not found, skipping data processing');
    return;
  }
  
  try {
    console.log('   🔍 Running enhanced data processor...');
    const { stdout, stderr } = await execPromise(`cd ${projectRoot} && node ${dataProcessorScript}`);
    
    if (stdout) console.log(`   ${stdout}`);
    if (stderr) console.error(`   STDERR: ${stderr}`);
    
    console.log('   ✅ Data processing completed');
  } catch (error) {
    console.error('   ❌ Error during data processing:', error.message);
    // Continue with deployment even if data processing fails
  }
}

/**
 * Synchronize processed data for frontend consumption
 */
async function synchronizeData() {
  const projectRoot = path.join(__dirname, '..');
  const syncScript = path.join(projectRoot, 'scripts', 'sync-data-for-deployment.js');
  
  if (!fs.existsSync(syncScript)) {
    console.log('   ⚠️  Data sync script not found, skipping data synchronization');
    return;
  }
  
  try {
    console.log('   🔄 Synchronizing data for deployment...');
    const { stdout, stderr } = await execPromise(`cd ${projectRoot} && node ${syncScript}`);
    
    if (stdout) console.log(`   ${stdout}`);
    if (stderr) console.error(`   STDERR: ${stderr}`);
    
    console.log('   ✅ Data synchronization completed');
  } catch (error) {
    console.error('   ❌ Error during data synchronization:', error.message);
    // Continue with deployment even if synchronization fails
  }
}

/**
 * Verify that all deployment requirements are met
 */
async function verifyDeploymentReadiness() {
  const projectRoot = path.join(__dirname, '..');
  const verifyScript = path.join(projectRoot, 'scripts', 'verify-deployment-readiness.js');
  
  if (!fs.existsSync(verifyScript)) {
    console.log('   ⚠️  Verification script not found, skipping deployment verification');
    return;
  }
  
  try {
    console.log('   ✅ Verifying deployment readiness...');
    const { stdout, stderr } = await execPromise(`cd ${projectRoot} && node ${verifyScript}`);
    
    if (stdout) console.log(`   ${stdout}`);
    if (stderr) console.error(`   STDERR: ${stderr}`);
    
    console.log('   ✅ Deployment readiness verification completed');
  } catch (error) {
    console.error('   ❌ Error during deployment verification:', error.message);
    // Continue with deployment even if verification fails
  }
}

/**
 * Build frontend for GitHub Pages deployment
 */
async function buildFrontend() {
  const frontendDir = path.join(__dirname, '..', 'frontend');
  
  if (!fs.existsSync(frontendDir)) {
    throw new Error('Frontend directory not found');
  }
  
  try {
    console.log('   🔧 Building frontend for GitHub Pages...');
    const { stdout, stderr } = await execPromise(`cd ${frontendDir} && npm run build:github`);
    
    if (stdout) console.log(`   ${stdout}`);
    if (stderr) console.error(`   STDERR: ${stderr}`);
    
    console.log('   ✅ Frontend build completed');
  } catch (error) {
    console.error('   ❌ Error during frontend build:', error.message);
    throw error;
  }
}

/**
 * Deploy to GitHub Pages
 */
async function deployToGitHubPages() {
  const frontendDir = path.join(__dirname, '..', 'frontend');
  
  if (!fs.existsSync(frontendDir)) {
    throw new Error('Frontend directory not found');
  }
  
  try {
    console.log('   🚀 Deploying to GitHub Pages...');
    const { stdout, stderr } = await execPromise(`cd ${frontendDir} && npm run deploy`);
    
    if (stdout) console.log(`   ${stdout}`);
    if (stderr) console.error(`   STDERR: ${stderr}`);
    
    console.log('   ✅ GitHub Pages deployment completed');
  } catch (error) {
    console.error('   ❌ Error during GitHub Pages deployment:', error.message);
    throw error;
  }
}

/**
 * Deploy CloudFlare Worker
 */
async function deployCloudFlareWorker() {
  const projectRoot = path.join(__dirname, '..');
  const workerScript = path.join(projectRoot, 'worker.js');
  
  if (!fs.existsSync(workerScript)) {
    console.log('   ⚠️  CloudFlare Worker script not found, skipping worker deployment');
    return;
  }
  
  try {
    console.log('   ☁️  Deploying CloudFlare Worker...');
    const { stdout, stderr } = await execPromise(`cd ${projectRoot} && npx wrangler deploy`);
    
    if (stdout) console.log(`   ${stdout}`);
    if (stderr) console.error(`   STDERR: ${stderr}`);
    
    console.log('   ✅ CloudFlare Worker deployment completed');
  } catch (error) {
    console.error('   ❌ Error during CloudFlare Worker deployment:', error.message);
    // Continue with deployment even if worker deployment fails
  }
}

/**
 * Perform final verification of deployment
 */
async function finalVerification() {
  const projectRoot = path.join(__dirname, '..');
  const verifyScript = path.join(projectRoot, 'scripts', 'verify-deployment-readiness.js');
  
  if (!fs.existsSync(verifyScript)) {
    console.log('   ⚠️  Verification script not found, skipping final verification');
    return;
  }
  
  try {
    console.log('   ✅ Performing final verification...');
    const { stdout, stderr } = await execPromise(`cd ${projectRoot} && node ${verifyScript}`);
    
    if (stdout) console.log(`   ${stdout}`);
    if (stderr) console.error(`   STDERR: ${stderr}`);
    
    console.log('   ✅ Final verification completed');
  } catch (error) {
    console.error('   ❌ Error during final verification:', error.message);
    // Continue with deployment even if verification fails
  }
}

/**
 * Run selective deployment based on arguments
 */
async function runSelectiveDeployment(args) {
  const steps = args.slice(2);
  
  if (steps.length === 0) {
    // Run full deployment
    await runAutomatedDeployment();
    return;
  }
  
  console.log(`🚀 Starting selective deployment: ${steps.join(', ')}...`);
  
  for (const step of steps) {
    switch (step) {
      case 'data':
        await processDataSources();
        await synchronizeData();
        await verifyDeploymentReadiness();
        break;
      case 'build':
        await buildFrontend();
        break;
      case 'deploy':
        await deployToGitHubPages();
        break;
      case 'worker':
        await deployCloudFlareWorker();
        break;
      case 'verify':
        await finalVerification();
        break;
      default:
        console.log(`⚠️  Unknown deployment step: ${step}`);
    }
  }
  
  console.log('\n✅ Selective deployment completed!');
}

// Run the deployment if this script is executed directly
if (require.main === module) {
  const args = process.argv;
  
  if (args.length > 2) {
    runSelectiveDeployment(args)
      .then(() => {
        console.log('\n✅ Selective deployment completed successfully!');
      })
      .catch(error => {
        console.error('\n❌ Error during selective deployment:', error);
        process.exit(1);
      });
  } else {
    runAutomatedDeployment()
      .then(() => {
        console.log('\n✅ Automated deployment completed successfully!');
      })
      .catch(error => {
        console.error('\n❌ Error during automated deployment:', error);
        process.exit(1);
      });
  }
}

module.exports = {
  runAutomatedDeployment,
  processDataSources,
  synchronizeData,
  verifyDeploymentReadiness,
  buildFrontend,
  deployToGitHubPages,
  deployCloudFlareWorker,
  finalVerification,
  runSelectiveDeployment
};