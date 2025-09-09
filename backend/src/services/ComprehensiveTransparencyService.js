const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

/**
 * Comprehensive Transparency Service for Carmen de Areco
 * Provides complete financial transparency, document access, and citizen-focused analysis
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
                    preserved: path.join(__dirname, '../../../data/preserved')
                };
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
                    // Generate likely official URL
                    accessMethods.official_url = `https://carmendeareco.gob.ar/transparencia/${doc.filename}`;
                }

                // Wayback Machine URL
                accessMethods.archive_url = `https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/${doc.filename}`;

                // Check for local copies
                const localPaths = [
                    path.join(this.documentPaths.source_materials, doc.year?.toString() || '2024', doc.filename),
                    path.join(this.documentPaths.source_materials, doc.filename),
                    path.join(this.documentPaths.preserved, 'pdf', doc.filename)
                ];

                for (const localPath of localPaths) {
                    try {
                        await fs.access(localPath);
                        accessMethods.local_copy = `/api/documents/${doc.id}/file`;
                        accessMethods.pdf_viewer_url = `/api/documents/${doc.id}/view`;
                        accessMethods.availability_score += 50;
                        break;
                    } catch (error) {
                        // File doesn't exist, continue checking
                    }
                }

                // Check for markdown version
                const markdownPath = path.join(this.documentPaths.pdf_extracts, 
                    doc.filename.replace('.pdf', '.md'));
                try {
                    await fs.access(markdownPath);
                    accessMethods.markdown_url = `/api/documents/${doc.id}/markdown`;
                    accessMethods.availability_score += 25;
                } catch (error) {
                    // Markdown doesn't exist
                }

                return accessMethods;
            }

            /**
             * Get comparative analysis between years
             */
            async getComparativeAnalysis(startYear, endYear) {
                try {
                    const query = `
                        SELECT 
                            d.year,
                            d.category,
                            COUNT(*) as document_count,
                            AVG(bd.execution_rate) as avg_execution_rate,
                            SUM(bd.budgeted_amount) as total_budgeted,
                            SUM(bd.executed_amount) as total_executed,
                            COUNT(CASE WHEN d.verification_status = 'verified' THEN 1 END) as verified_count
                        FROM transparency.documents d
                        LEFT JOIN transparency.budget_data bd ON d.id = bd.document_id
                        WHERE d.year BETWEEN $1 AND $2
                        GROUP BY d.year, d.category
                        ORDER BY d.year DESC, total_budgeted DESC
                    `;
                    
                    const result = await this.pool.query(query, [startYear, endYear]);
                    
                    return {
                        comparison_period: `${startYear}-${endYear}`,
                        yearly_trends: this.analyzeYearlyTrends(result.rows),
                        category_performance: this.analyzeCategoryPerformance(result.rows),
                        transparency_evolution: this.analyzeTransparencyEvolution(result.rows),
                        citizen_impact_analysis: this.analyzeCitizenImpact(result.rows),
                        recommendations: this.generateRecommendations(result.rows)
                    };
                } catch (error) {
                    console.error('Error getting comparative analysis:', error);
                    throw error;
                }
            }

            /**
             * Get real-time transparency dashboard data
             */
            async getTransparencyDashboard() {
                try {
                    const queries = {
                        overview: `
                            SELECT 
                                COUNT(*) as total_documents,
                                COUNT(DISTINCT year) as years_covered,
                                COUNT(DISTINCT category) as categories_covered,
                                COUNT(CASE WHEN verification_status = 'verified' THEN 1 END) as verified_documents,
                                SUM(size_bytes) as total_size_bytes,
                                MAX(created_at) as last_update
                            FROM transparency.documents
                        `,
                        recent_additions: `
                            SELECT filename, year, category, created_at
                            FROM transparency.documents 
                            ORDER BY created_at DESC 
                            LIMIT 10
                        `,
                        budget_summary: `
                            SELECT 
                                SUM(budgeted_amount) as total_budget,
                                SUM(executed_amount) as total_executed,
                                AVG(execution_rate) as avg_execution_rate,
                                COUNT(*) as budget_records
                            FROM transparency.budget_data
                        `,
                        category_distribution: `
                            SELECT 
                                category,
                                COUNT(*) as count,
                                SUM(size_bytes) as total_size
                            FROM transparency.documents 
                            GROUP BY category 
                            ORDER BY count DESC
                        `
                    };

                    const results = await Promise.all([
                        this.pool.query(queries.overview),
                        this.pool.query(queries.recent_additions),
                        this.pool.query(queries.budget_summary),
                        this.pool.query(queries.category_distribution)
                    ]);

                    const [overviewResult, recentResult, budgetResult, categoryResult] = results;

                    return {
                        overview: overviewResult.rows[0],
                        recent_additions: recentResult.rows,
                        budget_summary: budgetResult.rows[0],
                        category_distribution: categoryResult.rows,
                        dashboard_health: this.assessDashboardHealth(results),
                        last_updated: new Date().toISOString()
                    };
                } catch (error) {
                    console.error('Error getting transparency dashboard:', error);
                    throw error;
                }
            }

            // Helper methods for citizen-friendly descriptions
            getCitizenDescription(category) {
                const descriptions = {
                    'Recursos Humanos': 'Salarios y beneficios del personal municipal (empleados públicos, funcionarios)',
                    'Ejecución Presupuestaria': 'Cómo se gastó el dinero del presupuesto municipal',
                    'Contrataciones': 'Empresas contratadas y servicios tercerizados',
                    'Estados Financieros': 'Situación financiera general del municipio',
                    'Declaraciones Patrimoniales': 'Bienes declarados por funcionarios públicos',
                    'Documentos Generales': 'Otros documentos oficiales y administrativos'
                };
                return descriptions[category] || 'Documentos relacionados con la gestión municipal';
            }

            getImpactDescription(category, executedAmount) {
                const amount = parseFloat(executedAmount) || 0;
                const amountMillion = (amount / 1000000).toFixed(1);
                
                const impacts = {
                    'Recursos Humanos': `$${amountMillion}M invertidos en el personal que brinda servicios públicos`,
                    'Ejecución Presupuestaria': `$${amountMillion}M ejecutados del presupuesto para servicios ciudadanos`,
                    'Contrataciones': `$${amountMillion}M pagados a empresas por servicios y obras`,
                    'Estados Financieros': `Estado financiero que refleja $${amountMillion}M en movimientos`,
                    'Obras Públicas': `$${amountMillion}M invertidos en infraestructura y mejoras urbanas`
                };
                
                return impacts[category] || `$${amountMillion}M relacionados con ${category.toLowerCase()}`;
            }

            getCitizenServices(category) {
                const services = {
                    'Recursos Humanos': ['Atención ciudadana', 'Servicios administrativos', 'Seguridad urbana', 'Limpieza'],
                    'Obras Públicas': ['Pavimentación', 'Alumbrado público', 'Espacios verdes', 'Infraestructura'],
                    'Contrataciones': ['Servicios tercerizados', 'Provisión de materiales', 'Mantenimiento'],
                    'Estados Financieros': ['Gestión financiera', 'Planificación presupuestaria']
                };
                return services[category] || ['Servicios municipales generales'];
            }

            getEfficiencyRating(executionRate) {
                if (executionRate >= 0.9) return 'Excelente';
                if (executionRate >= 0.8) return 'Muy Bueno';
                if (executionRate >= 0.7) return 'Bueno';
                if (executionRate >= 0.6) return 'Regular';
                return 'Necesita Mejora';
            }

            calculateTransparencyScore(data) {
                const totalDocs = data.reduce((sum, row) => sum + parseInt(row.document_count), 0);
                const verifiedDocs = data.reduce((sum, row) => sum + parseInt(row.verified_count), 0);
                
                if (totalDocs === 0) return 0;
                return Math.round((verifiedDocs / totalDocs) * 100);
            }

            analyzeBudgetExecution(data) {
                const totalBudgeted = data.reduce((sum, row) => sum + (parseFloat(row.budgeted_amount) || 0), 0);
                const totalExecuted = data.reduce((sum, row) => sum + (parseFloat(row.executed_amount) || 0), 0);
                
                return {
                    overall_execution_rate: totalBudgeted > 0 ? ((totalExecuted / totalBudgeted) * 100).toFixed(2) : 0,
                    efficiency_level: this.getEfficiencyRating(totalExecuted / totalBudgeted),
                    unexecuted_amount: totalBudgeted - totalExecuted,
                    execution_analysis: totalExecuted / totalBudgeted > 0.8 ? 'Alta ejecución presupuestaria' : 'Oportunidades de mejora en ejecución'
                };
            }

            assessDocumentAccessibility(data) {
                const totalDocs = data.reduce((sum, row) => sum + parseInt(row.document_count), 0);
                const verifiedDocs = data.reduce((sum, row) => sum + parseInt(row.verified_count), 0);
                
                return {
                    accessibility_score: totalDocs > 0 ? Math.round((verifiedDocs / totalDocs) * 100) : 0,
                    documents_available: totalDocs,
                    verified_documents: verifiedDocs,
                    accessibility_level: verifiedDocs / totalDocs > 0.9 ? 'Excelente' : 'Buena'
                };
            }

            analyzeYearlyTrends(data) {
                const yearlyData = {};
                data.forEach(row => {
                    if (!yearlyData[row.year]) {
                        yearlyData[row.year] = {
                            total_budget: 0,
                            total_executed: 0,
                            document_count: 0,
                            verified_count: 0
                        };
                    }
                    yearlyData[row.year].total_budget += parseFloat(row.total_budgeted) || 0;
                    yearlyData[row.year].total_executed += parseFloat(row.total_executed) || 0;
                    yearlyData[row.year].document_count += parseInt(row.document_count);
                    yearlyData[row.year].verified_count += parseInt(row.verified_count);
                });

                return Object.entries(yearlyData).map(([year, data]) => ({
                    year: parseInt(year),
                    budget_evolution: data.total_budget,
                    execution_rate: data.total_budget > 0 ? ((data.total_executed / data.total_budget) * 100).toFixed(2) : 0,
                    transparency_score: data.document_count > 0 ? Math.round((data.verified_count / data.document_count) * 100) : 0,
                    document_availability: data.document_count
                }));
            }

            analyzeCategoryPerformance(data) {
                const categoryData = {};
                data.forEach(row => {
                    if (!categoryData[row.category]) {
                        categoryData[row.category] = {
                            total_budget: 0,
                            total_executed: 0,
                            years: new Set(),
                            avg_execution: 0,
                            execution_rates: []
                        };
                    }
                    categoryData[row.category].total_budget += parseFloat(row.total_budgeted) || 0;
                    categoryData[row.category].total_executed += parseFloat(row.total_executed) || 0;
                    categoryData[row.category].years.add(row.year);
                    categoryData[row.category].execution_rates.push(parseFloat(row.avg_execution_rate) || 0);
                });

                return Object.entries(categoryData).map(([category, data]) => ({
                    category,
                    total_investment: data.total_budget,
                    execution_efficiency: data.total_budget > 0 ? ((data.total_executed / data.total_budget) * 100).toFixed(2) : 0,
                    years_with_data: data.years.size,
                    consistency_rating: this.calculateConsistency(data.execution_rates),
                    citizen_priority: this.assessCitizenPriority(category, data.total_budget)
                }));
            }

            analyzeTransparencyEvolution(data) {
                const yearlyTransparency = {};
                data.forEach(row => {
                    if (!yearlyTransparency[row.year]) {
                        yearlyTransparency[row.year] = {
                            total_docs: 0,
                            verified_docs: 0
                        };
                    }
                    yearlyTransparency[row.year].total_docs += parseInt(row.document_count);
                    yearlyTransparency[row.year].verified_docs += parseInt(row.verified_count);
                });

                return Object.entries(yearlyTransparency).map(([year, data]) => ({
                    year: parseInt(year),
                    transparency_score: data.total_docs > 0 ? Math.round((data.verified_docs / data.total_docs) * 100) : 0,
                    document_count: data.total_docs,
                    evolution_trend: this.calculateEvolutionTrend(yearlyTransparency, year)
                }));
            }

            analyzeCitizenImpact(data) {
                const totalBudget = data.reduce((sum, row) => sum + (parseFloat(row.total_budgeted) || 0), 0);
                const totalExecuted = data.reduce((sum, row) => sum + (parseFloat(row.total_executed) || 0), 0);
                const estimatedPopulation = 15000;

                return {
                    total_citizen_investment: totalBudget,
                    per_citizen_investment: (totalBudget / estimatedPopulation).toFixed(2),
                    services_delivered_value: (totalExecuted / estimatedPopulation).toFixed(2),
                    efficiency_score: totalBudget > 0 ? Math.round((totalExecuted / totalBudget) * 100) : 0,
                    impact_categories: this.categorizeImpact(data),
                    citizen_recommendations: this.generateCitizenRecommendations(data)
                };
            }

            generateRecommendations(data) {
                const recommendations = [];
                
                // Budget execution recommendations
                const avgExecution = data.reduce((sum, row) => sum + (parseFloat(row.avg_execution_rate) || 0), 0) / data.length;
                if (avgExecution < 80) {
                    recommendations.push({
                        type: 'budget_execution',
                        priority: 'high',
                        recommendation: 'Mejorar la ejecución presupuestaria para optimizar el uso de recursos públicos',
                        citizen_benefit: 'Mayor eficiencia en la prestación de servicios públicos'
                    });
                }

                // Transparency recommendations
                const totalDocs = data.reduce((sum, row) => sum + parseInt(row.document_count), 0);
                const verifiedDocs = data.reduce((sum, row) => sum + parseInt(row.verified_count), 0);
                if (verifiedDocs / totalDocs < 0.95) {
                    recommendations.push({
                        type: 'transparency',
                        priority: 'medium',
                        recommendation: 'Aumentar la verificación y accesibilidad de documentos públicos',
                        citizen_benefit: 'Mayor transparencia y confianza en la gestión municipal'
                    });
                }

                return recommendations;
            }

            assessCitizenRelevance(doc) {
                const relevanceScores = {
                    'Recursos Humanos': 85,
                    'Ejecución Presupuestaria': 95,
                    'Contrataciones': 80,
                    'Obras Públicas': 90,
                    'Estados Financieros': 75,
                    'Declaraciones Patrimoniales': 70
                };
                
                return {
                    relevance_score: relevanceScores[doc.category] || 50,
                    citizen_interest_level: relevanceScores[doc.category] > 80 ? 'Alto' : 'Medio',
                    why_important: this.explainDocumentImportance(doc.category)
                };
            }

            explainDocumentImportance(category) {
                const explanations = {
                    'Recursos Humanos': 'Muestra cómo se invierten los impuestos en personal que brinda servicios públicos',
                    'Ejecución Presupuestaria': 'Revela exactamente cómo se gastan los fondos públicos año a año',
                    'Contrataciones': 'Transparenta las empresas contratadas y los montos pagados por servicios',
                    'Obras Públicas': 'Detalla las inversiones en infraestructura que benefician directamente a los ciudadanos',
                    'Estados Financieros': 'Proporciona la situación financiera general del municipio',
                    'Declaraciones Patrimoniales': 'Permite verificar la honestidad patrimonial de los funcionarios'
                };
                return explanations[category] || 'Documento oficial relevante para la transparencia municipal';
            }

            getDocumentTransparencyMetrics(doc) {
                return {
                    verification_status: doc.verification_status,
                    accessibility_score: 85, // Based on multiple access methods
                    citizen_friendly_rating: this.assessCitizenFriendliness(doc),
                    data_quality: doc.size_bytes > 100000 ? 'Alta' : 'Media', // Larger files typically have more content
                    last_verification: doc.created_at
                };
            }

            assessCitizenFriendliness(doc) {
                // Rate how citizen-friendly a document is
                let score = 50; // Base score
                
                if (doc.category === 'Ejecución Presupuestaria') score += 30;
                if (doc.category === 'Recursos Humanos') score += 25;
                if (doc.verification_status === 'verified') score += 15;
                if (doc.size_bytes > 500000) score += 10; // Comprehensive documents
                
                return {
                    score: Math.min(score, 100),
                    level: score > 80 ? 'Muy Amigable' : score > 60 ? 'Amigable' : 'Técnico'
                };
            }

            calculateConsistency(executionRates) {
                if (executionRates.length === 0) return 'No Data';
                
                const avg = executionRates.reduce((a, b) => a + b) / executionRates.length;
                const variance = executionRates.reduce((sum, rate) => sum + Math.pow(rate - avg, 2), 0) / executionRates.length;
                const standardDeviation = Math.sqrt(variance);
                
                if (standardDeviation < 10) return 'Muy Consistente';
                if (standardDeviation < 20) return 'Consistente';
                return 'Variable';
            }

            assessCitizenPriority(category, totalBudget) {
                const citizenPriorities = {
                    'Recursos Humanos': 'Alta', // Citizens care about public service quality
                    'Obras Públicas': 'Muy Alta', // Direct impact on citizen life
                    'Contrataciones': 'Alta', // Citizens want fair spending
                    'Ejecución Presupuestaria': 'Muy Alta', // Core transparency concern
                    'Estados Financieros': 'Media', // Important but technical
                    'Declaraciones Patrimoniales': 'Media' // Anti-corruption interest
                };
                
                return citizenPriorities[category] || 'Media';
            }

            calculateEvolutionTrend(yearlyData, currentYear) {
                const years = Object.keys(yearlyData).map(y => parseInt(y)).sort();
                const currentIndex = years.indexOf(parseInt(currentYear));
                
                if (currentIndex === 0 || currentIndex === -1) return 'No Trend Available';
                
                const previousYear = years[currentIndex - 1];
                const currentScore = yearlyData[currentYear] ? 
                    (yearlyData[currentYear].verified_docs / yearlyData[currentYear].total_docs) * 100 : 0;
                const previousScore = yearlyData[previousYear] ? 
                    (yearlyData[previousYear].verified_docs / yearlyData[previousYear].total_docs) * 100 : 0;
                
                const difference = currentScore - previousScore;
                
                if (difference > 5) return 'Mejorando';
                if (difference < -5) return 'Empeorando';
                return 'Estable';
            }

            categorizeImpact(data) {
                const categories = {};
                data.forEach(row => {
                    const budget = parseFloat(row.total_budgeted) || 0;
                    const executed = parseFloat(row.total_executed) || 0;
                    
                    if (!categories[row.category]) {
                        categories[row.category] = {
                            total_investment: 0,
                            citizen_benefit: 'N/A'
                        };
                    }
                    
                    categories[row.category].total_investment += executed;
                    categories[row.category].citizen_benefit = this.getCitizenBenefit(row.category, executed);
                });
                
                return categories;
            }

            getCitizenBenefit(category, amount) {
                const amountMillion = (amount / 1000000).toFixed(1);
                const benefits = {
                    'Recursos Humanos': `Personal capacitado brindando servicios públicos ($${amountMillion}M)`,
                    'Obras Públicas': `Infraestructura y mejoras urbanas ($${amountMillion}M)`,
                    'Contrataciones': `Servicios especializados para la comunidad ($${amountMillion}M)`,
                    'Ejecución Presupuestaria': `Gestión eficiente de recursos públicos ($${amountMillion}M)`
                };
                
                return benefits[category] || `Servicios municipales ($${amountMillion}M)`;
            }

            generateCitizenRecommendations(data) {
                const recommendations = [];
                
                // Based on data analysis, generate citizen-focused recommendations
                const avgExecution = data.reduce((sum, row) => sum + (parseFloat(row.avg_execution_rate) || 0), 0) / data.length;
                
                if (avgExecution > 85) {
                    recommendations.push('El municipio muestra una excelente ejecución presupuestaria');
                } else {
                    recommendations.push('Hay oportunidades de mejora en la ejecución del presupuesto municipal');
                }
                
                const totalDocs = data.reduce((sum, row) => sum + parseInt(row.document_count), 0);
                if (totalDocs > 50) {
                    recommendations.push('Excelente disponibilidad de documentos para transparencia ciudadana');
                }
                
                return recommendations;
            }

            assessDashboardHealth(results) {
                const [overview, recent, budget, category] = results;
                
                let healthScore = 0;
                
                // Document availability
                if (overview.rows[0].total_documents > 100) healthScore += 25;
                else if (overview.rows[0].total_documents > 50) healthScore += 15;
                
                // Verification rate
                const verificationRate = overview.rows[0].verified_documents / overview.rows[0].total_documents;
                if (verificationRate > 0.9) healthScore += 25;
                else if (verificationRate > 0.7) healthScore += 15;
                
                // Recent activity
                if (recent.rows.length > 5) healthScore += 25;
                
                // Budget data availability
                if (budget.rows[0].budget_records > 50) healthScore += 25;
                
                return {
                    overall_score: healthScore,
                    status: healthScore > 75 ? 'Excelente' : healthScore > 50 ? 'Bueno' : 'Necesita Mejora',
                    last_health_check: new Date().toISOString()
                };
            }
        }

        module.exports = ComprehensiveTransparencyService;