const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { runDocstrangeOCR } = require('./ocr-extraction');

/**
 * Test script to download a sample PDF from the data catalog and process it with OCR
 */

async function downloadSamplePDF() {
  // Load the main-data.json to get a sample PDF
  const mainDataPath = path.join(__dirname, '..', '..', 'data', 'main-data.json');
  
  if (!fs.existsSync(mainDataPath)) {
    throw new Error(`main-data.json not found at: ${mainDataPath}`);
  }
  
  const mainData = JSON.parse(fs.readFileSync(mainDataPath, 'utf8'));
  
  // Find the first PDF in the dataset
  let samplePDF = null;
  for (const dataset of mainData.dataset) {
    for (const distribution of dataset.distribution) {
      if (distribution.format.toUpperCase() === 'PDF') {
        samplePDF = distribution;
        break;
      }
    }
    if (samplePDF) break;
  }
  
  if (!samplePDF) {
    throw new Error('No PDF found in main-data.json');
  }
  
  console.log('Found sample PDF:', samplePDF.title);
  console.log('Download URL:', samplePDF.downloadURL);
  
  // Create directory for test PDFs
  const testDir = path.join(__dirname, '..', 'data', 'test_pdfs');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
  
  // Download the PDF
  const pdfPath = path.join(testDir, samplePDF.fileName);
  
  console.log(`Downloading PDF to: ${pdfPath}`);
  
  try {
    const response = await axios({
      method: 'GET',
      url: samplePDF.downloadURL,
      responseType: 'stream'
    });
    
    const writer = fs.createWriteStream(pdfPath);
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log('PDF download completed');
        resolve(pdfPath);
      });
      writer.on('error', (error) => {
        console.error('Error downloading PDF:', error);
        reject(error);
      });
    });
  } catch (error) {
    console.error('Error downloading PDF:', error.message);
    throw error;
  }
}

async function testOCRExtraction() {
  console.log('Starting OCR test with sample PDF...');
  
  try {
    // Download a sample PDF from the catalog
    const pdfPath = await downloadSamplePDF();
    
    // Create a simple data file structure for the single PDF
    const testData = {
      title: "Test data for OCR extraction",
      description: "Temporary data file for testing OCR on a single PDF",
      dataset: [
        {
          identifier: "test-ocr-extraction",
          title: "Test OCR extraction",
          distribution: [
            {
              title: path.basename(pdfPath),
              format: "PDF",
              fileName: path.basename(pdfPath),
              localPath: pdfPath,
              accessURL: pdfPath  // Using local path
            }
          ]
        }
      ]
    };
    
    // Save temporary data file
    const testDataPath = path.join(__dirname, '..', 'data', 'test_pdfs', 'test_ocr_data.json');
    fs.writeFileSync(testDataPath, JSON.stringify(testData, null, 2));
    
    console.log(`Created test data file: ${testDataPath}`);
    
    // Create output directory for OCR results
    const outputDir = path.join(__dirname, '..', 'data', 'test_pdfs', 'ocr_results');
    
    // Run OCR extraction on the test data
    console.log('Running OCR extraction...');
    await runDocstrangeOCR(testDataPath, outputDir);
    
    console.log('OCR test completed successfully!');
    
    // Verify that extraction results were created
    const resultFiles = fs.readdirSync(outputDir).filter(file => file.endsWith('.json'));
    console.log(`Found ${resultFiles.length} extraction result files:`, resultFiles);
    
    // Clean up temporary files
    if (fs.existsSync(testDataPath)) {
      fs.unlinkSync(testDataPath);
    }
    
  } catch (error) {
    console.error('Error during OCR test:', error);
    throw error;
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testOCRExtraction()
    .then(() => {
      console.log('\nOCR extraction test completed successfully!');
    })
    .catch(error => {
      console.error('\nOCR extraction test failed:', error);
      process.exit(1);
    });
}

module.exports = { testOCRExtraction, downloadSamplePDF };