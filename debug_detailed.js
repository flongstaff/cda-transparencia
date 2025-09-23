#!/usr/bin/env node

/**
 * Detailed debugging script to verify all endpoints are working
 */

const axios = require('axios');

const BASE_URL = 'https://cda-transparencia.org';

// Test key pages
const PAGES = [
  '/',
  '/dashboard',
  '/budget',
  '/expenses',
  '/documents',
  '/about'
];

async function testPage(path) {
  try {
    const response = await axios.get(`${BASE_URL}${path}`, {
      timeout: 10000
    });
    
    console.log(`✅ ${path}: ${response.status} - ${response.headers['content-type']}`);
    return response.status === 200;
  } catch (error) {
    console.log(`❌ ${path}: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🔍 Testing deployed site pages...\\n');
  
  let successCount = 0;
  for (const page of PAGES) {
    const success = await testPage(page);
    if (success) successCount++;
    // Brief pause between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\\n📊 Results: ${successCount}/${PAGES.length} pages loaded successfully`);
  
  if (successCount === PAGES.length) {
    console.log('🎉 All pages are working correctly!');
  } else {
    console.log('⚠️  Some pages may have issues');
  }
}

if (require.main === module) {
  runTests().catch(console.error);
}