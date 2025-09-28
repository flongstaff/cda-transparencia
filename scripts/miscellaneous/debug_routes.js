const express = require('express');
const app = express();

// Initialize the comprehensive transparency system
const routes = require('./backend/src/routes');

console.log('Routes object:', routes);

// Use comprehensive transparency routes
app.use('/api', routes);

// Log all registered routes
const expressListRoutes = require('express-list-routes');
expressListRoutes(app, { prefix: '/api' });

console.log('Server setup complete');