const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const execPromise = promisify(exec);

/**
 * Script to coordinate OCR extraction using docstrange
 * This script calls the Python script that uses docstrange for OCR processing
 */

async function runDocstrangeOCR(dataFilePath, outputDir) {
  console.log(`Starting docstrange OCR processing...`);
  console.log(`Input data file: ${dataFilePath}`);
  console.log(`Output directory: ${outputDir}`);

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Path to the Python script
  const pythonScriptPath = path.join(__dirname, 'process_pdfs_with_docstrange.py');

  // Check if the Python script exists
  if (!fs.existsSync(pythonScriptPath)) {
    throw new Error(`Python script not found at: ${pythonScriptPath}`);
  }

  // Run the Python script
  const command = `python3 ${pythonScriptPath} "${dataFilePath}" "${outputDir}"`;
  console.log(`Running command: ${command}`);

  try {
    const { stdout, stderr } = await execPromise(command);
    
    if (stdout) {
      console.log('STDOUT:', stdout);
    }
    
    if (stderr) {
      console.error('STDERR:', stderr);
    }
    
    console.log('OCR processing completed successfully!');
    return { stdout, stderr };
  } catch (error) {
    console.error('Error running docstrange OCR:', error);
    throw error;
  }
}

/**
 * Function to process all data files with OCR
 */
async function processAllDataFilesWithOCR() {
  console.log('Starting OCR processing for all data files...');
  
  // Define paths to the data files
  const dataFilePaths = [
    path.join(__dirname, '..', '..', 'data', 'main-data.json'),
    path.join(__dirname, '..', '..', 'data', 'data.json'),
    path.join(__dirname, '..', '..', 'data', 'main.json')
  ];

  // Filter to only include files that exist
  const existingFiles = dataFilePaths.filter(filePath => fs.existsSync(filePath));

  console.log(`Found ${existingFiles.length} data files to process with OCR`);

  for (const dataFile of existingFiles) {
    console.log(`\nProcessing file: ${dataFile}`);
    
    // Create an output directory for this file
    const outputDir = path.join(
      __dirname, 
      '..', 
      '..', 
      'data', 
      'ocr_extracted',
      path.basename(dataFile, '.json')
    );
    
    try {
      await runDocstrangeOCR(dataFile, outputDir);
      console.log(`Successfully processed ${dataFile} with OCR`);
    } catch (error) {
      console.error(`Error processing ${dataFile}:`, error);
      // Continue with other files even if one fails
    }
  }

  console.log('\nOCR processing completed for all data files!');
}

/**
 * Function to update data files after OCR processing
 * This function would incorporate OCR results back into the data files
 */
async function updateDataFilesWithOCRResults() {
  console.log('Updating data files with OCR results...');
  
  // For now, this function would update the JSON files with OCR metadata
  // In the future, this could link extracted text and other OCR data back to the main data files
  console.log('OCR results have been saved to data/ocr_extracted directory');
  console.log('Future implementation could merge OCR results back into main data files');
}

// Run the OCR processing if this script is executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const operation = args[0] || 'process';
  
  if (operation === 'process') {
    processAllDataFilesWithOCR()
      .then(async () => {
        console.log('OCR processing completed successfully!');
        await updateDataFilesWithOCRResults();
      })
      .catch(error => {
        console.error('Error during OCR processing:', error);
        process.exit(1);
      });
  } else if (operation === 'single') {
    // Process a single file
    if (args.length < 3) {
      console.error('Usage: node ocr-extraction.js single <data_file_path> <output_dir>');
      process.exit(1);
    }
    
    const dataFile = args[1];
    const outputDir = args[2];
    
    runDocstrangeOCR(dataFile, outputDir)
      .then(() => console.log('Single file OCR processing completed!'))
      .catch(error => {
        console.error('Error during single file OCR processing:', error);
        process.exit(1);
      });
  } else {
    console.log('Usage:');
    console.log('  node ocr-extraction.js process    # Process all data files');
    console.log('  node ocr-extraction.js single <data_file> <output_dir>  # Process single file');
  }
}

module.exports = {
  runDocstrangeOCR,
  processAllDataFilesWithOCR,
  updateDataFilesWithOCRResults
};