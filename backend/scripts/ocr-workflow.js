const fs = require('fs');
const path = require('path');
const { runDocstrangeOCR, processAllDataFilesWithOCR, updateDataFilesWithOCRResults } = require('./ocr-extraction');
const { linkDataFiles, checkConsistency } = require('./link-data-files');

/**
 * Complete workflow to process data files with OCR
 * This script orchestrates the entire process: linking data files, processing with OCR, and updating
 */

async function runCompleteWorkflow() {
  console.log('Starting complete data processing workflow with OCR...');
  
  try {
    // Step 1: Ensure data files are linked
    console.log('\n1. Linking data files...');
    await linkDataFiles();
    
    // Step 2: Check consistency of data files
    console.log('\n2. Checking data file consistency...');
    const consistency = await checkConsistency();
    
    // Step 3: Process all data files with OCR
    console.log('\n3. Processing data files with OCR...');
    await processAllDataFilesWithOCR();
    
    // Step 4: Update data files with OCR results
    console.log('\n4. Updating data files with OCR results...');
    await updateDataFilesWithOCRResults();
    
    // Step 5: Verify the process completed successfully
    console.log('\n5. Verification completed - workflow finished successfully!');
    
    // Show final consistency
    console.log('\nFinal status of data files:');
    for (const [name, info] of Object.entries(consistency)) {
      console.log(`  ${name}: exists=${info.exists}, datasets=${info.datasetCount || 0}, size=${info.size || 0} bytes`);
    }
    
  } catch (error) {
    console.error('Error in complete workflow:', error);
    throw error;
  }
}

/**
 * Function to run a sample workflow on specific files
 */
async function runSampleWorkflow() {
  console.log('Starting sample workflow on main-data.json...');
  
  try {
    // Define the main data file to process
    const dataFile = path.join(__dirname, '..', '..', 'data', 'main-data.json');
    const outputDir = path.join(__dirname, '..', '..', 'data', 'ocr_extracted', 'main-data');
    
    // Ensure the data file exists
    if (!fs.existsSync(dataFile)) {
      console.error(`Data file does not exist: ${dataFile}`);
      return;
    }
    
    // Run OCR on the main data file
    console.log(`Processing: ${dataFile}`);
    await runDocstrangeOCR(dataFile, outputDir);
    
    console.log('Sample workflow completed successfully!');
  } catch (error) {
    console.error('Error in sample workflow:', error);
    throw error;
  }
}

// Run the workflow if this script is executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const workflowType = args[0] || 'complete';
  
  if (workflowType === 'sample') {
    runSampleWorkflow()
      .then(() => console.log('Sample workflow completed!'))
      .catch(error => {
        console.error('Error in sample workflow:', error);
        process.exit(1);
      });
  } else {
    runCompleteWorkflow()
      .then(() => console.log('Complete workflow finished successfully!'))
      .catch(error => {
        console.error('Error in complete workflow:', error);
        process.exit(1);
      });
  }
}

module.exports = {
  runCompleteWorkflow,
  runSampleWorkflow
};