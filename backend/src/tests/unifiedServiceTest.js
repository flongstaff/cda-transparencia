const ComprehensiveTransparencyService = require('../services/ComprehensiveTransparencyService');

// Test the unified data service
async function testUnifiedService() {
    const service = new ComprehensiveTransparencyService();
    
    console.log('Testing ComprehensiveTransparencyService...');
    
    try {
        // Test system health
        console.log('\n1. Testing system health...');
        const health = await service.getSystemHealth();
        console.log('Health status:', JSON.stringify(health, null, 2));
        
        // Test available years
        console.log('\n2. Testing available years...');
        const years = await service.getAvailableYears();
        console.log('Available years:', years);
        
        // Test yearly data (use the most recent year)
        if (years && years.length > 0) {
            const recentYear = years[0];
            console.log(`\n3. Testing yearly data for ${recentYear}...`);
            const yearlyData = await service.getYearlyData(recentYear);
            console.log(`Yearly data for ${recentYear}:`, {
                total_documents: yearlyData.total_documents,
                categories_count: Object.keys(yearlyData.categories || {}).length
            });
        }
        
        // Test document search
        console.log('\n4. Testing document search...');
        const searchResults = await service.searchDocuments('presupuesto');
        console.log('Search results count:', searchResults.length);
        
        // Test all documents
        console.log('\n5. Testing all documents...');
        const allDocuments = await service.getAllDocuments({ limit: 5 });
        console.log('Documents count:', allDocuments.length);
        
        console.log('\n✅ All tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
if (require.main === module) {
    testUnifiedService();
}

module.exports = { testUnifiedService };
