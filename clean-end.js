const fs = require('fs');

// Read the EnhancedDataService file
const filePath = '/Users/flong/Developer/cda-transparencia/frontend/src/services/EnhancedDataService.ts';

// Read the file
const content = fs.readFileSync(filePath, 'utf8');

// Find the export line and truncate everything after it
const lines = content.split('\n');
let exportLineIndex = -1;

// Find the correct export line
for (let i = lines.length - 1; i >= 0; i--) {
  if (lines[i].trim() === 'export default EnhancedDataService.getInstance();') {
    exportLineIndex = i;
    break;
  }
}

if (exportLineIndex !== -1) {
  // Keep only lines up to and including the export line
  const cleanLines = lines.slice(0, exportLineIndex + 1);
  const cleanContent = cleanLines.join('\n');
  
  // Write back the clean content
  fs.writeFileSync(filePath, cleanContent, 'utf8');
  
  console.log('Cleaned up EnhancedDataService.ts');
} else {
  console.log('Could not find export line');
}