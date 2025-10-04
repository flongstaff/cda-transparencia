const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');
const ErrorHandler = require('./utils/ErrorHandler');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

console.log('🚀 Initializing Carmen de Areco Comprehensive Transparency API...');

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiting - Increased for development
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased limit for development
  message: { 
    success: false,
    error: {
      type: 'RateLimitError',
      message: 'Too many requests',
      details: 'Rate limit exceeded, please try again later.',
      timestamp: new Date().toISOString()
    }
  }
});
app.use(limiter);

// Initialize the comprehensive transparency system
const routes = require('./routes');

// Use comprehensive transparency routes
app.use('/api', routes);

// Error handling middleware
app.use((err, req, res, next) => {
  ErrorHandler.handleExpressError(err, req, res, next);
});

// 404 handler
app.use((req, res) => {
  const notFoundError = new Error('Endpoint not found');
  notFoundError.name = 'NotFoundError';
  
  const { response, statusCode } = ErrorHandler.createErrorResponse(notFoundError, `404 - ${req.method} ${req.path}`, 404);
  ErrorHandler.logError(notFoundError, `404 - ${req.method} ${req.path}`, {
    url: req.url,
    method: req.method,
    ip: req.ip
  });
  
  res.status(statusCode).json(response);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Carmen de Areco Comprehensive Transparency API running on port ${PORT}`);
  console.log(`📊 Using comprehensive ${process.env.DB_TYPE || 'SQLite'} transparency system`);
  console.log(`🔗 API available at http://localhost:${PORT}/api/transparency/`);
  console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
  console.log(`🏛️  Citizen portal: Full municipal transparency with document access`);
});

module.exports = app;