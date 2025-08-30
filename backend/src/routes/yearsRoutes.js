const express = require('express');
const router = express.Router();

// Mock data for years
const mockYearsData = {
  2025: {
    total_documents: 173,
    categories: {
      "Ejecución Presupuestaria": 65,
      "Estados Financieros": 42,
      "Deuda Pública": 18,
      "Recursos Humanos": 28,
      "Licitaciones Públicas": 12,
      "Documentos Generales": 8
    },
    documents: [
      {
        id: "doc-2025-001",
        title: "Estado de Ejecución de Gastos - Junio 2025",
        url: "https://carmendeareco.gob.ar/wp-content/uploads/2025/06/Estado-de-Ejecucion-de-Gastos-Junio-2025.pdf",
        year: 2025,
        category: "Ejecución Presupuestaria",
        source: "official",
        type: "budget_execution",
        description: "Reporte mensual de ejecución presupuestaria de gastos para junio 2025",
        official_url: "https://carmendeareco.gob.ar/transparencia/",
        size_mb: 2.1,
        last_modified: "2025-06-30T00:00:00.000Z"
      },
      {
        id: "doc-2025-002",
        title: "Estado de Ejecución de Recursos - Junio 2025",
        url: "https://carmendeareco.gob.ar/wp-content/uploads/2025/06/Estado-de-Ejecucion-de-Recursos-Junio-2025.pdf",
        year: 2025,
        category: "Ejecución Presupuestaria",
        source: "official",
        type: "budget_execution",
        description: "Reporte mensual de ejecución presupuestaria de recursos para junio 2025",
        official_url: "https://carmendeareco.gob.ar/transparencia/",
        size_mb: 1.8,
        last_modified: "2025-06-30T00:00:00.000Z"
      },
      {
        id: "doc-2025-003",
        title: "Situación Económico Financiera - Junio 2025",
        url: "https://carmendeareco.gob.ar/wp-content/uploads/2025/06/Situacion-Economico-Financiera-Junio-2025.pdf",
        year: 2025,
        category: "Estados Financieros",
        source: "official",
        type: "financial_statement",
        description: "Situación económico financiera al cierre de junio 2025",
        official_url: "https://carmendeareco.gob.ar/transparencia/",
        size_mb: 3.2,
        last_modified: "2025-06-30T00:00:00.000Z"
      }
    ]
  },
  2024: {
    total_documents: 187,
    categories: {
      "Ejecución Presupuestaria": 72,
      "Estados Financieros": 48,
      "Deuda Pública": 21,
      "Recursos Humanos": 24,
      "Licitaciones Públicas": 15,
      "Documentos Generales": 7
    },
    documents: [
      {
        id: "doc-2024-001",
        title: "Estado de Ejecución de Gastos - 4to Trimestre 2024",
        url: "https://carmendeareco.gob.ar/wp-content/uploads/2024/12/Estado-de-Ejecucion-de-Gastos-4to-Trimestres.pdf",
        year: 2024,
        category: "Ejecución Presupuestaria",
        source: "official",
        type: "budget_execution",
        description: "Reporte trimestral de ejecución presupuestaria de gastos para el 4to trimestre 2024",
        official_url: "https://carmendeareco.gob.ar/transparencia/",
        size_mb: 2.4,
        last_modified: "2024-12-31T00:00:00.000Z"
      },
      {
        id: "doc-2024-002",
        title: "Escala Salarial - Octubre 2024",
        url: "https://carmendeareco.gob.ar/wp-content/uploads/2024/10/ESCALA-SALARIAL-OCTUBRE-2024.pdf",
        year: 2024,
        category: "Recursos Humanos",
        source: "official",
        type: "salary_report",
        description: "Escala salarial vigente a partir de octubre 2024",
        official_url: "https://carmendeareco.gob.ar/transparencia/",
        size_mb: 0.9,
        last_modified: "2024-10-01T00:00:00.000Z"
      }
    ]
  },
  2023: {
    total_documents: 156,
    categories: {
      "Ejecución Presupuestaria": 68,
      "Estados Financieros": 35,
      "Deuda Pública": 19,
      "Recursos Humanos": 22,
      "Licitaciones Públicas": 8,
      "Documentos Generales": 4
    },
    documents: []
  },
  2022: {
    total_documents: 128,
    categories: {
      "Ejecución Presupuestaria": 52,
      "Estados Financieros": 31,
      "Deuda Pública": 16,
      "Recursos Humanos": 18,
      "Licitaciones Públicas": 7,
      "Documentos Generales": 4
    },
    documents: []
  },
  2021: {
    total_documents: 112,
    categories: {
      "Ejecución Presupuestaria": 45,
      "Estados Financieros": 28,
      "Deuda Pública": 14,
      "Recursos Humanos": 16,
      "Licitaciones Públicas": 6,
      "Documentos Generales": 3
    },
    documents: []
  },
  2020: {
    total_documents: 98,
    categories: {
      "Ejecución Presupuestaria": 38,
      "Estados Financieros": 25,
      "Deuda Pública": 12,
      "Recursos Humanos": 14,
      "Licitaciones Públicas": 5,
      "Documentos Generales": 4
    },
    documents: []
  },
  2019: {
    total_documents: 85,
    categories: {
      "Ejecución Presupuestaria": 32,
      "Estados Financieros": 22,
      "Deuda Pública": 10,
      "Recursos Humanos": 12,
      "Licitaciones Públicas": 5,
      "Documentos Generales": 4
    },
    documents: []
  }
};

// Get available years
router.get('/', (req, res) => {
  try {
    const years = Object.keys(mockYearsData).map(year => parseInt(year)).sort((a, b) => b - a);
    res.json({ years });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching available years' });
  }
});

// Get data for a specific year (matching frontend expectations)
router.get('/:year', async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    
    if (!year || isNaN(year)) {
      return res.status(400).json({ error: 'Invalid year parameter' });
    }
    
    const yearData = mockYearsData[year];
    
    if (!yearData) {
      return res.status(404).json({ 
        error: `Data not found for year ${year}`,
        details: `Data not available for year ${year}`
      });
    }
    
    // Format the response to match frontend expectations
    const formattedData = {
      year: year,
      total_documents: yearData.total_documents,
      categories: Object.entries(yearData.categories).reduce((acc, [category, count]) => {
        acc[category] = Array(count).fill().map((_, i) => ({
          id: `doc-${year}-${category}-${i}`,
          title: `${category} - Documento ${i + 1}`,
          year: year,
          category: category,
          size_mb: Math.random() * 2 + 0.5,
          official_url: "https://carmendeareco.gob.ar/transparencia/",
          archive_url: "https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/",
          verification_status: "verified",
          processing_date: new Date().toISOString(),
          data_sources: ["official_site", "web_archive"],
          file_size: Math.random() * 2 + 0.5
        }));
        return acc;
      }, {}),
      documents: yearData.documents.map(doc => ({
        id: doc.id,
        title: doc.title,
        year: doc.year,
        category: doc.category,
        size_mb: doc.size_mb,
        official_url: doc.official_url,
        archive_url: "https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/",
        verification_status: "verified",
        processing_date: doc.last_modified,
        data_sources: [doc.source],
        file_size: doc.size_mb
      }))
    };
    
    res.json(formattedData);
  } catch (error) {
    console.error('Error loading yearly data:', error);
    res.status(500).json({ 
      error: 'Error loading yearly data',
      details: error.message 
    });
  }
});

// Get documents for a specific year
router.get('/:year/documents', (req, res) => {
  try {
    const year = parseInt(req.params.year);
    
    if (!year || isNaN(year)) {
      return res.status(400).json({ error: 'Invalid year parameter' });
    }
    
    const yearData = mockYearsData[year];
    
    if (!yearData) {
      return res.status(404).json({ error: `Data not found for year ${year}` });
    }
    
    const documents = yearData.documents.map(doc => ({
      id: doc.id,
      title: doc.title,
      year: doc.year,
      category: doc.category,
      size_mb: doc.size_mb,
      official_url: doc.official_url,
      archive_url: "https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/",
      verification_status: "verified",
      processing_date: doc.last_modified,
      data_sources: [doc.source],
      file_size: doc.size_mb
    }));
    
    res.json({ documents });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents for year', details: error.message });
  }
});

// Get categories for a specific year
router.get('/:year/categories', (req, res) => {
  try {
    const year = parseInt(req.params.year);
    
    if (!year || isNaN(year)) {
      return res.status(400).json({ error: 'Invalid year parameter' });
    }
    
    const yearData = mockYearsData[year];
    
    if (!yearData) {
      return res.status(404).json({ error: `Data not found for year ${year}` });
    }
    
    res.json({ categories: yearData.categories });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching categories for year', details: error.message });
  }
});

module.exports = router;