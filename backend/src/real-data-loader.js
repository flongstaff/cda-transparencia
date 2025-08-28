/**
 * Real Data Loader for Carmen de Areco Backend
 * Loads actual PDF metadata and JSON data for the portal
 */

const fs = require('fs').promises;
const path = require('path');

class RealDataLoader {
  constructor() {
    this.dataPath = path.join(__dirname, '../../data');
    this.documentsCache = new Map();
    this.lastLoaded = null;
  }

  /**
   * Load all available document metadata
   */
  async loadDocuments() {
    console.log('📁 Loading real document data...');
    
    try {
      const documents = [];
      
      // Load live scraped PDFs
      const livePath = path.join(this.dataPath, 'live_scrape');
      const liveFiles = await this.loadDirectoryFiles(livePath, 'live_scrape');
      documents.push(...liveFiles);
      
      // Load archived documents
      const archivePath = path.join(this.dataPath, '../archive_materials/source_materials_20250826_161623');
      try {
        const archiveFiles = await this.loadDirectoryFiles(archivePath, 'archive');
        documents.push(...archiveFiles);
      } catch (err) {
        console.warn('Archive directory not accessible:', err.message);
      }
      
      // Load JSON metadata
      const jsonPath = path.join(this.dataPath, 'preserved/json');
      try {
        const jsonFiles = await this.loadJsonFiles(jsonPath);
        // Merge JSON data with document metadata
        this.mergeJsonData(documents, jsonFiles);
      } catch (err) {
        console.warn('JSON metadata not available:', err.message);
      }
      
      this.documentsCache.clear();
      documents.forEach(doc => this.documentsCache.set(doc.id, doc));
      this.lastLoaded = new Date();
      
      console.log(`✅ Loaded ${documents.length} real documents`);
      console.log(`   - Live scrape: ${liveFiles.length}`);
      console.log(`   - Budget execution docs: ${documents.filter(d => d.filename.includes('EJECUCION')).length}`);
      console.log(`   - Financial reports: ${documents.filter(d => d.filename.includes('BALANCE') || d.filename.includes('SITUACION')).length}`);
      
      return documents;
    } catch (error) {
      console.error('❌ Failed to load real documents:', error);
      throw error;
    }
  }

  /**
   * Load files from a directory
   */
  async loadDirectoryFiles(dirPath, source) {
    const documents = [];
    
    try {
      const files = await fs.readdir(dirPath);
      const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));
      
      for (const filename of pdfFiles) {
        const filePath = path.join(dirPath, filename);
        const stats = await fs.stat(filePath);
        
        const doc = {
          id: `${source}-${filename.replace('.pdf', '')}`,
          filename,
          title: this.generateTitle(filename),
          category: this.categorizeDocument(filename),
          year: this.extractYear(filename),
          quarter: this.extractQuarter(filename),
          size_mb: Math.round((stats.size / 1024 / 1024) * 100) / 100,
          source,
          path: filePath,
          official_url: `http://carmendeareco.gob.ar/wp-content/uploads/${filename}`,
          last_modified: stats.mtime.toISOString(),
          processing_date: new Date().toISOString().split('T')[0],
          verification_status: 'verified',
          document_type: this.getDocumentType(filename),
          priority: this.getPriority(filename)
        };
        
        documents.push(doc);
      }
    } catch (error) {
      console.warn(`Directory not accessible: ${dirPath}`, error.message);
    }
    
    return documents;
  }

  /**
   * Load JSON metadata files
   */
  async loadJsonFiles(jsonPath) {
    const jsonData = new Map();
    
    try {
      const files = await fs.readdir(jsonPath);
      const jsonFiles = files.filter(file => file.toLowerCase().endsWith('.json'));
      
      for (const filename of jsonFiles) {
        try {
          const filePath = path.join(jsonPath, filename);
          const content = await fs.readFile(filePath, 'utf8');
          const data = JSON.parse(content);
          
          const baseFilename = filename.replace('.json', '');
          jsonData.set(baseFilename, data);
        } catch (err) {
          console.warn(`Failed to load JSON file ${filename}:`, err.message);
        }
      }
    } catch (error) {
      console.warn('JSON directory not accessible:', error.message);
    }
    
    return jsonData;
  }

  /**
   * Merge JSON metadata with document records
   */
  mergeJsonData(documents, jsonData) {
    documents.forEach(doc => {
      const baseFilename = doc.filename.replace('.pdf', '');
      if (jsonData.has(baseFilename)) {
        const metadata = jsonData.get(baseFilename);
        doc.extracted_data = metadata;
        doc.has_structured_data = true;
      }
    });
  }

  /**
   * Generate human-readable title
   */
  generateTitle(filename) {
    const cleanName = filename.replace('.pdf', '').replace(/-/g, ' ');
    
    const titleMappings = {
      'ESTADO DE EJECUCION DE GASTOS': 'Estado de Ejecución de Gastos',
      'ESTADO DE EJECUCION DE RECURSOS': 'Estado de Ejecución de Recursos',
      'SITUACION ECONOMICA FINANCIERA': 'Situación Económica Financiera',
      'BALANCE GENERAL': 'Balance General Municipal',
      'ESCALA SALARIAL': 'Escala Salarial Municipal',
      'PRESUPUESTO': 'Presupuesto Municipal',
      'LICITACION PUBLICA': 'Licitación Pública',
      'DDJJ': 'Declaración Jurada Patrimonial'
    };
    
    for (const [key, value] of Object.entries(titleMappings)) {
      if (cleanName.toUpperCase().includes(key)) {
        return value + ' - ' + this.extractPeriod(filename);
      }
    }
    
    return cleanName;
  }

  /**
   * Categorize document by filename
   */
  categorizeDocument(filename) {
    const upper = filename.toUpperCase();
    
    if (upper.includes('EJECUCION') && upper.includes('GASTOS')) return 'Ejecución de Gastos';
    if (upper.includes('EJECUCION') && upper.includes('RECURSOS')) return 'Ejecución de Recursos';
    if (upper.includes('BALANCE')) return 'Estados Financieros';
    if (upper.includes('SITUACION') && upper.includes('ECONOMICA')) return 'Estados Financieros';
    if (upper.includes('ESCALA') || upper.includes('SUELDO')) return 'Recursos Humanos';
    if (upper.includes('PRESUPUESTO')) return 'Presupuesto Municipal';
    if (upper.includes('LICITACION')) return 'Contrataciones';
    if (upper.includes('DDJJ')) return 'Declaraciones Patrimoniales';
    if (upper.includes('CAIF')) return 'Salud Pública';
    
    return 'Documentos Municipales';
  }

  /**
   * Extract year from filename
   */
  extractYear(filename) {
    const yearMatch = filename.match(/(20\d{2})/);
    return yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();
  }

  /**
   * Extract quarter from filename
   */
  extractQuarter(filename) {
    const upper = filename.toUpperCase();
    if (upper.includes('1°TRI') || upper.includes('1°TRIMESTRE')) return '1Q';
    if (upper.includes('2°TRI') || upper.includes('2°TRIMESTRE')) return '2Q';
    if (upper.includes('3°TRI') || upper.includes('3°TRIMESTRE')) return '3Q';
    if (upper.includes('4°TRI') || upper.includes('4°TRIMESTRE')) return '4Q';
    if (upper.includes('ENERO') || upper.includes('JANUARY')) return 'Q1';
    if (upper.includes('ABRIL') || upper.includes('APRIL')) return 'Q2';
    if (upper.includes('JULIO') || upper.includes('JULY')) return 'Q3';
    if (upper.includes('OCTUBRE') || upper.includes('OCTOBER')) return 'Q4';
    return null;
  }

  /**
   * Extract period information
   */
  extractPeriod(filename) {
    const year = this.extractYear(filename);
    const quarter = this.extractQuarter(filename);
    
    if (quarter) {
      return `${year} - ${quarter}`;
    }
    
    return year.toString();
  }

  /**
   * Get document type for fraud analysis
   */
  getDocumentType(filename) {
    const upper = filename.toUpperCase();
    if (upper.includes('EJECUCION')) return 'budget_execution';
    if (upper.includes('BALANCE') || upper.includes('SITUACION')) return 'financial_statement';
    if (upper.includes('ESCALA') || upper.includes('SUELDO')) return 'payroll';
    if (upper.includes('LICITACION')) return 'contract';
    return 'other';
  }

  /**
   * Get priority for audit analysis
   */
  getPriority(filename) {
    const upper = filename.toUpperCase();
    if (upper.includes('EJECUCION')) return 'high'; // Critical for fraud detection
    if (upper.includes('BALANCE')) return 'high';
    if (upper.includes('ESCALA')) return 'medium';
    if (upper.includes('LICITACION')) return 'medium';
    return 'low';
  }

  /**
   * Get documents by category
   */
  getDocumentsByCategory(category) {
    return Array.from(this.documentsCache.values())
      .filter(doc => doc.category === category);
  }

  /**
   * Get documents by year
   */
  getDocumentsByYear(year) {
    return Array.from(this.documentsCache.values())
      .filter(doc => doc.year === year);
  }

  /**
   * Get high priority documents for audit
   */
  getHighPriorityDocuments() {
    return Array.from(this.documentsCache.values())
      .filter(doc => doc.priority === 'high')
      .sort((a, b) => b.year - a.year);
  }

  /**
   * Get budget execution documents specifically
   */
  getBudgetExecutionDocuments() {
    return Array.from(this.documentsCache.values())
      .filter(doc => doc.document_type === 'budget_execution')
      .sort((a, b) => b.year - a.year || b.quarter?.localeCompare(a.quarter));
  }

  /**
   * Get summary statistics
   */
  getStatistics() {
    const docs = Array.from(this.documentsCache.values());
    
    return {
      total_documents: docs.length,
      by_category: this.groupBy(docs, 'category'),
      by_year: this.groupBy(docs, 'year'),
      by_source: this.groupBy(docs, 'source'),
      by_priority: this.groupBy(docs, 'priority'),
      budget_execution_count: docs.filter(d => d.document_type === 'budget_execution').length,
      total_size_mb: Math.round(docs.reduce((sum, doc) => sum + doc.size_mb, 0) * 100) / 100,
      last_loaded: this.lastLoaded,
      latest_document: docs.reduce((latest, doc) => 
        new Date(doc.last_modified) > new Date(latest.last_modified) ? doc : latest, docs[0])
    };
  }

  /**
   * Group array by property
   */
  groupBy(array, property) {
    return array.reduce((groups, item) => {
      const key = item[property];
      groups[key] = (groups[key] || 0) + 1;
      return groups;
    }, {});
  }

  /**
   * Get all documents
   */
  getAllDocuments() {
    return Array.from(this.documentsCache.values());
  }

  /**
   * Get document by ID
   */
  getDocumentById(id) {
    return this.documentsCache.get(id);
  }

  /**
   * Check if data needs refresh
   */
  needsRefresh() {
    if (!this.lastLoaded) return true;
    const hoursSinceLoad = (Date.now() - this.lastLoaded.getTime()) / (1000 * 60 * 60);
    return hoursSinceLoad > 1; // Refresh every hour
  }
}

module.exports = RealDataLoader;