#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Scan all PDFs
const pdfDir = path.join(__dirname, '../public/data/pdfs');
const files = fs.readdirSync(pdfDir);

const manifest = {
  generatedAt: new Date().toISOString(),
  totalPDFs: files.length,
  baseURL: '/data/pdfs/',
  categories: {},
  pdfs: []
};

files.forEach(file => {
  if (!file.endsWith('.pdf')) return;

  const filePath = path.join(pdfDir, file);
  const stats = fs.statSync(filePath);

  // Categorize based on filename patterns
  let category = 'other';
  let theme = ['gove'];
  let year = null;
  let title = file.replace('.pdf', '').replace(/_/g, ' ');

  if (file.includes('PRESUPUESTO') || file.includes('presupuesto')) {
    category = 'budget';
    theme = ['econ'];
  } else if (file.includes('GASTOS') || file.includes('gastos')) {
    category = 'expenses';
    theme = ['econ'];
  } else if (file.includes('RECURSOS') || file.includes('recursos')) {
    category = 'revenue';
    theme = ['econ'];
  } else if (file.includes('SITUACION-ECONOMICA') || file.includes('Situacion-Economica')) {
    category = 'economic_reports';
    theme = ['econ'];
  } else if (file.includes('CAIF')) {
    category = 'health';
    theme = ['heal'];
  } else if (file.includes('Ordenanza') || file.includes('ORDENANZA')) {
    category = 'ordinances';
    theme = ['just', 'gove'];
  } else if (file.includes('boletin_oficial')) {
    category = 'official_bulletin';
    theme = ['gove'];
  } else if (file.includes('ORGANIGRAMA')) {
    category = 'organization';
    theme = ['gove'];
  }

  // Extract year
  const yearMatch = file.match(/20(1[7-9]|2[0-5])/);
  if (yearMatch) year = parseInt(yearMatch[0]);

  const pdfEntry = {
    filename: file,
    title,
    category,
    theme,
    year,
    size: stats.size,
    sizeFormatted: (stats.size / 1024 / 1024).toFixed(2) + 'MB',
    accessURL: '/data/pdfs/' + file,
    downloadURL: '/data/pdfs/' + file,
    modified: stats.mtime
  };

  manifest.pdfs.push(pdfEntry);

  // Group by category
  if (!manifest.categories[category]) {
    manifest.categories[category] = [];
  }
  manifest.categories[category].push(pdfEntry);
});

// Sort by year and filename
manifest.pdfs.sort((a, b) => {
  if (a.year && b.year) return b.year - a.year;
  if (a.year) return -1;
  if (b.year) return 1;
  return a.filename.localeCompare(b.filename);
});

// Add category summaries
manifest.categorySummary = Object.entries(manifest.categories).map(([name, pdfs]) => ({
  name,
  count: pdfs.length,
  totalSize: pdfs.reduce((sum, p) => sum + p.size, 0),
  years: [...new Set(pdfs.map(p => p.year).filter(y => y))].sort()
}));

console.log('📄 PDF Manifest Summary:');
console.log('   Total PDFs:', manifest.totalPDFs);
console.log('\n📊 By Category:');
manifest.categorySummary.forEach(cat => {
  console.log(`   ${cat.name}: ${cat.count} files`);
});

// Save manifest
const outputPath = path.join(__dirname, '../public/data/pdf-manifest.json');
fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2));

console.log('\n✅ PDF manifest created at: public/data/pdf-manifest.json');
console.log(`   File size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
