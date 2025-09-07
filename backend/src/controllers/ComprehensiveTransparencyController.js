const ComprehensiveTransparencyService = require('../services/ComprehensiveTransparencyService');
const path = require('path');
const fs = require('fs').promises;

class ComprehensiveTransparencyController {
    constructor() {
        this.service = new ComprehensiveTransparencyService();
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

            const overview = await this.service.getCitizenFinancialOverview(yearInt);
            
            res.json({
                ...overview,
                api_info: {
                    endpoint: 'citizen_financial_overview',
                    purpose: 'Provide clear financial transparency for citizens',
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
     * Get detailed budget breakdown with citizen explanations
     */
    async getBudgetBreakdownForCitizens(req, res) {
        try {
            const { year } = req.params;
            const yearInt = parseInt(year);
            
            if (!yearInt || isNaN(yearInt)) {
                return res.status(400).json({ 
                    error: 'Invalid year parameter' 
                });
            }

            const breakdown = await this.service.getBudgetBreakdownForCitizens(yearInt);
            
            res.json({
                year: yearInt,
                budget_breakdown: breakdown,
                total_categories: breakdown.length,
                citizen_guide: {
                    how_to_read: 'Cada categoría muestra cómo se invirtieron los impuestos municipales',
                    key_metrics: {
                        budgeted_amount: 'Dinero planificado para gastar',
                        executed_amount: 'Dinero realmente gastado',
                        execution_rate: 'Porcentaje de ejecución del presupuesto'
                    }
                },
                generated_at: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error in getBudgetBreakdownForCitizens:', error);
            res.status(500).json({ 
                error: 'Failed to get budget breakdown',
                details: error.message 
            });
        }
    }

    /**
     * Get document with all access methods (PDF, links, etc.)
     */
    async getDocumentWithAccess(req, res) {
        try {
            const { id } = req.params;
            const documentId = parseInt(id);
            
            if (!documentId || isNaN(documentId)) {
                return res.status(400).json({ 
                    error: 'Invalid document ID' 
                });
            }

            const documentData = await this.service.getDocumentWithAccess(documentId);
            
            res.json({
                ...documentData,
                usage_guide: {
                    access_methods: 'Multiple ways to access this document',
                    financial_impact: 'Shows how this document relates to municipal spending',
                    citizen_relevance: 'Explains why this document matters to you'
                },
                generated_at: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error in getDocumentWithAccess:', error);
            res.status(500).json({ 
                error: 'Failed to get document with access methods',
                details: error.message 
            });
        }
    }

    /**
     * Serve PDF document files directly
     */
    async serveDocumentFile(req, res) {
        try {
            const { id } = req.params;
            const documentId = parseInt(id);
            
            if (!documentId || isNaN(documentId)) {
                return res.status(400).json({ 
                    error: 'Invalid document ID' 
                });
            }

            // Get document info first
            const documentData = await this.service.getDocumentWithAccess(documentId);
            const filename = documentData.document.filename;

            // Try to find local file
            const possiblePaths = [
                path.join(__dirname, '../../../data/source_materials', documentData.document.year?.toString() || '2024', filename),
                path.join(__dirname, '../../../data/source_materials', filename),
                path.join(__dirname, '../../../data/preserved/pdf', filename)
            ];

            let filePath = null;
            for (const testPath of possiblePaths) {
                try {
                    await fs.access(testPath);
                    filePath = testPath;
                    break;
                } catch (error) {
                    // File doesn't exist, continue
                }
            }

            if (!filePath) {
                return res.status(404).json({
                    error: 'Local file not found',
                    alternatives: documentData.access_methods,
                    message: 'Try the official_url or archive_url for accessing this document'
                });
            }

            // Set headers for PDF download
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

            // Stream the file
            const fileBuffer = await fs.readFile(filePath);
            res.send(fileBuffer);

        } catch (error) {
            console.error('Error serving document file:', error);
            res.status(500).json({ 
                error: 'Failed to serve document file',
                details: error.message 
            });
        }
    }

    /**
     * Get PDF viewer HTML for embedded viewing
     */
    async getDocumentViewer(req, res) {
        try {
            const { id } = req.params;
            const documentId = parseInt(id);
            
            if (!documentId || isNaN(documentId)) {
                return res.status(400).json({ 
                    error: 'Invalid document ID' 
                });
            }

            const documentData = await this.service.getDocumentWithAccess(documentId);

            // Generate HTML for PDF viewer
            const viewerHtml = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Visor de Documento: ${documentData.document.title}</title>
                <style>
                    body { margin: 0; padding: 20px; font-family: Arial, sans-serif; background: #f5f5f5; }
                    .document-header { 
                        background: white; 
                        padding: 20px; 
                        border-radius: 8px; 
                        margin-bottom: 20px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    .document-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; }
                    .info-card { background: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 4px solid #007bff; }
                    .pdf-container { 
                        background: white; 
                        border-radius: 8px; 
                        overflow: hidden;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    .pdf-viewer { width: 100%; height: 80vh; border: none; }
                    .access-links { margin-top: 20px; text-align: center; }
                    .access-links a { 
                        display: inline-block; 
                        margin: 0 10px; 
                        padding: 10px 20px; 
                        background: #007bff; 
                        color: white; 
                        text-decoration: none; 
                        border-radius: 5px;
                    }
                </style>
            </head>
            <body>
                <div class="document-header">
                    <h1>📄 ${documentData.document.title}</h1>
                    <div class="document-info">
                        <div class="info-card">
                            <h3>📅 Información Básica</h3>
                            <p><strong>Año:</strong> ${documentData.document.year}</p>
                            <p><strong>Categoría:</strong> ${documentData.document.category}</p>
                            <p><strong>Tamaño:</strong> ${documentData.document.size_mb} MB</p>
                        </div>
                        <div class="info-card">
                            <h3>💰 Impacto Financiero</h3>
                            <p><strong>Monto Presupuestado:</strong> $${documentData.financial_impact.budget_amount ? (documentData.financial_impact.budget_amount / 1000000).toFixed(1) + 'M' : 'N/A'}</p>
                            <p><strong>Monto Ejecutado:</strong> $${documentData.financial_impact.executed_amount ? (documentData.financial_impact.executed_amount / 1000000).toFixed(1) + 'M' : 'N/A'}</p>
                        </div>
                        <div class="info-card">
                            <h3>🎯 Relevancia Ciudadana</h3>
                            <p><strong>Puntuación:</strong> ${documentData.citizen_relevance.relevance_score}/100</p>
                            <p><strong>Nivel de Interés:</strong> ${documentData.citizen_relevance.citizen_interest_level}</p>
                        </div>
                    </div>
                </div>
                
                <div class="pdf-container">
                    <iframe class="pdf-viewer" src="/api/transparency/documents/${documentId}/file" title="Documento PDF">
                        <p>Su navegador no soporta visualización de PDFs. 
                           <a href="/api/transparency/documents/${documentId}/file">Descargar documento</a>
                        </p>
                    </iframe>
                </div>
                
                <div class="access-links">
                    <h3>Opciones de Acceso</h3>
                    <a href="${documentData.access_methods.official_url}" target="_blank">📊 Sitio Oficial</a>
                    <a href="${documentData.access_methods.archive_url}" target="_blank">🗄️ Archivo Web</a>
                    <a href="/api/transparency/documents/${documentId}/file" download>⬇️ Descargar PDF</a>
                </div>
                
                <div style="margin-top: 30px; text-align: center; color: #666; font-size: 14px;">
                    <p><strong>¿Por qué es importante este documento?</strong></p>
                    <p>${documentData.citizen_relevance.why_important}</p>
                    <p><em>Carmen de Areco - Portal de Transparencia Municipal</em></p>
                </div>
            </body>
            </html>`;

            res.setHeader('Content-Type', 'text/html');
            res.send(viewerHtml);

        } catch (error) {
            console.error('Error generating document viewer:', error);
            res.status(500).json({ 
                error: 'Failed to generate document viewer',
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
            const start = parseInt(startYear);
            const end = parseInt(endYear);
            
            if (!start || !end || isNaN(start) || isNaN(end)) {
                return res.status(400).json({ 
                    error: 'Invalid year parameters' 
                });
            }

            if (start > end) {
                return res.status(400).json({ 
                    error: 'Start year must be less than or equal to end year' 
                });
            }

            const analysis = await this.service.getComparativeAnalysis(start, end);
            
            res.json({
                ...analysis,
                analysis_info: {
                    purpose: 'Compare municipal performance across multiple years',
                    citizen_benefits: 'Understand trends in spending, transparency, and service delivery',
                    how_to_interpret: {
                        yearly_trends: 'Shows budget and execution evolution over time',
                        category_performance: 'Compares efficiency across spending categories',
                        transparency_evolution: 'Tracks improvement in document availability'
                    }
                },
                generated_at: new Date().toISOString()
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
     * Get real-time transparency dashboard
     */
    async getTransparencyDashboard(req, res) {
        try {
            const dashboard = await this.service.getTransparencyDashboard();
            
            res.json({
                ...dashboard,
                dashboard_info: {
                    purpose: 'Real-time overview of municipal transparency',
                    update_frequency: 'Updated every time new documents are processed',
                    citizen_value: 'Quick access to key transparency metrics and recent additions'
                },
                navigation_help: {
                    overview: 'General statistics about document availability',
                    recent_additions: 'Latest documents added to the transparency portal',
                    budget_summary: 'Financial overview across all available data',
                    category_distribution: 'How documents are distributed across categories'
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
            const { query } = req.params;
            const { category, year, limit = 50 } = req.query;
            
            if (!query || query.length < 2) {
                return res.status(400).json({
                    error: 'Search query must be at least 2 characters long'
                });
            }

            // Build search query
            let searchQuery = `
                SELECT 
                    d.*,
                    bd.budgeted_amount,
                    bd.executed_amount,
                    bd.execution_rate
                FROM transparency.documents d
                LEFT JOIN transparency.budget_data bd ON d.id = bd.document_id
                WHERE (
                    d.filename ILIKE $1 OR 
                    d.title ILIKE $1 OR 
                    d.category ILIKE $1
                )
            `;
            
            const params = [`%${query}%`];
            
            if (category) {
                searchQuery += ` AND d.category = $${params.length + 1}`;
                params.push(category);
            }
            
            if (year) {
                searchQuery += ` AND d.year = $${params.length + 1}`;
                params.push(parseInt(year));
            }
            
            searchQuery += ` ORDER BY d.year DESC, d.created_at DESC LIMIT $${params.length + 1}`;
            params.push(parseInt(limit));

            const result = await this.service.pool.query(searchQuery, params);
            
            const documents = result.rows.map(doc => ({
                id: doc.id,
                title: doc.title || doc.filename,
                filename: doc.filename,
                year: doc.year,
                category: doc.category,
                citizen_description: this.service.getCitizenDescription(doc.category),
                financial_impact: doc.budgeted_amount ? {
                    budget_amount: parseFloat(doc.budgeted_amount),
                    executed_amount: parseFloat(doc.executed_amount),
                    citizen_impact: this.service.getImpactDescription(doc.category, doc.executed_amount)
                } : null,
                access_url: `/api/transparency/documents/${doc.id}/view`,
                download_url: `/api/transparency/documents/${doc.id}/file`,
                relevance_score: this.service.assessCitizenRelevance(doc).relevance_score
            }));

            res.json({
                search_query: query,
                filters_applied: { category, year },
                results: documents,
                total_results: documents.length,
                citizen_guidance: {
                    how_to_use_results: 'Haga clic en "access_url" para ver el documento completo',
                    understanding_impact: 'Los montos muestran el impacto financiero de cada documento',
                    relevance_explanation: 'La puntuación de relevancia indica qué tan importante es para los ciudadanos'
                },
                generated_at: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error in searchDocumentsForCitizens:', error);
            res.status(500).json({ 
                error: 'Failed to search documents',
                details: error.message 
            });
        }
    }

    /**
     * Get spending efficiency analysis for citizens
     */
    async getSpendingEfficiencyAnalysis(req, res) {
        try {
            const { year } = req.params;
            const yearInt = year ? parseInt(year) : new Date().getFullYear();

            const query = `
                SELECT 
                    d.category,
                    COUNT(*) as document_count,
                    AVG(bd.execution_rate) as avg_execution_rate,
                    SUM(bd.budgeted_amount) as total_budgeted,
                    SUM(bd.executed_amount) as total_executed,
                    (SUM(bd.executed_amount) / NULLIF(SUM(bd.budgeted_amount), 0)) * 100 as category_efficiency
                FROM transparency.documents d
                LEFT JOIN transparency.budget_data bd ON d.id = bd.document_id
                WHERE d.year = $1 AND bd.budgeted_amount IS NOT NULL
                GROUP BY d.category
                ORDER BY category_efficiency DESC
            `;

            const result = await this.service.pool.query(query, [yearInt]);
            
            const analysis = result.rows.map(row => ({
                category: row.category,
                citizen_description: this.service.getCitizenDescription(row.category),
                efficiency_score: parseFloat(row.category_efficiency) || 0,
                efficiency_rating: this.service.getEfficiencyRating(parseFloat(row.category_efficiency) / 100 || 0),
                total_investment: parseFloat(row.total_budgeted) || 0,
                money_used: parseFloat(row.total_executed) || 0,
                money_not_used: (parseFloat(row.total_budgeted) || 0) - (parseFloat(row.total_executed) || 0),
                citizen_services: this.service.getCitizenServices(row.category),
                document_transparency: {
                    documents_available: parseInt(row.document_count),
                    transparency_level: 'verified'
                }
            }));

            const totalBudgeted = result.rows.reduce((sum, row) => sum + (parseFloat(row.total_budgeted) || 0), 0);
            const totalExecuted = result.rows.reduce((sum, row) => sum + (parseFloat(row.total_executed) || 0), 0);
            const overallEfficiency = totalBudgeted > 0 ? (totalExecuted / totalBudgeted) * 100 : 0;

            res.json({
                year: yearInt,
                overall_efficiency: {
                    percentage: overallEfficiency.toFixed(2),
                    rating: this.service.getEfficiencyRating(overallEfficiency / 100),
                    total_budget: totalBudgeted,
                    total_used: totalExecuted,
                    total_unused: totalBudgeted - totalExecuted,
                    citizen_explanation: `Del presupuesto total de $${(totalBudgeted / 1000000).toFixed(1)}M, se ejecutó el ${overallEfficiency.toFixed(1)}%`
                },
                category_analysis: analysis,
                citizen_insights: {
                    best_performing_category: analysis[0]?.category || 'N/A',
                    areas_for_improvement: analysis.filter(a => a.efficiency_score < 80).map(a => a.category),
                    transparency_level: 'Alta - Todos los datos están verificados y disponibles',
                    recommendation: overallEfficiency > 85 ? 
                        'Excelente gestión del presupuesto municipal' : 
                        'Hay oportunidades de mejora en la ejecución presupuestaria'
                },
                generated_at: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error in getSpendingEfficiencyAnalysis:', error);
            res.status(500).json({ 
                error: 'Failed to get spending efficiency analysis',
                details: error.message 
            });
        }
    }
}

module.exports = ComprehensiveTransparencyController;