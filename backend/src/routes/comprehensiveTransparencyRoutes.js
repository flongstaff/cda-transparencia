const express = require('express');
const router = express.Router();
const ComprehensiveTransparencyController = require('../controllers/ComprehensiveTransparencyController');

const controller = new ComprehensiveTransparencyController();

/**
 * @swagger
 * components:
 *   schemas:
 *     ComprehensiveTransparencyData:
 *       type: object
 *       properties:
 *         year:
 *           type: integer
 *           description: The year being analyzed
 *         financialOverview:
 *           type: object
 *           description: Citizen-friendly financial summary
 *         budgetBreakdown:
 *           type: array
 *           items:
 *             type: object
 *           description: Detailed budget breakdown by category
 *         documents:
 *           type: array
 *           items:
 *             type: object
 *           description: All documents for the year
 *         dashboard:
 *           type: object
 *           description: Transparency dashboard data
 *         spendingEfficiency:
 *           type: object
 *           description: Spending efficiency analysis
 *         auditOverview:
 *           type: object
 *           description: Audit system overview
 *         antiCorruption:
 *           type: object
 *           description: Anti-corruption dashboard data
 *         generated_at:
 *           type: string
 *           format: date-time
 *           description: Timestamp when data was generated
 *         data_sources:
 *           type: object
 *           description: Information about data sources
 *         consistency_check:
 *           type: object
 *           description: Data consistency verification
 *         errors:
 *           type: object
 *           description: Any errors that occurred during data fetching
 */

/**
 * @swagger
 * tags:
 *   name: Comprehensive Transparency
 *   description: Complete transparency API for citizen access to municipal data
 */

/**
 * @swagger
 * /api/transparency/year/{year}:
 *   get:
 *     summary: Get ALL transparency data for a specific year in one call
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
 *         description: Complete transparency data for the specified year
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ComprehensiveTransparencyData'
 *       400:
 *         description: Invalid year parameter
 *       500:
 *         description: Internal server error
 */
router.get('/year/:year', (req, res) => {
    controller.getYearData(req, res);
});

// Alias for year data (used by frontend)
router.get('/year-data/:year', (req, res) => {
    controller.getYearData(req, res);
});

/**
 * @swagger
 * /api/transparency/financial/{year}:
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
 *         description: Financial overview with citizen explanations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 year:
 *                   type: integer
 *                 overview:
 *                   type: object
 *                 categories:
 *                   type: object
 *                 transparency_score:
 *                   type: number
 *                 spending_efficiency:
 *                   type: object
 *                 document_accessibility:
 *                   type: object
 */
router.get('/financial/:year', (req, res) => {
    controller.getCitizenFinancialOverview(req, res);
});

/**
 * @swagger
 * /api/transparency/budget/{year}:
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 year:
 *                   type: integer
 *                 budget_breakdown:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('/budget/:year', (req, res) => {
    controller.getBudgetBreakdownForCitizens(req, res);
});

/**
 * @swagger
 * /api/transparency/documents:
 *   get:
 *     summary: Get all documents with optional filtering
 *     tags: [Comprehensive Transparency]
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Filter by year
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *     responses:
 *       200:
 *         description: List of documents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 documents:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('/documents', (req, res) => {
    controller.getDocumentsWithFilters(req, res);
});

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
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document with access methods, financial impact, and citizen relevance
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 document:
 *                   type: object
 *                 access_methods:
 *                   type: object
 *                 financial_impact:
 *                   type: object
 *                 citizen_relevance:
 *                   type: object
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
 *           type: string
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
 *           type: string
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
 *         description: Comparative analysis with trends and recommendations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get('/dashboard', (req, res) => {
    controller.getTransparencyDashboard(req, res);
});

/**
 * @swagger
 * /api/transparency/search:
 *   get:
 *     summary: Search documents with citizen-friendly results
 *     tags: [Comprehensive Transparency]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
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
 *     responses:
 *       200:
 *         description: Search results with citizen-friendly formatting and access methods
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get('/search', (req, res) => {
    controller.searchDocumentsForCitizens(req, res);
});

/**
 * @swagger
 * /api/transparency/health:
 *   get:
 *     summary: Get transparency system health status
 *     tags: [Comprehensive Transparency]
 *     responses:
 *       200:
 *         description: System health metrics and data availability status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get('/health', (req, res) => {
    controller.getSystemHealth(req, res);
});

/**
 * @swagger
 * /api/transparency/debt/{year}:
 *   get:
 *     summary: Get municipal debt data for a specific year
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
 *         description: Municipal debt data with analytics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 debt_data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 total_debt:
 *                   type: number
 *                 average_interest_rate:
 *                   type: number
 *                 long_term_debt:
 *                   type: number
 *                 short_term_debt:
 *                   type: number
 *                 debt_by_type:
 *                   type: object
 *       500:
 *         description: Internal server error
 */
router.get('/debt/:year', (req, res) => {
    controller.getMunicipalDebtByYear(req, res);
});

// Alias for municipal debt (used by frontend)
router.get('/municipal-debt/:year', (req, res) => {
    controller.getMunicipalDebtByYear(req, res);
});

// Available years endpoint
router.get('/available-years', (req, res) => {
    controller.getAvailableYears(req, res);
});

/** @swagger
 * /api/transparency/external/{year}:
 *   get:
 *     summary: Get external financial data from government APIs
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
 *         description: External financial data from government APIs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 year:
 *                   type: integer
 *                 external_data:
 *                   type: object
 *                 source:
 *                   type: string
 *                 generated_at:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Internal server error
 */
router.get('/external/:year', (req, res) => {
    controller.getExternalFinancialData(req, res);
});

/** @swagger
 * /api/transparency/github/{repo}:
 *   get:
 *     summary: Get data from public GitHub repositories
 *     tags: [Comprehensive Transparency]
 *     parameters:
 *       - in: path
 *         name: repo
 *         required: true
 *         schema:
 *           type: string
 *         description: Repository name (e.g., clarius/normas)
 *       - in: path
 *         name: path
 *         required: false
 *         schema:
 *           type: string
 *         description: Optional path within repository
 *     responses:
 *       200:
 *         description: Data from GitHub repository
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 repository:
 *                   type: string
 *                 path:
 *                   type: string
 *                 data:
 *                   type: object
 *                 source:
 *                   type: string
 *                 generated_at:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Internal server error
 */
router.get('/github/:repo/:path?', (req, res) => {
    controller.getGitHubData(req, res);
});

/** @swagger
 * /api/transparency/local-markdown/{year}/{category}:
 *   get:
 *     summary: Get local markdown documents
 *     tags: [Comprehensive Transparency]
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *         description: Year to analyze (e.g., 2024)
 *       - in: path
 *         name: category
 *         required: false
 *         schema:
 *           type: string
 *         description: Optional document category
 *     responses:
 *       200:
 *         description: Local markdown documents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 year:
 *                   type: integer
 *                 category:
 *                   type: string
 *                 documents:
 *                   type: array
 *                   items:
 *                     type: object
 *                 count:
 *                   type: integer
 *                 source:
 *                   type: string
 *                 generated_at:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Internal server error
 */
router.get('/local-markdown/:year/:category?', (req, res) => {
    controller.getLocalMarkdownDocuments(req, res);
});

/** @swagger
 * /api/transparency/organized-pdfs/{year}/{category}:
 *   get:
 *     summary: Get organized PDF documents
 *     tags: [Comprehensive Transparency]
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *         description: Year to analyze (e.g., 2024)
 *       - in: path
 *         name: category
 *         required: false
 *         schema:
 *           type: string
 *         description: Optional document category
 *     responses:
 *       200:
 *         description: Organized PDF documents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 year:
 *                   type: integer
 *                 category:
 *                   type: string
 *                 documents:
 *                   type: array
 *                   items:
 *                     type: object
 *                 count:
 *                   type: integer
 *                 source:
 *                   type: string
 *                 generated_at:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Internal server error
 */
router.get('/organized-pdfs/:year/:category?', (req, res) => {
    controller.getOrganizedPdfDocuments(req, res);
});

/** @swagger
 * /api/transparency/local-analysis:
 *   get:
 *     summary: Get local transparency data analysis
 *     tags: [Comprehensive Transparency]
 *     responses:
 *       200:
 *         description: Local transparency data analysis
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                 source:
 *                   type: string
 *                 generated_at:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: No local transparency data available
 *       500:
 *         description: Internal server error
 */
router.get('/local-analysis', (req, res) => {
    controller.getLocalTransparencyData(req, res);
});

/** @swagger
 * /api/transparency/cache/clear:
 *   post:
 *     summary: Clear API cache
 *     tags: [Comprehensive Transparency]
 *     responses:
 *       200:
 *         description: API cache cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Internal server error
 */
router.post('/cache/clear', (req, res) => {
    controller.clearCache(req, res);
});

/** @swagger
 * /api/transparency/cache/stats:
 *   get:
 *     summary: Get cache statistics
 *     tags: [Comprehensive Transparency]
 *     responses:
 *       200:
 *         description: Cache statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cache_stats:
 *                   type: object
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Internal server error
 */
router.get('/cache/stats', (req, res) => {
    controller.getCacheStats(req, res);
});

module.exports = router;