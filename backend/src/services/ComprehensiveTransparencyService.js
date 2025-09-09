const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

/**
 * Comprehensive Transparency Service for Carmen de Areco
 * Provides complete financial transparency, document access, and citizen-focused analysis
 * Integrates local data sources, external APIs, and GitHub resources
 */
class ComprehensiveTransparencyService {
    constructor() {
        this.pool = new Pool({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5433,
            database: process.env.DB_NAME || 'transparency_portal',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
        });
        
        // Local document paths
        this.documentPaths = {
            source_materials: path.join(__dirname, '../../../data/source_materials'),
            pdf_extracts: path.join(__dirname, '../../../data/pdf_extracts'),
            preserved: path.join(__dirname, '../../../data/preserved'),
            markdown_documents: path.join(__dirname, '../../../data/markdown_documents'),
            organized_pdfs: path.join(__dirname, '../../../organized_pdfs'),
            transparency_data: path.join(__dirname, '../../../transparency_data')
        };
        
        // External API endpoints
        this.externalApis = {
            datos_gob_ar: 'https://datos.gob.ar/api/3/action',
            georef_api: 'https://apis.datos.gob.ar/georef/api',
            presupuesto_abierto: 'https://www.presupuestoabierto.gob.ar/sici/api',
            contrataciones_abiertas: 'https://www.argentina.gob.ar/contratacionesabiertas/api',
            bcra_api: 'https://api.estadisticasbcra.com',
            wayback_machine: 'https://archive.org/wayback/available'
        };
        
        // GitHub repositories for data sources
        this.githubRepos = {
            normas_legales: 'clarius/normas',
            constitucion_argentina: 'FdelMazo/ConstitucionArgentina',
            datos_politicos: 'PoliticaArgentina/data_warehouse',
            apis_publicas: 'enzonotario/apidocs.ar'
        };
        
        // Cache for external API responses
        this.apiCache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        
        console.log('✅ ComprehensiveTransparencyService initialized with full data source integration');
    }

    /**
     * Get comprehensive financial overview for citizens
     */
    async getCitizenFinancialOverview(year) {
        try {
            const query = `
                SELECT 
                    d.year,
                    d.category,
                    COUNT(*) as document_count,
                    SUM(d.size_bytes) as total_size_bytes,
                    COUNT(CASE WHEN d.verification_status = 'verified' THEN 1 END) as verified_count,
                    bd.budgeted_amount,
                    bd.executed_amount,
                    bd.execution_rate
                FROM transparency.documents d
                LEFT JOIN transparency.budget_data bd ON d.id = bd.document_id
                WHERE d.year = $1
                GROUP BY d.year, d.category, bd.budgeted_amount, bd.executed_amount, bd.execution_rate
                ORDER BY COUNT(*) DESC
            `;
            
            const result = await this.pool.query(query, [year]);
            
            return {
                year: parseInt(year),
                overview: this.generateCitizenSummary(result.rows, year),
                categories: this.processCategoryDataBasic(result.rows),
                transparency_score: this.calculateTransparencyScore(result.rows),
                spending_efficiency: this.analyzeBudgetExecution(result.rows),
                document_accessibility: this.assessDocumentAccessibility(result.rows)
            };
        } catch (error) {
            console.error('Error getting citizen financial overview:', error);
            throw error;
        }
    }

    /**
     * Process category data in basic format
     */
    processCategoryDataBasic(data) {
        const categories = {};
        data.forEach(row => {
            const category = row.category || 'Sin Categoría';
            if (!categories[category]) {
                categories[category] = {
                    document_count: 0,
                    total_budget: 0,
                    total_executed: 0
                };
            }
            categories[category].document_count += parseInt(row.document_count) || 0;
            categories[category].total_budget += parseFloat(row.budgeted_amount) || 0;
            categories[category].total_executed += parseFloat(row.executed_amount) || 0;
        });
        return categories;
    }

    /**
     * Generate citizen-friendly financial summary
     */
    generateCitizenSummary(data, year) {
        const totalDocuments = data.reduce((sum, row) => sum + parseInt(row.document_count), 0);
        const verifiedDocuments = data.reduce((sum, row) => sum + parseInt(row.verified_count), 0);
        const totalBudgeted = data.reduce((sum, row) => sum + (parseFloat(row.budgeted_amount) || 0), 0);
        const totalExecuted = data.reduce((sum, row) => sum + (parseFloat(row.executed_amount) || 0), 0);

        // Carmen de Areco population estimate
        const estimatedPopulation = 15000; // approx population
        const budgetPerCitizen = totalBudgeted / estimatedPopulation;
        const executedPerCitizen = totalExecuted / estimatedPopulation;

        return {
            total_municipal_budget: totalBudgeted,
            total_executed: totalExecuted,
            execution_rate: totalBudgeted > 0 ? ((totalExecuted / totalBudgeted) * 100).toFixed(2) : 0,
            budget_per_citizen: budgetPerCitizen.toFixed(2),
            executed_per_citizen: executedPerCitizen.toFixed(2),
            unexecuted_amount: totalBudgeted - totalExecuted,
            documents_available: totalDocuments,
            verified_documents: verifiedDocuments,
            transparency_level: totalDocuments > 0 ? ((verifiedDocuments / totalDocuments) * 100).toFixed(2) : 0,
            citizen_impact: {
                yearly_tax_contribution_estimate: budgetPerCitizen,
                services_delivered_value: executedPerCitizen,
                efficiency_rating: this.getEfficiencyRating(totalExecuted / totalBudgeted)
            }
        };
    }

    /**
     * Get detailed budget breakdown by category with citizen explanations
     */
    async getBudgetBreakdownForCitizens(year) {
        try {
            const query = `
                SELECT 
                    d.category,
                    d.document_type,
                    COUNT(*) as document_count,
                    bd.budgeted_amount,
                    bd.executed_amount,
                    bd.execution_rate,
                    bd.subcategory,
                    bd.funding_source,
                    STRING_AGG(d.filename, ', ') as source_documents
                FROM transparency.documents d
                LEFT JOIN transparency.budget_data bd ON d.id = bd.document_id
                WHERE d.year = $1 AND bd.budgeted_amount IS NOT NULL
                GROUP BY d.category, d.document_type, bd.budgeted_amount, bd.executed_amount, 
                        bd.execution_rate, bd.subcategory, bd.funding_source
                ORDER BY bd.budgeted_amount DESC
            `;
            
            const result = await this.pool.query(query, [year]);
            
            return result.rows.map(row => ({
                category: row.category,
                citizen_description: this.getCitizenDescription(row.category),
                budgeted_amount: parseFloat(row.budgeted_amount) || 0,
                executed_amount: parseFloat(row.executed_amount) || 0,
                execution_rate: parseFloat(row.execution_rate) || 0,
                impact_description: this.getImpactDescription(row.category, row.executed_amount),
                funding_source: row.funding_source,
                transparency_status: {
                    documents_available: parseInt(row.document_count),
                    source_documents: row.source_documents,
                    verification_level: 'verified'
                },
                citizen_services: this.getCitizenServices(row.category)
            }));
        } catch (error) {
            console.error('Error getting budget breakdown for citizens:', error);
            throw error;
        }
    }

    /**
     * Get document with full access options (PDF viewer, links, etc.)
     */
    async getDocumentWithAccess(documentId) {
        try {
            const query = `
                SELECT 
                    d.*,
                    bd.budgeted_amount,
                    bd.executed_amount,
                    bd.execution_rate,
                    sd.net_salary,
                    c.contract_amount,
                    c.contractor_name
                FROM transparency.documents d
                LEFT JOIN transparency.budget_data bd ON d.id = bd.document_id
                LEFT JOIN transparency.salary_data sd ON d.id = sd.document_id
                LEFT JOIN transparency.contracts c ON d.id = c.document_id
                WHERE d.id = $1
            `;
            
            const result = await this.pool.query(query, [documentId]);
            
            if (result.rows.length === 0) {
                throw new Error('Document not found');
            }

            const doc = result.rows[0];
            
            // Generate access methods for the document
            const accessMethods = await this.generateDocumentAccess(doc);
            
            return {
                document: {
                    id: doc.id,
                    title: doc.title || doc.filename,
                    filename: doc.filename,
                    year: doc.year,
                    category: doc.category,
                    type: doc.document_type,
                    size_mb: (doc.size_bytes / (1024 * 1024)).toFixed(2),
                    verification_status: doc.verification_status
                },
                access_methods: accessMethods,
                financial_impact: {
                    budget_amount: doc.budgeted_amount,
                    executed_amount: doc.executed_amount,
                    execution_rate: doc.execution_rate,
                    salary_amount: doc.net_salary,
                    contract_amount: doc.contract_amount,
                    contractor: doc.contractor_name
                },
                citizen_relevance: this.assessCitizenRelevance(doc),
                transparency_metrics: this.getDocumentTransparencyMetrics(doc)
            };
        } catch (error) {
            console.error('Error getting document with access:', error);
            throw error;
        }
    }

    /**
     * Generate all possible access methods for a document
     */
    async generateDocumentAccess(doc) {
        const accessMethods = {
            official_url: null,
            archive_url: null,
            local_copy: null,
            pdf_viewer_url: null,
            markdown_url: null,
            availability_score: 0
        };

        // Official URL
        if (doc.official_url) {
            accessMethods.official_url = doc.official_url;
            accessMethods.availability_score += 25;
        } else {
            // Generate likely official URL with year/month structure
            const date = new Date(doc.created_at || Date.now());
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            accessMethods.official_url = `http://carmendeareco.gob.ar/wp-content/uploads/${year}/${month}/${doc.filename}`;
        }

        // Wayback Machine URL
        accessMethods.archive_url = `https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/`;

        // Local copy availability
        try {
            // Check if document exists in organized_pdfs directory
            const pdfPath = path.join(this.documentPaths.organized_pdfs, String(doc.year), doc.category, doc.filename);
            const pdfExists = await fs.access(pdfPath).then(() => true).catch(() => false);
            
            if (pdfExists) {
                accessMethods.local_copy = `/api/pdfs/${doc.year}/${encodeURIComponent(doc.category)}/${encodeURIComponent(doc.filename)}`;
                accessMethods.availability_score += 25;
            }
        } catch (error) {
            console.warn('Could not check local PDF copy:', error);
        }

        // PDF viewer URL
        accessMethods.pdf_viewer_url = `/documents/${doc.id}/view`;

        // Markdown version URL (if available)
        try {
            const markdownPath = path.join(this.documentPaths.markdown_documents, String(doc.year), `${doc.filename.replace('.pdf', '')}.md`);
            const markdownExists = await fs.access(markdownPath).then(() => true).catch(() => false);
            
            if (markdownExists) {
                accessMethods.markdown_url = `/api/markdown/${doc.year}/${encodeURIComponent(doc.filename.replace('.pdf', ''))}.md`;
                accessMethods.availability_score += 25;
            }
        } catch (error) {
            console.warn('Could not check markdown version:', error);
        }

        return accessMethods;
    }

    /**
     * Get all documents with filters
     */
    async getAllDocuments(filters = {}) {
        try {
            let query = `
                SELECT 
                    d.id,
                    d.filename,
                    d.title,
                    d.year,
                    d.category,
                    d.document_type,
                    d.size_bytes,
                    d.verification_status,
                    d.created_at,
                    bd.budgeted_amount,
                    bd.executed_amount,
                    bd.execution_rate
                FROM transparency.documents d
                LEFT JOIN transparency.budget_data bd ON d.id = bd.document_id
            `;
            
            const conditions = [];
            const params = [];
            let paramIndex = 1;
            
            if (filters.year) {
                conditions.push(`d.year = $${paramIndex}`);
                params.push(filters.year);
                paramIndex++;
            }
            
            if (filters.category) {
                conditions.push(`d.category = $${paramIndex}`);
                params.push(filters.category);
                paramIndex++;
            }
            
            if (filters.type) {
                conditions.push(`d.document_type = $${paramIndex}`);
                params.push(filters.type);
                paramIndex++;
            }
            
            if (filters.search) {
                conditions.push(`(d.title ILIKE $${paramIndex} OR d.filename ILIKE $${paramIndex})`);
                params.push(`%${filters.search}%`);
                paramIndex++;
            }
            
            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');
            }
            
            query += ' ORDER BY d.year DESC, d.created_at DESC';
            
            if (filters.limit) {
                query += ` LIMIT $${paramIndex}`;
                params.push(filters.limit);
            }
            
            const result = await this.pool.query(query, params);
            
            return result.rows.map(row => ({
                id: row.id,
                title: row.title || row.filename,
                filename: row.filename,
                year: row.year,
                category: row.category,
                type: row.document_type,
                size_mb: (row.size_bytes / (1024 * 1024)).toFixed(2),
                verification_status: row.verification_status,
                created_at: row.created_at,
                budgeted_amount: row.budgeted_amount,
                executed_amount: row.executed_amount,
                execution_rate: row.execution_rate
            }));
        } catch (error) {
            console.error('Error getting all documents:', error);
            throw error;
        }
    }

    /**
     * Search documents with advanced filtering
     */
    async searchDocuments(query, filters = {}) {
        try {
            const searchQuery = `
                SELECT 
                    d.id,
                    d.filename,
                    d.title,
                    d.year,
                    d.category,
                    d.document_type,
                    d.size_bytes,
                    d.verification_status,
                    d.created_at,
                    d.content,
                    bd.budgeted_amount,
                    bd.executed_amount,
                    bd.execution_rate,
                    ts_rank(to_tsvector('spanish', d.content), plainto_tsquery('spanish', $1)) as rank
                FROM transparency.documents d
                LEFT JOIN transparency.budget_data bd ON d.id = bd.document_id
                WHERE to_tsvector('spanish', d.content) @@ plainto_tsquery('spanish', $1)
                ORDER BY rank DESC, d.year DESC
                LIMIT 50
            `;
            
            const result = await this.pool.query(searchQuery, [query]);
            
            return result.rows.map(row => ({
                id: row.id,
                title: row.title || row.filename,
                filename: row.filename,
                year: row.year,
                category: row.category,
                type: row.document_type,
                size_mb: (row.size_bytes / (1024 * 1024)).toFixed(2),
                verification_status: row.verification_status,
                created_at: row.created_at,
                snippet: this.extractContentSnippet(row.content, query),
                relevance_score: parseFloat(row.rank),
                budgeted_amount: row.budgeted_amount,
                executed_amount: row.executed_amount,
                execution_rate: row.execution_rate
            }));
        } catch (error) {
            console.error('Error searching documents:', error);
            throw error;
        }
    }

    /**
     * Extract content snippet around search terms
     */
    extractContentSnippet(content, searchTerm) {
        if (!content) return '...';
        
        const index = content.toLowerCase().indexOf(searchTerm.toLowerCase());
        if (index === -1) return content.substring(0, 100) + '...';
        
        const start = Math.max(0, index - 50);
        const end = Math.min(content.length, index + searchTerm.length + 50);
        return '...' + content.substring(start, end) + '...';
    }

    /**
     * Get municipal debt data by year
     */
    async getMunicipalDebtByYear(year) {
        try {
            // First, try to get debt data from the municipal_debt table
            const debtQuery = `
                SELECT 
                    id,
                    year,
                    debt_type,
                    description,
                    amount,
                    interest_rate,
                    due_date,
                    status
                FROM transparency.municipal_debt
                WHERE year = $1
                ORDER BY amount DESC
            `;
            
            const debtResult = await this.pool.query(debtQuery, [year]);
            
            // If no debt data found, return empty structure
            if (debtResult.rows.length === 0) {
                return {
                    debt_data: [],
                    total_debt: 0,
                    average_interest_rate: 0,
                    long_term_debt: 0,
                    short_term_debt: 0,
                    debt_by_type: {},
                    metadata: {
                        year: parseInt(year),
                        last_updated: new Date().toISOString(),
                        source: 'no_data_available'
                    }
                };
            }
            
            // Calculate debt analytics
            const debtData = debtResult.rows.map(row => ({
                debt_type: row.debt_type,
                description: row.description,
                amount: parseFloat(row.amount),
                interest_rate: parseFloat(row.interest_rate),
                due_date: row.due_date ? row.due_date.toISOString().split('T')[0] : null,
                status: row.status,
                principal_amount: parseFloat(row.amount), // Simplified - in a real system this would be separate
                accrued_interest: 0 // Simplified - in a real system this would be calculated
            }));
            
            const totalDebt = debtData.reduce((sum, debt) => sum + debt.amount, 0);
            const averageInterestRate = debtData.length > 0 
                ? debtData.reduce((sum, debt) => sum + debt.interest_rate, 0) / debtData.length 
                : 0;
            
            // Classify debt as short-term or long-term based on due date
            const currentDate = new Date();
            let shortTermDebt = 0;
            let longTermDebt = 0;
            
            const debtByType = {};
            
            debtData.forEach(debt => {
                // Group by type
                if (!debtByType[debt.debt_type]) {
                    debtByType[debt.debt_type] = 0;
                }
                debtByType[debt.debt_type] += debt.amount;
                
                // Classify as short-term or long-term
                if (debt.due_date) {
                    const dueDate = new Date(debt.due_date);
                    const diffTime = dueDate.getTime() - currentDate.getTime();
                    const diffDays = diffTime / (1000 * 60 * 60 * 24);
                    
                    if (diffDays <= 365) {
                        shortTermDebt += debt.amount;
                    } else {
                        longTermDebt += debt.amount;
                    }
                } else {
                    // If no due date, classify as long-term by default
                    longTermDebt += debt.amount;
                }
            });
            
            return {
                debt_data: debtData,
                total_debt: totalDebt,
                average_interest_rate: parseFloat(averageInterestRate.toFixed(2)),
                long_term_debt: longTermDebt,
                short_term_debt: shortTermDebt,
                debt_by_type: debtByType,
                metadata: {
                    year: parseInt(year),
                    last_updated: new Date().toISOString(),
                    source: 'postgresql_database'
                }
            };
        } catch (error) {
            console.error('Error fetching municipal debt data:', error);
            // Return fallback data
            return {
                debt_data: [],
                total_debt: 0,
                average_interest_rate: 0,
                long_term_debt: 0,
                short_term_debt: 0,
                debt_by_type: {},
                metadata: {
                    year: parseInt(year),
                    last_updated: new Date().toISOString(),
                    source: 'error_fallback',
                    error: error.message
                }
            };
        }
    }

    /**
     * Get corruption cases
     */
    async getCorruptionCases() {
        try {
            const query = `
                SELECT *
                FROM transparency.corruption_cases
                ORDER BY created_at DESC
            `;
            
            const result = await this.pool.query(query);
            return result.rows;
        } catch (error) {
            console.error('Error fetching corruption cases:', error);
            return [];
        }
    }

    /**
     * Get available years from documents
     */
    async getAvailableYears() {
        try {
            const query = `
                SELECT DISTINCT year 
                FROM transparency.documents 
                WHERE year IS NOT NULL 
                ORDER BY year DESC
            `;
            
            const result = await this.pool.query(query);
            return result.rows.map(row => row.year);
        } catch (error) {
            console.error('Error fetching available years:', error);
            // Fallback to hardcoded years
            const currentYear = new Date().getFullYear();
            return [currentYear, currentYear - 1, currentYear - 2, currentYear - 3, currentYear - 4, currentYear - 5];
        }
    }

    /**
     * Get categories
     */
    async getCategories() {
        try {
            const query = `
                SELECT DISTINCT category 
                FROM transparency.documents 
                WHERE category IS NOT NULL 
                ORDER BY category
            `;
            
            const result = await this.pool.query(query);
            return result.rows.map(row => row.category);
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
    }

    /**
     * Get system health status
     */
    async getSystemHealth() {
        try {
            const query = `
                SELECT 
                    COUNT(*) as total_documents,
                    COUNT(CASE WHEN verification_status = 'verified' THEN 1 END) as verified_documents,
                    MAX(created_at) as last_update
                FROM transparency.documents
            `;
            
            const result = await this.pool.query(query);
            const row = result.rows[0];
            
            return {
                status: 'healthy',
                database: 'connected',
                total_documents: parseInt(row.total_documents),
                verified_documents: parseInt(row.verified_documents),
                last_update: row.last_update,
                transparency_score: parseInt(row.total_documents) > 0 ? 
                    Math.round((row.verified_documents / row.total_documents) * 100) : 0
            };
        } catch (error) {
            console.error('Error fetching health status:', error);
            return {
                status: 'error',
                database: 'disconnected',
                error: error.message
            };
        }
    }

    /**
     * Get yearly data (documents, budget, summary)
     */
    async getYearlyData(year) {
        try {
            // Get documents for the year
            const documentsQuery = `
                SELECT 
                    d.id,
                    d.filename,
                    d.title,
                    d.year,
                    d.category,
                    d.document_type,
                    d.size_bytes,
                    d.verification_status,
                    d.created_at,
                    bd.budgeted_amount,
                    bd.executed_amount,
                    bd.execution_rate
                FROM transparency.documents d
                LEFT JOIN transparency.budget_data bd ON d.id = bd.document_id
                WHERE d.year = $1
                ORDER BY d.created_at DESC
            `;
            
            const [documentsResult, budgetResult] = await Promise.all([
                this.pool.query(documentsQuery, [year]),
                // Get budget summary
                this.pool.query(`
                    SELECT 
                        SUM(bd.budgeted_amount) as total_budgeted,
                        SUM(bd.executed_amount) as total_executed,
                        AVG(bd.execution_rate) as avg_execution_rate
                    FROM transparency.budget_data bd
                    JOIN transparency.documents d ON bd.document_id = d.id
                    WHERE d.year = $1
                `, [year])
            ]);
            
            const documents = documentsResult.rows.map(row => ({
                id: row.id,
                title: row.title || row.filename,
                filename: row.filename,
                year: row.year,
                category: row.category,
                type: row.document_type,
                size_mb: (row.size_bytes / (1024 * 1024)).toFixed(2),
                verification_status: row.verification_status,
                created_at: row.created_at,
                budgeted_amount: row.budgeted_amount,
                executed_amount: row.executed_amount,
                execution_rate: row.execution_rate
            }));
            
            const budgetSummary = budgetResult.rows[0];
            
            // Create yearly summary
            const summary = {
                year: parseInt(year),
                total_documents: documents.length,
                categories: this.categorizeDocuments(documents),
                document_types: [...new Set(documents.map(doc => doc.type))],
                file_sizes_total: documents.reduce((total, doc) => total + (parseFloat(doc.size_mb) || 0), 0),
                total_budgeted: parseFloat(budgetSummary.total_budgeted) || 0,
                total_executed: parseFloat(budgetSummary.total_executed) || 0,
                execution_rate: parseFloat(budgetSummary.avg_execution_rate) || 0
            };
            
            return {
                summary,
                documents,
                budget: {
                    total_budgeted: summary.total_budgeted,
                    total_executed: summary.total_executed,
                    execution_rate: summary.execution_rate,
                    categories: this.categorizeBudgetByCategory(documents)
                },
                source: 'transparency.db'
            };
        } catch (error) {
            console.error('Error loading yearly data:', error);
            throw error;
        }
    }

    /**
     * Categorize documents by category
     */
    categorizeDocuments(documents) {
        const categories = {};
        documents.forEach(doc => {
            const category = doc.category || 'Sin Categoría';
            if (!categories[category]) {
                categories[category] = {
                    count: 0,
                    size_mb: 0,
                    verified: 0
                };
            }
            categories[category].count++;
            categories[category].size_mb += parseFloat(doc.size_mb || 0);
            if (doc.verification_status === 'verified') {
                categories[category].verified++;
            }
        });
        return categories;
    }

    /**
     * Categorize budget by category
     */
    categorizeBudgetByCategory(documents) {
        const categories = {};
        documents.forEach(doc => {
            const category = doc.category || 'Sin Categoría';
            if (!categories[category]) {
                categories[category] = {
                    budgeted: 0,
                    executed: 0,
                    execution_rate: 0,
                    count: 0
                };
            }
            categories[category].budgeted += parseFloat(doc.budgeted_amount) || 0;
            categories[category].executed += parseFloat(doc.executed_amount) || 0;
            categories[category].count++;
        });
        
        // Calculate execution rates
        Object.keys(categories).forEach(category => {
            if (categories[category].budgeted > 0) {
                categories[category].execution_rate = 
                    (categories[category].executed / categories[category].budgeted) * 100;
            }
        });
        
        return categories;
    }

    /**
     * Get financial data from external APIs
     */
    async getExternalFinancialData(year) {
        try {
            // Check cache first
            const cacheKey = `external_financial_${year}`;
            if (this.apiCache.has(cacheKey)) {
                const cached = this.apiCache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    return cached.data;
                }
            }
            
            // Get data from external APIs
            const externalData = {};
            
            try {
                // Try to get provincial data from Buenos Aires Data
                const baData = await this.fetchFromApi(
                    `${this.externalApis.datos_gob_ar}/package_search`,
                    { fq: `organization:carmen-de-areco AND year:${year}` }
                );
                externalData.ba_data = baData;
            } catch (error) {
                console.warn('Could not fetch data from Buenos Aires Data:', error.message);
            }
            
            try {
                // Try to get national budget data
                const nationalData = await this.fetchFromApi(
                    this.externalApis.presupuesto_abierto,
                    { year: year }
                );
                externalData.national_data = nationalData;
            } catch (error) {
                console.warn('Could not fetch national budget data:', error.message);
            }
            
            // Cache the result
            this.apiCache.set(cacheKey, {
                data: externalData,
                timestamp: Date.now()
            });
            
            return externalData;
        } catch (error) {
            console.error('Error fetching external financial data:', error);
            return {};
        }
    }

    /**
     * Get GitHub data from public repositories
     */
    async getGitHubData(repoName, path = '') {
        try {
            // Check cache first
            const cacheKey = `github_${repoName}_${path}`;
            if (this.apiCache.has(cacheKey)) {
                const cached = this.apiCache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    return cached.data;
                }
            }
            
            // Fetch from GitHub API
            const repoFullName = this.githubRepos[repoName] || repoName;
            const url = `https://api.github.com/repos/${repoFullName}/contents/${path}`;
            
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Carmen-de-Areco-Transparency-Portal',
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            const data = response.data;
            
            // Cache the result
            this.apiCache.set(cacheKey, {
                data: data,
                timestamp: Date.now()
            });
            
            return data;
        } catch (error) {
            console.error(`Error fetching data from GitHub repo ${repoName}:`, error.message);
            return null;
        }
    }

    /**
     * Fetch data from external API with error handling
     */
    async fetchFromApi(baseUrl, params = {}) {
        try {
            // Create cache key from URL and params
            const cacheKey = `${baseUrl}?${new URLSearchParams(params).toString()}`;
            
            // Check cache first
            if (this.apiCache.has(cacheKey)) {
                const cached = this.apiCache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    return cached.data;
                }
            }
            
            // Make API request
            const response = await axios.get(baseUrl, { params });
            const data = response.data;
            
            // Cache the result
            this.apiCache.set(cacheKey, {
                data: data,
                timestamp: Date.now()
            });
            
            return data;
        } catch (error) {
            console.error(`Error fetching from API ${baseUrl}:`, error.message);
            throw error;
        }
    }

    /**
     * Get Wayback Machine archive URLs for documents
     */
    async getWaybackArchiveUrls(urls) {
        try {
            const archiveUrls = {};
            
            // Process URLs in batches to avoid rate limiting
            for (let i = 0; i < urls.length; i += 10) {
                const batch = urls.slice(i, i + 10);
                const promises = batch.map(url => 
                    axios.get(`${this.externalApis.wayback_machine}?url=${encodeURIComponent(url)}`)
                        .then(response => ({ url, data: response.data }))
                        .catch(error => ({ url, error: error.message }))
                );
                
                const results = await Promise.all(promises);
                results.forEach(result => {
                    if (result.data && result.data.archived_snapshots && 
                        result.data.archived_snapshots.closest) {
                        archiveUrls[result.url] = result.data.archived_snapshots.closest.url;
                    }
                });
            }
            
            return archiveUrls;
        } catch (error) {
            console.error('Error fetching Wayback Machine archive URLs:', error.message);
            return {};
        }
    }

    /**
     * Get local markdown documents by year and category
     */
    async getLocalMarkdownDocuments(year, category = null) {
        try {
            const basePath = path.join(this.documentPaths.markdown_documents, String(year));
            
            // Check if base path exists
            try {
                await fs.access(basePath);
            } catch (error) {
                return []; // Path doesn't exist
            }
            
            // Get all markdown files in the directory
            const files = await fs.readdir(basePath);
            const markdownFiles = files.filter(file => file.endsWith('.md'));
            
            const documents = [];
            for (const file of markdownFiles) {
                try {
                    const filePath = path.join(basePath, file);
                    const content = await fs.readFile(filePath, 'utf8');
                    
                    documents.push({
                        filename: file,
                        title: file.replace('.md', ''),
                        content: content,
                        path: filePath,
                        size: content.length,
                        last_modified: (await fs.stat(filePath)).mtime
                    });
                } catch (error) {
                    console.warn(`Could not read markdown file ${file}:`, error.message);
                }
            }
            
            return documents;
        } catch (error) {
            console.error('Error fetching local markdown documents:', error.message);
            return [];
        }
    }

    /**
     * Get organized PDF documents by year and category
     */
    async getOrganizedPdfDocuments(year, category = null) {
        try {
            let basePath = path.join(this.documentPaths.organized_pdfs, String(year));
            
            // If category is specified, append it to the path
            if (category) {
                basePath = path.join(basePath, category);
            }
            
            // Check if base path exists
            try {
                await fs.access(basePath);
            } catch (error) {
                return []; // Path doesn't exist
            }
            
            // Get all PDF files in the directory (recursively if no category specified)
            const pdfFiles = [];
            const walkDir = async (dir) => {
                const files = await fs.readdir(dir);
                for (const file of files) {
                    const filePath = path.join(dir, file);
                    const stat = await fs.stat(filePath);
                    if (stat.isDirectory()) {
                        if (!category) {
                            await walkDir(filePath); // Recursively walk subdirectories
                        }
                    } else if (file.endsWith('.pdf')) {
                        pdfFiles.push(filePath);
                    }
                }
            };
            
            await walkDir(basePath);
            
            const documents = [];
            for (const filePath of pdfFiles) {
                try {
                    const stat = await fs.stat(filePath);
                    const relativePath = path.relative(this.documentPaths.organized_pdfs, filePath);
                    const pathParts = relativePath.split(path.sep);
                    
                    documents.push({
                        filename: path.basename(filePath),
                        title: path.basename(filePath, '.pdf'),
                        path: filePath,
                        relative_path: relativePath,
                        year: pathParts[0],
                        category: pathParts[1] || 'General',
                        size: stat.size,
                        last_modified: stat.mtime,
                        url: `/api/pdfs/${relativePath}`
                    });
                } catch (error) {
                    console.warn(`Could not stat PDF file ${filePath}:`, error.message);
                }
            }
            
            return documents;
        } catch (error) {
            console.error('Error fetching organized PDF documents:', error.message);
            return [];
        }
    }

    /**
     * Get transparency data from local analysis results
     */
    async getLocalTransparencyData() {
        try {
            // Get the most recent analysis results file
            const files = await fs.readdir(this.documentPaths.transparency_data);
            const analysisFiles = files
                .filter(file => file.startsWith('analysis_results_') && file.endsWith('.json'))
                .sort()
                .reverse();
            
            if (analysisFiles.length === 0) {
                return null;
            }
            
            const latestFile = analysisFiles[0];
            const filePath = path.join(this.documentPaths.transparency_data, latestFile);
            const content = await fs.readFile(filePath, 'utf8');
            
            return JSON.parse(content);
        } catch (error) {
            console.error('Error fetching local transparency data:', error.message);
            return null;
        }
    }

    /**
     * Utility methods for citizen descriptions and impact analysis
     */
    getCitizenDescription(category) {
        const descriptions = {
            'Recursos Humanos': 'Gastos en personal municipal, incluyendo sueldos, jubilaciones y beneficios',
            'Obras Públicas': 'Inversión en infraestructura, mantenimiento urbano y proyectos de desarrollo',
            'Contrataciones': 'Adquisición de bienes y servicios para el funcionamiento del municipio',
            'Ejecución Presupuestaria': 'Seguimiento del cumplimiento del presupuesto aprobado',
            'Estados Financieros': 'Informes contables que muestran la situación económica del municipio',
            'Declaraciones Patrimoniales': 'Información sobre los bienes y obligaciones de funcionarios públicos'
        };
        
        return descriptions[category] || 'Categoría de gasto municipal';
    }

    getImpactDescription(category, amount) {
        const amountMillion = (amount / 1000000).toFixed(1);
        const impacts = {
            'Recursos Humanos': `Personal calificado brindando servicios públicos ($${amountMillion}M)`,
            'Obras Públicas': `Infraestructura y mejoras urbanas ($${amountMillion}M)`,
            'Contrataciones': `Servicios especializados para la comunidad ($${amountMillion}M)`,
            'Ejecución Presupuestaria': `Gestión eficiente de recursos públicos ($${amountMillion}M)`
        };
        
        return impacts[category] || `Servicios municipales ($${amountMillion}M)`;
    }

    getCitizenServices(category) {
        const services = {
            'Recursos Humanos': ['Educación', 'Salud', 'Seguridad', 'Administración'],
            'Obras Públicas': ['Mantenimiento de calles', 'Parques y espacios verdes', 'Obras de infraestructura'],
            'Contrataciones': ['Servicios profesionales', 'Adquisición de insumos', 'Mantenimiento de equipamiento'],
            'Ejecución Presupuestaria': ['Transparencia financiera', 'Rendición de cuentas', 'Control de gastos'],
            'Estados Financieros': ['Información contable', 'Auditorías', 'Reportes económicos'],
            'Declaraciones Patrimoniales': ['Transparencia de funcionarios', 'Prevención de conflictos de interés']
        };
        
        return services[category] || ['Servicios municipales'];
    }

    assessCitizenRelevance(doc) {
        const relevanceFactors = {
            category_weight: this.getCitizenPriority(doc.category),
            budget_amount: parseFloat(doc.budgeted_amount) || 0,
            execution_rate: parseFloat(doc.execution_rate) || 0,
            verification_status: doc.verification_status === 'verified' ? 100 : 50
        };
        
        return relevanceFactors;
    }

    getCitizenPriority(category) {
        const priorities = {
            'Recursos Humanos': 90, // High impact on daily services
            'Obras Públicas': 85, // Direct impact on citizen life
            'Contrataciones': 75, // Citizens want fair spending
            'Ejecución Presupuestaria': 95, // Core transparency concern
            'Estados Financieros': 70, // Important but technical
            'Declaraciones Patrimoniales': 80 // Anti-corruption interest
        };
        
        return priorities[category] || 60;
    }

    getDocumentTransparencyMetrics(doc) {
        return {
            availability_score: doc.official_url ? 100 : 75,
            verification_score: doc.verification_status === 'verified' ? 100 : 50,
            accessibility_score: 80, // Assuming PDF is accessible
            completeness_score: doc.content ? 90 : 60
        };
    }

    calculateTransparencyScore(data) {
        const totalDocs = data.reduce((sum, row) => sum + parseInt(row.document_count), 0);
        const verifiedDocs = data.reduce((sum, row) => sum + parseInt(row.verified_count), 0);
        
        return totalDocs > 0 ? Math.round((verifiedDocs / totalDocs) * 100) : 0;
    }

    analyzeBudgetExecution(data) {
        const totalBudgeted = data.reduce((sum, row) => sum + (parseFloat(row.budgeted_amount) || 0), 0);
        const totalExecuted = data.reduce((sum, row) => sum + (parseFloat(row.executed_amount) || 0), 0);
        
        return {
            total_budgeted: totalBudgeted,
            total_executed: totalExecuted,
            execution_rate: totalBudgeted > 0 ? ((totalExecuted / totalBudgeted) * 100).toFixed(2) : 0,
            variance: totalBudgeted - totalExecuted
        };
    }

    assessDocumentAccessibility(data) {
        const totalDocs = data.reduce((sum, row) => sum + parseInt(row.document_count), 0);
        const accessibleDocs = data.filter(row => row.official_url).reduce((sum, row) => sum + parseInt(row.document_count), 0);
        
        return {
            accessible_documents: accessibleDocs,
            accessibility_rate: totalDocs > 0 ? ((accessibleDocs / totalDocs) * 100).toFixed(2) : 0,
            online_availability: accessibleDocs > 0 ? 'Good' : 'Needs Improvement'
        };
    }

    getEfficiencyRating(ratio) {
        if (ratio >= 0.9) return 'Excelente';
        if (ratio >= 0.8) return 'Buena';
        if (ratio >= 0.7) return 'Aceptable';
        if (ratio >= 0.6) return 'Regular';
        return 'Baja';
    }

    /**
     * Clear API cache
     */
    clearCache() {
        this.apiCache.clear();
        console.log('✅ API cache cleared');
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            cache_size: this.apiCache.size,
            cache_keys: Array.from(this.apiCache.keys())
        };
    }
}

module.exports = ComprehensiveTransparencyService;