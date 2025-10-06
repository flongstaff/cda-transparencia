#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load national catalog
const nationalCatalog = JSON.parse(
  fs.readFileSync('/tmp/datos_gob_ar_catalog.json', 'utf8')
);

// Load existing municipal catalog
const municipalCatalog = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, '../data/data.json'),
    'utf8'
  )
);

// Create merged catalog
const mergedCatalog = {
  '@context': 'http://www.w3.org/ns/dcat.jsonld',
  version: '1.1',
  title: 'Datos Carmen de Areco - Catálogo Integrado',
  description:
    'Catálogo integrado de datos públicos municipales de Carmen de Areco con referencia al catálogo nacional de datos abiertos de Argentina.',
  publisher: {
    name: 'Municipalidad de Carmen de Areco',
    mbox: 'municipio@carmendeareco.gob.ar',
  },
  license: 'CC-BY-4.0',
  superThemeTaxonomy: 'http://datos.gob.ar/superThemeTaxonomy.json',
  themeTaxonomy: nationalCatalog.themeTaxonomy || [],
  dataset: [],
};

// Add all municipal datasets first (with source tag)
const municipalDatasets = municipalCatalog.dataset || [];
municipalDatasets.forEach((ds) => {
  mergedCatalog.dataset.push({
    ...ds,
    spatial: 'Carmen de Areco, Buenos Aires, Argentina',
    source: 'municipal',
  });
});

// Add all national datasets (with source tag)
const nationalDatasets = nationalCatalog.dataset || [];
nationalDatasets.forEach((ds) => {
  mergedCatalog.dataset.push({
    ...ds,
    source: 'national',
  });
});

// Write merged catalog to all target locations
const outputPaths = [
  path.join(__dirname, '../data/data.json'),
  path.join(__dirname, '../data/main.json'),
  path.join(__dirname, '../public/main-data.json'),
];

outputPaths.forEach((outputPath) => {
  fs.writeFileSync(outputPath, JSON.stringify(mergedCatalog, null, 2), 'utf8');
  console.log(`✅ Updated: ${outputPath}`);
});

console.log(`\n📊 Catalog Statistics:`);
console.log(`   Municipal datasets: ${municipalDatasets.length}`);
console.log(`   National datasets: ${nationalDatasets.length}`);
console.log(`   Total datasets: ${mergedCatalog.dataset.length}`);
console.log(`   Themes: ${mergedCatalog.themeTaxonomy.length}`);
