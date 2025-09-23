const express = require('express');
const app = express();

// Initialize the comprehensive transparency system
const routes = require('./backend/src/routes');

console.log('Main routes:');
console.log(routes.stack);

// Check transparency routes
const transparencyRoutes = require('./backend/src/routes/comprehensiveTransparencyRoutes');
console.log('\nTransparency routes:');
console.log(transparencyRoutes.stack);

// Check static data routes
const staticDataRoutes = require('./backend/src/routes/staticDataRoutes');
console.log('\nStatic data routes:');
console.log(staticDataRoutes.stack);