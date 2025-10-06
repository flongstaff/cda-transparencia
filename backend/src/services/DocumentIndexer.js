/**
 * Document Indexing System
 * Creates and maintains an index of all documents with metadata
 */

const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

class DocumentIndexer {
  constructor() {
    this.indexFile = path.join(__dirname, '..', 'data', 'document-index.json');
    this.documentsDir = path.join(__dirname, '..', 'data', 'documents');
    this.index = null;
    this.ensureDirectoryExists(this.documentsDir);
  }

  /**
   * Ensure directory exists, create if not
   */
  async ensureDirectoryExists(dirPath) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      console.error(`Error creating directory: ${dirPath}`, error.message);
    }
  }

  /**
   * Load the document index from file
   */
  async loadIndex() {
    try {
      const data = await fs.readFile(this.indexFile, 'utf8');
      this.index = JSON.parse(data);
      return this.index;
    } catch (error) {
      // If file doesn't exist, create a new index
      if (error.code === 'ENOENT') {
        this.index = { documents: {}, lastUpdated: new Date().toISOString(), totalDocuments: 0 };
        await this.saveIndex();
        return this.index;
      }
      console.error('Error loading document index:', error.message);
      throw error;
    }
  }

  /**
   * Save the document index to file
   */
  async saveIndex() {
    if (!this.index) {
      await this.loadIndex();
    }
    this.index.lastUpdated = new Date().toISOString();
    await fs.writeFile(this.indexFile, JSON.stringify(this.index, null, 2));
  }

  /**
   * Add a document to the index
   */
  async addDocument(documentInfo) {
    if (!this.index) {
      await this.loadIndex();
    }

    // Generate a unique ID for the document
    const documentId = documentInfo.id || this.generateDocumentId(documentInfo);
    
    // Add metadata
    const indexedDocument = {
      id: documentId,
      ...documentInfo,
      indexedAt: new Date().toISOString(),
      lastModified: documentInfo.lastModified || new Date().toISOString()
    };

    this.index.documents[documentId] = indexedDocument;
    this.index.totalDocuments = Object.keys(this.index.documents).length;

    await this.saveIndex();
    return indexedDocument;
  }

  /**
   * Remove a document from the index
   */
  async removeDocument(documentId) {
    if (!this.index) {
      await this.loadIndex();
    }

    if (this.index.documents[documentId]) {
      delete this.index.documents[documentId];
      this.index.totalDocuments = Object.keys(this.index.documents).length;
      await this.saveIndex();
      return true;
    }
    return false;
  }

  /**
   * Update a document in the index
   */
  async updateDocument(documentId, updates) {
    if (!this.index) {
      await this.loadIndex();
    }

    if (this.index.documents[documentId]) {
      this.index.documents[documentId] = {
        ...this.index.documents[documentId],
        ...updates,
        lastModified: new Date().toISOString()
      };
      await this.saveIndex();
      return this.index.documents[documentId];
    }
    return null;
  }

  /**
   * Get a document by ID
   */
  async getDocument(documentId) {
    if (!this.index) {
      await this.loadIndex();
    }
    return this.index.documents[documentId] || null;
  }

  /**
   * Search documents by query
   */
  async searchDocuments(query, options = {}) {
    if (!this.index) {
      await this.loadIndex();
    }

    const { 
      limit = 20, 
      offset = 0, 
      category, 
      year, 
      type,
      sortBy = 'indexedAt',
      sortOrder = 'desc'
    } = options;

    // Convert query to lowercase for case-insensitive search
    const searchTerm = query ? query.toLowerCase() : '';
    
    let results = Object.values(this.index.documents);

    // Apply filters
    if (searchTerm) {
      results = results.filter(doc => 
        (doc.title && doc.title.toLowerCase().includes(searchTerm)) ||
        (doc.description && doc.description.toLowerCase().includes(searchTerm)) ||
        (doc.content && doc.content.toLowerCase().includes(searchTerm)) ||
        (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(searchTerm))) ||
        (doc.url && doc.url.toLowerCase().includes(searchTerm))
      );
    }

    if (category) {
      results = results.filter(doc => doc.category === category);
    }

    if (year) {
      results = results.filter(doc => {
        const docYear = doc.year || (doc.lastModified ? new Date(doc.lastModified).getFullYear() : null);
        return docYear == year; // Use == to handle string/number comparison
      });
    }

    if (type) {
      results = results.filter(doc => doc.type === type);
    }

    // Sort results
    results.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      // Handle date sorting
      if (sortBy.includes('Date') || sortBy.includes('At') || sortBy.includes('Modified')) {
        valA = new Date(valA);
        valB = new Date(valB);
      }

      if (sortOrder === 'desc') {
        return valB > valA ? 1 : valB < valA ? -1 : 0;
      } else {
        return valA > valB ? 1 : valA < valB ? -1 : 0;
      }
    });

    // Apply pagination
    const paginatedResults = results.slice(offset, offset + limit);

    return {
      results: paginatedResults,
      total: results.length,
      limit,
      offset,
      hasMore: offset + limit < results.length
    };
  }

  /**
   * Get all documents by category
   */
  async getDocumentsByCategory(category) {
    if (!this.index) {
      await this.loadIndex();
    }

    const results = Object.values(this.index.documents).filter(doc => doc.category === category);
    
    return {
      results,
      total: results.length
    };
  }

  /**
   * Get all documents by year
   */
  async getDocumentsByYear(year) {
    if (!this.index) {
      await this.loadIndex();
    }

    const results = Object.values(this.index.documents).filter(doc => {
      const docYear = doc.year || (doc.lastModified ? new Date(doc.lastModified).getFullYear() : null);
      return docYear == year;
    });
    
    return {
      results,
      total: results.length
    };
  }

  /**
   * Get statistics about the document index
   */
  async getStatistics() {
    if (!this.index) {
      await this.loadIndex();
    }

    const categories = {};
    const years = {};
    const types = {};

    for (const doc of Object.values(this.index.documents)) {
      // Count by category
      if (doc.category) {
        categories[doc.category] = (categories[doc.category] || 0) + 1;
      }

      // Count by year
      const year = doc.year || (doc.lastModified ? new Date(doc.lastModified).getFullYear() : 'unknown');
      years[year] = (years[year] || 0) + 1;

      // Count by type
      types[doc.type || 'unknown'] = (types[doc.type || 'unknown'] || 0) + 1;
    }

    return {
      totalDocuments: this.index.totalDocuments,
      categories,
      years,
      types,
      lastUpdated: this.index.lastUpdated
    };
  }

  /**
   * Index a document from URL
   */
  async indexDocumentFromUrl(url, metadata = {}) {
    try {
      // Get content from URL
      const response = await axios.get(url, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CarmenDeArecoTransparencyBot/1.0)'
        }
      });

      const content = response.data;
      
      // Extract basic metadata if not provided
      const docInfo = {
        url,
        title: metadata.title || this.extractTitle(content),
        description: metadata.description || this.extractDescription(content),
        content: typeof content === 'string' ? content.substring(0, 10000) : JSON.stringify(content).substring(0, 10000), // Limit content size
        type: metadata.type || this.getDocumentType(url),
        category: metadata.category || 'general',
        year: metadata.year || new Date().getFullYear(),
        size: typeof content === 'string' ? content.length : JSON.stringify(content).length,
        lastModified: response.headers['last-modified'] || new Date().toISOString(),
        source: metadata.source || 'external',
        tags: metadata.tags || this.extractTags(content),
        ...metadata
      };

      return await this.addDocument(docInfo);
    } catch (error) {
      console.error(`Error indexing document from ${url}:`, error.message);
      throw error;
    }
  }

  /**
   * Index multiple documents from URLs
   */
  async indexDocumentsFromUrls(urls, commonMetadata = {}) {
    const results = [];
    const errors = [];

    for (const url of urls) {
      try {
        const doc = await this.indexDocumentFromUrl(url, commonMetadata);
        results.push(doc);
      } catch (error) {
        errors.push({ url, error: error.message });
      }
    }

    return { results, errors, successCount: results.length, errorCount: errors.length };
  }

  /**
   * Generate document ID based on URL or other properties
   */
  generateDocumentId(documentInfo) {
    const crypto = require('crypto');
    const source = documentInfo.url || documentInfo.title || JSON.stringify(documentInfo);
    return crypto.createHash('md5').update(source).digest('hex');
  }

  /**
   * Extract title from content (for HTML content)
   */
  extractTitle(content) {
    if (typeof content !== 'string') return 'Unknown Title';
    
    const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      return titleMatch[1].trim();
    }
    
    // Try to find H1 tags
    const h1Match = content.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (h1Match) {
      return h1Match[1].trim();
    }
    
    return 'Untitled Document';
  }

  /**
   * Extract description from content
   */
  extractDescription(content) {
    if (typeof content !== 'string') return '';
    
    // Look for meta description
    const descMatch = content.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    if (descMatch) {
      return descMatch[1].substring(0, 200);
    }
    
    // Fallback to first 200 characters of content
    return content.replace(/<[^>]*>/g, ' ').substring(0, 200) + '...';
  }

  /**
   * Extract tags from content
   */
  extractTags(content) {
    if (typeof content !== 'string') return [];
    
    // Look for common transparency-related terms
    const terms = content.toLowerCase();
    const tags = [];
    
    if (terms.includes('presupuesto') || terms.includes('budget')) tags.push('budget');
    if (terms.includes('gasto') || terms.includes('expense')) tags.push('expenses');
    if (terms.includes('contrato') || terms.includes('contratacion') || terms.includes('licitacion')) tags.push('contracts');
    if (terms.includes('sueldo') || terms.includes('salario')) tags.push('salaries');
    if (terms.includes('deuda') || terms.includes('debt')) tags.push('debt');
    if (terms.includes('tesoreria') || terms.includes('treasury')) tags.push('treasury');
    if (terms.includes('inversion') || terms.includes('investment')) tags.push('investments');
    if (terms.includes('ordenanza')) tags.push('ordinances');
    if (terms.includes('decreto')) tags.push('decrees');
    if (terms.includes('declaracion') && terms.includes('jurada')) tags.push('declarations');
    
    return [...new Set(tags)]; // Remove duplicates
  }

  /**
   * Determine document type from URL
   */
  getDocumentType(url) {
    if (url.endsWith('.pdf')) return 'pdf';
    if (url.endsWith('.doc') || url.endsWith('.docx')) return 'document';
    if (url.endsWith('.xls') || url.endsWith('.xlsx')) return 'spreadsheet';
    if (url.endsWith('.csv')) return 'csv';
    if (url.endsWith('.json')) return 'json';
    if (url.endsWith('.xml')) return 'xml';
    if (url.includes('api') || url.includes('json')) return 'json';
    return 'webpage';
  }

  /**
   * Rebuild the index by scanning document files
   */
  async rebuildIndex(documentSources = []) {
    this.index = { documents: {}, lastUpdated: new Date().toISOString(), totalDocuments: 0 };
    
    // Index documents from provided sources
    if (documentSources.length > 0) {
      for (const source of documentSources) {
        if (typeof source === 'string') {
          // URL string
          try {
            await this.indexDocumentFromUrl(source);
          } catch (error) {
            console.error(`Error indexing source ${source}:`, error.message);
          }
        } else if (source.url) {
          // Object with URL and metadata
          try {
            await this.indexDocumentFromUrl(source.url, source.metadata || {});
          } catch (error) {
            console.error(`Error indexing source ${source.url}:`, error.message);
          }
        }
      }
    }

    await this.saveIndex();
    return this.index;
  }
}

// Export a singleton instance
const documentIndexer = new DocumentIndexer();
module.exports = documentIndexer;