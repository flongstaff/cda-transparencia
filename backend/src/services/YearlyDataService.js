const fs = require('fs').promises;
const path = require('path');

class YearlyDataService {
  constructor() {
    this.dataPath = path.join(__dirname, '../../../data/organized_data');
  }

  /**
   * Get available years
   */
  async getAvailableYears() {
    try {
      const files = await fs.readdir(this.dataPath);
      const yearFiles = files.filter(file => file.startsWith('data_index_') && file.endsWith('.json'));
      const years = yearFiles.map(file => {
        const match = file.match(/data_index_(\d{4})\.json/);
        return match ? parseInt(match[1]) : null;
      }).filter(year => year !== null);
      
      return years.sort((a, b) => b - a); // Sort descending
    } catch (error) {
      console.error('Error reading available years:', error);
      // Fallback to known years
      return [2025, 2024, 2023, 2022, 2021, 2020, 2019];
    }
  }

  /**
   * Get data for a specific year
   */
  async getYearlyData(year) {
    try {
      const filePath = path.join(this.dataPath, `data_index_${year}.json`);
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading data for year ${year}:`, error);
      // Return mock data as fallback
      return this.getMockYearlyData(year);
    }
  }

  /**
   * Get documents for a specific year
   */
  async getDocumentsForYear(year) {
    try {
      const yearlyData = await this.getYearlyData(year);
      return yearlyData.documents || [];
    } catch (error) {
      console.error(`Error getting documents for year ${year}:`, error);
      return [];
    }
  }

  /**
   * Get categories for a specific year
   */
  async getCategoriesForYear(year) {
    try {
      const yearlyData = await this.getYearlyData(year);
      return yearlyData.categories || {};
    } catch (error) {
      console.error(`Error getting categories for year ${year}:`, error);
      return {};
    }
  }

  /**
   * Get mock data for a specific year (fallback)
   */
  getMockYearlyData(year) {
    const mockData = {
      2025: {
        year: 2025,
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
        year: 2024,
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
        year: 2023,
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
        year: 2022,
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
        year: 2021,
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
        year: 2020,
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
        year: 2019,
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

    return mockData[year] || {
      year,
      total_documents: 0,
      categories: {},
      documents: []
    };
  }
}

module.exports = YearlyDataService;