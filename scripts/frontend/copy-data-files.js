import fs from 'fs-extra';
import path from 'path';

// Copy all files from public/data to dist/data
const publicDataDir = path.join(process.cwd(), 'public', 'data');
const distDataDir = path.join(process.cwd(), 'dist', 'data');

async function copyDataFiles() {
  try {
    console.log('Copying data files from public/data to dist/data...');
    
    // Ensure destination directory exists
    await fs.ensureDir(distDataDir);
    
    // Copy all files recursively, dereferencing symlinks
    await fs.copy(publicDataDir, distDataDir, {
      overwrite: true,
      preserveTimestamps: true,
      dereference: true  // This will copy the actual files instead of symlinks
    });
    
    console.log('✅ Data files copied successfully!');
    
    // List copied files for verification
    const files = await fs.readdir(distDataDir);
    console.log(`📋 Copied ${files.length} items to dist/data:`);
    files.forEach(file => {
      console.log(`   - ${file}`);
    });
  } catch (error) {
    console.error('❌ Error copying data files:', error);
    process.exit(1);
  }
}

copyDataFiles();