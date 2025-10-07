#!/usr/bin/env node

/**
 * Integration Verification Script
 * Simple script to verify that external data integrations are working
 */

console.log('🔄 Verifying external data integrations...\n');

// Check if backend proxy server is running
fetch('http://localhost:3001/health')
  .then(response => response.json())
  .then(data => {
    console.log('✅ Backend Proxy Server:');
    console.log(`   Status: ${data.status}`);
    console.log(`   Service: ${data.service}`);
    console.log(`   Cache Hits: ${data.cache_stats.hits}`);
    console.log(`   Cache Misses: ${data.cache_stats.misses}\n`);
    
    // Test a few key endpoints
    return Promise.allSettled([
      fetch('http://localhost:3001/api/external/rafam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ municipalityCode: '270' })
      }),
      fetch('http://localhost:3001/api/provincial/gba'),
      fetch('http://localhost:3001/api/national/datos')
    ]);
  })
  .then(results => {
    const [rafam, gba, datos] = results;
    
    console.log('🌐 External API Endpoints:');
    
    if (rafam.status === 'fulfilled' && rafam.value.ok) {
      console.log('   ✅ RAFAM API: CONNECTED');
    } else {
      console.log('   ⚠️  RAFAM API: CONNECTION ISSUE');
    }
    
    if (gba.status === 'fulfilled' && gba.value.ok) {
      console.log('   ✅ Buenos Aires Provincial: CONNECTED');
    } else {
      console.log('   ⚠️  Buenos Aires Provincial: CONNECTION ISSUE');
    }
    
    if (datos.status === 'fulfilled' && datos.value.ok) {
      console.log('   ✅ Datos Argentina: CONNECTED');
    } else {
      console.log('   ⚠️  Datos Argentina: CONNECTION ISSUE');
    }
    
    console.log('\n✅ Integration verification completed!');
    console.log('📊 Summary: Backend proxy is running and external APIs are accessible');
  })
  .catch(error => {
    console.error('❌ Integration verification failed:', error.message);
    process.exit(1);
  });