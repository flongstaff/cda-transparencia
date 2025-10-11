const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const { exec } = require('child_process');
const { promisify } = require('util');

const execPromise = promisify(exec);

/**
 * Extract numbers from text using regex
 * @param {string} text - Text to extract numbers from
 * @returns {Array} - Array of numbers found in the text
 */
function extractNumbers(text) {
  // Match numbers with various formats (e.g., 1,234,567.89 or 1234567)
  const regex = /[\d,]+\.?\d*/g;
  const matches = text.match(regex);
  
  if (!matches) return [];
  
  return matches.map(num => {
    // Remove commas and convert to float
    return parseFloat(num.replace(/,/g, ''));
  }).filter(num => !isNaN(num));
}

/**
 * Parse budget PDF and extract structured data using basic PDF parsing
 * @param {string} pdfPath - Path to the PDF file
 * @returns {Promise<Object>} - Parsed budget data
 */
async function parseBudgetBasic(pdfPath) {
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer);
    
    // Extract relevant information from the PDF text
    const text = data.text;
    
    // Look for specific budget-related terms and values
    const budgetData = {
      year: 2025, // Based on the filename
      textSample: text.substring(0, 500), // First 500 characters as sample
      numPages: data.numpages,
      metadata: data.metadata,
      extractedNumbers: extractNumbers(text),
      fullTextLength: text.length,
      source: 'basic-pdf-parse'  // Indicate the source of extraction
    };
    
    // Create structured data directory if it doesn't exist
    const structuredDir = path.join(__dirname, '..', 'data', 'structured');
    if (!fs.existsSync(structuredDir)) {
      fs.mkdirSync(structuredDir, { recursive: true });
    }
    
    // Write the structured data to a JSON file
    const outputPath = path.join(structuredDir, 'budget-2025-basic.json');
    fs.writeFileSync(outputPath, JSON.stringify(budgetData, null, 2));
    
    console.log(`Basic budget data extracted and saved to ${outputPath}`);
    console.log(`Pages: ${budgetData.numPages}, Numbers extracted: ${budgetData.extractedNumbers.length}`);
    
    return budgetData;
  } catch (error) {
    console.error('Error parsing budget PDF with basic method:', error);
    throw error;
  }
}

/**
 * Parse budget PDF using advanced OCR (docstrange) and extract structured data
 * @param {string} pdfPath - Path to the PDF file
 * @returns {Promise<Object>} - Parsed budget data
 */
async function parseBudgetAdvanced(pdfPath) {
  try {
    // Use the Python docstrange script to process the PDF
    const pythonScriptPath = path.join(__dirname, 'process_pdfs_with_docstrange.py');
    const outputDir = path.join(__dirname, '..', 'data', 'ocr_extracted');
    
    // Create a temporary data file with a single PDF entry for processing
    const tempData = {
      title: "Temporary Single PDF Processing",
      description: "Data structure for processing a single PDF with docstrange",
      dataset: [
        {
          identifier: "temp-single-pdf",
          title: "Temporarily created for single PDF processing",
          distribution: [
            {
              title: "Input PDF",
              format: "PDF",
              fileName: path.basename(pdfPath),
              downloadURL: pdfPath,
              localPath: pdfPath  // For local files
            }
          ]
        }
      ]
    };
    
    // Write temporary data file
    const tempDataPath = path.join(outputDir, 'temp_single_pdf.json');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(tempDataPath, JSON.stringify(tempData, null, 2));
    
    // Run the docstrange processing on the temporary data file
    const command = `python3 ${pythonScriptPath} "${tempDataPath}" "${outputDir}"`;
    console.log(`Running advanced OCR processing command: ${command}`);
    
    const { stdout, stderr } = await execPromise(command);
    
    if (stderr) {
      console.error('STDERR from docstrange:', stderr);
    }
    
    // Look for the extraction result file
    const extractionResultPath = path.join(outputDir, 'temp-single-pdf', `${path.basename(pdfPath, '.pdf')}_extraction.json`);
    if (fs.existsSync(extractionResultPath)) {
      const extractionResult = JSON.parse(fs.readFileSync(extractionResultPath, 'utf8'));
      
      const budgetData = {
        year: 2025, // Based on the filename
        textSample: extractionResult.extracted_text.substring(0, 500), // First 500 characters as sample
        numPages: extractionResult.page_count,
        extractedNumbers: extractNumbers(extractionResult.extracted_text),
        fullTextLength: extractionResult.text_length,
        source: 'advanced-ocr-docstrange',  // Indicate the source of extraction
        extractionDetails: extractionResult
      };
      
      // Write the structured data to a JSON file
      const outputPath = path.join(__dirname, '..', 'data', 'structured', 'budget-2025-advanced.json');
      fs.writeFileSync(outputPath, JSON.stringify(budgetData, null, 2));
      
      console.log(`Advanced budget data extracted and saved to ${outputPath}`);
      console.log(`Pages: ${budgetData.numPages}, Numbers extracted: ${budgetData.extractedNumbers.length}`);
      
      // Clean up temporary file
      fs.unlinkSync(tempDataPath);
      
      return budgetData;
    } else {
      throw new Error(`Extraction result not found at: ${extractionResultPath}`);
    }
  } catch (error) {
    console.error('Error parsing budget PDF with advanced OCR:', error);
    throw error;
  }
}

/**
 * Parse budget PDF using the best available method (defaults to basic, with option for advanced)
 * @param {string} pdfPath - Path to the PDF file
 * @param {boolean} useAdvancedOCR - Whether to use advanced OCR (docstrange) or basic parsing
 * @returns {Promise<Object>} - Parsed budget data
 */
async function parseBudget(pdfPath, useAdvancedOCR = false) {
  if (useAdvancedOCR) {
    console.log('Using advanced OCR (docstrange) for PDF parsing...');
    return await parseBudgetAdvanced(pdfPath);
  } else {
    console.log('Using basic PDF parsing...');
    return await parseBudgetBasic(pdfPath);
  }
}

// If this script is run directly, parse the budget PDF
if (require.main === module) {
  // Check command line arguments to see if advanced OCR is requested
  const useAdvancedOCR = process.argv.includes('--advanced') || process.argv.includes('--ocr');
  
  // Look for the PDF in both potential locations
  const pdfPath1 = path.join(__dirname, '..', 'data', 'raw', 'budget-2025.pdf'); // backend/data/raw
  const pdfPath2 = path.join(__dirname, '..', '..', 'data', 'raw', 'budget-2025.pdf'); // root data/raw
  let pdfPath = null;
  
  if (fs.existsSync(pdfPath1)) {
    pdfPath = pdfPath1;
  } else if (fs.existsSync(pdfPath2)) {
    pdfPath = pdfPath2;
  } else {
    console.error(`PDF file not found in either location: ${pdfPath1} or ${pdfPath2}`);
    console.log('Make sure you have downloaded the budget PDF to the data/raw directory');
    process.exit(1);
  }
  
  console.log(`Using ${useAdvancedOCR ? 'advanced' : 'basic'} PDF parsing method`);
  
  parseBudget(pdfPath, useAdvancedOCR)
    .then(result => {
      console.log('Budget parsing completed successfully');
    })
    .catch(error => {
      console.error('Failed to parse budget:', error);
      process.exit(1);
    });
}

module.exports = { parseBudget, parseBudgetBasic, parseBudgetAdvanced, extractNumbers };