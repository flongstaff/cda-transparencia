#!/usr/bin/env node
/**
 * Ordinance PDF Extractor
 * Extracts structured data from municipal ordinance PDFs for Carmen de Areco
 */

const fs = require('fs').promises;
const path = require('path');
const pdf = require('pdf-parse');

// Regular expressions for ordinance data
const ORDINANCE_PATTERNS = {
  ordinanceNumber: /ordenanza\s+([núNÚ]o\.?\s*)?(\d+\/?\d*)/i,
  title: /titulo[:\s]+([^\n\r]+)/i,
  description: /descripcion[:\s]+([^\n\r]+)/i,
  date: /fecha[:\s]+(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})/i,
  publicationDate: /publicada[:\s]+(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})/i,
  approvalDate: /aprobada[:\s]+(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})/i,
  summary: /resumen[:\s]+([^\n\r]+)/i,
  amount: /\$([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{2})?)/g,
  status: /estado[:\s]+([^\n\r]+)/i
};

/**
 * Extract ordinance data from PDF text
 * @param {string} text - PDF text content
 * @returns {Object} - Extracted ordinance data
 */
function extractOrdinanceData(text) {
  const cleanedText = text.replace(/\s+/g, ' ').trim(); // Normalize whitespace
  
  const data = {
    ordinance_number: null,
    title: null,
    description: null,
    date: null,
    publication_date: null,
    approval_date: null,
    summary: null,
    amounts: [],
    status: null,
    full_text_length: text.length,
    text_sample: text.substring(0, 500)
  };

  // Extract ordinance number
  const ordinanceMatch = cleanedText.match(ORDINANCE_PATTERNS.ordinanceNumber);
  if (ordinanceMatch) {
    data.ordinance_number = ordinanceMatch[2];
  }

  // Extract title
  const titleMatch = cleanedText.match(ORDINANCE_PATTERNS.title);
  if (titleMatch) {
    data.title = titleMatch[1].trim();
  }

  // Extract description
  const descriptionMatch = cleanedText.match(ORDINANCE_PATTERNS.description);
  if (descriptionMatch) {
    data.description = descriptionMatch[1].trim();
  }

  // Extract dates
  const dateMatch = cleanedText.match(ORDINANCE_PATTERNS.date);
  if (dateMatch) {
    data.date = dateMatch[1].trim();
  }

  const pubDateMatch = cleanedText.match(ORDINANCE_PATTERNS.publicationDate);
  if (pubDateMatch) {
    data.publication_date = pubDateMatch[1].trim();
  }

  const approvalDateMatch = cleanedText.match(ORDINANCE_PATTERNS.approvalDate);
  if (approvalDateMatch) {
    data.approval_date = approvalDateMatch[1].trim();
  }

  // Extract summary
  const summaryMatch = cleanedText.match(ORDINANCE_PATTERNS.summary);
  if (summaryMatch) {
    data.summary = summaryMatch[1].trim();
  }

  // Extract status
  const statusMatch = cleanedText.match(ORDINANCE_PATTERNS.status);
  if (statusMatch) {
    data.status = statusMatch[1].trim();
  }

  // Extract amounts
  const amountMatches = [...cleanedText.matchAll(ORDINANCE_PATTERNS.amount)];
  data.amounts = amountMatches.map(match => {
    return parseFloat(match[1].replace(/\./g, '').replace(',', '.'));
  }).filter(amount => !isNaN(amount));

  return data;
}

/**
 * Process ordinance PDF file
 * @param {string} pdfPath - Path to the PDF file
 * @returns {Promise<Object>} - Processed ordinance data
 */
async function processOrdinancePDF(pdfPath) {
  try {
    console.log(`📄 Processing ordinance PDF: ${path.basename(pdfPath)}`);
    
    const dataBuffer = await fs.readFile(pdfPath);
    const pdfData = await pdf(dataBuffer);
    
    const ordinanceData = extractOrdinanceData(pdfData.text);
    
    // Add PDF metadata
    ordinanceData.pdf_metadata = {
      num_pages: pdfData.numpages,
      metadata: pdfData.metadata,
      file_size: (await fs.stat(pdfPath)).size
    };
    
    // Create output directory if it doesn't exist
    const outputDir = path.join(__dirname, '..', 'data', 'ordinances');
    await fs.mkdir(outputDir, { recursive: true });
    
    // Generate output filename based on ordinance number or PDF name
    const baseName = path.parse(pdfPath).name;
    const ordinanceNumber = ordinanceData.ordinance_number || baseName;
    const outputPath = path.join(outputDir, `ordinance_${ordinanceNumber}.json`);
    
    // Save extracted data to JSON file
    await fs.writeFile(outputPath, JSON.stringify(ordinanceData, null, 2));
    
    console.log(`✅ Ordinance data saved to: ${outputPath}`);
    console.log(`📊 Extracted ordinance: #${ordinanceData.ordinance_number || 'unknown'}`);
    
    return ordinanceData;
  } catch (error) {
    console.error(`❌ Error processing ordinance PDF ${pdfPath}:`, error.message);
    throw error;
  }
}

/**
 * Process all ordinance PDFs in a directory
 * @param {string} directory - Directory containing ordinance PDFs
 * @returns {Promise<Array>} - Array of processed ordinance data
 */
async function processAllOrdinancePDFs(directory) {
  console.log(`📁 Processing all ordinance PDFs in: ${directory}`);
  
  try {
    const files = await fs.readdir(directory);
    const pdfFiles = files.filter(file => 
      file.toLowerCase().endsWith('.pdf') && 
      (file.toLowerCase().includes('ordenanza') || 
       file.toLowerCase().includes('ordinance') ||
       file.toLowerCase().includes('boletin'))
    );
    
    if (pdfFiles.length === 0) {
      console.log('ℹ️  No ordinance PDFs found in the directory');
      return [];
    }
    
    console.log(`📋 Found ${pdfFiles.length} ordinance PDFs to process`);
    
    const results = [];
    for (const pdfFile of pdfFiles) {
      try {
        const pdfPath = path.join(directory, pdfFile);
        const result = await processOrdinancePDF(pdfPath);
        results.push(result);
        
        // Small delay between processing files
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`⚠️  Failed to process ${pdfFile}:`, error.message);
      }
    }
    
    return results;
  } catch (error) {
    console.error('❌ Error processing ordinance directory:', error.message);
    throw error;
  }
}

/**
 * Enhanced PDF extraction endpoint compatible with existing proxy
 */
async function extractOrdinanceFromUrl(url) {
  try {
    console.log(`🌐 Extracting ordinance from URL: ${url}`);
    
    // This function would be used by the proxy server
    // For now, we'll simulate by creating a mock extraction
    
    // In a real implementation, you would:
    // 1. Download the PDF from the URL
    // 2. Extract it using the existing functions
    // 3. Return the structured data
    
    const mockOrdinanceData = {
      source_url: url,
      ordinance_number: '1234/2025',
      title: 'Ejemplo de Ordenanza para Prueba',
      description: 'Ordenanza de ejemplo para ilustrar el formato de datos',
      date: '2025-01-15',
      summary: 'Esta es una ordenanza de ejemplo para probar la extracción de datos',
      amounts: [1500000, 5000000],
      status: 'vigente',
      extraction_date: new Date().toISOString(),
      extracted_from: 'URL',
      full_text_length: 0, // Would have actual text length in real implementation
      text_sample: 'Texto de ejemplo de ordenanza... [contenido real en implementación completa]'
    };
    
    return mockOrdinanceData;
  } catch (error) {
    console.error(`❌ Error extracting ordinance from URL ${url}:`, error.message);
    throw error;
  }
}

// Main execution if run directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('_usage: node extract-ordinance-pdf.js <pdf_path|directory_path>');
    console.log('Example: node extract-ordinance-pdf.js /path/to/ordinance.pdf');
    console.log('Example: node extract-ordinance-pdf.js /path/to/ordinances_directory/');
    process.exit(1);
  }
  
  const inputPath = args[0];
  
  fs.stat(inputPath)
    .then(stats => {
      if (stats.isDirectory()) {
        return processAllOrdinancePDFs(inputPath);
      } else {
        return processOrdinancePDF(inputPath);
      }
    })
    .then(results => {
      console.log('\n✅ Processing complete!');
      if (Array.isArray(results)) {
        console.log(`📊 Processed ${results.length} ordinance PDFs`);
      } else {
        console.log('📋 Single ordinance processed');
      }
    })
    .catch(error => {
      console.error('\n💥 Error during processing:', error);
      process.exit(1);
    });
}

module.exports = {
  extractOrdinanceData,
  processOrdinancePDF,
  processAllOrdinancePDFs,
  extractOrdinanceFromUrl
};