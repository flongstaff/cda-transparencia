import fs from 'fs-extra';
import path from 'path';

async function copyConsolidatedData() {
  try {
    console.log('Copying consolidated chart data to frontend...');
    console.log('Working directory:', process.cwd());
    
    // Source directory with our consolidated data
    const sourceDir = path.join(process.cwd(), '../data/consolidated_charts');
    console.log('Source directory:', sourceDir);
    
    // Check if source directory exists
    const sourceExists = await fs.pathExists(sourceDir);
    console.log('Source directory exists:', sourceExists);
    
    if (!sourceExists) {
      console.log('Source directory does not exist, exiting.');
      return;
    }
    
    // Destination directory in frontend public
    const destDir = path.join(process.cwd(), 'public/data/charts');
    console.log('Destination directory:', destDir);
    
    // Ensure destination directory exists
    await fs.ensureDir(destDir);
    
    // Get all CSV files from source directory
    const sourceFiles = await fs.readdir(sourceDir);
    console.log('Found', sourceFiles.length, 'files in source');
    
    for (const file of sourceFiles) {
      if (file.endsWith('.csv')) {
        const sourcePath = path.join(sourceDir, file);
        const destPath = path.join(destDir, file);
        console.log(`Copying ${sourcePath} to ${destPath}`);
        await fs.copy(sourcePath, destPath);
      }
    }
    
    console.log('✅ Consolidated chart data copied successfully!');
    
    // List copied files for verification
    const files = await fs.readdir(destDir);
    console.log(`📋 Copied ${files.length} consolidated chart files to frontend/public/data/charts:`);
    files.forEach(file => {
      console.log(`   - ${file}`);
    });
    
    // Also copy the extracted data for direct access
    const sourceExtractedDir = path.join(process.cwd(), '../data/extracted_csv');
    console.log('Extracted source directory:', sourceExtractedDir);
    
    const extractedSourceExists = await fs.pathExists(sourceExtractedDir);
    console.log('Extracted source directory exists:', extractedSourceExists);
    
    if (!extractedSourceExists) {
      console.log('Extracted source directory does not exist, skipping.');
      return;
    }
    
    const destExtractedDir = path.join(process.cwd(), 'public/data/extracted');
    console.log('Extracted destination directory:', destExtractedDir);
    
    // Ensure destination directory exists
    await fs.ensureDir(destExtractedDir);
    
    // Get all CSV files from extracted directory
    const extractedSourceFiles = await fs.readdir(sourceExtractedDir);
    console.log('Found', extractedSourceFiles.length, 'files in extracted source');
    
    for (const file of extractedSourceFiles) {
      if (file.endsWith('.csv')) {
        const sourcePath = path.join(sourceExtractedDir, file);
        const destPath = path.join(destExtractedDir, file);
        console.log(`Copying ${sourcePath} to ${destPath}`);
        await fs.copy(sourcePath, destPath);
      }
    }
    
    console.log('✅ Extracted data copied successfully!');
    
    // List copied files for verification
    const extractedFiles = await fs.readdir(destExtractedDir);
    console.log(`📋 Copied ${extractedFiles.length} extracted files to frontend/public/data/extracted:`);
    extractedFiles.forEach(file => {
      console.log(`   - ${file}`);
    });
    
  } catch (error) {
    console.error('❌ Error copying consolidated data:', error);
    process.exit(1);
  }
}

copyConsolidatedData();