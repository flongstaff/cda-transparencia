const fs = require('fs-extra');
const path = require('path');

const sourceDir = path.join(__dirname, '../backend/enhanced_audit_data');
const destDir = path.join(__dirname, '../frontend/public/enhanced_audit_data');

fs.copy(sourceDir, destDir, { overwrite: true }, err => {
  if (err) return console.error(err);
  console.log('Audit data copied successfully!');
});
