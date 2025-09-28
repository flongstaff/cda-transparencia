// services/ComprehensiveTransparencyService.js
const ComprehensiveTransparencyService = require('../services/ComprehensiveTransparencyService');
const path = require('path');
const fs = require('fs').promises;

/**
 * Comprehensive Transparency Service for Carmen de Areco
 * Provides complete financial transparency, document access, and citizen-focused analysis
 */
class ComprehensiveTransparencyController {
    constructor() {
        this.service = new ComprehensiveTransparencyService();
        console.log('✅ ComprehensiveTransparencyController: Using comprehensive transparency service');
    }

    /**
     * Get citizen-focused financial overview
     */
    async getCitizenFinancialOverview(req, res) {
        try {
            const { year } = req.params;
            const yearInt = parseInt(year);

            if (!yearInt || isNaN(yearInt)) {
                return res.status(400).json({
                    error: 'Invalid year parameter',
                    message: 'Year must be a valid number'
                });
            }

            const result = await this.service.getCitizenFinancialOverview(yearInt);
            
            res.json({
                ...result,
                api_info: {
                    endpoint: 'citizen_financial_overview',
                    purpose: 'Provide citizen-friendly financial summary with real impact explanations',
                    year: yearInt,
                    generated_at: new Date().toISOString()
                }
            });
        } catch (error) {
            console.error('Error in getCitizenFinancialOverview:', error);
            res.status(500).json({
                error: 'Failed to get citizen financial overview',
                details: error.message
            });
        }
    }

    /**
     * Get budget breakdown with citizen explanations
     */
    async getBudgetBreakdownForCitizens(req, res) {
        try {
            const { year } = req.params;
            const yearInt = parseInt(year);

            if (!yearInt || isNaN(yearInt)) {
                return res.status(400).json({
                    error: 'Invalid year parameter',
                    message: 'Year must be a valid number'
                });
            }

            const budgetData = await this.service.getBudgetBreakdownForCitizens(yearInt);
            
            res.json({
                year: yearInt,
                budget_breakdown: budgetData,
                api_info: {
                    endpoint: 'budget_breakdown_for_citizens',
                    purpose: 'Provide detailed budget breakdown with citizen-friendly explanations',
                    year: yearInt,
                    generated_at: new Date().toISOString()
                }
            });
        } catch (error) {
            console.error('Error in getBudgetBreakdownForCitizens:', error);
            res.status(500).json({
                error: 'Failed to get budget breakdown for citizens',
                details: error.message
            });
        }
    }

    /**
     * Get all documents with filters
     */
    async getDocumentsWithFilters(req, res) {
        try {
            const { year, category, type, search, limit } = req.query;
            
            const filters = {};
            if (year) filters.year = parseInt(year);
            if (category) filters.category = category;
            if (type) filters.type = type;
            if (search) filters.search = search;
            if (limit) filters.limit = parseInt(limit);

            const documents = await this.service.getAllDocuments(filters);
            
            res.json({
                documents: documents,
                total: documents.length,
                filters: filters,
                api_info: {
                    endpoint: 'documents_with_filters',
                    purpose: 'Get all documents with optional filtering',
                    generated_at: new Date().toISOString()
                }
            });
        } catch (error) {
            console.error('Error in getDocumentsWithFilters:', error);
            res.status(500).json({
                error: 'Failed to get documents with filters',
                details: error.message
            });
        }
    }

    /**
     * Get document with all access methods and citizen relevance
     */
    async getDocumentWithAccess(req, res) {
        try {
            const { id } = req.params;
            
            if (!id) {
                return res.status(400).json({
                    error: 'Missing document ID',
                    message: 'Document ID is required'
                });
            }

            const documentData = await this.service.getDocumentWithAccess(id);
            
            res.json({
                ...documentData,
                api_info: {
                    endpoint: 'document_with_access',
                    purpose: 'Get document with all access methods, financial impact, and citizen relevance',
                    document_id: id,
                    generated_at: new Date().toISOString()
                }
            });
        } catch (error) {
            console.error('Error in getDocumentWithAccess:', error);
            res.status(500).json({
                error: 'Failed to get document with access',
                details: error.message
            });
        }
    }

    /**
     * Serve document file for download or viewing
     */
    async serveDocumentFile(req, res) {
        try {
            const { id } = req.params;
            
            if (!id) {
                return res.status(400).json({
                    error: 'Missing document ID',
                    message: 'Document ID is required'
                });
            }

            // This would typically stream the PDF file
            // For now, we'll return a placeholder
            res.json({
                message: 'Document file serving endpoint',
                document_id: id,
                note: 'Implementation would stream the actual PDF file'
            });
        } catch (error) {
            console.error('Error in serveDocumentFile:', error);
            res.status(500).json({
                error: 'Failed to serve document file',
                details: error.message
            });
        }
    }

    /**
     * Get embedded PDF viewer with document context
     */
    async getDocumentViewer(req, res) {
        try {
            const { id } = req.params;
            
            if (!id) {
                return res.status(400).json({
                    error: 'Missing document ID',
                    message: 'Document ID is required'
                });
            }

            // This would typically return an HTML page with embedded PDF viewer
            // For now, we'll return a placeholder
            res.json({
                message: 'Document viewer endpoint',
                document_id: id,
                note: 'Implementation would return HTML page with embedded PDF viewer'
            });
        } catch (error) {
            console.error('Error in getDocumentViewer:', error);
            res.status(500).json({
                error: 'Failed to get document viewer',
                details: error.message
            });
        }
    }

    /**
     * Get comparative analysis between years
     */
    async getComparativeAnalysis(req, res) {
        try {
            const { startYear, endYear } = req.params;
            const startYearInt = parseInt(startYear);
            const endYearInt = parseInt(endYear);

            if (!startYearInt || isNaN(startYearInt) || !endYearInt || isNaN(endYearInt)) {
                return res.status(400).json({
                    error: 'Invalid year parameters',
                    message: 'Both start year and end year must be valid numbers'
                });
            }

            const analysis = await this.service.getComparativeAnalysis(startYearInt, endYearInt);
            
            res.json({
                ...analysis,
                api_info: {
                    endpoint: 'comparative_analysis',
                    purpose: 'Provide comparative analysis between years with trends and recommendations',
                    start_year: startYearInt,
                    end_year: endYearInt,
                    generated_at: new Date().toISOString()
                }
            });
        } catch (error) {
            console.error('Error in getComparativeAnalysis:', error);
            res.status(500).json({
                error: 'Failed to get comparative analysis',
                details: error.message
            });
        }
    }

    /**
     * Get real-time transparency dashboard with key metrics
     */
    async getTransparencyDashboard(req, res) {
        try {
            const dashboardData = await this.service.getTransparencyDashboard();
            
            res.json({
                ...dashboardData,
                api_info: {
                    endpoint: 'transparency_dashboard',
                    purpose: 'Provide real-time dashboard with overview, recent additions, and key metrics',
                    generated_at: new Date().toISOString()
                }
            });
        } catch (error) {
            console.error('Error in getTransparencyDashboard:', error);
            res.status(500).json({
                error: 'Failed to get transparency dashboard',
                details: error.message
            });
        }
    }

    /**
     * Search documents with citizen-friendly results
     */
    async searchDocumentsForCitizens(req, res) {
        try {
            const { q, category, year } = req.query;
            
            if (!q) {
                return res.status(400).json({
                    error: 'Missing search query',
                    message: 'Search query (q) is required'
                });
            }

            const searchResults = await this.service.searchDocuments(q, { category, year });
            
            res.json({
                results: searchResults,
                query: q,
                filters: { category, year },
                api_info: {
                    endpoint: 'search_documents_for_citizens',
                    purpose: 'Search documents with citizen-friendly formatting and access methods',
                    generated_at: new Date().toISOString()
                }
            });
        } catch (error) {
            console.error('Error in searchDocumentsForCitizens:', error);
            res.status(500).json({
                error: 'Failed to search documents for citizens',
                details: error.message
            });
        }
    }

    /**
     * Get transparency system health status
     */
    async getSystemHealth(req, res) {
        try {
            const health = await this.service.getSystemHealth();
            
            res.json({
                ...health,
                api_info: {
                    endpoint: 'system_health',
                    purpose: 'Provide transparency system health status and data availability',
                    generated_at: new Date().toISOString()
                }
            });
        } catch (error) {
            console.error('Error in getSystemHealth:', error);
            res.status(500).json({
                error: 'Failed to get system health',
                details: error.message
            });
        }
    }

    /**
     * Get municipal debt data by year
     */
    async getMunicipalDebtByYear(req, res) {
        try {
            const { year } = req.params;
            const yearInt = parseInt(year);

            if (!yearInt || isNaN(yearInt)) {
                return res.status(400).json({
                    error: 'Invalid year parameter',
                    message: 'Year must be a valid number'
                });
            }

            // Use the enhanced service method that includes all data sources
            const debtData = await this.service.getMunicipalDebtByYear(yearInt);
            
            res.json({
                ...debtData,
                api_info: {
                    endpoint: 'municipal_debt_analysis',
                    purpose: 'Provide comprehensive debt analysis for municipal transparency',
                    year: yearInt,
                    generated_at: new Date().toISOString()
                }
            });
        } catch (error) {
            console.error('Error in getMunicipalDebtByYear:', error);
            res.status(500).json({
                error: 'Failed to get municipal debt data',
                details: error.message
            });
        }
    }

    /**
     * Get investment data for a specific year
     */
    async getInvestmentData(req, res) {
        try {
            const { year } = req.params;
            const yearInt = parseInt(year);

            if (!yearInt || isNaN(yearInt)) {
                return res.status(400).json({
                    error: 'Invalid year parameter',
                    message: 'Year must be a valid number'
                });
            }

            const investmentData = await this.service.getInvestmentData(yearInt);
            
            res.json({
                year: yearInt,
                investments: investmentData,
                api_info: {
                    endpoint: 'investment_data',
                    purpose: 'Provide investment data for transparency',
                    year: yearInt,
                    generated_at: new Date().toISOString()
                }
            });
        } catch (error) {
            console.error('Error in getInvestmentData:', error);
            res.status(500).json({
                error: 'Failed to get investment data',
                details: error.message
            });
        }
    }

    /**
     * Get available years for transparency data
     */
    async getAvailableYears(req, res) {
        try {
            const years = await this.service.getAvailableYears();
            
            res.json({
                years: years,
                api_info: {
                    endpoint: 'available_years',
                    purpose: 'Get all available years for transparency data',
                    generated_at: new Date().toISOString()
                }
            });
        } catch (error) {
            console.error('Error in getAvailableYears:', error);
            res.status(500).json({
                error: 'Failed to get available years',
                details: error.message
            });
        }
    }

    /**
     * Get external financial data from government APIs
     */
    async getExternalFinancialData(req, res) {
        try {
            const { year } = req.params;
            const yearInt = parseInt(year);

            if (!yearInt || isNaN(yearInt)) {
                return res.status(400).json({
                    error: 'Invalid year parameter',
                    message: 'Year must be a valid number'
                });
            }

            const externalData = await this.service.getExternalFinancialData(yearInt);
            
            res.json({
                year: yearInt,
                external_data: externalData,
                source: 'national_and_provincial_apis',
                generated_at: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error in getExternalFinancialData:', error);
            res.status(500).json({
                error: 'Failed to get external financial data',
                details: error.message
            });
        }
    }

    /**
     * Get GitHub data from public repositories
     */
    async getGitHubData(req, res) {
        try {
            const { repo, path } = req.params;
            
            if (!repo) {
                return res.status(400).json({
                    error: 'Missing repository parameter',
                    message: 'Repository name is required'
                });
            }

            const githubData = await this.service.getGitHubData(repo, path || '');
            
            res.json({
                repository: repo,
                path: path || '',
                data: githubData,
                source: 'github_api',
                generated_at: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error in getGitHubData:', error);
            res.status(500).json({
                error: 'Failed to get GitHub data',
                details: error.message
            });
        }
    }

    /**
     * Get local markdown documents
     */
    async getLocalMarkdownDocuments(req, res) {
        try {
            const { year, category } = req.params;
            const yearInt = parseInt(year);

            const documents = await this.service.getLocalMarkdownDocuments(yearInt, category || null);
            
            res.json({
                year: yearInt,
                category: category || 'all',
                documents: documents,
                count: documents.length,
                source: 'local_markdown_documents',
                generated_at: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error in getLocalMarkdownDocuments:', error);
            res.status(500).json({
                error: 'Failed to get local markdown documents',
                details: error.message
            });
        }
    }

    /**
     * Get organized PDF documents
     */
    async getOrganizedPdfDocuments(req, res) {
        try {
            const { year, category } = req.params;
            const yearInt = parseInt(year);

            const documents = await this.service.getOrganizedPdfDocuments(yearInt, category || null);
            
            res.json({
                year: yearInt,
                category: category || 'all',
                documents: documents,
                count: documents.length,
                source: 'organized_pdf_documents',
                generated_at: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error in getOrganizedPdfDocuments:', error);
            res.status(500).json({
                error: 'Failed to get organized PDF documents',
                details: error.message
            });
        }
    }

    /**
     * Get local transparency data analysis
     */
    async getLocalTransparencyData(req, res) {
        try {
            const transparencyData = await this.service.getLocalTransparencyData();
            
            if (!transparencyData) {
                return res.status(404).json({
                    error: 'No local transparency data available',
                    message: 'No analysis results found in local storage'
                });
            }
            
            res.json({
                data: transparencyData,
                source: 'local_analysis_results',
                generated_at: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error in getLocalTransparencyData:', error);
            res.status(500).json({
                error: 'Failed to get local transparency data',
                details: error.message
            });
        }
    }

    /**
     * Get unified data for a specific year
     */
    async getYearData(req, res) {
        try {
            const { year } = req.params;
            const yearInt = parseInt(year);

            if (!yearInt || isNaN(yearInt)) {
                return res.status(400).json({ error: 'Invalid year parameter' });
            }

            console.log(`📥 Fetching unified data for year ${yearInt}...`);

            // Fetch ALL data in parallel
            const [
                financialOverview,
                budgetBreakdown,
                documents,
                dashboard,
                externalData
            ] = await Promise.allSettled([
                this.service.getCitizenFinancialOverview(yearInt),
                this.service.getBudgetBreakdownForCitizens(yearInt),
                this.service.getAllDocuments({ year: yearInt }),
                this.service.getTransparencyDashboard(),
                this.service.getExternalFinancialData(yearInt)
            ]);

            // Process results
            const processedResults = [
                financialOverview,
                budgetBreakdown,
                documents,
                dashboard,
                externalData
            ].reduce((acc, result) => {
                if (result.status === 'fulfilled') {
                    // Merge the result data into our accumulator
                    Object.assign(acc.data, result.value);
                } else {
                    acc.errors.push(result.reason);
                }
                return acc;
            }, { data: {}, errors: [] });

            // Build final response
            const fullData = {
                year: yearInt,
                financialOverview: processedResults.data.financialOverview || processedResults.data.overview,
                budgetBreakdown: processedResults.data.budgetBreakdown || processedResults.data.budget_breakdown,
                spendingEfficiency: processedResults.data.spendingEfficiency || processedResults.data.spending_efficiency,
                documents: processedResults.data.documents || [],
                dashboard: processedResults.data.dashboard,
                auditOverview: processedResults.data.auditOverview || processedResults.data.audit_overview,
                antiCorruption: processedResults.data.antiCorruption || processedResults.data.anti_corruption,
                externalData: processedResults.data.externalData || processedResults.data,
                generated_at: new Date().toISOString()
            };

            // Add consistency checks
            const docCount = fullData.documents.length;
            const expectedDocs = fullData.financialOverview?.total_documents || 0;
            const dataComplete = docCount >= expectedDocs * 0.8;

            if (expectedDocs > 0 && docCount < expectedDocs * 0.8) {
                console.warn(`⚠️ Data mismatch: Expected ~${expectedDocs} docs, got ${docCount}`);
            }

            res.json({
                ...fullData,
                consistency_check: {
                    documents_expected: expectedDocs,
                    documents_received: docCount,
                    data_complete: dataComplete
                },
                data_sources: {
                    local: 'active',
                    external: processedResults.data.externalData ? 'active' : 'inactive',
                    provincial: processedResults.data.externalData?.ba_municipal_data ? 'active' : 'inactive',
                    national: processedResults.data.externalData?.national_data ? 'active' : 'inactive',
                    procurement: processedResults.data.externalData?.procurement_data ? 'active' : 'inactive'
                }
            });

        } catch (error) {
            console.error('Error in getYearData:', error);
            res.status(500).json({
                error: 'Failed to get comprehensive year data',
                details: error.message
            });
        }
    }

    /**
     * Clear API cache
     */
    async clearCache(req, res) {
        try {
            this.service.clearCache();
            
            res.json({
                message: 'API cache cleared successfully',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error in clearCache:', error);
            res.status(500).json({
                error: 'Failed to clear cache',
                details: error.message
            });
        }
    }

    /**
     * Get cache statistics
     */
    async getCacheStats(req, res) {
        try {
            const stats = this.service.getCacheStats();
            
            res.json({
                cache_stats: stats,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error in getCacheStats:', error);
            res.status(500).json({
                error: 'Failed to get cache statistics',
                details: error.message
            });
        }
    }
}

module.exports = ComprehensiveTransparencyController;