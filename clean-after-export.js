const fs = require('fs');

// Read the EnhancedDataService file
const filePath = '/Users/flong/Developer/cda-transparencia/frontend/src/services/EnhancedDataService.ts';

// Read the file
const content = fs.readFileSync(filePath, 'utf8');

// Find the correct export line
const exportLineIndex = content.indexOf('export default EnhancedDataService.getInstance();');

if (exportLineIndex !== -1) {
  // Keep content up to and including the semicolon plus the newline
  const cleanContent = content.substring(0, exportLineIndex + 45) + '\n';
  
  // Write back the clean content
  fs.writeFileSync(filePath, cleanContent, 'utf8');
  
  console.log('Cleaned up everything after export line in EnhancedDataService.ts');
} else {
  console.log('Could not find export line');
}