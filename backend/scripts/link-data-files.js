const fs = require('fs');
const path = require('path');

/**
 * Script to link and synchronize data files: data.json, main-data.json, and main.json
 * This script ensures all three data index files are properly linked and updated consistently
 */

async function linkDataFiles() {
  console.log('Linking data files: data.json, main-data.json, main.json');
  
  // Define file paths
  const dataPaths = {
    data: path.join(__dirname, '..', '..', 'data', 'data.json'),
    mainData: path.join(__dirname, '..', '..', 'data', 'main-data.json'),
    main: path.join(__dirname, '..', '..', 'data', 'main.json'),
    publicData: path.join(__dirname, '..', '..', 'public', 'data.json'),
    publicMainData: path.join(__dirname, '..', '..', 'public', 'main-data.json'),
    publicMain: path.join(__dirname, '..', '..', 'public', 'main.json'),
    frontendData: path.join(__dirname, '..', '..', 'frontend', 'public', 'data', 'data.json'),
    frontendMainData: path.join(__dirname, '..', '..', 'frontend', 'public', 'data', 'main-data.json'),
    frontendMain: path.join(__dirname, '..', '..', 'frontend', 'public', 'data', 'main.json')
  };

  try {
    // Check if main-data.json exists (since we know it does from earlier)
    if (!fs.existsSync(dataPaths.mainData)) {
      console.error(`main-data.json does not exist at: ${dataPaths.mainData}`);
      return;
    }

    // Read main-data.json as the source of truth
    const mainDataContent = JSON.parse(fs.readFileSync(dataPaths.mainData, 'utf8'));
    console.log(`Loaded main-data.json with ${mainDataContent.dataset?.length || 0} datasets`);
    
    // Update data.json to match main-data.json pattern if it's different
    if (fs.existsSync(dataPaths.data)) {
      const dataContent = JSON.parse(fs.readFileSync(dataPaths.data, 'utf8'));
      console.log(`Loaded data.json with ${dataContent.dataset?.length || 0} datasets`);
      
      // If data.json has a different structure, we might want to align it
      // For now, let's copy the structure from main-data.json
      await updateTargetFile(dataPaths.data, mainDataContent);
    } else {
      console.log('Creating data.json based on main-data.json');
      await updateTargetFile(dataPaths.data, mainDataContent);
    }
    
    // Update main.json to match main-data.json if it's different
    if (fs.existsSync(dataPaths.main)) {
      const mainContent = JSON.parse(fs.readFileSync(dataPaths.main, 'utf8'));
      console.log(`Loaded main.json with ${mainContent.dataset?.length || 0} datasets`);
      
      await updateTargetFile(dataPaths.main, mainDataContent);
    } else {
      console.log('Creating main.json based on main-data.json');
      await updateTargetFile(dataPaths.main, mainDataContent);
    }
    
    // Synchronize public directory versions
    await syncToFile(dataPaths.mainData, dataPaths.publicMainData);
    await syncToFile(dataPaths.data, dataPaths.publicData);
    await syncToFile(dataPaths.main, dataPaths.publicMain);
    
    // Synchronize frontend directory versions
    await syncToFile(dataPaths.mainData, dataPaths.frontendMainData);
    await syncToFile(dataPaths.data, dataPaths.frontendData);
    await syncToFile(dataPaths.main, dataPaths.frontendMain);
    
    console.log('Successfully linked all data files!');
  } catch (error) {
    console.error('Error linking data files:', error);
    throw error;
  }
}

async function updateTargetFile(targetPath, sourceContent) {
  // Ensure directory exists
  const dirPath = path.dirname(targetPath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  // Write the source content to the target file
  fs.writeFileSync(targetPath, JSON.stringify(sourceContent, null, 2));
  console.log(`Updated ${targetPath}`);
}

async function syncToFile(sourcePath, targetPath) {
  if (fs.existsSync(sourcePath)) {
    // Ensure target directory exists
    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // Copy content
    const content = fs.readFileSync(sourcePath, 'utf8');
    fs.writeFileSync(targetPath, content);
    console.log(`Synced ${sourcePath} to ${targetPath}`);
  }
}

/**
 * Function to check the consistency of all data files
 */
async function checkConsistency() {
  const dataPaths = {
    data: path.join(__dirname, '..', '..', 'data', 'data.json'),
    mainData: path.join(__dirname, '..', '..', 'data', 'main-data.json'),
    main: path.join(__dirname, '..', '..', 'data', 'main.json')
  };
  
  console.log('Checking consistency of data files...');
  
  const results = {};
  
  for (const [name, path] of Object.entries(dataPaths)) {
    if (fs.existsSync(path)) {
      const content = JSON.parse(fs.readFileSync(path, 'utf8'));
      results[name] = {
        exists: true,
        size: fs.statSync(path).size,
        datasetCount: content.dataset?.length || 0,
        lastUpdated: content.lastUpdated || 'unknown'
      };
    } else {
      results[name] = { exists: false };
    }
  }
  
  console.log('Data file status:');
  for (const [name, info] of Object.entries(results)) {
    console.log(`  ${name}: exists=${info.exists}, datasets=${info.datasetCount || 0}, size=${info.size || 0} bytes, lastUpdated=${info.lastUpdated || 'unknown'}`);
  }
  
  return results;
}

// Run the linking process if this script is executed directly
if (require.main === module) {
  console.log('Starting data file linking process...');
  
  const args = process.argv.slice(2);
  const operation = args[0] || 'link';
  
  if (operation === 'check') {
    checkConsistency()
      .then(results => console.log('Consistency check completed.'))
      .catch(error => console.error('Error during consistency check:', error));
  } else {
    linkDataFiles()
      .then(() => console.log('Data file linking completed successfully!'))
      .catch(error => {
        console.error('Error during data file linking:', error);
        process.exit(1);
      });
  }
}

module.exports = { linkDataFiles, checkConsistency };