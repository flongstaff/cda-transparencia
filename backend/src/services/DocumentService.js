const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class DocumentService {
  constructor() {
    // Use the actual transparency database that contains 367 documents
    this.dbPath = path.join(__dirname, '../../../transparency_data/transparency.db');
    this.markdownPath = path.join(__dirname, '../../../data/markdown_documents');
    this.init();
  }

  init() {
    // Ensure database exists
    if (!fs.existsSync(this.dbPath)) {
      console.log('Document database not found at:', this.dbPath);
    } else {
      console.log('✅ DocumentService initialized with transparency.db containing real data');
    }
  }

  // Get database connection
  getConnection() {
    return new sqlite3.Database(this.dbPath);
  }

  // Get all documents with metadata (adapted to real schema)
  async getAllDocuments(filters = {}) {
    return new Promise((resolve, reject) => {
      const db = this.getConnection();
      
      let query = `
        SELECT doc_id as id, title, url, file_size, document_type, 
               integrity_status as verification_status, content,
               download_date, file_hash, source, financial_data
        FROM documents
      `;
      
      const conditions = [];
      const params = [];
      
      if (filters.type && filters.type !== 'all') {
        conditions.push('document_type = ?');
        params.push(filters.type);
      }
      
      if (filters.search) {
        conditions.push('(title LIKE ? OR content LIKE ?)');
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += ' ORDER BY download_date DESC';
      
      db.all(query, params, (err, rows) => {
        if (err) {
          console.error('Error fetching documents:', err);
          reject(err);
        } else {
          // Transform data to match expected frontend format
          const enhancedRows = rows.map(row => ({
            id: row.id,
            filename: row.title,
            title: row.title,
            url: row.url,
            file_size: row.file_size || 0,
            size_bytes: String(row.file_size || 0),
            file_type: row.document_type,
            document_type: row.document_type,
            category: this.extractCategory(row.title),
            year: this.extractYear(row.title, row.download_date),
            verification_status: row.verification_status || 'pending',
            integrity_verified: row.verification_status === 'verified',
            processing_date: row.download_date,
            sha256_hash: row.file_hash || '',
            content: row.content,
            financial_data: row.financial_data
          }));
          resolve(enhancedRows);
        }
        db.close();
      });
    });
  }

  // Get document by ID with full content
  async getDocumentById(id) {
    return new Promise((resolve, reject) => {
      const db = this.getConnection();
      
      db.get('SELECT * FROM documents WHERE doc_id = ?', [id], (err, doc) => {
        if (err) {
          db.close();
          reject(err);
          return;
        }
        
        if (!doc) {
          db.close();
          resolve(null);
          return;
        }
        
        // Transform to expected format
        const transformedDoc = {
          id: doc.doc_id,
          filename: doc.title,
          title: doc.title,
          url: doc.url,
          file_size: doc.file_size,
          document_type: doc.document_type,
          category: this.extractCategory(doc.title),
          year: this.extractYear(doc.title, doc.download_date),
          content: doc.content,
          financial_data: doc.financial_data ? JSON.parse(doc.financial_data) : null,
          integrity_status: doc.integrity_status,
          created_at: doc.created_at,
          download_date: doc.download_date
        };
        
        db.close();
        resolve(transformedDoc);
      });
    });
  }

  // Search documents
  async searchDocuments(query, filters = {}) {
    return new Promise((resolve, reject) => {
      const db = this.getConnection();
      
      let searchQuery = `
        SELECT doc_id as id, title, url, file_size, document_type, 
               integrity_status, content, download_date
        FROM documents
        WHERE (title LIKE ? OR content LIKE ?)
      `;
      
      const params = [`%${query}%`, `%${query}%`];
      
      if (filters.type && filters.type !== 'all') {
        searchQuery += ' AND document_type = ?';
        params.push(filters.type);
      }
      
      searchQuery += ' ORDER BY download_date DESC LIMIT 50';
      
      db.all(searchQuery, params, (err, rows) => {
        db.close();
        
        if (err) {
          reject(err);
        } else {
          const results = rows.map(row => ({
            id: row.id,
            filename: row.title,
            title: row.title,
            document_type: row.document_type,
            category: this.extractCategory(row.title),
            year: this.extractYear(row.title, row.download_date),
            relevance_score: 0.8,
            search_snippet: this.extractSnippet(row.content, query)
          }));
          resolve(results);
        }
      });
    });
  }

  // Get financial data from documents
  async getFinancialData(filters = {}) {
    return new Promise((resolve, reject) => {
      const db = this.getConnection();
      
      let query = `
        SELECT doc_id, title, financial_data, document_type
        FROM documents
        WHERE financial_data IS NOT NULL AND financial_data != ''
      `;
      
      db.all(query, [], (err, rows) => {
        db.close();
        
        if (err) {
          reject(err);
        } else {
          const financialData = rows.map(row => {
            try {
              const data = JSON.parse(row.financial_data);
              return {
                document_id: row.doc_id,
                document_title: row.title,
                document_type: row.document_type,
                ...data
              };
            } catch (e) {
              return null;
            }
          }).filter(Boolean);
          resolve(financialData);
        }
      });
    });
  }

  // Get available years from documents
  async getAvailableYears() {
    return new Promise((resolve, reject) => {
      const db = this.getConnection();
      
      db.all('SELECT DISTINCT title, download_date FROM documents ORDER BY download_date DESC', [], (err, rows) => {
        db.close();
        
        if (err) {
          reject(err);
        } else {
          const years = new Set();
          rows.forEach(row => {
            const year = this.extractYear(row.title, row.download_date);
            if (year) years.add(year);
          });
          
          const sortedYears = Array.from(years).sort((a, b) => b - a);
          resolve(sortedYears);
        }
      });
    });
  }

  // Get categories
  async getCategories() {
    return new Promise((resolve, reject) => {
      const db = this.getConnection();
      
      db.all('SELECT title, document_type FROM documents', [], (err, rows) => {
        db.close();
        
        if (err) {
          reject(err);
        } else {
          const categories = {};
          rows.forEach(row => {
            const category = this.extractCategory(row.title);
            categories[category] = (categories[category] || 0) + 1;
          });
          
          const categoryList = Object.entries(categories).map(([category, count]) => ({
            category,
            document_count: count,
            display_name: this.getDisplayCategory(category)
          }));
          
          resolve(categoryList);
        }
      });
    });
  }

  // Get corruption cases
  async getCorruptionCases() {
    return new Promise((resolve, reject) => {
      const db = this.getConnection();
      
      db.all('SELECT * FROM corruption_cases ORDER BY created_at DESC', [], (err, rows) => {
        db.close();
        
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Helper methods
  extractYear(title, downloadDate) {
    // Try to extract year from title first
    const yearMatch = title.match(/\b(20\d{2})\b/);
    if (yearMatch) {
      return parseInt(yearMatch[1]);
    }
    
    // Fallback to download date
    if (downloadDate) {
      const date = new Date(downloadDate);
      if (!isNaN(date.getTime())) {
        return date.getFullYear();
      }
    }
    
    // Default to current year
    return new Date().getFullYear();
  }

  extractCategory(title) {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('decreto')) return 'Decretos';
    if (titleLower.includes('resolución') || titleLower.includes('resolucion')) return 'Resoluciones';
    if (titleLower.includes('licitación') || titleLower.includes('licitacion')) return 'Licitaciones';
    if (titleLower.includes('presupuesto')) return 'Presupuesto Municipal';
    if (titleLower.includes('declaración') || titleLower.includes('declaracion')) return 'Declaraciones Patrimoniales';
    if (titleLower.includes('salario') || titleLower.includes('sueldo')) return 'Información Salarial';
    if (titleLower.includes('contrat')) return 'Contratos';
    if (titleLower.includes('ordenanza')) return 'Ordenanzas';
    
    return 'Documentos Generales';
  }

  extractSnippet(content, query) {
    if (!content) return '...';
    
    const index = content.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return content.substring(0, 100) + '...';
    
    const start = Math.max(0, index - 50);
    const end = Math.min(content.length, index + query.length + 50);
    return '...' + content.substring(start, end) + '...';
  }

  getDisplayCategory(category) {
    const displayNames = {
      'Decretos': '📜 Decretos',
      'Resoluciones': '📋 Resoluciones',
      'Licitaciones': '💼 Licitaciones',
      'Presupuesto Municipal': '💰 Presupuesto Municipal',
      'Declaraciones Patrimoniales': '🏛️ Declaraciones Patrimoniales',
      'Información Salarial': '👥 Información Salarial',
      'Contratos': '📝 Contratos',
      'Ordenanzas': '⚖️ Ordenanzas',
      'Documentos Generales': '📄 Documentos Generales'
    };
    return displayNames[category] || category;
  }

  formatFileSize(bytes) {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  }
}

module.exports = DocumentService;