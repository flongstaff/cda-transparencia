const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

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
 * Parse budget PDF and extract structured data
 * @param {string} pdfPath - Path to the PDF file
 * @returns {Promise<Object>} - Parsed budget data
 */
async function parseBudget(pdfPath) {
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
      fullTextLength: text.length
    };
    
    // Create structured data directory if it doesn't exist
    const structuredDir = path.join(__dirname, '..', 'data', 'structured');
    if (!fs.existsSync(structuredDir)) {
      fs.mkdirSync(structuredDir, { recursive: true });
    }
    
    // Write the structured data to a JSON file
    const outputPath = path.join(structuredDir, 'budget-2025.json');
    fs.writeFileSync(outputPath, JSON.stringify(budgetData, null, 2));
    
    console.log(`Budget data extracted and saved to ${outputPath}`);
    console.log(`Pages: ${budgetData.numPages}, Numbers extracted: ${budgetData.extractedNumbers.length}`);
    
    return budgetData;
  } catch (error) {
    console.error('Error parsing budget PDF:', error);
    throw error;
  }
}

// If this script is run directly, parse the budget PDF
if (require.main === module) {
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
  
  parseBudget(pdfPath)
    .then(result => {
      console.log('Budget parsing completed successfully');
    })
    .catch(error => {
      console.error('Failed to parse budget:', error);
      process.exit(1);
    });
}

module.exports = { parseBudget, extractNumbers };