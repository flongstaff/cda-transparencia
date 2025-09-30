const fs = require('fs');

// Read the EnhancedDataService file
const filePath = '/Users/flong/Developer/cda-transparencia/frontend/src/services/EnhancedDataService.ts';

// Read the file
const content = fs.readFileSync(filePath, 'utf8');

// Split into lines
const lines = content.split('\\n');

// Find the first corrupted export line
const firstExportIndex = lines.findIndex((line, index) => 
  line.includes('export default EnhancedDataService.getInstance();') && 
  line.includes(') && value.includes')
);

// Find the correct export line at the end
const correctExportIndex = lines.lastIndexOf('export default EnhancedDataService.getInstance();');

if (firstExportIndex !== -1 && correctExportIndex !== -1 && firstExportIndex < correctExportIndex) {
  // Keep lines from start to first corrupted export, then from after the correct export to end
  const cleanLines = [
    ...lines.slice(0, firstExportIndex),
    ...lines.slice(correctExportIndex)
  ];
  
  const cleanContent = cleanLines.join('\\n');
  
  // Write back the clean content
  fs.writeFileSync(filePath, cleanContent, 'utf8');
  
  console.log('Cleaned up corrupted export lines in EnhancedDataService.ts');
} else {
  console.log('Could not find corrupted export lines');
}