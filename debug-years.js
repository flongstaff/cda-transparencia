// Debug script to check available years
const DataService = require('./DataService');

console.log('Available years:', DataService.default.getAvailableYears());