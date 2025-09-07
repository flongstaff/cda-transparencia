const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const sequelize = null; // We'll set this to null since we're not using a database for our new endpoints
const RealDataLoader = require('./real-data-loader');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Real Data Loader
const realDataLoader = new RealDataLoader();
let realDataCache = null;

// Initialize working services only
const PostgreSQLDataService = require('./services/PostgreSQLDataService');
const pgDataService = new PostgreSQLDataService();

const ComprehensiveTransparencyService = require('./services/ComprehensiveTransparencyService');
const comprehensiveTransparencyService = new ComprehensiveTransparencyService();

const EnhancedAuditService = require('./services/EnhancedAuditService');
const enhancedAuditService = new EnhancedAuditService();

const DocumentService = require('./services/DocumentService');
const documentService = new DocumentService();

// Security and Performance Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiting for production
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: 'connected'
  });
});

// Serve markdown content

const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
  // Removed SSL configuration to avoid connection issues
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: 'connected',
      db_time: result.rows[0].now
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: 'disconnected',
      error: error.message
    });
  }
});

// API to get document list from database
app.get('/api/documents', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM transparency.documents');
    client.release();
    res.json({ 
      documents: result.rows, 
      total: result.rowCount,
      source: 'database',
      last_updated: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Error loading documents from database' });
  }
});

// API endpoints for real document data
app.get('/api/real-documents', async (req, res) => {
  try {
    if (!realDataCache || realDataLoader.needsRefresh()) {
      console.log('🔄 Loading real document data...');
      realDataCache = await realDataLoader.loadDocuments();
    }
    
    res.json({
      documents: realDataCache,
      total: realDataCache.length,
      source: 'real_files',
      last_updated: realDataLoader.lastLoaded,
      statistics: realDataLoader.getStatistics()
    });
  } catch (error) {
    console.error('Error loading real documents:', error);
    res.status(500).json({ 
      error: 'Error loading real document data',
      details: error.message 
    });
  }
});

// API to get documents by category
app.get('/api/real-documents/category/:category', async (req, res) => {
  try {
    if (!realDataCache || realDataLoader.needsRefresh()) {
      realDataCache = await realDataLoader.loadDocuments();
    }
    
    const documents = realDataLoader.getDocumentsByCategory(req.params.category);
    res.json({
      documents,
      total: documents.length,
      category: req.params.category,
      source: 'real_files'
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Error loading documents by category',
      details: error.message 
    });
  }
});

// API to get documents by year
app.get('/api/real-documents/year/:year', async (req, res) => {
  try {
    if (!realDataCache || realDataLoader.needsRefresh()) {
      realDataCache = await realDataLoader.loadDocuments();
    }
    
    const year = parseInt(req.params.year);
    const documents = realDataLoader.getDocumentsByYear(year);
    res.json({
      documents,
      total: documents.length,
      year,
      source: 'real_files'
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Error loading documents by year',
      details: error.message 
    });
  }
});

// API to get budget execution documents for audit
app.get('/api/real-documents/budget-execution', async (req, res) => {
  try {
    if (!realDataCache || realDataLoader.needsRefresh()) {
      realDataCache = await realDataLoader.loadDocuments();
    }
    
    const documents = realDataLoader.getBudgetExecutionDocuments();
    res.json({
      documents,
      total: documents.length,
      document_type: 'budget_execution',
      source: 'real_files',
      audit_ready: true
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Error loading budget execution documents',
      details: error.message 
    });
  }
});

// API to get high priority documents
app.get('/api/real-documents/high-priority', async (req, res) => {
  try {
    if (!realDataCache || realDataLoader.needsRefresh()) {
      realDataCache = await realDataLoader.loadDocuments();
    }
    
    const documents = realDataLoader.getHighPriorityDocuments();
    res.json({
      documents,
      total: documents.length,
      priority: 'high',
      source: 'real_files'
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Error loading high priority documents',
      details: error.message 
    });
  }
});

// API to get document statistics
app.get('/api/real-documents/stats', async (req, res) => {
  try {
    if (!realDataCache || realDataLoader.needsRefresh()) {
      realDataCache = await realDataLoader.loadDocuments();
    }
    
    const stats = realDataLoader.getStatistics();
    res.json({
      ...stats,
      source: 'real_files'
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Error loading document statistics',
      details: error.message 
    });
  }
});

// API to get specific document by ID
app.get('/api/real-documents/document/:id', async (req, res) => {
  try {
    if (!realDataCache || realDataLoader.needsRefresh()) {
      realDataCache = await realDataLoader.loadDocuments();
    }
    
    const document = realDataLoader.getDocumentById(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    res.json({
      document,
      source: 'real_files'
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Error loading document',
      details: error.message 
    });
  }
});

// Power BI endpoints removed - service not available

// Endpoint to trigger Power BI data extraction
app.post('/api/powerbi/extract', async (req, res) => {
  try {
    // In a production environment, you would want to add authentication here
    // For now, we'll just run the extraction script
    
    const { spawn } = require('child_process');
    const path = require('path');
    
    const scriptPath = path.join(__dirname, '../../scripts/run_powerbi_extraction.py');
    
    const extractionProcess = spawn('python3', [scriptPath], {
      cwd: path.join(__dirname, '../..')
    });
    
    let stdout = '';
    let stderr = '';
    
    extractionProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    extractionProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    extractionProcess.on('close', (code) => {
      if (code === 0) {
        res.json({ 
          success: true, 
          message: 'Power BI data extraction completed successfully',
          output: stdout
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: 'Power BI data extraction failed',
          error: stderr,
          exitCode: code
        });
      }
    });
    
    // Set a timeout to prevent hanging
    setTimeout(() => {
      extractionProcess.kill();
      res.status(500).json({ 
        success: false, 
        message: 'Power BI data extraction timed out'
      });
    }, 600000); // 10 minutes timeout
  } catch (error) {
    res.status(500).json({ 
      error: 'Error triggering Power BI data extraction',
      details: error.message 
    });
  }
});

const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Yearly Data API Endpoints
app.get('/api/years', async (req, res) => {
  try {
    const years = await pgDataService.getAvailableYears();
    res.json({ years });
  } catch (error) {
    res.status(500).json({ 
      error: 'Error loading available years',
      details: error.message 
    });
  }
});

app.get('/api/years/:year', async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    if (isNaN(year)) {
      return res.status(400).json({ error: 'Invalid year parameter' });
    }
    
    const data = await pgDataService.getYearlyData(year);
    res.json(data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Error loading yearly data',
      details: error.message 
    });
  }
});

app.get('/api/years/:year/documents', async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    if (isNaN(year)) {
      return res.status(400).json({ error: 'Invalid year parameter' });
    }
    
    const documents = await pgDataService.getDocumentsForYear(year);
    res.json({ documents });
  } catch (error) {
    res.status(500).json({ 
      error: 'Error loading documents for year',
      details: error.message 
    });
  }
});

app.get('/api/years/:year/categories', async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    if (isNaN(year)) {
      return res.status(400).json({ error: 'Invalid year parameter' });
    }
    
    const categories = await pgDataService.getCategoriesForYear(year);
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ 
      error: 'Error loading categories for year',
      details: error.message 
    });
  }
});

// Unified service endpoints removed - using PostgreSQL service instead

// Routes - Anti-corruption system routes handled by modular controllers
const apiRoutes = require('./routes');
app.use('/api', apiRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;