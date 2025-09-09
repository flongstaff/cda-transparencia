const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Initialize the comprehensive transparency system
const routes = require('./routes');

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
  message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

// Use comprehensive transparency routes
app.use('/api', routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : 'Contact administrator'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Carmen de Areco Comprehensive Transparency API running on port ${PORT}`);
  console.log(`📊 Using comprehensive PostgreSQL transparency system`);
  console.log(`🔗 API available at http://localhost:${PORT}/api/transparency/`);
  console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
  console.log(`🏛️  Citizen portal: Full municipal transparency with document access`);
});

module.exports = app;