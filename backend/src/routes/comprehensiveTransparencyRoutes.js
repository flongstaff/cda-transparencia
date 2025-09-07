const express = require('express');
const router = express.Router();
const ComprehensiveTransparencyController = require('../controllers/ComprehensiveTransparencyController');

const controller = new ComprehensiveTransparencyController();

/**
 * @swagger
 * components:
 *   schemas:
 *     CitizenFinancialOverview:
 *       type: object
 *       properties:
 *         year:
 *           type: integer
 *           description: The year being analyzed
 *         overview:
 *           type: object
 *           description: Citizen-friendly financial summary
 *         transparency_score:
 *           type: number
 *           description: Overall transparency score (0-100)
 *         spending_efficiency:
 *           type: object
 *           description: Budget execution analysis
 */

/**
 * @swagger
 * tags:
 *   name: Comprehensive Transparency
 *   description: Complete transparency API for citizen access to municipal data
 */

// === CITIZEN-FOCUSED ENDPOINTS ===

/**
 * @swagger
 * /api/transparency/citizen/financial/{year}:
 *   get:
 *     summary: Get citizen-focused financial overview for a specific year
 *     tags: [Comprehensive Transparency]
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *         description: Year to analyze (e.g., 2024)
 *     responses:
 *       200:
 *         description: Comprehensive financial overview with citizen explanations
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CitizenFinancialOverview'
 */
router.get('/citizen/financial/:year', (req, res) => {
    controller.getCitizenFinancialOverview(req, res);
});

/**
 * @swagger
 * /api/transparency/citizen/budget/{year}:
 *   get:
 *     summary: Get detailed budget breakdown with citizen explanations
 *     tags: [Comprehensive Transparency]
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *         description: Year for budget analysis
 *     responses:
 *       200:
 *         description: Detailed budget breakdown with citizen-friendly explanations
 */
router.get('/citizen/budget/:year', (req, res) => {
    controller.getBudgetBreakdownForCitizens(req, res);
});

/**
 * @swagger
 * /api/transparency/citizen/efficiency/{year}:
 *   get:
 *     summary: Get spending efficiency analysis for citizens
 *     tags: [Comprehensive Transparency]
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *         description: Year for efficiency analysis
 *     responses:
 *       200:
 *         description: Spending efficiency analysis with citizen insights
 */
router.get('/citizen/efficiency/:year', (req, res) => {
    controller.getSpendingEfficiencyAnalysis(req, res);
});

// === DOCUMENT ACCESS ENDPOINTS ===

/**
 * @swagger
 * /api/transparency/documents/{id}:
 *   get:
 *     summary: Get document with all access methods and citizen relevance
 *     tags: [Comprehensive Transparency]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document with access methods, financial impact, and citizen relevance
 */
router.get('/documents/:id', (req, res) => {
    controller.getDocumentWithAccess(req, res);
});

/**
 * @swagger
 * /api/transparency/documents/{id}/file:
 *   get:
 *     summary: Download or view the actual PDF document
 *     tags: [Comprehensive Transparency]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Document ID
 *     responses:
 *       200:
 *         description: PDF file for download or viewing
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/documents/:id/file', (req, res) => {
    controller.serveDocumentFile(req, res);
});

/**
 * @swagger
 * /api/transparency/documents/{id}/view:
 *   get:
 *     summary: Get embedded PDF viewer with document context
 *     tags: [Comprehensive Transparency]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Document ID
 *     responses:
 *       200:
 *         description: HTML page with embedded PDF viewer and document information
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
router.get('/documents/:id/view', (req, res) => {
    controller.getDocumentViewer(req, res);
});

// === ANALYSIS AND COMPARISON ENDPOINTS ===

/**
 * @swagger
 * /api/transparency/compare/{startYear}/{endYear}:
 *   get:
 *     summary: Get comparative analysis between years
 *     tags: [Comprehensive Transparency]
 *     parameters:
 *       - in: path
 *         name: startYear
 *         required: true
 *         schema:
 *           type: integer
 *         description: Start year for comparison
 *       - in: path
 *         name: endYear
 *         required: true
 *         schema:
 *           type: integer
 *         description: End year for comparison
 *     responses:
 *       200:
 *         description: Comprehensive comparative analysis with trends and recommendations
 */
router.get('/compare/:startYear/:endYear', (req, res) => {
    controller.getComparativeAnalysis(req, res);
});

/**
 * @swagger
 * /api/transparency/dashboard:
 *   get:
 *     summary: Get real-time transparency dashboard with key metrics
 *     tags: [Comprehensive Transparency]
 *     responses:
 *       200:
 *         description: Real-time dashboard with overview, recent additions, and key metrics
 */
router.get('/dashboard', (req, res) => {
    controller.getTransparencyDashboard(req, res);
});

// === SEARCH ENDPOINTS ===

/**
 * @swagger
 * /api/transparency/search/{query}:
 *   get:
 *     summary: Search documents with citizen-friendly results
 *     tags: [Comprehensive Transparency]
 *     parameters:
 *       - in: path
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query (minimum 2 characters)
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by document category
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Filter by year
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of results
 *     responses:
 *       200:
 *         description: Search results with citizen-friendly formatting and access methods
 */
router.get('/search/:query', (req, res) => {
    controller.searchDocumentsForCitizens(req, res);
});

// === HEALTH AND STATUS ENDPOINTS ===

/**
 * @swagger
 * /api/transparency/health:
 *   get:
 *     summary: Get transparency system health status
 *     tags: [Comprehensive Transparency]
 *     responses:
 *       200:
 *         description: System health metrics and data availability status
 */
router.get('/health', async (req, res) => {
    try {
        const controller_instance = new ComprehensiveTransparencyController();
        const dashboard = await controller_instance.service.getTransparencyDashboard();
        
        res.json({
            status: 'healthy',
            system: 'Carmen de Areco Transparency Portal',
            database: 'connected',
            total_documents: dashboard.overview.total_documents,
            verified_documents: dashboard.overview.verified_documents,
            years_available: dashboard.overview.years_covered,
            categories_available: dashboard.overview.categories_covered,
            last_update: dashboard.overview.last_update,
            transparency_score: Math.round((dashboard.overview.verified_documents / dashboard.overview.total_documents) * 100),
            citizen_services: {
                document_access: 'available',
                pdf_viewer: 'available',
                financial_analysis: 'available',
                comparative_analysis: 'available',
                search: 'available'
            },
            api_endpoints: {
                citizen_financial_overview: '/api/transparency/citizen/financial/{year}',
                document_viewer: '/api/transparency/documents/{id}/view',
                comparative_analysis: '/api/transparency/compare/{startYear}/{endYear}',
                dashboard: '/api/transparency/dashboard',
                search: '/api/transparency/search/{query}'
            },
            generated_at: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: 'Health check failed',
            details: error.message
        });
    }
});

module.exports = router;