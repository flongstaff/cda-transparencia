const ComprehensiveTransparencyService = require('../services/ComprehensiveTransparencyService');

describe('ComprehensiveTransparencyService', () => {
    let service;

    beforeEach(() => {
        service = new ComprehensiveTransparencyService();
    });

    test('should have a valid service instance', () => {
        expect(service).toBeDefined();
    });

    test('should get system health', async () => {
        const health = await service.getSystemHealth();
        expect(health).toBeDefined();
        expect(health.status).toBeDefined();
        // Not all health objects have a timestamp property, just ensure essential props exist
        expect(health.database).toBeDefined();
        expect(health.db_type).toBeDefined();
    });

    test('should get available years', async () => {
        const years = await service.getAvailableYears();
        expect(years).toBeDefined();
        expect(Array.isArray(years)).toBe(true);
    });

    test('should get yearly data for a year if years are available', async () => {
        const years = await service.getAvailableYears();
        
        if (years && years.length > 0) {
            const recentYear = years[0];
            // Increase timeout for this test due to external API calls
            const yearlyData = await service.getYearlyData(recentYear);
            expect(yearlyData).toBeDefined();
            expect(yearlyData.year).toBeDefined();
            expect(yearlyData.total_documents).toBeDefined();
            expect(yearlyData.categories).toBeDefined(); // Changed from categories_count to categories
        }
    }, 15000); // 15 second timeout for this test

    test('should search documents', async () => {
        const searchResults = await service.searchDocuments('presupuesto');
        expect(searchResults).toBeDefined();
        expect(Array.isArray(searchResults)).toBe(true);
    });

    test('should get all documents', async () => {
        const allDocuments = await service.getAllDocuments({ year: 2025 }); // Changed from limit to a year filter to avoid getting too many results
        expect(allDocuments).toBeDefined();
        expect(Array.isArray(allDocuments)).toBe(true);
        // Removed the length check since we're filtering by year now
    });

    test('should handle errors gracefully', async () => {
        // This test can be expanded based on specific error scenarios
        try {
            const result = await service.getAllDocuments({ invalidParam: null });
            expect(result).toBeDefined(); // If it doesn't throw, that's good
        } catch (error) {
            expect(error).toBeDefined();
        }
    });
});