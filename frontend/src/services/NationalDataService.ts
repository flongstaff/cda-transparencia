// Mock service for national datasets
// In a real implementation, this would connect to national data API

const nationalDatasetCategories = [
  'Economía y Finanzas',
  'Salud y Bienestar',
  'Educación y Cultura',
  'Transporte y Vialidad',
  'Desarrollo Social',
  'Infraestructura y Obras',
  'Medio Ambiente',
  'Seguridad y Justicia',
  'Innovación y Tecnología',
  'Agricultura y Ganadería'
];

const nationalDatasetFormats = [
  ['csv', 'json'],
  ['xlsx', 'json'],
  ['csv', 'xlsx', 'json'],
  ['pdf', 'json'],
  ['csv', 'pdf'],
  ['json'],
  ['xlsx', 'csv'],
  ['pdf', 'xlsx', 'json']
];

const nationalDatasetTags = [
  ['economía', 'finanzas', 'nacional'],
  ['salud', 'hospital', 'nacional'],
  ['educación', 'escuelas', 'nacional'],
  ['transporte', 'vialidad', 'nacional'],
  ['social', 'asistencia', 'nacional'],
  ['obras', 'construcción', 'nacional'],
  ['medio ambiente', 'sustentable', 'nacional'],
  ['seguridad', 'policía', 'nacional'],
  ['tecnología', 'innovación', 'nacional'],
  ['agricultura', 'ganadería', 'nacional']
];

// Generate mock national datasets
export const generateNationalDatasets = (count: number): any[] => {
  const datasets = [];
  
  for (let i = 0; i < count; i++) {
    const catIndex = i % nationalDatasetCategories.length;
    const formatIndex = i % nationalDatasetFormats.length;
    const tagIndex = i % nationalDatasetTags.length;
    
    datasets.push({
      id: `national-dataset-${i + 1}`,
      title: `Dataset Nacional ${nationalDatasetCategories[catIndex]} #${i + 1}`,
      description: `Conjunto de datos nacional sobre ${nationalDatasetCategories[catIndex].toLowerCase()} - Actualizado regularmente por el gobierno nacional`,
      category: nationalDatasetCategories[catIndex],
      formats: nationalDatasetFormats[formatIndex],
      size: `${Math.round(Math.random() * 15) + 1}.${Math.round(Math.random() * 9)} MB`,
      lastUpdated: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      url: `/data/national-dataset-${i + 1}.${nationalDatasetFormats[formatIndex][0]}`,
      accessibility: {
        compliant: Math.random() > 0.15, // 85% are compliant
        standards: ['WCAG 2.1 AA']
      },
      source: 'Nacional',
      license: 'Creative Commons',
      tags: [...nationalDatasetTags[tagIndex], 'nacional'],
      updateFrequency: Math.random() > 0.5 ? 'mensual' : 'trimestral',
      downloads: Math.floor(Math.random() * 500) + 50
    });
  }
  
  return datasets;
};

// Generate mock national PDF documents
export const generateNationalPDFs = (count: number): any[] => {
  const pdfs = [];
  
  for (let i = 0; i < count; i++) {
    const catIndex = i % nationalDatasetCategories.length;
    const tagIndex = i % nationalDatasetTags.length;
    
    pdfs.push({
      id: `national-pdf-${i + 1}`,
      title: `Documento Nacional ${nationalDatasetCategories[catIndex]} #${i + 1}`,
      description: `Documento PDF nacional oficial sobre ${nationalDatasetCategories[catIndex].toLowerCase()} - Publicado por el gobierno nacional`,
      category: nationalDatasetCategories[catIndex],
      size: `${Math.round(Math.random() * 20) + 5} MB`,
      lastUpdated: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      url: `/data/national-document-${i + 1}.pdf`,
      tags: [...nationalDatasetTags[tagIndex], 'nacional'],
      source: 'Nacional',
      page: 'national'
    });
  }
  
  return pdfs;
};

// Main function to get both datasets and documents
export const getNationalData = () => {
  return {
    datasets: generateNationalDatasets(1191), // Simulating 1,191 national datasets
    documents: generateNationalPDFs(150) // Simulating 150 national documents
  };
};