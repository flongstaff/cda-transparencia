/**
 * Document Indexing Routes
 * API endpoints for managing the document index
 */

const express = require('express');
const router = express.Router();
const documentIndexer = require('../services/DocumentIndexer');

/**
 * Health check for document indexer
 */
router.get('/health', async (req, res) => {
  try {
    const stats = await documentIndexer.getStatistics();
    
    res.json({ 
      success: true,
      service: 'Document Indexer',
      status: 'active',
      statistics: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Document indexer health check error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * Get document index statistics
 */
router.get('/statistics', async (req, res) => {
  try {
    const stats = await documentIndexer.getStatistics();
    res.json({ 
      success: true, 
      statistics: stats 
    });
  } catch (error) {
    console.error('Error getting statistics:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * Add a document to the index
 */
router.post('/add', async (req, res) => {
  try {
    const { url, title, description, category, type, year, source, tags } = req.body;

    if (!url) {
      return res.status(400).json({ 
        success: false, 
        error: 'URL is required' 
      });
    }

    const documentInfo = {
      url,
      title,
      description,
      category: category || 'general',
      type: type || documentIndexer.getDocumentType(url),
      year: year || new Date().getFullYear(),
      source: source || 'external',
      tags: tags || []
    };

    const indexedDocument = await documentIndexer.addDocument(documentInfo);
    
    res.json({ 
      success: true, 
      document: indexedDocument,
      message: 'Document added to index successfully'
    });
  } catch (error) {
    console.error('Error adding document:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * Index a document from URL (with metadata extraction)
 */
router.post('/index-url', async (req, res) => {
  try {
    const { url, metadata = {} } = req.body;

    if (!url) {
      return res.status(400).json({ 
        success: false, 
        error: 'URL is required' 
      });
    }

    const indexedDocument = await documentIndexer.indexDocumentFromUrl(url, metadata);
    
    res.json({ 
      success: true, 
      document: indexedDocument,
      message: 'Document indexed successfully'
    });
  } catch (error) {
    console.error('Error indexing document from URL:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * Index multiple documents from URLs
 */
router.post('/index-urls', async (req, res) => {
  try {
    const { urls, commonMetadata = {} } = req.body;

    if (!urls || !Array.isArray(urls)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Array of URLs is required' 
      });
    }

    const result = await documentIndexer.indexDocumentsFromUrls(urls, commonMetadata);
    
    res.json({ 
      success: true, 
      ...result,
      message: `Indexed ${result.successCount} documents with ${result.errorCount} errors`
    });
  } catch (error) {
    console.error('Error indexing multiple documents:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * Remove a document from the index
 */
router.delete('/remove/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;

    const success = await documentIndexer.removeDocument(documentId);
    
    if (success) {
      res.json({ 
        success: true, 
        message: 'Document removed from index successfully'
      });
    } else {
      res.status(404).json({ 
        success: false, 
        error: 'Document not found in index' 
      });
    }
  } catch (error) {
    console.error('Error removing document:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * Update a document in the index
 */
router.put('/update/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    const updates = req.body;

    const updatedDocument = await documentIndexer.updateDocument(documentId, updates);
    
    if (updatedDocument) {
      res.json({ 
        success: true, 
        document: updatedDocument,
        message: 'Document updated successfully'
      });
    } else {
      res.status(404).json({ 
        success: false, 
        error: 'Document not found in index' 
      });
    }
  } catch (error) {
    console.error('Error updating document:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * Get a document by ID
 */
router.get('/document/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;

    const document = await documentIndexer.getDocument(documentId);
    
    if (document) {
      res.json({ 
        success: true, 
        document 
      });
    } else {
      res.status(404).json({ 
        success: false, 
        error: 'Document not found' 
      });
    }
  } catch (error) {
    console.error('Error getting document:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * Search documents
 */
router.get('/search', async (req, res) => {
  try {
    const { 
      q, 
      limit = 20, 
      offset = 0, 
      category, 
      year, 
      type,
      sortBy = 'indexedAt',
      sortOrder = 'desc'
    } = req.query;

    const options = {
      limit: parseInt(limit),
      offset: parseInt(offset),
      category,
      year: year ? parseInt(year) : undefined,
      type,
      sortBy,
      sortOrder
    };

    const results = await documentIndexer.searchDocuments(q, options);
    
    res.json({ 
      success: true, 
      ...results,
      query: q || '',
      filters: { category, year, type }
    });
  } catch (error) {
    console.error('Error searching documents:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * Get documents by category
 */
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const results = await documentIndexer.getDocumentsByCategory(category);
    
    res.json({ 
      success: true, 
      ...results,
      category
    });
  } catch (error) {
    console.error('Error getting documents by category:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * Get documents by year
 */
router.get('/year/:year', async (req, res) => {
  try {
    const { year } = req.params;
    const results = await documentIndexer.getDocumentsByYear(parseInt(year));
    
    res.json({ 
      success: true, 
      ...results,
      year: parseInt(year)
    });
  } catch (error) {
    console.error('Error getting documents by year:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * Rebuild the entire index
 */
router.post('/rebuild', async (req, res) => {
  try {
    const { documentSources = [] } = req.body;
    const newIndex = await documentIndexer.rebuildIndex(documentSources);
    
    res.json({ 
      success: true, 
      index: newIndex,
      message: 'Document index rebuilt successfully'
    });
  } catch (error) {
    console.error('Error rebuilding index:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;