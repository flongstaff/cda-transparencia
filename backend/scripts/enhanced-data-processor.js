const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { exec } = require('child_process');
const { promisify } = require('util');

const execPromise = promisify(exec);

// Configure axios with better defaults for handling certificate issues
const httpClient = axios.create({
  timeout: 60000, // 60 seconds timeout
  maxRedirects: 5,
  // Allow self-signed certificates (use with caution in production)
  httpsAgent: new (require('https').Agent)({
    rejectUnauthorized: false
  }),
  // Retry configuration
  retry: 3,
  retryDelay: 1000
});

/**
 * Enhanced script to process all official data sources and organize them for CloudFlare/GitHub Pages
 * This script processes PDFs with OCR and formats all data for frontend consumption in charts and pages
 */

async function processAllOfficialDataSources() {
  console.log('Starting enhanced data processing for CloudFlare/GitHub Pages...');

  // Define all data source files to process
  const dataFiles = [
    path.join(__dirname, '..', '..', 'data', 'data.json'),
    path.join(__dirname, '..', '..', 'data', 'main-data.json'),
    path.join(__dirname, '..', '..', 'data', 'main.json')
  ];

  // Enhanced audit data
  const enhancedAuditFile = path.join(__dirname, '..', 'enhanced_audit_data', 'enhanced_audit_results.json');

  // Create the processed data directory structure for GitHub Pages
  const processedBaseDir = path.join(__dirname, '..', '..', 'frontend', 'public', 'data');
  const dirsToCreate = [
    path.join(processedBaseDir, 'processed_pdfs'),
    path.join(processedBaseDir, 'processed_csvs'),
    path.join(processedBaseDir, 'pdf_ocr_results'),
    path.join(processedBaseDir, 'dataset_metadata'),
    path.join(processedBaseDir, 'consolidated'),
    path.join(processedBaseDir, 'enhanced_audit')
  ];

  for (const dir of dirsToCreate) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  // Process each main data file
  for (const dataFile of dataFiles) {
    if (!fs.existsSync(dataFile)) {
      console.log(`Data file does not exist: ${dataFile}`);
      continue;
    }

    console.log(`\nProcessing data file: ${path.basename(dataFile)}`);
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

    for (const dataset of data.dataset) {
      console.log(`  Processing dataset: ${dataset.title}`);
      await processDataset(dataset, processedBaseDir);
    }
  }

  // Process enhanced audit data
  if (fs.existsSync(enhancedAuditFile)) {
    console.log('\nProcessing enhanced audit data...');
    await processEnhancedAuditData(enhancedAuditFile, processedBaseDir);
  }

  // Create consolidated indexes for frontend consumption
  await createConsolidatedIndexes(processedBaseDir);

  console.log('\nEnhanced data processing completed!');
}

async function processDataset(dataset, processedBaseDir) {
  const datasetId = dataset.identifier;
  const datasetDir = path.join(processedBaseDir, 'dataset_metadata', datasetId);
  
  if (!fs.existsSync(datasetDir)) {
    fs.mkdirSync(datasetDir, { recursive: true });
  }

  // Process each distribution file (PDF/CSV)
  for (const distribution of dataset.distribution) {
    try {
      // Handle cases where format might be missing or undefined
      const formatRaw = distribution.format || 'UNKNOWN';
      const format = typeof formatRaw === 'string' ? formatRaw.toUpperCase() : 'UNKNOWN';
      const fileName = distribution.fileName || `unknown.${format.toLowerCase()}`;
      const accessURL = distribution.accessURL || distribution.downloadURL;

      if (!accessURL) {
        console.log(`    No access URL for: ${fileName}`);
        continue;
      }

      if (format === 'PDF') {
        console.log(`    Processing PDF: ${fileName}`);
        await processPDFWithOCR(accessURL, fileName, dataset, processedBaseDir);
      } else if (format === 'CSV') {
        console.log(`    Processing CSV: ${fileName}`);
        await processCSVForFrontend(accessURL, fileName, dataset, processedBaseDir);
      } else {
        console.log(`    Skipping unsupported format: ${format} for ${fileName}`);
        // Still create metadata for unsupported formats
        await createMetadataEntry(dataset, distribution, processedBaseDir);
      }
    } catch (error) {
      console.error(`    Error processing distribution:`, error.message);
      // Continue with other distributions even if one fails
      continue;
    }
  }

  // Create dataset-level metadata
  await createDatasetMetadata(dataset, processedBaseDir);
}

async function downloadFile(url, localPath) {
  console.log(`      Downloading: ${url}`);
  
  // Ensure the directory exists
  const dirPath = path.dirname(localPath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  // Retry mechanism
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await httpClient({
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

      console.log(`      Downloaded to: ${localPath}`);
      return true;
    } catch (error) {
      lastError = error;
      console.error(`      Download attempt ${attempt} failed:`, error.message);
      
      // If this is the last attempt, clean up partial file
      if (attempt === 3 && fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
      
      // Wait before retrying (exponential backoff)
      if (attempt < 3) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  
  console.error(`      Failed to download after 3 attempts:`, lastError.message);
  return false;
}

async function processPDFWithOCR(url, fileName, dataset, processedBaseDir) {
  const datasetId = dataset.identifier;
  const downloadsDir = path.join(__dirname, '..', 'data', 'downloads', datasetId);
  
  if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
  }

  const localPath = path.join(downloadsDir, fileName);
  
  try {
    // Download PDF
    const downloadSuccess = await downloadFile(url, localPath);
    if (!downloadSuccess) {
      throw new Error(`Failed to download PDF: ${fileName}`);
    }

    // Copy to frontend public directory for GitHub Pages
    const publicPDFDir = path.join(processedBaseDir, 'processed_pdfs', datasetId);
    if (!fs.existsSync(publicPDFDir)) {
      fs.mkdirSync(publicPDFDir, { recursive: true });
    }
    const publicPDFPath = path.join(publicPDFDir, fileName);
    fs.copyFileSync(localPath, publicPDFPath);

    // Process with docstrange OCR
    await runDocstrangeOCR(localPath, dataset, processedBaseDir);

    // Create metadata entry
    await createMetadataEntry(dataset, { ...dataset.distribution.find(d => d.fileName === fileName), localPath: publicPDFPath }, processedBaseDir);

  } catch (error) {
    console.error(`      Error processing PDF ${fileName}:`, error.message);
    // Create error metadata entry
    await createErrorMetadataEntry(dataset, fileName, error.message, processedBaseDir);
  }
}

async function processCSVForFrontend(url, fileName, dataset, processedBaseDir) {
  const datasetId = dataset.identifier;
  const downloadsDir = path.join(__dirname, '..', 'data', 'downloads', datasetId);
  
  if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
  }

  const localPath = path.join(downloadsDir, fileName);
  
  try {
    // Download CSV
    const downloadSuccess = await downloadFile(url, localPath);
    if (!downloadSuccess) {
      throw new Error(`Failed to download CSV: ${fileName}`);
    }

    // Copy to frontend public directory for GitHub Pages
    const publicCSVDir = path.join(processedBaseDir, 'processed_csvs', datasetId);
    if (!fs.existsSync(publicCSVDir)) {
      fs.mkdirSync(publicCSVDir, { recursive: true });
    }
    const publicCSVPath = path.join(publicCSVDir, fileName);
    fs.copyFileSync(localPath, publicCSVPath);

    // Process for charts
    await processCSVForCharts(localPath, dataset, processedBaseDir);

    // Create metadata entry
    await createMetadataEntry(dataset, { ...dataset.distribution.find(d => d.fileName === fileName), localPath: publicCSVPath }, processedBaseDir);

  } catch (error) {
    console.error(`      Error processing CSV ${fileName}:`, error.message);
    // Create error metadata entry
    await createErrorMetadataEntry(dataset, fileName, error.message, processedBaseDir);
  }
}

async function runDocstrangeOCR(pdfPath, dataset, processedBaseDir) {
  try {
    // Create a temporary data file structure for the single PDF
    const tempData = {
      title: "Temporary PDF for OCR processing",
      description: "Data structure for processing a single PDF with docstrange",
      dataset: [
        {
          identifier: dataset.identifier,
          title: dataset.title,
          distribution: [
            {
              title: path.basename(pdfPath),
              format: "PDF",
              fileName: path.basename(pdfPath),
              localPath: pdfPath
            }
          ]
        }
      ]
    };

    // Write temporary data file
    const tempDir = path.join(__dirname, '..', 'data', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const tempDataPath = path.join(tempDir, `${dataset.identifier}_temp.json`);
    fs.writeFileSync(tempDataPath, JSON.stringify(tempData, null, 2));

    // Create OCR results directory
    const ocrResultsDir = path.join(processedBaseDir, 'pdf_ocr_results', dataset.identifier);
    if (!fs.existsSync(ocrResultsDir)) {
      fs.mkdirSync(ocrResultsDir, { recursive: true });
    }

    // Run the Python docstrange script using the exec function
    const pythonScriptPath = path.join(__dirname, 'process_pdfs_with_docstrange.py');
    const command = `python3 ${pythonScriptPath} "${tempDataPath}" "${ocrResultsDir}"`;
    console.log(`      Running OCR command: ${command}`);

    const { stdout, stderr } = await execPromise(command);

    if (stderr) {
      console.error('      STDERR from docstrange:', stderr);
    }

    console.log('      OCR processing completed');

    // Clean up temporary file
    if (fs.existsSync(tempDataPath)) {
      fs.unlinkSync(tempDataPath);
    }

  } catch (error) {
    console.error(`      Error running OCR on ${pdfPath}:`, error.message);
    // Even if OCR fails, the PDF is still available for frontend use
  }
}

async function processCSVForCharts(csvPath, dataset, processedBaseDir) {
  // For now, just read the CSV and create a simple JSON version that's easier for charts to consume
  // In the future, we could implement more sophisticated CSV processing here
  
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  
  // Simple CSV parsing - in a real implementation, we'd want more robust parsing
  const lines = csvContent.split('\n');
  if (lines.length < 2) return; // Need at least header and one data row

  const headers = lines[0].split(',').map(h => h.trim());
  const dataRows = lines.slice(1).filter(line => line.trim() !== '');

  const jsonArray = [];
  for (const row of dataRows) {
    if (row.trim() === '') continue;
    
    const values = row.split(',');
    const obj = {};
    
    for (let i = 0; i < headers.length; i++) {
      obj[headers[i]] = values[i] ? values[i].trim() : '';
    }
    
    jsonArray.push(obj);
  }

  // Create a JSON version for frontend consumption
  const jsonPath = path.join(
    processedBaseDir, 
    'processed_csvs', 
    dataset.identifier, 
    `${path.parse(csvPath).name}.json`
  );
  
  const chartData = {
    sourceFile: path.basename(csvPath),
    headers: headers,
    data: jsonArray,
    recordCount: jsonArray.length,
    processedAt: new Date().toISOString()
  };
  
  fs.writeFileSync(jsonPath, JSON.stringify(chartData, null, 2));
  console.log(`      Created chart-ready JSON: ${jsonPath}`);
}

async function createMetadataEntry(dataset, distribution, processedBaseDir) {
  const datasetId = dataset.identifier;
  const metadataPath = path.join(processedBaseDir, 'dataset_metadata', `${datasetId}.json`);
  
  // Load existing metadata or create new
  let existingMetadata = {};
  if (fs.existsSync(metadataPath)) {
    existingMetadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  }
  
  // Add/update this distribution's metadata
  if (!existingMetadata.files) existingMetadata.files = {};
  
  existingMetadata.files[distribution.fileName] = {
    datasetId: datasetId,
    datasetTitle: dataset.title,
    fileName: distribution.fileName,
    format: distribution.format,
    title: distribution.title,
    accessURL: distribution.accessURL || distribution.downloadURL,
    lastProcessed: new Date().toISOString(),
    status: 'processed'
  };

  // Add general dataset info if not already there
  existingMetadata.info = {
    identifier: dataset.identifier,
    title: dataset.title,
    description: dataset.description,
    theme: dataset.theme,
    superTheme: dataset.superTheme,
    keywords: dataset.keywords,
    issued: dataset.issued,
    modified: dataset.modified,
    publisher: dataset.publisher,
    landingPage: dataset.landingPage
  };

  fs.writeFileSync(metadataPath, JSON.stringify(existingMetadata, null, 2));
}

async function createErrorMetadataEntry(dataset, fileName, errorMessage, processedBaseDir) {
  const datasetId = dataset.identifier;
  const metadataPath = path.join(processedBaseDir, 'dataset_metadata', `${datasetId}.json`);
  
  // Load existing metadata or create new
  let existingMetadata = {};
  if (fs.existsSync(metadataPath)) {
    existingMetadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  }
  
  // Add error entry
  if (!existingMetadata.files) existingMetadata.files = {};
  
  existingMetadata.files[fileName] = {
    datasetId: datasetId,
    datasetTitle: dataset.title,
    fileName: fileName,
    lastProcessed: new Date().toISOString(),
    status: 'error',
    error: errorMessage
  };

  // Add general dataset info if not already there
  existingMetadata.info = existingMetadata.info || {
    identifier: dataset.identifier,
    title: dataset.title,
    description: dataset.description || 'Unknown',
    theme: dataset.theme || 'unknown',
    keywords: dataset.keywords || [],
    issued: dataset.issued || 'unknown',
    modified: dataset.modified || 'unknown',
    publisher: dataset.publisher || 'unknown'
  };

  fs.writeFileSync(metadataPath, JSON.stringify(existingMetadata, null, 2));
}

async function createDatasetMetadata(dataset, processedBaseDir) {
  const datasetId = dataset.identifier;
  const datasetMetadataPath = path.join(processedBaseDir, 'consolidated', `dataset_${datasetId}.json`);
  
  // Create comprehensive dataset metadata
  const datasetMetadata = {
    identifier: dataset.identifier,
    title: dataset.title,
    description: dataset.description,
    theme: dataset.theme,
    superTheme: dataset.superTheme,
    keywords: dataset.keywords,
    issued: dataset.issued,
    modified: dataset.modified,
    landingPage: dataset.landingPage,
    publisher: dataset.publisher,
    distributions: dataset.distribution.map(dist => ({
      title: dist.title,
      format: dist.format,
      fileName: dist.fileName,
      accessURL: dist.accessURL || dist.downloadURL
    })),
    lastProcessed: new Date().toISOString(),
    processingStatus: 'completed'
  };
  
  fs.writeFileSync(datasetMetadataPath, JSON.stringify(datasetMetadata, null, 2));
}

async function processEnhancedAuditData(auditFile, processedBaseDir) {
  const auditData = JSON.parse(fs.readFileSync(auditFile, 'utf8'));
  
  // Extract and organize information for frontend consumption
  const frontendAuditData = {
    metadata: {
      source: 'enhanced_audit_results.json',
      lastUpdated: new Date().toISOString()
    },
    nationalSearch: {
      datasets: auditData.national_search.national_datasets,
      provincialData: auditData.national_search.provincial_data
    },
    monitoring: {
      changeDetection: auditData.monitoring_config.change_detection,
      boraMonitoring: auditData.monitoring_config.bora_monitoring,
      socialMonitoring: auditData.monitoring_config.social_monitoring
    },
    comparison: auditData.comparison_framework,
    compliance: auditData.legal_compliance,
    reporting: auditData.reporting_channels,
    publicPortal: {
      features: auditData.public_portal.features,
      dataStandards: auditData.public_portal.data_standards
    }
  };
  
  const auditPath = path.join(processedBaseDir, 'enhanced_audit', 'audit_data.json');
  fs.writeFileSync(auditPath, JSON.stringify(frontendAuditData, null, 2));
  console.log(`    Created enhanced audit data: ${auditPath}`);
}

async function createConsolidatedIndexes(processedBaseDir) {
  // Create a consolidated index of all processed data
  const consolidatedDir = path.join(processedBaseDir, 'consolidated');
  
  // Find all dataset metadata files
  const metadataFiles = fs.readdirSync(path.join(processedBaseDir, 'dataset_metadata'))
    .filter(file => file.endsWith('.json'));
  
  const datasets = [];
  for (const file of metadataFiles) {
    const filePath = path.join(processedBaseDir, 'dataset_metadata', file);
    const metadata = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (metadata.info) {
      datasets.push({
        identifier: metadata.info.identifier,
        title: metadata.info.title,
        description: metadata.info.description,
        theme: metadata.info.theme,
        keywords: metadata.info.keywords,
        modified: metadata.info.modified,
        publisher: metadata.info.publisher,
        fileCount: Object.keys(metadata.files || {}).length,
        files: metadata.files
      });
    }
  }
  
  // Create consolidated index
  const consolidatedIndex = {
    metadata: {
      title: 'Consolidated Data Index',
      description: 'Index of all processed datasets from Carmen de Areco',
      generatedAt: new Date().toISOString()
    },
    statistics: {
      totalDatasets: datasets.length,
      totalFiles: datasets.reduce((sum, ds) => sum + ds.fileCount, 0)
    },
    datasets: datasets
  };
  
  const indexPath = path.join(consolidatedDir, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(consolidatedIndex, null, 2));
  console.log(`  Created consolidated index: ${indexPath}`);
  
  // Also create a simplified version for quick frontend loading
  const quickIndex = {
    lastUpdated: new Date().toISOString(),
    datasetCount: datasets.length,
    themeBreakdown: datasets.reduce((acc, ds) => {
      acc[ds.theme] = (acc[ds.theme] || 0) + 1;
      return acc;
    }, {}),
    recentUpdates: datasets
      .filter(ds => ds.modified !== 'unknown')
      .sort((a, b) => new Date(b.modified) - new Date(a.modified))
      .slice(0, 10)
      .map(ds => ({
        identifier: ds.identifier,
        title: ds.title,
        modified: ds.modified
      }))
  };
  
  const quickIndexPath = path.join(consolidatedDir, 'quick_index.json');
  fs.writeFileSync(quickIndexPath, JSON.stringify(quickIndex, null, 2));
  console.log(`  Created quick index: ${quickIndexPath}`);
}

// Run the processing if this script is executed directly
if (require.main === module) {
  processAllOfficialDataSources()
    .then(() => {
      console.log('\nAll data processing for CloudFlare/GitHub Pages completed successfully!');
    })
    .catch(error => {
      console.error('\nError during data processing:', error);
      process.exit(1);
    });
}

module.exports = {
  processAllOfficialDataSources,
  processDataset,
  processPDFWithOCR,
  processCSVForFrontend,
  runDocstrangeOCR,
  processCSVForCharts,
  createMetadataEntry,
  createErrorMetadataEntry,
  createDatasetMetadata,
  processEnhancedAuditData,
  createConsolidatedIndexes
};