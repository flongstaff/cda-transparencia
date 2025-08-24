const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class DocumentService {
  constructor() {
    this.dbPath = path.join(__dirname, '../../../data/documents.db');
    this.markdownPath = path.join(__dirname, '../../../data/markdown_documents');
    this.init();
  }

  init() {
    // Ensure database exists
    if (!fs.existsSync(this.dbPath)) {
      console.log('Document database not found. Please run enhanced_document_processor.py first.');
    }
  }

  // Get database connection
  getConnection() {
    return new sqlite3.Database(this.dbPath);
  }

  // Get all documents with metadata
  async getAllDocuments(filters = {}) {
    return new Promise((resolve, reject) => {
      const db = this.getConnection();
      
      let query = `
        SELECT d.*, COUNT(dc.id) as content_pages,
               COUNT(va.id) as verification_count
        FROM documents d
        LEFT JOIN document_content dc ON d.id = dc.document_id
        LEFT JOIN verification_audit va ON d.id = va.document_id
      `;
      
      const conditions = [];
      const params = [];
      
      if (filters.category) {
        conditions.push('d.category = ?');
        params.push(filters.category);
      }
      
      if (filters.year) {
        conditions.push('d.year = ?');
        params.push(parseInt(filters.year));
      }
      
      if (filters.type) {
        conditions.push('d.document_type = ?');
        params.push(filters.type);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += ' GROUP BY d.id ORDER BY d.year DESC, d.filename';
      
      db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          // Enhance with additional metadata
          const enhancedRows = rows.map(row => ({
            ...row,
            official_download: row.official_url,
            archive_download: row.archive_url,
            markdown_available: this.hasMarkdownFile(row.filename),
            verification_status_badge: this.getVerificationBadge(row.verification_status),
            display_category: this.getDisplayCategory(row.category),
            file_size_formatted: this.formatFileSize(row.file_size)
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
      
      // Get document metadata
      db.get('SELECT * FROM documents WHERE id = ?', [id], (err, doc) => {
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
        
        // Get document content
        db.all(
          'SELECT * FROM document_content WHERE document_id = ? ORDER BY page_number',
          [id],
          (err, content) => {
            if (err) {
              db.close();
              reject(err);
              return;
            }
            
            // Get financial data
            db.all(
              'SELECT * FROM budget_data WHERE document_id = ?',
              [id],
              (err, financialData) => {
                if (err) {
                  db.close();
                  reject(err);
                  return;
                }
                
                // Get verification audit
                db.all(
                  'SELECT * FROM verification_audit WHERE document_id = ? ORDER BY verification_date DESC',
                  [id],
                  (err, audit) => {
                    db.close();
                    
                    if (err) {
                      reject(err);
                      return;
                    }
                    
                    resolve({
                      ...doc,
                      content: content,
                      financial_data: financialData,
                      verification_audit: audit,
                      markdown_content: this.getMarkdownContent(doc.filename)
                    });
                  }
                );
              }
            );
          }
        );
      });
    });
  }

  // Search documents
  async searchDocuments(query, filters = {}) {
    return new Promise((resolve, reject) => {
      const db = this.getConnection();
      
      let searchQuery = `
        SELECT DISTINCT d.*, 
               snippet(document_content_fts, -1, '<mark>', '</mark>', '...', 32) as snippet
        FROM documents d
        JOIN document_content dc ON d.id = dc.document_id
        JOIN document_content_fts ON dc.id = document_content_fts.rowid
        WHERE document_content_fts MATCH ?
      `;
      
      const conditions = [];
      const params = [query];
      
      if (filters.category) {
        conditions.push('d.category = ?');
        params.push(filters.category);
      }
      
      if (filters.year) {
        conditions.push('d.year = ?');
        params.push(parseInt(filters.year));
      }
      
      if (conditions.length > 0) {
        searchQuery += ' AND ' + conditions.join(' AND ');
      }
      
      searchQuery += ' ORDER BY rank LIMIT 50';
      
      db.all(searchQuery, params, (err, rows) => {
        db.close();
        
        if (err) {
          // Fallback to simple text search if FTS not available
          this.simpleSearch(query, filters).then(resolve).catch(reject);
        } else {
          resolve(rows.map(row => ({
            ...row,
            relevance_score: 0.9, // High relevance for full-text matches
            search_snippet: row.snippet
          })));
        }
      });
    });
  }

  // Simple search fallback
  async simpleSearch(query, filters = {}) {
    return new Promise((resolve, reject) => {
      const db = this.getConnection();
      
      let searchQuery = `
        SELECT DISTINCT d.*
        FROM documents d
        JOIN document_content dc ON d.id = dc.document_id
        WHERE (dc.searchable_text LIKE ? OR d.filename LIKE ?)
      `;
      
      const conditions = [];
      const params = [`%${query}%`, `%${query}%`];
      
      if (filters.category) {
        conditions.push('d.category = ?');
        params.push(filters.category);
      }
      
      if (filters.year) {
        conditions.push('d.year = ?');
        params.push(parseInt(filters.year));
      }
      
      if (conditions.length > 0) {
        searchQuery += ' AND ' + conditions.join(' AND ');
      }
      
      searchQuery += ' ORDER BY d.year DESC LIMIT 50';
      
      db.all(searchQuery, params, (err, rows) => {
        db.close();
        
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => ({
            ...row,
            relevance_score: 0.7, // Lower relevance for simple matches
            search_snippet: `...${query}...`
          })));
        }
      });
    });
  }

  // Get financial data
  async getFinancialData(filters = {}) {
    return new Promise((resolve, reject) => {
      const db = this.getConnection();
      
      let query = `
        SELECT bd.*, d.filename, d.category, d.year as doc_year
        FROM budget_data bd
        JOIN documents d ON bd.document_id = d.id
      `;
      
      const conditions = [];
      const params = [];
      
      if (filters.year) {
        conditions.push('bd.year = ?');
        params.push(parseInt(filters.year));
      }
      
      if (filters.category) {
        conditions.push('d.category = ?');
        params.push(filters.category);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += ' ORDER BY bd.year DESC, bd.budgeted_amount DESC';
      
      db.all(query, params, (err, rows) => {
        db.close();
        
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => ({
            ...row,
            execution_percentage: this.calculateExecutionPercentage(row.budgeted_amount, row.executed_amount),
            formatted_budget: this.formatCurrency(row.budgeted_amount),
            formatted_executed: this.formatCurrency(row.executed_amount)
          })));
        }
      });
    });
  }

  // Get categories
  async getCategories() {
    return new Promise((resolve, reject) => {
      const db = this.getConnection();
      
      db.all(`
        SELECT category, COUNT(*) as document_count, 
               MIN(year) as earliest_year, MAX(year) as latest_year
        FROM documents 
        WHERE category IS NOT NULL 
        GROUP BY category 
        ORDER BY document_count DESC
      `, (err, rows) => {
        db.close();
        
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => ({
            ...row,
            display_name: this.getDisplayCategory(row.category),
            year_range: `${row.earliest_year}-${row.latest_year}`
          })));
        }
      });
    });
  }

  // Get verification status
  async getVerificationStatus() {
    return new Promise((resolve, reject) => {
      const db = this.getConnection();
      
      db.get(`
        SELECT 
          COUNT(*) as total_documents,
          COUNT(CASE WHEN verification_status = 'verified' THEN 1 END) as verified_documents,
          COUNT(CASE WHEN verification_status = 'pending' THEN 1 END) as pending_documents,
          COUNT(CASE WHEN verification_status = 'failed' THEN 1 END) as failed_documents
        FROM documents
      `, (err, stats) => {
        if (err) {
          db.close();
          reject(err);
          return;
        }
        
        db.all(`
          SELECT verification_method, COUNT(*) as count
          FROM verification_audit
          GROUP BY verification_method
        `, (err, methods) => {
          db.close();
          
          if (err) {
            reject(err);
          } else {
            resolve({
              ...stats,
              verification_rate: ((stats.verified_documents / stats.total_documents) * 100).toFixed(1),
              methods: methods,
              last_updated: new Date().toISOString()
            });
          }
        });
      });
    });
  }

  // Helper methods
  hasMarkdownFile(filename) {
    const markdownFile = path.join(this.markdownPath, filename.replace(/\.[^/.]+$/, '.md'));
    return fs.existsSync(markdownFile);
  }

  getMarkdownContent(filename) {
    const markdownFile = path.join(this.markdownPath, filename.replace(/\.[^/.]+$/, '.md'));
    try {
      if (fs.existsSync(markdownFile)) {
        return fs.readFileSync(markdownFile, 'utf8');
      }
    } catch (err) {
      console.error(`Error reading markdown file for ${filename}:`, err);
    }
    return null;
  }

  getVerificationBadge(status) {
    const badges = {
      'verified': '✅ Verificado',
      'pending': '⚠️ Pendiente',
      'failed': '❌ Error',
      'partial': '🔄 Parcial'
    };
    return badges[status] || '❓ Desconocido';
  }

  getDisplayCategory(category) {
    const displayNames = {
      'Licitaciones': '📋 Licitaciones Públicas',
      'Presupuesto': '💰 Presupuesto Municipal',
      'Ejecución Presupuestaria': '📊 Ejecución Presupuestaria',
      'Declaraciones Patrimoniales': '🏛️ Declaraciones Patrimoniales',
      'Información Salarial': '💼 Información Salarial',
      'Resoluciones': '📜 Resoluciones Oficiales',
      'Informes': '📈 Informes y Reportes',
      'General': '📄 Documentos Generales'
    };
    return displayNames[category] || category;
  }

  formatFileSize(bytes) {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  }

  formatCurrency(amount) {
    if (!amount) return '-';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  calculateExecutionPercentage(budgeted, executed) {
    if (!budgeted || budgeted === 0) return null;
    return ((executed / budgeted) * 100).toFixed(1);
  }
}

module.exports = DocumentService;