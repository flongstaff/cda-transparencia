#!/usr/bin/env node

/**
 * Dark Mode Enhancement Script
 * Automatically adds missing dark mode classes to components
 */

const fs = require('fs');
const path = require('path');

// Define the directories to scan
const directories = [
  '/Users/flong/Developer/cda-transparencia/frontend/src/components',
  '/Users/flong/Developer/cda-transparencia/frontend/src/pages',
  '/Users/flong/Developer/cda-transparencia/frontend/src/layouts'
];

// Define common light mode to dark mode class mappings
const classMappings = {
  // Background colors
  'bg-white': 'dark:bg-dark-surface',
  'bg-gray-50': 'dark:bg-dark-background',
  'bg-gray-100': 'dark:bg-dark-surface-alt',
  'bg-gray-200': 'dark:bg-dark-border',
  'bg-blue-50': 'dark:bg-blue-900/20',
  'bg-green-50': 'dark:bg-green-900/20',
  'bg-red-50': 'dark:bg-red-900/20',
  'bg-orange-50': 'dark:bg-orange-900/20',
  'bg-purple-50': 'dark:bg-purple-900/20',
  
  // Text colors
  'text-gray-900': 'dark:text-dark-text-primary',
  'text-gray-800': 'dark:text-dark-text-primary',
  'text-gray-700': 'dark:text-dark-text-secondary',
  'text-gray-600': 'dark:text-dark-text-secondary',
  'text-gray-500': 'dark:text-dark-text-tertiary',
  'text-gray-400': 'dark:text-dark-text-tertiary',
  'text-blue-600': 'dark:text-blue-400',
  'text-green-600': 'dark:text-green-400',
  'text-red-600': 'dark:text-red-400',
  'text-orange-600': 'dark:text-orange-400',
  'text-purple-600': 'dark:text-purple-400',
  
  // Border colors
  'border-gray-200': 'dark:border-dark-border',
  'border-gray-300': 'dark:border-dark-border',
  'border-blue-200': 'dark:border-blue-700',
  'border-green-200': 'dark:border-green-700',
  'border-red-200': 'dark:border-red-700',
  'border-orange-200': 'dark:border-orange-700',
  'border-purple-200': 'dark:border-purple-700',
  
  // Fill colors (for SVG icons)
  'fill-gray-400': 'dark:fill-gray-500',
  'fill-gray-500': 'dark:fill-gray-400',
  'fill-gray-600': 'dark:fill-gray-300',
  'fill-gray-700': 'dark:fill-gray-300',
  'fill-blue-500': 'dark:fill-blue-400',
  'fill-green-500': 'dark:fill-green-400',
  'fill-red-500': 'dark:fill-red-400',
  'fill-orange-500': 'dark:fill-orange-400',
  'fill-purple-500': 'dark:fill-purple-400'
};

// Function to enhance a single file with dark mode classes
function enhanceFileWithDarkMode(filePath) {
  try {
    // Read the file content
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if it's not a React component file
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.jsx')) {
      return false;
    }
    
    // Skip if it's already been processed
    if (content.includes('dark:')) {
      console.log(`⏭️  Skipping ${filePath} (already has dark mode classes)`);
      return false;
    }
    
    let enhancedContent = content;
    let changesMade = false;
    
    // Apply class mappings
    Object.entries(classMappings).forEach(([lightClass, darkClass]) => {
      // Look for class attributes that contain the light class
      const classRegex = new RegExp(`(className=[\"'][^\"']*)(${lightClass})([^\"']*[\\"])`, 'g');
      
      if (classRegex.test(content)) {
        // Reset regex for actual replacement
        classRegex.lastIndex = 0;
        enhancedContent = enhancedContent.replace(classRegex, `$1${lightClass} ${darkClass}$3`);
        changesMade = true;
        console.log(`  ✨ Added ${darkClass} to elements with ${lightClass}`);
      }
    });
    
    // Special handling for text-gray classes
    const textGrayRegex = /(text-gray-(\d+))/g;
    if (textGrayRegex.test(content)) {
      textGrayRegex.lastIndex = 0;
      enhancedContent = enhancedContent.replace(textGrayRegex, (match, fullClass, number) => {
        let darkClass = '';
        if (parseInt(number) >= 900) {
          darkClass = 'dark:text-dark-text-primary';
        } else if (parseInt(number) >= 600) {
          darkClass = 'dark:text-dark-text-secondary';
        } else {
          darkClass = 'dark:text-dark-text-tertiary';
        }
        changesMade = true;
        console.log(`  ✨ Added ${darkClass} to elements with ${fullClass}`);
        return `${fullClass} ${darkClass}`;
      });
    }
    
    // Special handling for bg-gray classes
    const bgGrayRegex = /(bg-gray-(\d+))/g;
    if (bgGrayRegex.test(content)) {
      bgGrayRegex.lastIndex = 0;
      enhancedContent = enhancedContent.replace(bgGrayRegex, (match, fullClass, number) => {
        let darkClass = '';
        if (parseInt(number) >= 800) {
          darkClass = 'dark:bg-dark-surface';
        } else if (parseInt(number) >= 500) {
          darkClass = 'dark:bg-dark-border';
        } else if (parseInt(number) >= 200) {
          darkClass = 'dark:bg-dark-surface-alt';
        } else {
          darkClass = 'dark:bg-dark-background';
        }
        changesMade = true;
        console.log(`  ✨ Added ${darkClass} to elements with ${fullClass}`);
        return `${fullClass} ${darkClass}`;
      });
    }
    
    // Write the enhanced content back to the file if changes were made
    if (changesMade) {
      fs.writeFileSync(filePath, enhancedContent, 'utf8');
      console.log(`✅ Enhanced ${filePath} with dark mode classes`);
      return true;
    } else {
      console.log(`⏭️  No changes needed for ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error enhancing ${filePath}:`, error.message);
    return false;
  }
}

// Function to recursively scan directories and enhance files
function enhanceDirectoryWithDarkMode(dirPath) {
  console.log(`📁 Scanning directory: ${dirPath}`);
  
  let enhancedFiles = 0;
  
  try {
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const itemPath = path.join(dirPath, item);
      
      // Check if it's a directory
      if (fs.statSync(itemPath).isDirectory()) {
        // Recursively scan subdirectories
        enhancedFiles += enhanceDirectoryWithDarkMode(itemPath);
      } else {
        // Enhance individual files
        if (enhanceFileWithDarkMode(itemPath)) {
          enhancedFiles++;
        }
      }
    });
  } catch (error) {
    console.error(`❌ Error scanning directory ${dirPath}:`, error.message);
  }
  
  return enhancedFiles;
}

// Main function to run the enhancement
function runDarkModeEnhancement() {
  console.log('🚀 Starting Dark Mode Enhancement Process...\n');
  
  let totalEnhancedFiles = 0;
  
  directories.forEach(dir => {
    if (fs.existsSync(dir)) {
      totalEnhancedFiles += enhanceDirectoryWithDarkMode(dir);
    } else {
      console.log(`⚠️  Directory not found: ${dir}`);
    }
  });
  
  console.log(`\n🎉 Dark Mode Enhancement Complete!`);
  console.log(`✨ Enhanced ${totalEnhancedFiles} files with dark mode support`);
  
  if (totalEnhancedFiles > 0) {
    console.log('\n💡 Next steps:');
    console.log('  1. Review the enhanced files to ensure proper dark mode appearance');
    console.log('  2. Test the application in both light and dark modes');
    console.log('  3. Make any manual adjustments as needed');
  } else {
    console.log('\n✅ All files already have dark mode support or no changes were needed.');
  }
  
  return totalEnhancedFiles;
}

// Run the enhancement if this script is executed directly
if (require.main === module) {
  runDarkModeEnhancement();
}

module.exports = {
  enhanceFileWithDarkMode,
  enhanceDirectoryWithDarkMode,
  runDarkModeEnhancement
};