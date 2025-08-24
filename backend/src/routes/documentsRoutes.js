const express = require('express');
const router = express.Router();
const DocumentService = require('../services/DocumentService');

const documentService = new DocumentService();

// Get all documents with optional filtering
router.get('/', async (req, res) => {
  try {
    const filters = {
      category: req.query.category,
      year: req.query.year,
      type: req.query.type
    };
    
    const documents = await documentService.getAllDocuments(filters);
    
    res.json({
      documents: documents,
      total: documents.length,
      filters_applied: Object.keys(filters).filter(key => filters[key]).length,
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ 
      error: 'Failed to fetch documents',
      details: error.message 
    });
  }
});

// Get document by ID with full content
router.get('/:id', async (req, res) => {
  try {
    const document = await documentService.getDocumentById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ 
        error: 'Document not found',
        id: req.params.id 
      });
    }
    
    res.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ 
      error: 'Failed to fetch document',
      details: error.message 
    });
  }
});

// Get document content (markdown) by ID
router.get('/:id/content', async (req, res) => {
  try {
    const document = await documentService.getDocumentById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ 
        error: 'Document not found',
        id: req.params.id 
      });
    }
    
    if (document.markdown_content) {
      res.setHeader('Content-Type', 'text/markdown');
      res.send(document.markdown_content);
    } else {
      res.json({
        error: 'Markdown content not available',
        alternative: 'Use official_url or archive_url to access original document',
        official_url: document.official_url,
        archive_url: document.archive_url
      });
    }
  } catch (error) {
    console.error('Error fetching document content:', error);
    res.status(500).json({ 
      error: 'Failed to fetch document content',
      details: error.message 
    });
  }
});

// Search documents
router.get('/search/query', async (req, res) => {
  try {
    const query = req.query.q;
    
    if (!query) {
      return res.status(400).json({ 
        error: 'Search query is required',
        parameter: 'q'
      });
    }
    
    const filters = {
      category: req.query.category,
      year: req.query.year,
      type: req.query.type
    };
    
    const results = await documentService.searchDocuments(query, filters);
    
    res.json({
      query: query,
      results: results,
      total_results: results.length,
      search_type: 'full_text',
      filters_applied: Object.keys(filters).filter(key => filters[key]),
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error searching documents:', error);
    res.status(500).json({ 
      error: 'Search failed',
      details: error.message 
    });
  }
});

// Get financial data from documents
router.get('/financial/data', async (req, res) => {
  try {
    const filters = {
      year: req.query.year,
      category: req.query.category
    };
    
    const financialData = await documentService.getFinancialData(filters);
    
    // Calculate aggregates
    const aggregates = {
      total_budgeted: financialData.reduce((sum, item) => sum + (item.budgeted_amount || 0), 0),
      total_executed: financialData.reduce((sum, item) => sum + (item.executed_amount || 0), 0),
      avg_execution: financialData.length > 0 ? 
        financialData.reduce((sum, item) => sum + (parseFloat(item.execution_percentage) || 0), 0) / financialData.length : 0,
      categories_count: [...new Set(financialData.map(item => item.category))].length
    };
    
    res.json({
      financial_data: financialData,
      aggregates: aggregates,
      total_records: financialData.length,
      filters_applied: Object.keys(filters).filter(key => filters[key]),
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching financial data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch financial data',
      details: error.message 
    });
  }
});

// Get categories
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await documentService.getCategories();
    
    res.json({
      categories: categories,
      total_categories: categories.length,
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      error: 'Failed to fetch categories',
      details: error.message 
    });
  }
});

// Get verification status
router.get('/meta/verification', async (req, res) => {
  try {
    const verificationStatus = await documentService.getVerificationStatus();
    
    res.json({
      verification_status: verificationStatus,
      compliance_indicators: {
        osint_compliant: true,
        legal_framework: ['Ley 27.275', 'Ley 25.326'],
        verification_methods: verificationStatus.methods
      },
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching verification status:', error);
    res.status(500).json({ 
      error: 'Failed to fetch verification status',
      details: error.message 
    });
  }
});

// Advanced search with facets
router.post('/search/advanced', async (req, res) => {
  try {
    const { query, filters, facets } = req.body;
    
    if (!query) {
      return res.status(400).json({ 
        error: 'Search query is required in request body'
      });
    }
    
    const results = await documentService.searchDocuments(query, filters || {});
    
    // Calculate facets if requested
    let facetData = {};
    if (facets && facets.length > 0) {
      // Get all documents for facet calculation
      const allDocs = await documentService.getAllDocuments();
      
      facetData = {
        categories: facets.includes('categories') ? 
          this.calculateFacets(allDocs, 'category') : undefined,
        years: facets.includes('years') ? 
          this.calculateFacets(allDocs, 'year') : undefined,
        types: facets.includes('types') ? 
          this.calculateFacets(allDocs, 'document_type') : undefined
      };
    }
    
    res.json({
      query: query,
      results: results,
      total_results: results.length,
      facets: facetData,
      search_performance: {
        execution_time_ms: Date.now() - req.startTime,
        result_relevance: 'high'
      },
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in advanced search:', error);
    res.status(500).json({ 
      error: 'Advanced search failed',
      details: error.message 
    });
  }
});

// Helper method for facet calculation
function calculateFacets(documents, field) {
  const facets = {};
  documents.forEach(doc => {
    const value = doc[field];
    if (value) {
      facets[value] = (facets[value] || 0) + 1;
    }
  });
  return Object.entries(facets)
    .map(([key, count]) => ({ value: key, count: count }))
    .sort((a, b) => b.count - a.count);
}

module.exports = router;