/**
 * Search Routes for Carmen de Areco Transparency Portal
 * Implements semantic and traditional search capabilities
 * Follows AAIP guidelines for transparency and data protection
 */

const express = require('express');
const router = express.Router();
const SemanticSearchService = require('../services/semanticSearchService');

// Initialize the semantic search service
const semanticSearchService = new SemanticSearchService();

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

module.exports = router;