const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const sequelize = require('./config/database');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Load document registry (GitHub-compatible approach)
let documentRegistry = null;
try {
  const registryPath = path.join(__dirname, '../../src/data/document_registry.json');
  if (fs.existsSync(registryPath)) {
    documentRegistry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  }
} catch (error) {
  console.log('Document registry not found, using fallback metadata');
}

// Document metadata with official links (GitHub-compatible)
const getDocumentInfo = (filename) => {
  if (documentRegistry && documentRegistry.documents) {
    const doc = documentRegistry.documents.find(d => d.filename === filename);
    if (doc) {
      return {
        ...doc,
        // Ensure we have official download sources
        download_sources: {
          official_site: doc.official_url,
          web_archive: doc.archive_url,
          backup_available: true
        }
      };
    }
  }
  
  // Fallback metadata
  const baseUrl = 'https://carmendeareco.gob.ar/transparencia/';
  const archiveUrl = `https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/`;
  
  return {
    filename: filename,
    official_url: baseUrl,
    archive_url: archiveUrl,
    verification_status: 'verified',
    download_date: new Date().toISOString(),
    download_sources: {
      official_site: baseUrl,
      web_archive: archiveUrl,
      backup_available: false
    }
  };
};

// Document info endpoint (no binary serving for GitHub)
app.get('/api/documents/:year/:filename', (req, res) => {
  const { year, filename } = req.params;
  const docInfo = getDocumentInfo(filename);
  
  // Return document info with official download links
  res.json({
    ...docInfo,
    year: parseInt(year),
    message: 'Document available through official sources',
    download_instructions: {
      primary: `Visit ${docInfo.official_url} to download this document`,
      alternative: `Check ${docInfo.archive_url} for archived versions`,
      verified: docInfo.verification_status === 'verified'
    }
  });
});

// API to get document list from registry (GitHub-compatible)
app.get('/api/documents', (req, res) => {
  try {
    if (documentRegistry && documentRegistry.documents) {
      // Use registry data
      const documents = documentRegistry.documents.map(doc => ({
        ...doc,
        download_url: `/api/documents/${doc.year}/${doc.filename}`,
        // GitHub-compatible: point to official sources
        primary_download: doc.official_url,
        archive_download: doc.archive_url,
        github_deployment: true
      }));
      
      res.json({ 
        documents, 
        total: documents.length,
        source: 'document_registry',
        github_compatible: true,
        last_updated: documentRegistry.generated_date
      });
    } else {
      // Fallback: try to read from file system
      const dataDir = path.join(__dirname, '../../data/source_materials');
      if (!fs.existsSync(dataDir)) {
        // No local files - return empty registry for GitHub deployment
        res.json({
          documents: [],
          total: 0,
          source: 'github_deployment',
          message: 'Documents available through official links only',
          official_source: 'https://carmendeareco.gob.ar/transparencia/'
        });
        return;
      }
      
      // Legacy file-based approach (for development)
      const documents = [];
      const years = fs.readdirSync(dataDir).filter(item => 
        fs.statSync(path.join(dataDir, item)).isDirectory() && 
        /^\d{4}$/.test(item)
      );
      
      years.forEach(year => {
        const yearDir = path.join(dataDir, year);
        const files = fs.readdirSync(yearDir).filter(file => 
          file.endsWith('.pdf') || file.endsWith('.xlsx') || file.endsWith('.xls')
        );
        
        files.forEach(filename => {
          const docInfo = getDocumentInfo(filename);
          documents.push({
            ...docInfo,
            year: parseInt(year),
            type: path.extname(filename).toLowerCase(),
            download_url: `/api/documents/${year}/${filename}`
          });
        });
      });
      
      res.json({ documents, total: documents.length, source: 'filesystem' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error loading document registry' });
  }
});

// Routes
const apiRoutes = require('./routes');
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Carmen de Areco Transparency Portal API', 
    version: '1.0.0' 
  });
});

// Test database connection
sequelize.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
