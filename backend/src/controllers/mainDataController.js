const path = require('path');
const fs = require('fs').promises;

// Controller to serve main-data.json
const getMainData = async (req, res) => {
  try {
    // Path to the main-data.json file in the public directory
    const mainDataPath = path.join(__dirname, '..', '..', 'public', 'main-data.json');
    
    // Read the file
    const data = await fs.readFile(mainDataPath, 'utf8');
    
    // Parse and send JSON response
    const jsonData = JSON.parse(data);
    res.json(jsonData);
  } catch (error) {
    console.error('Error serving main-data.json:', error);
    
    // Send error response
    res.status(500).json({
      error: 'Failed to load main data',
      message: error.message
    });
  }
};

module.exports = {
  getMainData
};