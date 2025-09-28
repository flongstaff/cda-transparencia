// Generate data index for the frontend
const fs = require('fs');
const path = require('path');
const { globSync } = require('glob');

console.log('🔍 Generating data index for frontend...');

// Function to create an index of available data files
function generateDataIndex() {
  const dataDir = path.join(__dirname, '../data');
  const outputDir = path.join(__dirname, '../frontend/public/data');
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Find all data files in the data directory
  const dataFiles = globSync(path.join(dataDir, '**/*.{csv,json,xml,txt}'));
  
  // Create an index of the data
  const dataIndex = {
    generatedAt: new Date().toISOString(),
    dataSources: {
      csv: dataFiles.filter(f => f.endsWith('.csv')).map(f => {
        const relPath = path.relative(dataDir, f);
        return {
          path: relPath,
          name: path.basename(f),
          size: fs.statSync(f).size
        };
      }),
      json: dataFiles.filter(f => f.endsWith('.json')).map(f => {
        const relPath = path.relative(dataDir, f);
        return {
          path: relPath,
          name: path.basename(f),
          size: fs.statSync(f).size
        };
      })
    },
    dataDirectoryStructure: buildDirectoryStructure(dataDir)
  };

  // Write the index to the frontend public directory
  const indexPath = path.join(outputDir, 'data-index.json');
  fs.writeFileSync(indexPath, JSON.stringify(dataIndex, null, 2));
  
  console.log(`✅ Data index generated with ${dataIndex.dataSources.csv.length + dataIndex.dataSources.json.length} files`);
  console.log(`📊 Index written to: ${indexPath}`);
}

// Helper function to build directory structure
function buildDirectoryStructure(dir) {
  const result = {};
  
  function scanDirectory(currentDir, currentPath = '') {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const relativePath = currentPath ? path.join(currentPath, item) : item;
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        result[relativePath] = {
          type: 'directory',
          contents: []
        };
        scanDirectory(fullPath, relativePath);
      } else if (path.extname(fullPath).match(/\.(csv|json|xml|txt)$/)) {
        const parentDir = path.dirname(relativePath);
        if (!result[parentDir]) {
          result[parentDir] = { type: 'directory', contents: [] };
        }
        result[parentDir].contents.push({
          name: path.basename(fullPath),
          type: 'file',
          extension: path.extname(fullPath),
          size: stat.size
        });
      }
    }
  }
  
  scanDirectory(dir);
  return result;
}

// Run the generation
generateDataIndex();