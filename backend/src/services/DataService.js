const UnifiedDatabaseAdapter = require('./UnifiedDatabaseAdapter');

/**
 * Data Service for Carmen de Areco Transparency Portal
 * Provides real data from our comprehensive database using the UnifiedDatabaseAdapter
 */
class DataService {
    constructor() {
        this.dbAdapter = null;
    }

    async initialize() {
        if (!this.dbAdapter) {
            this.dbAdapter = await UnifiedDatabaseAdapter.getInstance();
        }
    }

    async getAvailableYears() {
        await this.initialize();
        return this.dbAdapter.getAvailableYears();
    }

    async getYearlyData(year) {
        await this.initialize();
        try {
            const [documents, summary] = await Promise.all([
                this.getDocumentsByYear(year),
                this.getYearlySummary(year)
            ]);

            return {
                year: parseInt(year),
                documents,
                summary,
                categories: this.categorizeDocuments(documents),
                total_documents: documents.length,
                verified_documents: documents.filter(d => d.verification_status === 'verified').length
            };
        } catch (error) {
            console.error('Error fetching yearly data:', error);
            throw error;
        }
    }

    async getFullYearData(year) {
        await this.initialize();
        try {
            // Fetch all relevant data in parallel
            const [documents, summary] = await Promise.all([
                this.getDocumentsByYear(year),
                this.getYearlySummary(year)
            ]);

            // Process categories for the dashboard
            const categories = {};
            documents.forEach(doc => {
                const category = doc.category || 'Sin Categoría';
                if (!categories[category]) {
                    categories[category] = 0;
                }
                categories[category]++;
            });

            return {
                year: parseInt(year),
                documents,
                summary,
                categories,
                total_documents: documents.length,
                verified_documents: documents.filter(d => d.verification_status === 'verified').length
            };
        } catch (error) {
            console.error('Error fetching full year data:', error);
            throw error;
        }
    }

    async getDocumentsByYear(year) {
        await this.initialize();
        return this.dbAdapter.getDocumentsByYear(year);
    }

    async getYearlySummary(year) {
        await this.initialize();
        return this.dbAdapter.getYearlySummary(year);
    }

    categorizeDocuments(documents) {
        const categories = {};
        
        documents.forEach(doc => {
            const category = doc.category || 'Sin Categoría';
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(doc);
        });
        
        return categories;
    }

    async getAllDocuments() {
        await this.initialize();
        return this.dbAdapter.getAllDocuments();
    }

    async getHealthStatus() {
        await this.initialize();
        return this.dbAdapter.getHealthStatus();
    }

    async getDocumentsByCategory(category, year = null) {
        await this.initialize();
        return this.dbAdapter.getDocumentsByCategory(category, year);
    }
}

module.exports = DataService;