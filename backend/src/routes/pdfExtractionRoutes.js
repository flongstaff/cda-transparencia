/**
 * PDF Extraction Routes
 * Handles PDF extraction and processing endpoints
 */

const express = require('express');
const router = express.Router();
const pdfExtractionService = require('../services/PDFExtractionService');

/**
 * Extract data from a PDF URL
 */
router.post('/extract', async (req, res) => {
  try {
    const { pdfUrl, documentType = 'general' } = req.body;

    if (!pdfUrl) {
      return res.status(400).json({ 
        success: false, 
        error: 'PDF URL is required' 
      });
    }

    const extractedData = await pdfExtractionService.extractFromUrl(pdfUrl, documentType);

    res.json({ 
      success: true, 
      data: extractedData,
      message: `Successfully extracted ${documentType} data from PDF`
    });

  } catch (error) {
    console.error('PDF extraction error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * Extract data from multiple PDF URLs
 */
router.post('/extract-batch', async (req, res) => {
  try {
    const { pdfUrls, documentType = 'general' } = req.body;

    if (!pdfUrls || !Array.isArray(pdfUrls)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Array of PDF URLs is required' 
      });
    }

    const results = [];
    const errors = [];

    // Process each PDF URL
    for (const pdfUrl of pdfUrls) {
      try {
        const extractedData = await pdfExtractionService.extractFromUrl(pdfUrl, documentType);
        results.push({
          url: pdfUrl,
          success: true,
          data: extractedData
        });
      } catch (error) {
        errors.push({
          url: pdfUrl,
          success: false,
          error: error.message
        });
      }
    }

    res.json({ 
      success: true, 
      results,
      errors,
      message: `Processed ${results.length} PDFs successfully with ${errors.length} errors`
    });

  } catch (error) {
    console.error('Batch PDF extraction error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * Health check for PDF extraction service
 */
router.get('/health', (req, res) => {
  res.json({ 
    success: true,
    service: 'PDF Extraction Service',
    status: 'active',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;