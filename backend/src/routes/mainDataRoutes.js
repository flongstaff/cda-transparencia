const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;

// Serve main-data.json from public directory
router.get('/', async (req, res) => {
  try {
    console.log('[MAIN DATA API] Serving main-data.json');
    
    // Path to the main-data.json file in the public directory
    const mainDataPath = path.join(__dirname, '..', '..', '..', 'public', 'main-data.json');
    
    // Check if file exists
    try {
      await fs.access(mainDataPath);
    } catch (err) {
      console.error('[MAIN DATA API] File not found:', mainDataPath);
      return res.status(404).json({
        success: false,
        error: 'Main data file not found',
        path: mainDataPath
      });
    }
    
    // Read the file
    const data = await fs.readFile(mainDataPath, 'utf8');
    
    // Parse and send JSON response
    const jsonData = JSON.parse(data);
    
    console.log('[MAIN DATA API] Successfully served main-data.json');
    res.json({
      success: true,
      data: jsonData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[MAIN DATA API] Error serving main-data.json:', error);
    
    // Send error response
    res.status(500).json({
      success: false,
      error: 'Failed to load main data',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;