/**
 * Simple Metadata Generator
 * Works with existing data structure to generate basic metadata
 */

const fs = require('fs').promises;
const path = require('path');

async function generateSimpleMetadata() {
  console.log('🔍 Generating simple metadata for existing data structure...');
  
  try {
    // Read existing data inventory if available
    let dataInventory = {};
    try {
      const inventoryContent = await fs.readFile('./frontend/public/data/data_inventory.json', 'utf8');
      dataInventory = JSON.parse(inventoryContent);
      console.log('✅ Found existing data inventory');
    } catch (error) {
      console.log('ℹ️  No existing data inventory found, creating new one');
    }
    
    // Generate basic metadata
    const metadata = {
      generated: new Date().toISOString(),
      totalFiles: {
        csv: 0,
        json: 0,
        pdf: 0
      },
      categories: {},
      years: {}
    };
    
    // Count files by extension and extract basic info
    const countFiles = async (dirPath, extension) => {
      try {
        const files = await fs.readdir(dirPath);
        let count = 0;
        
        for (const file of files) {
          const fullPath = path.join(dirPath, file);
          const stat = await fs.stat(fullPath);
          
          if (stat.isDirectory()) {
            count += await countFiles(fullPath, extension);
          } else if (file.endsWith(extension)) {
            count++;
            
            // Extract year and category from filename if possible
            const basename = path.basename(file, extension);
            const yearMatch = basename.match(/(\d{4})/);
            if (yearMatch) {
              const year = yearMatch[1];
              if (!metadata.years[year]) {
                metadata.years[year] = 0;
              }
              metadata.years[year]++;
            }
            
            // Extract category from path
            const relativePath = path.relative('./frontend/public/data', dirPath);
            const category = relativePath.split('/')[0] || 'uncategorized';
            if (!metadata.categories[category]) {
              metadata.categories[category] = 0;
            }
            metadata.categories[category]++;
          }
        }
        
        return count;
      } catch (error) {
        return 0;
      }
    };
    
    // Count files in each directory
    metadata.totalFiles.csv = await countFiles('./frontend/public/data/csv', '.csv');
    metadata.totalFiles.json = await countFiles('./frontend/public/data', '.json');
    metadata.totalFiles.pdf = await countFiles('./frontend/public/data/pdfs', '.pdf');
    
    // Write metadata files
    await fs.writeFile('./frontend/public/data/metadata/simple-metadata.json', JSON.stringify(metadata, null, 2));
    await fs.writeFile('./frontend/public/data/metadata/metadata-summary.json', JSON.stringify({
      generated: metadata.generated,
      totalFiles: metadata.totalFiles,
      categories: Object.keys(metadata.categories),
      years: Object.keys(metadata.years).sort()
    }, null, 2));
    
    console.log(`✅ Generated simple metadata:`);
    console.log(`  CSV files: ${metadata.totalFiles.csv}`);
    console.log(`  JSON files: ${metadata.totalFiles.json}`);
    console.log(`  PDF files: ${metadata.totalFiles.pdf}`);
    console.log(`  Categories: ${Object.keys(metadata.categories).join(', ')}`);
    console.log(`  Years: ${Object.keys(metadata.years).sort().join(', ')}`);
    
  } catch (error) {
    console.error('❌ Error generating simple metadata:', error.message);
  }
}

// Run the generator
generateSimpleMetadata().catch(console.error);
