const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Initialize services using real SQLite data
const DocumentService = require('./services/DocumentService');
const FinancialDataParser = require('./services/FinancialDataParser');
const documentService = new DocumentService();
const financialParser = new FinancialDataParser();

console.log('🚀 Initializing server with real data services...');

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: 'SQLite transparency.db',
    services: ['DocumentService']
  });
});

// ==== DOCUMENT ENDPOINTS ====

// Get all documents with optional filtering
app.get('/api/documents', async (req, res) => {
  try {
    const filters = {
      type: req.query.type,
      search: req.query.search,
      category: req.query.category,
      year: req.query.year
    };
    
    const documents = await documentService.getAllDocuments(filters);
    
    res.json({
      documents: documents,
      total: documents.length,
      source: 'transparency.db',
      last_updated: new Date().toISOString(),
      filters_applied: filters
    });
  } catch (error) {
    console.error('Error loading documents:', error);
    res.status(500).json({ 
      error: 'Error loading documents',
      details: error.message 
    });
  }
});

// Get document by ID
app.get('/api/documents/:id', async (req, res) => {
  try {
    const document = await documentService.getDocumentById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    res.json({
      document,
      source: 'transparency.db'
    });
  } catch (error) {
    console.error('Error loading document:', error);
    res.status(500).json({ 
      error: 'Error loading document',
      details: error.message 
    });
  }
});

// Search documents
app.get('/api/documents/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    const filters = {
      type: req.query.type,
      category: req.query.category
    };
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const results = await documentService.searchDocuments(query, filters);
    
    res.json({
      results,
      total: results.length,
      query,
      source: 'transparency.db'
    });
  } catch (error) {
    console.error('Error searching documents:', error);
    res.status(500).json({ 
      error: 'Error searching documents',
      details: error.message 
    });
  }
});

// Get available years
app.get('/api/years', async (req, res) => {
  try {
    const years = await documentService.getAvailableYears();
    
    res.json({
      years,
      source: 'transparency.db'
    });
  } catch (error) {
    console.error('Error loading years:', error);
    res.status(500).json({ 
      error: 'Error loading available years',
      details: error.message 
    });
  }
});

// Get yearly data (documents for specific year)
app.get('/api/years/:year', async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    if (isNaN(year)) {
      return res.status(400).json({ error: 'Invalid year parameter' });
    }
    
    const documents = await documentService.getAllDocuments({ year });
    const categories = await documentService.getCategories();
    
    // Create yearly summary
    const summary = {
      year,
      total_documents: documents.length,
      categories: categories.filter(cat => 
        documents.some(doc => doc.category === cat.category)
      ),
      document_types: [...new Set(documents.map(doc => doc.document_type))],
      file_sizes_total: documents.reduce((total, doc) => total + (doc.file_size || 0), 0)
    };
    
    res.json({
      summary,
      documents,
      source: 'transparency.db'
    });
  } catch (error) {
    console.error('Error loading yearly data:', error);
    res.status(500).json({ 
      error: 'Error loading yearly data',
      details: error.message 
    });
  }
});

// Get categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await documentService.getCategories();
    
    res.json({
      categories,
      total: categories.length,
      source: 'transparency.db'
    });
  } catch (error) {
    console.error('Error loading categories:', error);
    res.status(500).json({ 
      error: 'Error loading categories',
      details: error.message 
    });
  }
});

// ==== FINANCIAL DATA ENDPOINTS ====

// Get financial data - Enhanced with real parsed data
app.get('/api/financial', async (req, res) => {
  try {
    const filters = {
      year: req.query.year,
      category: req.query.category
    };
    
    // Get both database and parsed financial data
    const [dbFinancialData, parsedFinancialData] = await Promise.all([
      documentService.getFinancialData(filters),
      financialParser.getFinancialSummary()
    ]);
    
    res.json({
      financial_data: dbFinancialData,
      parsed_financial_summary: parsedFinancialData,
      total: dbFinancialData.length,
      filters_applied: filters,
      source: 'transparency.db + parsed_pdfs'
    });
  } catch (error) {
    console.error('Error loading financial data:', error);
    res.status(500).json({ 
      error: 'Error loading financial data',
      details: error.message 
    });
  }
});

// New endpoint for detailed financial summary
app.get('/api/financial-summary', async (req, res) => {
  try {
    const summary = await financialParser.getFinancialSummary();
    res.json({
      summary,
      source: 'parsed_budget_execution_documents'
    });
  } catch (error) {
    console.error('Error loading financial summary:', error);
    res.status(500).json({ 
      error: 'Error loading financial summary',
      details: error.message 
    });
  }
});

// ==== AUDIT/CORRUPTION ENDPOINTS ====

// Get corruption cases
app.get('/api/corruption-cases', async (req, res) => {
  try {
    const cases = await documentService.getCorruptionCases();
    
    res.json({
      cases,
      total: cases.length,
      source: 'transparency.db'
    });
  } catch (error) {
    console.error('Error loading corruption cases:', error);
    res.status(500).json({ 
      error: 'Error loading corruption cases',
      details: error.message 
    });
  }
});

// ==== STATISTICS ENDPOINTS ====

// Get comprehensive statistics
app.get('/api/statistics', async (req, res) => {
  try {
    const documents = await documentService.getAllDocuments();
    const categories = await documentService.getCategories();
    const years = await documentService.getAvailableYears();
    const corruptionCases = await documentService.getCorruptionCases();
    
    // Calculate statistics
    const stats = {
      total_documents: documents.length,
      total_categories: categories.length,
      available_years: years,
      year_range: {
        earliest: Math.min(...years),
        latest: Math.max(...years)
      },
      document_types: [...new Set(documents.map(doc => doc.document_type))],
      total_file_size: documents.reduce((total, doc) => total + (doc.file_size || 0), 0),
      verified_documents: documents.filter(doc => doc.integrity_verified).length,
      corruption_cases: corruptionCases.length,
      by_category: categories.reduce((acc, cat) => {
        acc[cat.category] = cat.document_count;
        return acc;
      }, {}),
      by_year: years.reduce((acc, year) => {
        acc[year] = documents.filter(doc => doc.year === year).length;
        return acc;
      }, {}),
      by_type: documents.reduce((acc, doc) => {
        acc[doc.document_type] = (acc[doc.document_type] || 0) + 1;
        return acc;
      }, {})
    };
    
    res.json({
      statistics: stats,
      source: 'transparency.db',
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating statistics:', error);
    res.status(500).json({ 
      error: 'Error generating statistics',
      details: error.message 
    });
  }
});

// ==== LEGACY COMPATIBILITY ENDPOINTS ====

// Budget data (for compatibility)
app.get('/api/budget/:year', async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const documents = await documentService.getAllDocuments({ year });
    const budgetDocs = documents.filter(doc => 
      doc.category === 'Presupuesto Municipal' || 
      doc.title.toLowerCase().includes('presupuesto')
    );
    
    res.json({
      budget_documents: budgetDocs,
      year,
      total: budgetDocs.length,
      source: 'transparency.db'
    });
  } catch (error) {
    console.error('Error loading budget data:', error);
    res.status(500).json({ 
      error: 'Error loading budget data',
      details: error.message 
    });
  }
});

// Salaries data (for compatibility)
app.get('/api/salaries/:year', async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const documents = await documentService.getAllDocuments({ year });
    const salaryDocs = documents.filter(doc => 
      doc.category === 'Información Salarial' || 
      doc.title.toLowerCase().includes('salario') ||
      doc.title.toLowerCase().includes('sueldo')
    );
    
    res.json({
      salary_documents: salaryDocs,
      year,
      total: salaryDocs.length,
      source: 'transparency.db'
    });
  } catch (error) {
    console.error('Error loading salary data:', error);
    res.status(500).json({ 
      error: 'Error loading salary data',
      details: error.message 
    });
  }
});

// Contracts data (for compatibility) 
app.get('/api/contracts/:year', async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const documents = await documentService.getAllDocuments({ year });
    const contractDocs = documents.filter(doc => 
      doc.category === 'Contratos' || 
      doc.category === 'Licitaciones' ||
      doc.title.toLowerCase().includes('contrat') ||
      doc.title.toLowerCase().includes('licitac')
    );
    
    res.json({
      contract_documents: contractDocs,
      year,
      total: contractDocs.length,
      source: 'transparency.db'
    });
  } catch (error) {
    console.error('Error loading contract data:', error);
    res.status(500).json({ 
      error: 'Error loading contract data',
      details: error.message 
    });
  }
});

// Property declarations (for compatibility)
app.get('/api/declarations/:year', async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const documents = await documentService.getAllDocuments({ year });
    const declarationDocs = documents.filter(doc => 
      doc.category === 'Declaraciones Patrimoniales' ||
      doc.title.toLowerCase().includes('declarac')
    );
    
    res.json({
      declaration_documents: declarationDocs,
      year,
      total: declarationDocs.length,
      source: 'transparency.db'
    });
  } catch (error) {
    console.error('Error loading declaration data:', error);
    res.status(500).json({ 
      error: 'Error loading declaration data',
      details: error.message 
    });
  }
});

// Static PDF serving  
const pdfPath = path.join(__dirname, '../../organized_pdfs');
app.use('/api/pdfs', express.static(pdfPath));

// Get PDF files by year and category
app.get('/api/pdfs-index', async (req, res) => {
  try {
    const fs = require('fs');
    const walkDir = (dir, fileList = []) => {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
          walkDir(filePath, fileList);
        } else if (file.endsWith('.pdf')) {
          const relativePath = path.relative(pdfPath, filePath);
          const parts = relativePath.split(path.sep);
          fileList.push({
            name: file,
            path: relativePath.replace(/\\/g, '/'),
            year: parts[0],
            category: parts[1] || 'Sin categoría',
            url: `/api/pdfs/${relativePath.replace(/\\/g, '/')}`,
            size: fs.statSync(filePath).size
          });
        }
      });
      return fileList;
    };

    const pdfFiles = walkDir(pdfPath);
    res.json({
      pdfs: pdfFiles,
      total: pdfFiles.length,
      source: 'organized_pdfs'
    });
  } catch (error) {
    console.error('Error getting PDF index:', error);
    res.status(500).json({ 
      error: 'Error loading PDF index',
      details: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : 'Contact administrator'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Using real data from transparency.db (367 documents)`);
  console.log(`🔗 API available at http://localhost:${PORT}/api/`);
  console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;