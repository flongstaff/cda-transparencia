const fs = require('fs').promises;
const path = require('path');

class StaticDataService {
    constructor() {
        this.cache = new Map();
        this.cacheExpiry = 30 * 60 * 1000; // 30 minutes
        this.dataFolders = {
            frontend: path.join(__dirname, '../../data'),
            frontendDist: path.join(__dirname, '../../../frontend/dist/data'),
            carmen: path.join(__dirname, '../../../carmen_transparencia'),
            audit: path.join(__dirname, '../../enhanced_audit_data')
        };
    }

    async readJSONFile(filePath) {
        try {
            const data = await fs.readFile(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.warn(`Failed to read ${filePath}:`, error.message);
            return null;
        }
    }

    async getFileWithCache(key, filePath) {
        const cached = this.cache.get(key);
        if (cached && (Date.now() - cached.timestamp) < this.cacheExpiry) {
            return cached.data;
        }

        const data = await this.readJSONFile(filePath);
        if (data) {
            this.cache.set(key, { data, timestamp: Date.now() });
        }
        return data;
    }

    // Financial Data
    async getBudgetData(year = 2024) {
        return await this.getFileWithCache(
            `budget_${year}`,
            path.join(this.dataFolders.frontendDist, 'organized_analysis/financial_oversight/budget_analysis/budget_data_2024.json')
        );
    }

    async getSalaryData(year = 2024) {
        return await this.getFileWithCache(
            `salary_${year}`,
            path.join(this.dataFolders.frontendDist, 'organized_analysis/financial_oversight/salary_oversight/salary_data_2024.json')
        );
    }

    async getDebtData(year = 2024) {
        return await this.getFileWithCache(
            `debt_${year}`,
            path.join(this.dataFolders.frontendDist, 'organized_analysis/financial_oversight/debt_monitoring/debt_data_2024.json')
        );
    }

    // Audit and Analysis Data
    async getAnomalyData(year = 2024) {
        return await this.getFileWithCache(
            `anomaly_${year}`,
            path.join(this.dataFolders.frontendDist, 'organized_analysis/audit_cycles/anomaly_detection/anomaly_data_2024.json')
        );
    }

    async getEnhancedAuditResults() {
        return await this.getFileWithCache(
            'enhanced_audit_results',
            path.join(this.dataFolders.audit, 'enhanced_audit_results.json')
        );
    }

    // Document Export Data from Carmen
    async getCarmenDocumentExport() {
        return await this.getFileWithCache(
            'carmen_database_export',
            path.join(this.dataFolders.carmen, 'database_export.json')
        );
    }

    // Organized Analysis Data
    async getInventorySummary() {
        return await this.getFileWithCache(
            'inventory_summary',
            path.join(this.dataFolders.frontendDist, 'organized_analysis/inventory_summary.json')
        );
    }

    async getDetailedInventory() {
        return await this.getFileWithCache(
            'detailed_inventory',
            path.join(this.dataFolders.frontendDist, 'organized_analysis/detailed_inventory.json')
        );
    }

    // Comparison and Analysis Reports
    async getComparisonReport() {
        const files = await fs.readdir(path.join(this.dataFolders.frontendDist, 'organized_analysis/data_analysis/comparisons')).catch(() => []);
        const comparisonFile = files.find(f => f.includes('comparison_report'));
        
        if (comparisonFile) {
            return await this.getFileWithCache(
                'comparison_report',
                path.join(this.dataFolders.frontendDist, 'organized_analysis/data_analysis/comparisons', comparisonFile)
            );
        }
        return null;
    }

    // Web Sources and Governance Review
    async getWebSources() {
        return await this.getFileWithCache(
            'web_sources',
            path.join(this.dataFolders.frontendDist, 'organized_analysis/governance_review/transparency_reports/web_sources.json')
        );
    }

    // Audit Cycle Reports
    async getLatestAuditCycle() {
        try {
            const cycleDir = path.join(this.dataFolders.frontendDist, 'organized_analysis/audit_cycles/cycle_reports');
            const files = await fs.readdir(cycleDir);
            const cycleFiles = files.filter(f => f.includes('cycle_') && f.endsWith('.json'));
            
            if (cycleFiles.length > 0) {
                // Get the most recent cycle file
                const latestFile = cycleFiles.sort().pop();
                return await this.getFileWithCache(
                    'latest_audit_cycle',
                    path.join(cycleDir, latestFile)
                );
            }
        } catch (error) {
            console.warn('Failed to load audit cycle data:', error.message);
        }
        return null;
    }

    // Markdown Documents Index
    async getMarkdownDocuments() {
        try {
            const mdDir = path.join(this.dataFolders.frontendDist, 'markdown_documents');
            const years = await fs.readdir(mdDir).catch(() => []);
            
            const documentIndex = {};
            for (const year of years) {
                if (year.match(/^\d{4}$/)) {
                    const yearDir = path.join(mdDir, year);
                    const files = await fs.readdir(yearDir).catch(() => []);
                    documentIndex[year] = files.filter(f => f.endsWith('.md')).map(f => ({
                        filename: f,
                        path: `/data/markdown_documents/${year}/${f}`,
                        title: f.replace('.md', '').replace(/-/g, ' ')
                    }));
                }
            }
            
            return documentIndex;
        } catch (error) {
            console.warn('Failed to index markdown documents:', error.message);
            return {};
        }
    }

    // Comprehensive Dashboard Data
    async getDashboardData() {
        const [
            budgetData,
            salaryData,
            debtData,
            anomalyData,
            inventorySummary,
            auditResults,
            carmenExport,
            comparisonReport,
            webSources,
            latestCycle,
            markdownDocs
        ] = await Promise.all([
            this.getBudgetData(),
            this.getSalaryData(),
            this.getDebtData(),
            this.getAnomalyData(),
            this.getInventorySummary(),
            this.getEnhancedAuditResults(),
            this.getCarmenDocumentExport(),
            this.getComparisonReport(),
            this.getWebSources(),
            this.getLatestAuditCycle(),
            this.getMarkdownDocuments()
        ]);

        return {
            financial: {
                budget: budgetData,
                salaries: salaryData,
                debt: debtData
            },
            analysis: {
                anomalies: anomalyData,
                inventory: inventorySummary,
                comparison: comparisonReport,
                latestCycle: latestCycle
            },
            documents: {
                carmen_export: carmenExport,
                markdown_index: markdownDocs
            },
            governance: {
                audit_results: auditResults,
                web_sources: webSources
            },
            metadata: {
                generated_at: new Date().toISOString(),
                data_sources: Object.keys(this.dataFolders).length,
                cache_status: this.cache.size
            }
        };
    }

    // Clear cache
    clearCache() {
        this.cache.clear();
    }

    // Get cache stats
    getCacheStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

module.exports = StaticDataService;