#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');
const pdf = require('pdf-parse');
const glob = require('glob');

const PDF_DIR = path.join(__dirname, '../data/pdfs');
const OUTPUT_DIR = path.join(__dirname, '../frontend/public/data/processed_pdfs');

async function processPDF(pdfPath) {
  try {
    const dataBuffer = await fs.readFile(pdfPath);
    const data = await pdf(dataBuffer);
    
    const filename = path.basename(pdfPath, '.pdf');
    const year = filename.match(/\d{4}/)?.[0] || 'unknown';
    
    return {
      filename,
      path: pdfPath,
      year,
      pages: data.numpages,
      text: data.text,
      textLength: data.text.length,
      metadata: data.metadata,
      info: data.info
    };
  } catch (error) {
    console.error(`Error processing ${pdfPath}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('📄 Processing all PDFs with OCR...\n');
  
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  
  // Find all PDFs
  const pdfFiles = glob.sync('**/*.pdf', { cwd: PDF_DIR, absolute: true });
  console.log(`Found ${pdfFiles.length} PDF files\n`);
  
  const results = [];
  const index = {
    totalFiles: pdfFiles.length,
    processed: 0,
    failed: 0,
    files: []
  };
  
  for (let i = 0; i < pdfFiles.length; i++) {
    const pdfPath = pdfFiles[i];
    console.log(`[${i+1}/${pdfFiles.length}] Processing: ${path.basename(pdfPath)}`);
    
    const result = await processPDF(pdfPath);
    if (result) {
      results.push(result);
      index.processed++;
      index.files.push({
        filename: result.filename,
        year: result.year,
        pages: result.pages,
        path: path.relative(PDF_DIR, pdfPath)
      });
      
      // Save individual file
      const outputFile = path.join(OUTPUT_DIR, `${result.filename}.json`);
      await fs.writeFile(outputFile, JSON.stringify(result, null, 2));
    } else {
      index.failed++;
    }
  }
  
  // Save index
  const indexFile = path.join(OUTPUT_DIR, 'pdf_index.json');
  await fs.writeFile(indexFile, JSON.stringify(index, null, 2));
  
  console.log(`\n✅ Processing complete!`);
  console.log(`   Processed: ${index.processed}`);
  console.log(`   Failed: ${index.failed}`);
  console.log(`   Index saved: ${indexFile}`);
}

main().catch(console.error);
