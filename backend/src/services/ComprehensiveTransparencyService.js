const UnifiedDatabaseAdapter = require('./UnifiedDatabaseAdapter');
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const DataService = require('./DataService');

/**
 * Comprehensive Transparency Service for Carmen de Areco
 * Provides complete financial transparency, document access, and citizen-focused analysis
 * Integrates local data sources, external APIs, and GitHub resources
 */
class ComprehensiveTransparencyService {
    constructor() {
        this.dbAdapter = null;
        this.dataService = new DataService();
        
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

    async initialize() {
        if (!this.dbAdapter) {
            this.dbAdapter = await UnifiedDatabaseAdapter.getInstance();
        }
    }

    async getCitizenFinancialOverview(year) {
        await this.initialize();
        try {
            const summary = await this.dbAdapter.getYearlySummary(year);
            const documents = await this.dbAdapter.getDocumentsByYear(year);
            
            return {
                year: parseInt(year),
                overview: this.generateCitizenSummary(summary, documents, year),
                categories: this.processCategoryDataBasic(documents),
                transparency_score: summary.transparency_score,
                spending_efficiency: this.analyzeBudgetExecution(documents),
                document_accessibility: this.assessDocumentAccessibility(documents)
            };
        } catch (error) {
            console.error('Error getting citizen financial overview:', error);
            throw error;
        }
    }

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
            categories[category].document_count++;
            categories[category].total_budget += parseFloat(row.budgeted_amount) || 0;
            categories[category].total_executed += parseFloat(row.executed_amount) || 0;
        });
        return categories;
    }

    generateCitizenSummary(summary, documents, year) {
        const totalBudgeted = documents.reduce((sum, row) => sum + (parseFloat(row.budgeted_amount) || 0), 0);
        const totalExecuted = documents.reduce((sum, row) => sum + (parseFloat(row.executed_amount) || 0), 0);

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
            documents_available: summary.total_documents,
            verified_documents: summary.verified_documents,
            transparency_level: summary.transparency_score,
            citizen_impact: {
                yearly_tax_contribution_estimate: budgetPerCitizen,
                services_delivered_value: executedPerCitizen,
                efficiency_rating: this.getEfficiencyRating(totalExecuted / totalBudgeted)
            }
        };
    }

    async getDocumentWithAccess(documentId) {
        await this.initialize();
        try {
            const doc = await this.dbAdapter.query(`SELECT * FROM ${this.dbAdapter.getSchema().table} WHERE id = ${this.dbAdapter.dbType === 'postgresql' ? '$1' : '?'}`, [documentId]);

            if (doc.rows.length === 0) {
                throw new Error('Document not found');
            }

            const document = doc.rows[0];
            const accessMethods = await this.generateDocumentAccess(document);
            
            return {
                document: {
                    id: document.id,
                    title: document.title || document.filename,
                    filename: document.filename,
                    year: document.year,
                    category: document.category,
                    type: document.document_type,
                    size_mb: this.dbAdapter.convertSizeToMB(document[this.dbAdapter.getSchema().sizeColumn]),
                    verification_status: document.verification_status
                },
                access_methods: accessMethods,
                financial_impact: {
                    budget_amount: document.budgeted_amount,
                    executed_amount: document.executed_amount,
                    execution_rate: document.execution_rate,
                    salary_amount: document.net_salary,
                    contract_amount: document.contract_amount,
                    contractor: document.contractor_name
                },
                citizen_relevance: this.assessCitizenRelevance(document),
                transparency_metrics: this.getDocumentTransparencyMetrics(document)
            };
        } catch (error) {
            console.error('Error getting document with access:', error);
            throw error;
        }
    }

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
            accessMethods.official_url = `http://cda-transparencia.org/wp-content/uploads/${year}/${month}/${doc.filename}`;
        }

        // Wayback Machine URL
        accessMethods.archive_url = `https://web.archive.org/web/*/cda-transparencia.org/transparencia/`;

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

        // Get best available URL with fallback logic
        const fallbackUrls = [];
        if (doc.year) {
            fallbackUrls.push(`http://carmendeareco.gob.ar/transparencia/documentos/${doc.year}/${doc.filename}`);
        }
        fallbackUrls.push(`http://carmendeareco.gob.ar/transparencia/documentos/${doc.filename}`);
        fallbackUrls.push(`https://web.archive.org/web/20240101000000*/http://carmendeareco.gob.ar/transparencia/documentos/${doc.filename}`);

        accessMethods.best_url = await this.getBestDocumentUrl(accessMethods.official_url, fallbackUrls);

        return accessMethods;
    }

    async getAllDocuments(filters = {}) {
        await this.initialize();
        return await this.dbAdapter.getAllDocuments(filters);
    }

    async searchDocuments(query, filters = {}) {
        await this.initialize();
        // This method now only supports basic search, as advanced search is not in the adapter
        const documents = await this.dbAdapter.getAllDocuments();
        const lowerCaseQuery = query.toLowerCase();
        return documents.filter(doc => {
            const titleMatch = doc.title && doc.title.toLowerCase().includes(lowerCaseQuery);
            const filenameMatch = doc.filename && doc.filename.toLowerCase().includes(lowerCaseQuery);
            return titleMatch || filenameMatch;
        });
    }

    extractContentSnippet(content, searchTerm) {
        // Type checking to prevent type confusion
        if (!content || typeof content !== 'string') return '...';
        if (!searchTerm || typeof searchTerm !== 'string') return content.substring(0, 100) + '...';
        
        const index = content.toLowerCase().indexOf(searchTerm.toLowerCase());
        if (index === -1) return content.substring(0, 100) + '...';
        
        const start = Math.max(0, index - 50);
        const end = Math.min(content.length, index + searchTerm.length + 50);
        return '...' + content.substring(start, end) + '...';
    }

    async getAvailableYears() {
        await this.initialize();
        return this.dbAdapter.getAvailableYears();
    }

    async getCategories() {
        await this.initialize();
        const documents = await this.dbAdapter.getAllDocuments();
        const categories = new Set(documents.map(doc => doc.category));
        return Array.from(categories).sort();
    }

    async getSystemHealth() {
        await this.initialize();
        return this.dbAdapter.getHealthStatus();
    }

    async getYearlyData(year) {
        await this.initialize();
        try {
            const [documents, summary, externalData] = await Promise.all([
                this.dbAdapter.getDocumentsByYear(year),  // Fixed: call on dbAdapter
                this.dbAdapter.getYearlySummary(year),    // Fixed: call on dbAdapter
                this.getExternalFinancialData(year)  // Add external data
            ]);

            const categorizedDocs = this.categorizeDocuments(documents);
            
            // Enhance with external data if available
            const enhancedSummary = {
                ...summary,
                external_data: externalData || {},
                provincial_data: externalData?.ba_municipal_data || {},
                national_data: externalData?.national_data || {},
                procurement_data: externalData?.procurement_data || {}
            };

            return {
                year: parseInt(year),
                documents,
                summary: enhancedSummary,
                categories: categorizedDocs,
                total_documents: documents.length,
                verified_documents: documents.filter(d => d.verification_status === 'verified').length,
                external_data_sources: {
                    provincial: !!externalData?.ba_municipal_data,
                    national: !!externalData?.national_data,
                    procurement: !!externalData?.procurement_data
                }
            };
        } catch (error) {
            console.error('Error fetching yearly data:', error);
            throw error;
        }
    }

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
     * Get budget breakdown for citizens - Citizen-friendly budget analysis
     */
    async getBudgetBreakdownForCitizens(year) {
        try {
            await this.initialize();
            const documents = await this.getAllDocuments({ year });
            const budgetBreakdown = this.categorizeBudgetByCategory(documents);
            
            // Transform for citizen presentation
            const citizenBreakdown = Object.keys(budgetBreakdown).map(category => ({
                name: category,
                budgeted: budgetBreakdown[category].budgeted,
                executed: budgetBreakdown[category].executed,
                execution_rate: budgetBreakdown[category].execution_rate.toFixed(2),
                count: budgetBreakdown[category].count,
                citizen_impact: this.assessCitizenRelevance({ category, budgeted_amount: budgetBreakdown[category].budgeted })
            }));
            
            return {
                year,
                categories: citizenBreakdown,
                total_budgeted: citizenBreakdown.reduce((sum, cat) => sum + cat.budgeted, 0),
                total_executed: citizenBreakdown.reduce((sum, cat) => sum + cat.executed, 0),
                overall_execution_rate: citizenBreakdown.length > 0 
                    ? ((citizenBreakdown.reduce((sum, cat) => sum + cat.executed, 0) / 
                       citizenBreakdown.reduce((sum, cat) => sum + cat.budgeted, 0)) * 100).toFixed(2)
                    : '0.00'
            };
        } catch (error) {
            console.error('Error getting budget breakdown for citizens:', error);
            throw error;
        }
    }

    /**
     * Get transparency dashboard data
     */
    async getTransparencyDashboard() {
        try {
            await this.initialize();
            
            // Get available years
            const availableYears = await this.getAvailableYears();
            
            // Get categories
            const categories = await this.getCategories();
            
            // Get system health
            const systemHealth = await this.getSystemHealth();
            
            // Get document analysis
            const latestYear = Math.max(...availableYears);
            const latestDocuments = await this.getAllDocuments({ year: latestYear });
            
            // Calculate transparency metrics
            const totalDocuments = latestDocuments.length;
            const verifiedDocuments = latestDocuments.filter(doc => doc.verification_status === 'verified').length;
            const transparencyScore = totalDocuments > 0 ? Math.round((verifiedDocuments / totalDocuments) * 100) : 0;
            
            return {
                years: availableYears,
                categories: categories,
                total_documents: totalDocuments,
                verified_documents: verifiedDocuments,
                transparency_score: transparencyScore,
                system_health: systemHealth,
                latest_year: latestYear,
                generated_at: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error getting transparency dashboard:', error);
            throw error;
        }
    }

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
                const baSearchUrl = `${this.externalApis.datos_gob_ar}/package_search`;
                const baSearchParams = {
                    q: `carmen de areco ${year}`,
                    fq: 'organization:provincia-de-buenos-aires'
                };
                
                const baData = await this.fetchFromApi(baSearchUrl, baSearchParams);
                externalData.ba_data = baData;
            } catch (error) {
                console.warn('Could not fetch data from Buenos Aires Data:', error.message);
            }
            
            try {
                // Try to get national budget data
                const nationalData = await this.fetchFromApi(
                    this.externalApis.presupuesto_abierto,
                    { year: year },
                    [`${this.externalApis.presupuesto_abierto.replace('sici', 'v1')}`] // Fallback URL
                );
                externalData.national_data = nationalData;
            } catch (error) {
                console.warn('Could not fetch national budget data:', error.message);
            }
            
            try {
                // Try to get Buenos Aires province municipal data
                const baProvMunicipalUrl = `${this.externalApis.BUENOS_AIRES_GOV}/municipalities`;
                const baMunicipalData = await this.fetchFromApi(
                    baProvMunicipalUrl,
                    { municipality: 'carmen de areco', year: year }
                );
                externalData.ba_municipal_data = baMunicipalData;
            } catch (error) {
                console.warn('Could not fetch Buenos Aires municipal data:', error.message);
            }
            
            try {
                // Try to get national procurement data
                const procurementUrl = `${this.externalApis.CONTRATACIONES_AR}/licitaciones`;
                const procurementData = await this.fetchFromApi(
                    procurementUrl,
                    { 
                        q: `carmen de areco ${year}`,
                        fields: 'id,titulo,descripcion,estado,monto,fecha_publicacion'
                    }
                );
                externalData.procurement_data = procurementData;
            } catch (error) {
                console.warn('Could not fetch procurement data:', error.message);
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

    async getGitHubData(repoName, path = '') {
        try {
            // Validate inputs to prevent SSRF
            if (!repoName || typeof repoName !== 'string') {
                throw new Error('Invalid repository name');
            }
            
            // Sanitize path to prevent directory traversal
            if (path && typeof path !== 'string') {
                throw new Error('Invalid path');
            }
            
            // Prevent SSRF by ensuring we only access GitHub domains
            const allowedRepos = Object.keys(this.githubRepos);
            if (!allowedRepos.includes(repoName) && !Object.values(this.githubRepos).some(repo => repo === repoName)) {
                console.warn(`Attempted to access unauthorized GitHub repository: ${repoName}`);
                return null;
            }
            
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
            
            // Validate repo name format (owner/repo)
            const repoParts = repoFullName.split('/');
            if (repoParts.length !== 2 || !repoParts[0] || !repoParts[1]) {
                throw new Error('Invalid repository name format');
            }
            
            // Sanitize path to prevent directory traversal
            const sanitizedPath = path ? path.replace(/(\.\.[\/\\])+/, '') : '';
            
            const url = `https://api.github.com/repos/${repoFullName}/contents/${sanitizedPath}`;
            
            // Validate URL to prevent SSRF
            const parsedUrl = new URL(url);
            if (parsedUrl.hostname !== 'api.github.com') {
                throw new Error('Unauthorized domain access attempt');
            }
            
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Carmen-de-Areco-Transparency-Portal',
                    'Accept': 'application/vnd.github.v3+json'
                },
                timeout: 10000 // 10 second timeout
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

    async fetchFromApi(baseUrl, params = {}, fallbackUrls = []) {
        try {
            // Validate inputs
            if (!baseUrl || typeof baseUrl !== 'string') {
                throw new Error('Invalid base URL');
            }
            
            if (params && typeof params !== 'object') {
                throw new Error('Invalid params object');
            }
            
            // Validate URL to prevent SSRF
            const parsedUrl = new URL(baseUrl);
            const allowedDomains = [
                'datos.gob.ar',
                'apis.datos.gob.ar',
                'www.presupuestoabierto.gob.ar',
                'www.argentina.gob.ar',
                'api.estadisticasbcra.com'
            ];
            
            if (!allowedDomains.includes(parsedUrl.hostname)) {
                throw new Error('Unauthorized domain access attempt');
            }
            
            // Create cache key from URL and params
            const cacheKey = `${baseUrl}?${new URLSearchParams(params).toString()}`;
            
            // Check cache first
            if (this.apiCache.has(cacheKey)) {
                const cached = this.apiCache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    return cached.data;
                }
            }
            
            // Try primary URL first
            try {
                const response = await axios.get(baseUrl, { 
                    params,
                    timeout: 15000 // 15 second timeout
                });
                const data = response.data;
                
                // Type checking for response data
                if (data && typeof data !== 'object') {
                    throw new Error('Unexpected response data type');
                }
                
                // Cache the result
                this.apiCache.set(cacheKey, {
                    data: data,
                    timestamp: Date.now()
                });
                
                return data;
            } catch (primaryError) {
                console.warn(`Primary API request failed for ${baseUrl}:`, primaryError.message);
                
                // Try fallback URLs if provided
                for (const fallbackUrl of fallbackUrls) {
                    try {
                        const fallbackParsedUrl = new URL(fallbackUrl);
                        if (allowedDomains.includes(fallbackParsedUrl.hostname)) {
                            const response = await axios.get(fallbackUrl, { 
                                params,
                                timeout: 15000 // 15 second timeout
                            });
                            const data = response.data;
                            
                            // Type checking for response data
                            if (data && typeof data !== 'object') {
                                throw new Error('Unexpected response data type');
                            }
                            
                            // Cache the result
                            this.apiCache.set(cacheKey, {
                                data: data,
                                timestamp: Date.now()
                            });
                            
                            console.log(`Successfully fetched data from fallback URL: ${fallbackUrl}`);
                            return data;
                        }
                    } catch (fallbackError) {
                        console.warn(`Fallback API request failed for ${fallbackUrl}:`, fallbackError.message);
                    }
                }
                
                // If all attempts failed, throw the original error
                throw primaryError;
            }
        } catch (error) {
            console.error(`Error fetching from API ${baseUrl}:`, error.message);
            throw error;
        }
    }

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
        const totalDocs = data.length;
        const accessibleDocs = data.filter(row => row.url || row.official_url).length;
        
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
     * Validate if a URL is accessible
     */
    async validateDocumentUrl(url) {
        try {
            const response = await axios.head(url, { timeout: 5000 });
            return response.status >= 200 && response.status < 400;
        } catch {
            return false;
        }
    }

    /**
     * Get best available URL for a document with fallback logic
     */
    async getBestDocumentUrl(primaryUrl, fallbackUrls = []) {
        // Try primary URL first
        if (await this.validateDocumentUrl(primaryUrl)) {
            return primaryUrl;
        }
        
        // Try fallback URLs
        for (const fallbackUrl of fallbackUrls) {
            if (await this.validateDocumentUrl(fallbackUrl)) {
                return fallbackUrl;
            }
        }
        
        // Return primary URL as last resort
        return primaryUrl;
    }

    clearCache() {
        this.apiCache.clear();
        console.log('✅ API cache cleared');
    }

    getCacheStats() {
        return {
            cache_size: this.apiCache.size,
            cache_keys: Array.from(this.apiCache.keys())
        };
    }
}

module.exports = ComprehensiveTransparencyService;
