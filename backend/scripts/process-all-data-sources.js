const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { runDocstrangeOCR } = require('./ocr-extraction');
const { parseBudget } = require('./parse-pdf');  // This is the enhanced parse-pdf with OCR support

/**
 * Comprehensive script to process all PDFs and CSVs from official data sources
 * and format them for frontend consumption in charts and pages
 */

async function processAllDataSources() {
  console.log('Starting comprehensive data processing...');

  // Define the main data files to process
  const dataFiles = [
    path.join(__dirname, '..', '..', 'data', 'data.json'),
    path.join(__dirname, '..', '..', 'data', 'main-data.json'),
    path.join(__dirname, '..', '..', 'data', 'main.json')
  ];

  // Enhanced audit data file
  const enhancedAuditFile = path.join(__dirname, '..', 'enhanced_audit_data', 'enhanced_audit_results.json');

  // Process each data file
  for (const dataFile of dataFiles) {
    if (!fs.existsSync(dataFile)) {
      console.log(`Data file does not exist: ${dataFile}`);
      continue;
    }

    console.log(`\nProcessing data file: ${path.basename(dataFile)}`);
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

    // Process each dataset
    for (const dataset of data.dataset) {
      console.log(`  Processing dataset: ${dataset.title}`);

      // Process each distribution (PDF/CSV files)
      for (const distribution of dataset.distribution) {
        const format = distribution.format.toUpperCase();
        const fileName = distribution.fileName || 'unknown';
        const accessURL = distribution.accessURL || distribution.downloadURL;

        if (!accessURL) {
          console.log(`    No access URL for: ${fileName}`);
          continue;
        }

        // Create dataset directory
        const datasetDir = path.join(__dirname, '..', 'data', 'processed', dataset.identifier);
        if (!fs.existsSync(datasetDir)) {
          fs.mkdirSync(datasetDir, { recursive: true });
        }

        if (format === 'PDF') {
          console.log(`    Processing PDF: ${fileName}`);
          await processPDF(accessURL, datasetDir, fileName, dataset.identifier);
        } else if (format === 'CSV') {
          console.log(`    Processing CSV: ${fileName}`);
          await processCSV(accessURL, datasetDir, fileName, dataset.identifier);
        } else {
          console.log(`    Skipping unsupported format: ${format} for ${fileName}`);
        }
      }
    }
  }

  // Process enhanced audit data
  if (fs.existsSync(enhancedAuditFile)) {
    console.log('\nProcessing enhanced audit data...');
    const auditData = JSON.parse(fs.readFileSync(enhancedAuditFile, 'utf8'));
    await processEnhancedAuditData(auditData);
  }

  // Create CloudFlare/GitHub Pages ready data structure
  await prepareFrontendData();

  console.log('\nComprehensive data processing completed!');
}

async function processPDF(url, datasetDir, fileName, datasetId) {
  try {
    // Download PDF
    const localPath = path.join(datasetDir, fileName);
    console.log(`      Downloading: ${url}`);
    
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
      timeout: 60000  // 60 seconds timeout
    });

    const writer = fs.createWriteStream(localPath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    console.log(`      Saved to: ${localPath}`);

    // Process with OCR
    const testData = {
      title: "PDF for OCR extraction",
      description: "Temporary data file for processing a single PDF with OCR",
      dataset: [
        {
          identifier: datasetId,
          title: `Dataset for ${fileName}`,
          distribution: [
            {
              title: fileName,
              format: "PDF",
              fileName: fileName,
              localPath: localPath,
              accessURL: localPath
            }
          ]
        }
      ]
    };

    // Save temporary data file
    const testDataPath = path.join(datasetDir, `${path.parse(fileName).name}_temp_data.json`);
    fs.writeFileSync(testDataPath, JSON.stringify(testData, null, 2));

    // Create output directory for OCR results
    const outputDir = path.join(datasetDir, 'ocr_results');

    // Run OCR extraction
    await runDocstrangeOCR(testDataPath, outputDir);

    // Clean up temporary file
    if (fs.existsSync(testDataPath)) {
      fs.unlinkSync(testDataPath);
    }

    // Process the OCR results to make them frontend-ready
    await processOCROutput(outputDir, datasetDir);

  } catch (error) {
    console.error(`      Error processing PDF ${fileName}:`, error.message);
  }
}

async function processCSV(url, datasetDir, fileName, datasetId) {
  try {
    console.log(`      Downloading: ${url}`);
    
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
      timeout: 60000  // 60 seconds timeout
    });

    const localPath = path.join(datasetDir, fileName);
    const writer = fs.createWriteStream(localPath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    console.log(`      Saved to: ${localPath}`);

    // Process the CSV to make it frontend-ready
    await processCSVForFrontend(localPath, datasetDir);

  } catch (error) {
    console.error(`      Error processing CSV ${fileName}:`, error.message);
  }
}

async function processOCROutput(ocrOutputDir, datasetDir) {
  // Look for extraction results in the OCR output directory
  if (!fs.existsSync(ocrOutputDir)) {
    console.log('    No OCR output directory found');
    return;
  }

  const files = fs.readdirSync(ocrOutputDir);
  for (const file of files) {
    if (file.endsWith('_extraction.json')) {
      const extractionPath = path.join(ocrOutputDir, file);
      const extractionData = JSON.parse(fs.readFileSync(extractionPath, 'utf8'));

      // Create a frontend-ready version of the extraction
      const frontendReady = {
        datasetId: path.basename(extractionPath, '_extraction.json'),
        extractionInfo: {
          pageCount: extractionData.page_count,
          textLength: extractionData.text_length,
          fallbackMethod: extractionData.fallback_method || 'docstrange',
          tableCount: extractionData.table_count || 0,
          figureCount: extractionData.figure_count || 0
        },
        textSample: extractionData.extracted_text.substring(0, 500) + '...'
      };

      // Save the frontend-ready version
      const frontendReadyPath = path.join(datasetDir, `${path.basename(extractionPath, '_extraction.json')}_frontend.json`);
      fs.writeFileSync(frontendReadyPath, JSON.stringify(frontendReady, null, 2));
      console.log(`    Created frontend-ready extraction: ${frontendReadyPath}`);
    }
  }
}

async function processCSVForFrontend(csvPath, datasetDir) {
  // For now, just copy the CSV to a public location for GitHub Pages
  // In the future, we could process the CSV to extract key metrics
  const filename = path.basename(csvPath);
  const publicCSVDir = path.join(__dirname, '..', '..', 'frontend', 'public', 'data', 'processed_csvs');
  
  if (!fs.existsSync(publicCSVDir)) {
    fs.mkdirSync(publicCSVDir, { recursive: true });
  }
  
  const publicCSVPath = path.join(publicCSVDir, filename);
  fs.copyFileSync(csvPath, publicCSVPath);
  console.log(`    Copied CSV to public directory: ${publicCSVPath}`);

  // Create a metadata file for the CSV to help with frontend consumption
  const stats = fs.statSync(csvPath);
  const metadata = {
    fileName: filename,
    size: stats.size,
    path: `/data/processed_csvs/${filename}`,  // GitHub Pages relative path
    processingDate: new Date().toISOString(),
    format: 'csv'
  };

  const metadataPath = path.join(datasetDir, `${path.parse(filename).name}_metadata.json`);
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  console.log(`    Created metadata: ${metadataPath}`);
}

async function processEnhancedAuditData(auditData) {
  // Extract relevant information from enhanced audit data
  const processedAuditData = {
    nationalSearch: auditData.national_search,
    monitoringConfig: auditData.monitoring_config,
    comparisonFramework: {
      peerMunicipalities: auditData.comparison_framework.peer_municipalities,
      bestPracticeModels: auditData.comparison_framework.best_practice_models
    },
    legalCompliance: auditData.legal_compliance,
    lastUpdated: new Date().toISOString()
  };

  // Save processed audit data in a frontend-ready format
  const processedAuditPath = path.join(__dirname, '..', 'data', 'processed', 'enhanced_audit_processed.json');
  fs.writeFileSync(processedAuditPath, JSON.stringify(processedAuditData, null, 2));
  console.log(`  Saved processed audit data: ${processedAuditPath}`);

  // Also save to public directory for GitHub Pages
  const publicAuditPath = path.join(__dirname, '..', '..', 'frontend', 'public', 'data', 'enhanced_audit.json');
  fs.writeFileSync(publicAuditPath, JSON.stringify(processedAuditData, null, 2));
  console.log(`  Saved public audit data: ${publicAuditPath}`);
}

async function prepareFrontendData() {
  console.log('\nPreparing data for frontend consumption...');

  // Create a consolidated index of all processed data
  const processedDir = path.join(__dirname, '..', 'data', 'processed');
  if (!fs.existsSync(processedDir)) {
    fs.mkdirSync(processedDir, { recursive: true });
  }

  // Find all processed datasets
  const datasets = [];
  const items = fs.readdirSync(processedDir);
  
  for (const item of items) {
    const itemPath = path.join(processedDir, item);
    if (fs.statSync(itemPath).isDirectory()) {
      const files = fs.readdirSync(itemPath);
      
      // Look for relevant files in the dataset directory
      const datasetInfo = {
        id: item,
        files: [],
        hasOCR: false,
        hasFrontendReady: false
      };
      
      for (const file of files) {
        const filePath = path.join(itemPath, file);
        const stat = fs.statSync(filePath);
        
        datasetInfo.files.push({
          name: file,
          path: path.relative(path.join(__dirname, '..', '..'), filePath),
          size: stat.size,
          type: path.extname(file).substring(1)  // Remove the dot from extension
        });
        
        if (file.endsWith('_frontend.json')) {
          datasetInfo.hasFrontendReady = true;
          datasetInfo.hasOCR = true;
        }
      }
      
      datasets.push(datasetInfo);
    }
  }

  // Create a consolidated index
  const index = {
    lastUpdated: new Date().toISOString(),
    totalDatasets: datasets.length,
    datasets: datasets,
    dataSources: [
      "main-data.json",
      "data.json", 
      "main.json"
    ],
    processedDataTypes: [
      "PDF (with OCR)", 
      "CSV", 
      "Enhanced Audit Data"
    ],
    frontendReady: true
  };

  // Save the consolidated index
  const indexPath = path.join(processedDir, 'consolidated_index.json');
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
  console.log(`  Created consolidated index: ${indexPath}`);

  // Also save to public directory for GitHub Pages
  const publicIndexPath = path.join(__dirname, '..', '..', 'frontend', 'public', 'data', 'consolidated_index.json');
  fs.writeFileSync(publicIndexPath, JSON.stringify(index, null, 2));
  console.log(`  Created public index: ${publicIndexPath}`);

  // Create a summary for the frontend with key metrics
  const summary = {
    metadata: {
      title: "Carmen de Areco Transparency Data Summary",
      description: "Processed and analyzed data from Carmen de Areco's transparency portal",
      lastUpdated: new Date().toISOString()
    },
    statistics: {
      totalDatasets: index.totalDatasets,
      datasetsWithOCR: datasets.filter(d => d.hasOCR).length,
      datasetsWithFrontendReady: datasets.filter(d => d.hasFrontendReady).length
    },
    dataAvailability: {
      budgetData: datasets.filter(d => d.id.includes('presupuesto')).length > 0,
      executionReports: datasets.filter(d => d.id.includes('ejecucion')).length > 0,
      contracts: datasets.filter(d => d.id.includes('licitacion') || d.id.includes('contrato')).length > 0,
      statistics: datasets.filter(d => d.id.includes('estadisticas')).length > 0
    }
  };

  // Save the summary
  const summaryPath = path.join(processedDir, 'summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log(`  Created summary: ${summaryPath}`);

  // Also save to public directory for GitHub Pages
  const publicSummaryPath = path.join(__dirname, '..', '..', 'frontend', 'public', 'data', 'summary.json');
  fs.writeFileSync(publicSummaryPath, JSON.stringify(summary, null, 2));
  console.log(`  Created public summary: ${publicSummaryPath}`);

  console.log('Frontend data preparation completed!');
}

// Run the processing if this script is executed directly
if (require.main === module) {
  processAllDataSources()
    .then(() => {
      console.log('\nAll data processing completed successfully!');
    })
    .catch(error => {
      console.error('\nError during data processing:', error);
      process.exit(1);
    });
}

module.exports = {
  processAllDataSources,
  processPDF,
  processCSV,
  processOCROutput,
  processCSVForFrontend,
  processEnhancedAuditData,
  prepareFrontendData
};