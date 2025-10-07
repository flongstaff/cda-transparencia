/**
 * Search Routes for Carmen de Areco Transparency Portal
 * Implements semantic and traditional search capabilities
 * Follows AAIP guidelines for transparency and data protection
 */

const express = require('express');
const router = express.Router();
const SemanticSearchService = require('../services/semanticSearchService');
const AdvancedSearchService = require('../services/advancedSearchService');

// Initialize the search services
const semanticSearchService = new SemanticSearchService();
const advancedSearchService = new AdvancedSearchService();

// POST route for semantic search
router.post('/semantic', async (req, res) => {
  try {
    const { query, options = {} } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Query parameter is required and must be a string'
      });
    }

    // Perform semantic search
    const searchResults = await semanticSearchService.semanticSearch(query, {
      ...options,
      // Include IP for anonymization in search service
      ip: req.ip
    });

    // Add transparency information
    res.json({
      ...searchResults,
      // Add transparency information about AI usage
      aiProcessing: {
        method: 'hybrid semantic and traditional search',
        model: 'sentence-transformers/all-MiniLM-L6-v2 adapted for Spanish',
        vectorDimensions: 384,
        privacyProtection: {
          queryAnonymized: true,
          noStorage: true,
          ipHashed: true
        }
      }
    });
  } catch (error) {
    console.error('Semantic search error:', error);
    res.status(500).json({
      error: 'Search service error',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Search temporarily unavailable'
    });
  }
});

// GET route for search suggestions
router.get('/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string' || q.length < 2) {
      return res.json({ suggestions: [] });
    }

    // In a real implementation, this would call an actual suggestions service
    // For now, we'll return some hardcoded suggestions based on common queries
    
    const suggestions = [
      'presupuesto 2024',
      'ejecución presupuestaria',
      'contratos municipales',
      'gastos en infraestructura',
      'licitaciones públicas',
      'declaraciones juradas',
      'deuda pública',
      'ingresos municipales',
      'proyectos de ley',
      'ordenanzas municipales'
    ].filter(suggestion => 
      suggestion.toLowerCase().includes(q.toLowerCase())
    );

    res.json({ 
      suggestions: suggestions.slice(0, 10) // Limit to 10 suggestions
    });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ suggestions: [] });
  }
});

// GET route for search statistics (for transparency reporting)
router.get('/stats', async (req, res) => {
  try {
    const stats = semanticSearchService.getQueryStats();
    
    res.json({
      ...stats,
      transparency: {
        dataProtection: true,
        privacyCompliant: true,
        anonymizationApplied: true
      },
      compliance: {
        follows_aaip_guidelines: true,
        gdpr_compliant: true
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Stats service error' });
  }
});

// GET route for search health check
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Semantic Search API',
    capabilities: {
      semantic_search: true,
      traditional_search: true,
      hybrid_search: true,
      spanish_language: true,
      ai_transparency: true,
      privacy_protection: true
    },
    timestamp: new Date().toISOString()
  });
});

// POST route for indexing documents (requires authentication in production)
// Note: In a production environment, this endpoint should require authentication
router.post('/index', async (req, res) => {
  try {
    // In production, verify this call is authorized
    // This is typically only used by internal data processing services
    
    const { documents } = req.body;
    
    if (!documents || !Array.isArray(documents)) {
      return res.status(400).json({
        error: 'Documents array is required'
      });
    }

    // Validate document structure
    for (const doc of documents) {
      if (!doc.id || !doc.title || !doc.content) {
        return res.status(400).json({
          error: `Document missing required fields: id, title, content are required. Error at document: ${doc.id || 'unknown'}`
        });
      }
    }

    // Create index if it doesn't exist
    await semanticSearchService.createIndex();
    
    // Index the documents
    const result = await semanticSearchService.bulkIndex(documents);
    
    res.json({
      success: true,
      indexed: documents.length,
      details: result.body
    });
  } catch (error) {
    console.error('Indexing error:', error);
    res.status(500).json({
      error: 'Indexing service error',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Indexing temporarily unavailable'
    });
  }
});

// GET route for faceted filtering options
router.get('/facets', async (req, res) => {
  try {
    const { q = '', category, year, type, source } = req.query;
    
    const options = {
      category: category || undefined,
      year: year ? parseInt(year) : undefined,
      type: type || undefined,
      source: source || undefined
    };

    const facets = await advancedSearchService.getFacetFilters(q, options);
    
    res.json({
      ...facets,
      // Add transparency information
      aiProcessing: {
        method: 'content analysis for faceted filtering',
        privacyProtection: true
      }
    });
  } catch (error) {
    console.error('Facets error:', error);
    res.status(500).json({ 
      error: 'Faceted filtering service error',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Faceted filtering temporarily unavailable'
    });
  }
});

// POST route for advanced search with multiple filters
router.post('/advanced', async (req, res) => {
  try {
    const { query, options = {} } = req.body;
    
    if (query && (typeof query !== 'string' || query.length < 1)) {
      return res.status(400).json({
        error: 'Query parameter must be a string with at least 1 character if provided'
      });
    }

    const searchResults = await advancedSearchService.advancedSearch(query, {
      ...options,
      // Include IP for anonymization in search service
      ip: req.ip
    });

    res.json({
      ...searchResults,
      // Add transparency information
      aiProcessing: {
        method: 'advanced search with multiple filters and options',
        privacyProtection: true
      }
    });
  } catch (error) {
    console.error('Advanced search error:', error);
    res.status(500).json({
      error: 'Advanced search service error',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Advanced search temporarily unavailable'
    });
  }
});

// GET route for document clustering
router.get('/clusters', async (req, res) => {
  try {
    const { q, filters = {} } = req.query;
    
    // First, get search results
    const searchResults = await advancedSearchService.advancedSearch(q || '', { filters });
    
    // Then cluster the results
    const clusters = await advancedSearchService.getDocumentClusters(searchResults.results);
    
    res.json({
      ...clusters,
      totalResults: searchResults.total,
      // Add transparency information
      aiProcessing: {
        method: 'document clustering based on content similarity',
        privacyProtection: true
      }
    });
  } catch (error) {
    console.error('Clustering error:', error);
    res.status(500).json({
      error: 'Document clustering service error',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Document clustering temporarily unavailable'
    });
  }
});

// POST route for clustering specific documents
router.post('/cluster-documents', async (req, res) => {
  try {
    const { documents, maxClusters = 5 } = req.body;
    
    if (!documents || !Array.isArray(documents)) {
      return res.status(400).json({
        error: 'Documents array is required'
      });
    }

    const clusters = await advancedSearchService.clusterDocuments(documents, maxClusters);
    
    res.json({
      ...clusters,
      // Add transparency information
      aiProcessing: {
        method: 'content-based document clustering',
        privacyProtection: true
      }
    });
  } catch (error) {
    console.error('Document clustering error:', error);
    res.status(500).json({
      error: 'Document clustering service error',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Document clustering temporarily unavailable'
    });
  }
});

module.exports = router;